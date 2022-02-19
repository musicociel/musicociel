import type { Keycloak } from "keycloak-connect";
/*
import type { IncomingMessage } from "http";
import type { Socket } from "net";
import { WebSocket, WebSocketServer } from "ws";
import { getUserConditions } from "./database/utils/auth";
*/

export const socketServer = (keycloak: Keycloak | null) => null;
// TODO: implement the socket server
/*
export const socketServer = (keycloak: Keycloak | null) => {
  const ws = new WebSocketServer({ noServer: true });
  return keycloak
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
};
*/
