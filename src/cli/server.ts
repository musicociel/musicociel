import express from "express";
import type { Params as ExpressJWTParams } from "express-jwt";
import { expressjwt } from "express-jwt";
import { NotFound } from "http-errors";
import jwks from "jwks-rsa";
import { Pool } from "pg";
import type { Config } from "../common/config";
import { checkDB } from "./database/checkDB";
import { httpDeleteFile } from "./database/httpDeleteFile";
import { httpDeleteLibrary } from "./database/httpDeleteLibrary";
import { httpGetFile } from "./database/httpGetFile";
import { httpGetFiles } from "./database/httpGetFiles";
import { httpGetLibraries } from "./database/httpGetLibraries";
import { httpGetLibrary } from "./database/httpGetLibrary";
import { httpPostLibrary } from "./database/httpPostLibrary";
import { httpPutFile } from "./database/httpPutFile";
import { checkAddress } from "./middleware/checkAddress";
import { errorHandler } from "./middleware/errorHandler";
import { securityHeaders } from "./middleware/securityHeaders";
import { staticHandler } from "./middleware/staticHandler";
import { socketServer } from "./socketServer";
import { withEndingSlash, withoutEndingSlash } from "./utils";

const jsonConfig = (config: any): express.Handler => {
  const strConfig = JSON.stringify(config);
  return (req, res) => res.type("json").send(strConfig);
};

const serviceWorkerRemover = `self.addEventListener('install',function(){self.skipWaiting();});self.addEventListener('activate',function(){self.registration.unregister()});`;
const noServiceWorker: express.Handler = (req, res) => res.type("js").send(serviceWorkerRemover);

export interface OIDCConfig {
  authority: string;
  client_id: string;
  algorithms?: ExpressJWTParams["algorithms"];
}

export const server = async ({
  address,
  database,
  oidc: oidcConfig,
  hashRouting,
  serviceWorker = true
}: {
  address: string[];
  database?: URL;
  oidc?: OIDCConfig;
  hashRouting?: boolean;
  serviceWorker?: boolean;
}) => {
  address = address.map(withEndingSlash);
  const config: Config = {};
  if (!serviceWorker) config.noServiceWorker = true;

  const db = await (async () => {
    if (!database) return null;
    const db = new Pool({ connectionString: database.toString() });
    await checkDB(db);
    return db;
  })();
  if (!db) config.noDb = true;

  const oidc = await (async () => {
    if (!oidcConfig) return null;
    const oidcAuthority = withoutEndingSlash(oidcConfig.authority);
    const oidcMetadataReq = await fetch(`${oidcAuthority}/.well-known/openid-configuration`);
    const oidcMetadata = oidcMetadataReq.ok ? await oidcMetadataReq.json() : null;
    if (!oidcMetadata || oidcMetadata.issuer !== oidcAuthority || !oidcMetadata.jwks_uri) {
      throw new Error("Invalid OIDC server!");
    }
    config.oidc = { authority: oidcAuthority, client_id: oidcConfig.client_id, metadata: oidcMetadata };
    return expressjwt({
      credentialsRequired: false,
      secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: oidcMetadata.jwks_uri
      }) as jwks.GetVerificationKey,
      issuer: oidcAuthority,
      audience: oidcConfig.client_id,
      algorithms: oidcConfig.algorithms ?? ["RS256"]
    });
  })();

  const app = express();
  app.use(checkAddress(address));
  app.use(securityHeaders(config));
  if (oidc) {
    app.use(oidc);
  }
  if (db) {
    app.post("/api/libraries", ...httpPostLibrary(db));
    app.get("/api/libraries", ...httpGetLibraries(db));
    app.get("/api/libraries/:library", ...httpGetLibrary(db));
    app.delete("/api/libraries/:library", ...httpDeleteLibrary(db));
    app.get("/api/libraries/:library/files", ...httpGetFiles(db));
    app.get("/api/libraries/:library/files/:path(*)", ...httpGetFile(db));
    app.put("/api/libraries/:library/files/:path(*)", ...httpPutFile(db));
    app.delete("/api/libraries/:library/files/:path(*)", ...httpDeleteFile(db));
  }
  app.use("/api", (res, req, next) => next(new NotFound()));
  app.get("/musicociel.json", jsonConfig(config));
  if (config.noServiceWorker) {
    app.get("/sw.js", noServiceWorker);
  }
  app.use("/", await staticHandler(config, !!hashRouting));
  app.use(errorHandler);

  const upgradeHandler = socketServer();

  return {
    requestHandler: app,
    upgradeHandler,
    config
  };
};
