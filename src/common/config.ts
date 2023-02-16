import type { OidcClientSettings } from "oidc-client-ts";

export interface Config {
  oidc?: Omit<OidcClientSettings, `${string}redirect_uri`>;
  noServiceWorker?: boolean;
  noDb?: boolean;
}
