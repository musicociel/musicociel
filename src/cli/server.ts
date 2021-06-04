import type { IncomingMessage } from "http";
import type { Socket } from "net";
import Keycloak, { KeycloakConfig } from "keycloak-connect";
import express from "express";
import WebSocket, { Server as WebsocketServer } from "ws";
import { checkDB, getUserConditions } from "./database";
import { checkAddress } from "./middleware/checkAddress";
import { securityHeaders } from "./middleware/securityHeaders";
import { apiHandleError } from "./middleware/apiHandleError";
import { staticHandler } from "./middleware/staticHandler";
import type { Config } from "../common/config";

export const getUserToken = (req: express.Request): any => {
  const grant = (req as any).kauth?.grant;
  return grant && grant.access_token ? grant.access_token.content : null;
};

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
  database?: string;
  keycloak?: KeycloakConfig;
  hashRouting?: boolean;
  serviceWorker?: boolean;
}) => {
  address = address.map(withEndingSlash);
  const config: Config = {};
  if (!serviceWorker) config.noServiceWorker = true;

  /*const db = */ await (async () => {
    if (!database) return null;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const db = new (require("pg").Pool)({ connectionString: database });
    await checkDB(db);
    return db;
  })();

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
  app.use("/api", apiHandleError);
  app.use("/", await staticHandler(config, !!hashRouting));

  const ws = new WebsocketServer({ noServer: true });
  const upgradeHandler = keycloak
    ? async (request: IncomingMessage, socket: Socket, upgradeHead: Buffer) => {
        try {
          const url = new URL(request.url!, "ws://localhost");
          const access_token = url.searchParams.get("token");
          if (access_token) {
            const grant = await keycloak.grantManager.createGrant({ access_token } as any);
            const client = await new Promise<WebSocket>((resolve) => ws.handleUpgrade(request, socket, upgradeHead, resolve));
            console.log("socket connected from ", (grant.access_token as any).content.preferred_username);
            console.log(getUserConditions((grant.access_token as any).content));
            client.on("close", () => console.log("socket closed"));
            client.on("message", (message) => console.log("message from client:", message));
          } else {
            throw "missing access token";
          }
        } catch (error) {
          console.log("socket connection closed with error", error);
          socket.end();
        }
      }
    : null;
  return {
    requestHandler: app,
    upgradeHandler,
    config
  };
};
