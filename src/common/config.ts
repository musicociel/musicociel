import type { KeycloakConfig } from "keycloak-js";

export interface Config {
  keycloak?: KeycloakConfig;
  noServiceWorker?: boolean;
}
