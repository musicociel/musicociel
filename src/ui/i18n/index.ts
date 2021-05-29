import { init, getLocaleFromNavigator, register } from "svelte-i18n";

register("en", () => import("./en.json"));
register("fr", () => import("./fr.json"));
init({
  fallbackLocale: "en",
  initialLocale: getLocaleFromNavigator()
});
