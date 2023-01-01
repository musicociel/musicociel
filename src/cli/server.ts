import type { KeycloakConfig } from "keycloak-connect";
import Keycloak from "keycloak-connect";
import { Pool } from "pg";
import express from "express";
import { checkAddress } from "./middleware/checkAddress";
import { securityHeaders } from "./middleware/securityHeaders";
import { errorHandler } from "./middleware/errorHandler";
import { NotFound } from "http-errors";
import { staticHandler } from "./middleware/staticHandler";
import type { Config } from "../common/config";
import { checkDB } from "./database/checkDB";
import { httpGetFile } from "./database/httpGetFile";
import { httpPutFile } from "./database/httpPutFile";
import { httpGetLibraries } from "./database/httpGetLibraries";
import { httpPostLibrary } from "./database/httpPostLibrary";
import { httpGetFiles } from "./database/httpGetFiles";
import { socketServer } from "./socketServer";
import { httpDeleteFile } from "./database/httpDeleteFile";
import { httpDeleteLibrary } from "./database/httpDeleteLibrary";
import { httpGetLibrary } from "./database/httpGetLibrary";

export const withoutEndingSlash = (address: string) => address.replace(/[/]+$/, "");
export const withEndingSlash = (address: string) => address.replace(/[/]*$/, "/");
const jsonConfig = (config: any): express.Handler => {
  const strConfig = JSON.stringify(config);
  return (req, res) => res.type("json").send(strConfig);
};

const serviceWorkerRemover = `self.addEventListener('install',function(){self.skipWaiting();});self.addEventListener('activate',function(){self.registration.unregister()});`;
const noServiceWorker: express.Handler = (req, res) => res.type("js").send(serviceWorkerRemover);

export const server = async ({
  address,
  database,
  keycloak: keycloakConfig,
  hashRouting,
  serviceWorker = true
}: {
  address: string[];
  database?: URL;
  keycloak?: KeycloakConfig;
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

  const keycloak = (() => {
    if (!keycloakConfig) return null;
    const url = withoutEndingSlash(keycloakConfig["auth-server-url"]);
    keycloakConfig["auth-server-url"] = url;
    const keycloak = new Keycloak({}, { ...keycloakConfig, "bearer-only": true });
    config.keycloak = { url, realm: keycloakConfig.realm, clientId: keycloakConfig.resource };
    return keycloak;
  })();

  const app = express();
  app.use(checkAddress(address));
  app.use(securityHeaders(config));
  if (keycloak) {
    app.use(keycloak.middleware());
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

  const upgradeHandler = socketServer(keycloak);

  return {
    requestHandler: app,
    upgradeHandler,
    config
  };
};
