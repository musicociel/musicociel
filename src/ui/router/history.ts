import { createBrowserHistory, createHashHistory } from "history";
import { createLocationStore } from "./locationStore";

export const isHashRouting = document.getElementsByTagName("base").length === 0;
export const locationStore = createLocationStore(
  isHashRouting
    ? createHashHistory()
    : createBrowserHistory({
        // cf https://github.com/ReactTraining/history/issues/810
        basename: new URL("./", document.baseURI || window.location.href).pathname
      })
);
