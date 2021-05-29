import type { KeycloakConfig } from "keycloak-js";

export interface Config {
  hashRouting?: boolean;
  keycloak?: KeycloakConfig;
  noServiceWorker?: boolean;
}
