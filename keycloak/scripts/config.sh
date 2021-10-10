#!/bin/bash

(

set -e

while [[ "$(curl -s -o /dev/null -L -w ''%{http_code}'' http://127.0.0.1:8080/auth)" != "200" ]]; do sleep 1; done
echo "Executing startup for Musicociel"
/opt/jboss/keycloak/bin/kcadm.sh config credentials --server http://127.0.0.1:8080/auth --realm master --user "admin" --password "admin"
/opt/jboss/keycloak/bin/kcadm.sh create realms -s realm=musicociel -s enabled=true
/opt/jboss/keycloak/bin/kcadm.sh create users -r musicociel -s username="admin" -s enabled=true
/opt/jboss/keycloak/bin/kcadm.sh set-password -r musicociel --username "admin" --new-password "admin"
/opt/jboss/keycloak/bin/kcadm.sh create clients -r musicociel -s clientId=musicociel -s publicClient=true -s 'redirectUris=["http://127.0.0.1:8081/*"]'
echo "Startup for Musicociel successfully executed!"

) &
