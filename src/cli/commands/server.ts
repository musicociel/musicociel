import type { CommandModule } from "yargs";
import type { AddressInfo } from "net";
import { promises as fs } from "fs";
import type { Server as HttpServer } from "http";
import { createServer as createHttpServer } from "http";
import type { Server as HttpsServer } from "https";
import { createServer as createHttpsServer } from "https";
import { server } from "../server";
import { normalizeHostname } from "../middleware/checkAddress";

type Protocol = "http" | "https";
const formatURL = (protocol: Protocol, hostname: string, port: number) => {
  const url = new URL("http://localhost");
  const defaultPort = protocol === "https" ? 443 : 80;
  url.protocol = protocol;
  url.hostname = normalizeHostname(hostname);
  url.port = port === defaultPort ? "" : `${port}`;
  return url.toString();
};

const formatAddressInfo = ({ address, port }: AddressInfo, protocol: Protocol = "http") => formatURL(protocol, address, port);

export const serverCommand: CommandModule = {
  command: "server",
  describe: "Start server",
  builder: {
    host: {
      type: "string",
      default: "127.0.0.1",
      description: "Host to bind the web server to."
    },
    port: {
      type: "number",
      default: 8081,
      description: "Port to bind the web server to."
    },
    address: {
      type: "string",
      array: true,
      description: "Full public address at which the web server must be accessed (can be repeated for multiple addresses)."
    },
    "hash-routing": {
      type: "boolean",
      description: "Use hash-style routing."
    },
    "service-worker": {
      type: "boolean",
      description: "Enables the service worker. Use --no-service-worker to disable the service worker.",
      default: process.env.NODE_ENV === "production"
    },
    keycloak: {
      type: "string",
      description: "Keycloak JSON configuration. Keycloak is not used if unspecified."
    },
    database: {
      type: "string",
      description: "URL to connect to the database. No database is used if unspecified."
    },
    "database-username": {
      type: "string",
      description: "Username to connect to the database. Alternatively, it can also be integrated in the url passed to --database."
    },
    "database-password": {
      type: "string",
      description: "Password to connect to the database. Alternatively, it can also be integrated in the url passed to --database."
    },
    "trust-proxy": {
      type: "boolean",
      default: false,
      description: "Trust proxy headers."
    },
    "tls-key": {
      type: "string",
      description: "Path to the file containing the TLS key to use."
    },
    "tls-cert": {
      type: "string",
      description: "Path to the file containing the TLS certificate to use."
    }
  },
  async handler(args: any) {
    const { host, port, keycloak, tlsCert, tlsKey, trustProxy } = args;
    let httpServer: HttpServer | HttpsServer;
    let protocol;
    if (tlsCert || tlsKey) {
      if (!tlsCert || !tlsKey) {
        throw new Error("Please specify both --tls-cert and --tls-key to enable TLS.");
      }
      console.log(`Reading certificate and key from ${tlsCert} and ${tlsKey}`);
      const [cert, key] = await Promise.all([fs.readFile(tlsCert), fs.readFile(tlsKey)]);
      protocol = "https";
      httpServer = createHttpsServer({
        cert,
        key
      });
    } else {
      protocol = "http";
      httpServer = createHttpServer();
    }
    const address = args.address ?? [formatURL(protocol, host, port)];
    const database = args.database ? new URL(args.database) : undefined;
    if (database) {
      args.databaseUsername ? (database.username = args.databaseUsername) : null;
      args.databasePassword ? (database.password = args.databasePassword) : null;
    }
    const { requestHandler, upgradeHandler } = await server({
      address,
      database,
      keycloak: keycloak ? JSON.parse(keycloak) : undefined,
      hashRouting: args["hash-routing"],
      serviceWorker: args["service-worker"]
    });
    console.log(trustProxy ? "The server is configured to be behind a trusted proxy." : "The server is not configured to be behind a trusted proxy.");
    if (trustProxy) {
      requestHandler.set("trust proxy", true);
    }
    httpServer.on("request", requestHandler);
    if (upgradeHandler) {
      httpServer.on("upgrade", upgradeHandler);
    }
    await new Promise((resolve, reject) => httpServer.on("error", reject).listen(port, host, resolve as () => void));
    console.log(`Listening address: ${formatAddressInfo(httpServer.address() as AddressInfo, protocol)}`);
    console.log(`Public address: ${address.join(", ")}`);
  }
};
