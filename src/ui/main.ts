import "bootstrap/dist/css/bootstrap.min.css";
import { configPromise } from "./config";
import App from "./pages/Index.svelte";
import { registerFileHandlers } from "./files/filesystem/fileHandlers";
import "./i18n";
import "./auth";

const app = new App({
  target: document.body
});

registerFileHandlers();

(async () => {
  const loadEvent = new Promise((resolve) => window.addEventListener("load", resolve));
  const config = await configPromise;
  if (!config.noServiceWorker && "serviceWorker" in navigator && window.isSecureContext && process.env.NODE_ENV === "production") {
    await loadEvent;
    navigator.serviceWorker.register("sw.js");
  }
})();

export default app;
