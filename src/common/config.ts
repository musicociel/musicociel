import type { OidcClientSettings } from "oidc-client-ts";

export interface Config {
  oidc?: Pick<OidcClientSettings, "authority" | "client_id">;
  noServiceWorker?: boolean;
  noDb?: boolean;
}
