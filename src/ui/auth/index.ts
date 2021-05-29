import produce, { freeze } from "immer";
import type { KeycloakProfile } from "keycloak-js";
import { writable } from "svelte/store";
import { configPromise, address as configAddress } from "../config";

export const loginInfo = (() => {
  const store = writable<{ loading: boolean; enabled: boolean; user: KeycloakProfile | null }>(freeze({ loading: true, enabled: false, user: null }));
  let keycloak: Keycloak.KeycloakInstance;

  (async () => {
    try {
      const config = await configPromise;
      if (!config.keycloak) {
        return;
      }
      store.update(
        produce((value) => {
          value.enabled = true;
        })
      );
      const Keycloak = (await import("keycloak-js")).default;
      keycloak = Keycloak(config.keycloak);

      keycloak.onAuthSuccess = async () => {
        const userProfile = await keycloak.loadUserProfile();
        store.update(
          produce((value) => {
            value.user = userProfile;
          })
        );
        /*const address = new URL(configAddress);
      address.protocol = address.protocol.replace(/^http/i, "ws");
      address.searchParams.append("token", keycloak.token!);
      const socket = new WebSocket(address.toString());
      socket.onopen = () => console.log("socket open");
      socket.onerror = () => console.log("socket error");
      socket.onmessage = () => console.log("socket message");
      socket.onclose = () => console.log("socket closed");
      */
        /*const result = await fetch(`${config.keycloak.url}/admin/realms/${config.keycloak.realm}/groups`, {
        headers: {
          Authorization: `Bearer ${keycloak.token}`
        }
      });
      console.log(await result.json());*/
        /*
      const result = await fetch(`${configAddress}/api/branches`, {
        headers: {
          Authorization: `Bearer ${keycloak.token}`
        }
      });
      console.log(await result.json());
      const newResult = await fetch(`${configAddress}/api/branches`, {
        method: "POST",
        body: JSON.stringify({
          name: "My library " + new Date()
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${keycloak.token}`
        }
      });
      console.log(await newResult.json());
      */
      };
      keycloak.onAuthLogout = () => {
        store.update(
          produce((value) => {
            value.user = null;
          })
        );
      };
      await keycloak.init({
        onLoad: "check-sso",
        silentCheckSsoRedirectUri: `${configAddress}/sso.html`
      });
    } finally {
      store.update(
        produce((value) => {
          value.loading = false;
        })
      );
    }
  })();

  const login = () => (keycloak ? keycloak.login() : null);
  const logout = () => (keycloak ? keycloak.logout() : null);
  const manageAccount = () => (keycloak ? keycloak.accountManagement() : null);

  return { subscribe: store.subscribe, login, logout, manageAccount };
})();
