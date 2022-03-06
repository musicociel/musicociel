import type { Config } from "../../common/config";
import express from "express";
import path from "path";
import { promises as fs } from "fs";

export const staticHandler = async (config: Config, hashRouting: boolean) => {
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const viteServer = await require("vite").createServer({
      // Note that __dirname is the build directory
      configFile: path.join(__dirname, "..", "vite.config.js"),
      server: {
        middlewareMode: "html"
      }
    });
    return viteServer.middlewares;
  } else {
    // Note that __dirname is the build directory
    const PUBLIC_PATH = path.join(__dirname, "public");
    const readIndexHtml = async () => await fs.readFile(path.join(PUBLIC_PATH, "index.html"), "utf8");
    const handleStatic = express.static(PUBLIC_PATH, { index: false });
    const cachedIndexHtml = await readIndexHtml();
    const sendIndexHtml = (req, res) => {
      let content = cachedIndexHtml;
      if (!hashRouting) {
        content = content.replace(/<head>/i, `<head><base href="${(req as any).checkedAddress}">`);
      }
      res.type("html").send(content);
    };
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (req.path === "/index.html" || req.path === "/") {
        sendIndexHtml(req, res);
      } else {
        handleStatic(req, res, hashRouting ? next : () => sendIndexHtml(req, res));
      }
    };
  }
};
