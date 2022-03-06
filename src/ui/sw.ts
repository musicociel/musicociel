import { StaleWhileRevalidate } from "workbox-strategies";
import { precache, matchPrecache } from "workbox-precaching";

const appFiles: { revision: string; url: string }[] = (self as any).__WB_MANIFEST;
const scriptURL = (self as any).serviceWorker.scriptURL;
const scopeURL = new URL(".", scriptURL).toString();
const apiBase = new URL("api/", scriptURL).toString();
const indexURL = new URL("index.html", scriptURL).toString();

const configURL = new URL("musicociel.json", scriptURL).toString();
const strategy = new StaleWhileRevalidate({
  cacheName: `musicociel-cache-${scopeURL}`
});

precache(appFiles);

self.addEventListener("install", (event: any) =>
  event.waitUntil(async () => {
    await strategy.handleAll({ event, request: configURL })[1];
  })
);

self.addEventListener("fetch", (event: any) => {
  const request = event.request;
  if (request.url === configURL) {
    event.respondWith(strategy.handle(event));
  } else if (request.url.startsWith(scopeURL) && !request.url.startsWith(apiBase)) {
    const url = new URL(request.url);
    url.search = "";
    url.hash = "";
    event.respondWith(
      (async () => {
        return (await matchPrecache(url.href)) || (await matchPrecache(indexURL));
      })()
    );
  }
});
