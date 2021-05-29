import type { Config } from "../../common/config";
import express from "express";
import path from "path";
import { promises as fs } from "fs";
import { asyncHandler } from "../asyncHandler";

// Note that __dirname is the build directory
const PUBLIC_PATH = path.join(__dirname, "public");
const readIndexHtml = async () => await fs.readFile(path.join(PUBLIC_PATH, "index.html"), "utf8");

const serviceWorkerRemover = `self.addEventListener('install',function(){self.skipWaiting();});self.addEventListener('activate',function(){self.registration.unregister()});`;

export const staticHandler = async (config: Config) => {
  const strConfig = JSON.stringify(config);
  const handleStatic = express.static(PUBLIC_PATH, { index: false });
  const getIndexHtml =
    process.env.NODE_ENV === "development"
      ? readIndexHtml
      : await (async () => {
          const cachedIndexHtml = await readIndexHtml();
          return async () => cachedIndexHtml;
        })();
  const sendIndexHtml = asyncHandler(async (req, res) => {
    let content = await getIndexHtml();
    if (!config.hashRouting) {
      content = content.replace(/<head>/i, `<head><base href="${(req as any).checkedAddress}">`);
    }
    res.type("html").send(content);
  });
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.path === "/musicociel.json") {
      res.type("json").send(strConfig);
    } else if (req.path === "/index.html" || req.path === "/") {
      sendIndexHtml(req, res, next);
    } else if (config.noServiceWorker && req.path === "/sw.js") {
      res.type("js").send(serviceWorkerRemover);
    } else {
      handleStatic(req, res, config.hashRouting ? next : () => sendIndexHtml(req, res, next));
    }
  };
};
