import type { RequestHandler } from "express";
import helmet from "helmet";
import type { IncomingMessage } from "http";
import type { Config } from "../../common/config";
import { withEndingSlash } from "../utils";

type PolicyArray = (string | ((req: IncomingMessage) => string))[];
const modAddress = (fn: (url: URL) => void) => {
  return (req: IncomingMessage) => {
    const url = new URL((req as any).checkedAddress);
    fn(url);
    return url.toString();
  };
};
const appendPathname = (suffix: string) => modAddress((url) => (url.pathname += suffix));

export const securityHeaders = ({ oidc }: Config): RequestHandler => {
  const self = appendPathname("");
  const scriptSrc: PolicyArray = [appendPathname("assets/"), appendPathname("sw.js")];
  const connectSrc: PolicyArray = [self, modAddress((url) => (url.protocol = url.protocol.replace(/^http/i, "ws")))];
  const frameSrc: PolicyArray = [];
  if (oidc) {
    const authority = withEndingSlash(oidc.authority);
    connectSrc.push(authority);
    frameSrc.push(authority, appendPathname("oidc.html"));
    scriptSrc.push(appendPathname("oidc.js"));
  }
  if (process.env.NODE_ENV === "development") {
    const liveReloadPort = "24678";
    connectSrc.push(
      modAddress((url) => {
        url.port = liveReloadPort;
        url.pathname = "/";
        url.protocol = "ws";
      })
    );
    scriptSrc.push(appendPathname(""));
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
        manifestSrc: [appendPathname("manifest.webmanifest")],
        styleSrc: ["'unsafe-inline'", appendPathname("assets/")],
        scriptSrc,
        connectSrc,
        frameSrc
      }
    }
  });
};
