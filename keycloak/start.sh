#!/bin/bash

podman run --rm -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin -v ./healthcheck.sh:/healthcheck.sh -v ./entrypoint.sh:/entrypoint.sh --entrypoint /entrypoint.sh quay.io/keycloak/keycloak:23.0.3 start-dev --health-enabled=true 2>&1 | tee keycloak.log
