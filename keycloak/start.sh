#!/bin/bash

podman run --rm -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin -v ./entrypoint.sh:/entrypoint.sh --entrypoint /entrypoint.sh quay.io/keycloak/keycloak:20.0.2 start-dev 2>&1 | tee keycloak.log