import produce, { freeze } from "immer";
import { writable, derived } from "svelte/store";
import { configPromise, address as configAddress } from "../config";

export interface LoginInfo {
  loading: boolean;
  enabled: boolean;
  user: { sub: string; preferred_username: string } | null;
}

export const { loginInfo, login, logout, manageAccount, authFetch } = (() => {
  const store = writable<LoginInfo>(freeze({ loading: true, enabled: false, user: null }));
  let keycloak: Keycloak.KeycloakInstance;

  const loadPromise = (async () => {
    const config = await configPromise;
    if (!config.keycloak) {
      store.update(
        produce((state) => {
          state.loading = false;
        })
      );
      return;
    }
    const Keycloak = (await import("keycloak-js")).default;
    keycloak = Keycloak(config.keycloak);

    keycloak.onAuthRefreshSuccess = () => {
      console.log("onAuthRefreshSuccess", keycloak.tokenParsed);
      produce((state) => {
        state.user = (keycloak.tokenParsed as any) || null;
      });
    };

    keycloak.onAuthLogout = () => {
      store.update(
        produce((state) => {
          state.user = null;
        })
      );
    };

    await keycloak.init({
      onLoad: "check-sso",
      checkLoginIframe: true,
      silentCheckSsoRedirectUri: `${configAddress}/sso.html`
    });

    store.update(
      produce((state) => {
        state.enabled = true;
        state.loading = false;
        state.user = (keycloak.tokenParsed as any) || null;
      })
    );
  })();

  const login = () => (keycloak ? keycloak.login() : null);
  const logout = () => (keycloak ? keycloak.logout() : null);
  const manageAccount = () => (keycloak ? keycloak.accountManagement() : null);
  const getToken = async () => {
    if (keycloak && keycloak.authenticated) {
      await keycloak.updateToken(10);
      return keycloak.token;
    }
  };

  const authFetch = async (url: string, { headers = {}, ...params }: RequestInit & { headers?: Record<string, string> } = {}) => {
    await loadPromise;
    const token = await getToken();
    return await fetch(`${configAddress}/api/${url}`, { ...params, headers: { ...headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
  };

  return { loginInfo: { subscribe: store.subscribe }, login, logout, manageAccount, authFetch };
})();

export const userId = derived(loginInfo, (info) => (info.loading ? undefined : info.user?.sub ?? ""));
