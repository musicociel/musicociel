import Keycloak, { KeycloakConfig } from "keycloak-connect";
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
import { httpGetBranches } from "./database/httpGetBranches";
import { httpPostBranch } from "./database/httpPostBranch";
import { httpGetFiles } from "./database/httpGetFiles";
import { socketServer } from "./socketServer";
import { httpDeleteFile } from "./database/httpDeleteFile";
import { httpDeleteBranch } from "./database/httpDeleteBranch";
import { httpGetBranch } from "./database/httpGetBranch";

export const withoutEndingSlash = (address: string) => address.replace(/[/]+$/, "");
export const withEndingSlash = (address: string) => address.replace(/[/]*$/, "/");

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
    app.post("/api/branches", ...httpPostBranch(db));
    app.get("/api/branches", ...httpGetBranches(db));
    app.get("/api/branches/:branch", ...httpGetBranch(db));
    app.delete("/api/branches/:branch", ...httpDeleteBranch(db));
    app.get("/api/branches/:branch/files", ...httpGetFiles(db));
    app.get("/api/branches/:branch/files/:path(*)", ...httpGetFile(db));
    app.put("/api/branches/:branch/files/:path(*)", ...httpPutFile(db));
    app.delete("/api/branches/:branch/files/:path(*)", ...httpDeleteFile(db));
  }
  app.use("/api", (res, req, next) => next(new NotFound()));
  app.use("/", await staticHandler(config, !!hashRouting));
  app.use(errorHandler);

  const upgradeHandler = socketServer(keycloak);

  return {
    requestHandler: app,
    upgradeHandler,
    config
  };
};
