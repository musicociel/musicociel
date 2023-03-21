import type { User, UserManager, UserProfile } from "oidc-client-ts";
import { writable, computed, asReadable } from "@amadeus-it-group/tansu";
import { configPromise, address as configAddress } from "../config";

export interface LoginInfo {
  loading: boolean;
  enabled: boolean;
  user: UserProfile | null;
}

export const { loginInfo, login, logout, authFetch } = (() => {
  const store = writable<LoginInfo>({ loading: true, enabled: false, user: null });
  let oidcUserManager: UserManager | null = null;
  let user: User | null = null;

  const updateState = () => {
    store.set({ loading: false, enabled: !!oidcUserManager, user: user?.profile ?? null });
  };

  const loadPromise = (async () => {
    const config = await configPromise;
    if (!config.oidc) {
      return;
    }
    const UserManager = (await import("oidc-client-ts")).UserManager;
    const redirectURI = new URL("./oidc.html", document.baseURI).href;
    oidcUserManager = new UserManager({
      ...config.oidc,
      redirect_uri: redirectURI,
      post_logout_redirect_uri: redirectURI,
      popup_redirect_uri: redirectURI,
      popup_post_logout_redirect_uri: redirectURI,
      silent_redirect_uri: redirectURI
    });
    oidcUserManager.events.addUserLoaded((newUser) => {
      user = newUser;
      updateState();
    });
    oidcUserManager.events.addUserUnloaded(() => {
      user = null;
      updateState();
    });
    try {
      await oidcUserManager.signinSilent();
    } catch (error) {
      // ignore error
    }
  })().finally(updateState);

  const login = async () => {
    await oidcUserManager?.signinPopup();
  };
  const logout = async () => {
    await oidcUserManager?.signoutSilent();
  };

  const authFetch = async (url: string, { headers = {}, ...params }: RequestInit & { headers?: Record<string, string> } = {}) => {
    await loadPromise;
    const token = user?.access_token;
    const res = await fetch(`${configAddress}/api/${url}`, {
      ...params,
      headers: { ...headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    });
    if (!res.ok) {
      throw res;
    }
    return res;
  };

  return { loginInfo: asReadable(store), login, logout, authFetch };
})();

export const userId = computed(() => {
  const info = loginInfo();
  return info.loading ? undefined : info.user?.sub ?? "";
});
