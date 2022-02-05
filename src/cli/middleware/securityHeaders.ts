import type { RequestHandler } from "express";
import type { IncomingMessage } from "http";
import type { Config } from "../../common/config";
import helmet from "helmet";

type PolicyArray = (string | ((req: IncomingMessage) => string))[];
const modAddress = (fn: (url: URL) => void) => {
  return (req: IncomingMessage) => {
    const url = new URL((req as any).checkedAddress);
    fn(url);
    return url.toString();
  };
};
const appendPathname = (suffix: string) => modAddress((url) => (url.pathname += suffix));

export const securityHeaders = ({ keycloak }: Config): RequestHandler => {
  const self = appendPathname("");
  const scriptSrc: PolicyArray = [appendPathname("js/"), appendPathname("sw.js")];
  const connectSrc: PolicyArray = [self, modAddress((url) => (url.protocol = url.protocol.replace(/^http/i, "ws")))];
  const frameSrc: PolicyArray = [appendPathname("sso.html")];
  if (keycloak) {
    connectSrc.push(`${keycloak.url}/`);
    frameSrc.push(`${keycloak.url}/`);
  }
  if (process.env.NODE_ENV === "development") {
    const liveReloadPort = "35729";
    scriptSrc.push(
      modAddress((url) => {
        url.port = liveReloadPort;
        url.pathname = "/";
      })
    );
    connectSrc.push(
      modAddress((url) => {
        url.port = liveReloadPort;
        url.pathname = "/";
        url.protocol = "ws";
      })
    );
  }
  return helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
    originAgentCluster: false,
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'none'"],
        fontSrc: ["data:"],
        imgSrc: [self, "data:"],
        manifestSrc: [appendPathname("manifest.json")],
        styleSrc: ["'unsafe-inline'", appendPathname("css/")],
        scriptSrc,
        connectSrc,
        frameSrc
      }
    }
  });
};
