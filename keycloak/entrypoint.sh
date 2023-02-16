#!/bin/bash

(

set -e

while [[ "$(curl -s -o /dev/null -L -w ''%{http_code}'' http://127.0.0.1:8080/)" != "200" ]]; do sleep 1; done
echo "Executing startup for Musicociel"
/opt/keycloak/bin/kcadm.sh config credentials --server http://127.0.0.1:8080/ --realm master --user "admin" --password "admin"
/opt/keycloak/bin/kcadm.sh create realms -s realm=musicociel -s enabled=true
/opt/keycloak/bin/kcadm.sh create users -r musicociel -s username="admin" -s enabled=true
/opt/keycloak/bin/kcadm.sh set-password -r musicociel --username "admin" --new-password "admin"
/opt/keycloak/bin/kcadm.sh create clients -r musicociel -s clientId=musicociel -s publicClient=true -s 'baseUrl=http://127.0.0.1:8081' -s 'attributes={"post.logout.redirect.uris":"http://127.0.0.1:8081/*"}' -s 'redirectUris=["http://127.0.0.1:8081/*"]'
CLIENT_ID="$(/opt/keycloak/bin/kcadm.sh get clients -r musicociel -q clientId=musicociel --fields id | grep id | sed 's/\s*"id"\s*:\s*"\(.*\)"/\1/' )"
/opt/keycloak/bin/kcadm.sh create clients/$CLIENT_ID/protocol-mappers/models -r musicociel -s 'name=musicociel-audience' -s 'protocol=openid-connect' -s 'protocolMapper=oidc-audience-mapper' -s 'config."included.client.audience"=musicociel' -s 'config."access.token.claim"=true'
echo "Startup for Musicociel successfully executed!"

) &

exec /opt/keycloak/bin/kc.sh "$@"
