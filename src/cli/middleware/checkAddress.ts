import type express from "express";

export const normalizeHostname = (hostname: string) => (hostname.includes(":") ? `[${hostname}]` : hostname);

const matchHostname = (url: URL) => {
  const protocol = url.protocol.replace(/:$/, "");
  return (req: express.Request) => {
    if (req.protocol === protocol && req.hostname === url.hostname && req.path.startsWith(url.pathname)) {
      return url;
    }
    return null;
  };
};

const matchLocalIp = (url: URL) => {
  const protocol = url.protocol.replace(/:$/, "");
  return (req: express.Request) => {
    const hostname = req.hostname;
    const localIp = normalizeHostname(req.socket.localAddress!);
    const isLocalIp = hostname === localIp || `[::ffff:${hostname}]` === localIp;
    if (isLocalIp && req.protocol === protocol && req.path.startsWith(url.pathname)) {
      const response = new URL(".", url);
      response.hostname = hostname;
      return response;
    }
    return null;
  };
};

export const checkAddress = (addresses: string[]) => {
  const parsedAddresses = addresses.map((address) => {
    const url = new URL(address);
    url.search = "";
    url.hash = "";
    if (url.hostname === "0.0.0.0" || url.hostname === "[::]") {
      return matchLocalIp(url);
    } else {
      return matchHostname(url);
    }
  });
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    for (const match of parsedAddresses) {
      const matchResult = match(req);
      if (matchResult) {
        (req as any).checkedAddress = matchResult.href;
        const url = new URL(req.url, matchResult.href);
        url.pathname = req.path.substring(matchResult.pathname.length - 1);
        req.url = url.pathname + url.search;
        return next();
      }
    }
    return res.sendStatus(404);
  };
};
