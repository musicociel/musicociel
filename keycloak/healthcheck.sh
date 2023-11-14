#!/bin/bash

# cf https://github.com/keycloak/keycloak/issues/17273#issuecomment-1456572972
exec 3<>/dev/tcp/localhost/8080

echo -e "GET /health/ready HTTP/1.1\nhost: localhost:8080\n" >&3

timeout --preserve-status 1 cat <&3 | grep -m 1 status | grep -m 1 UP
ERROR=$?

exec 3<&-
exec 3>&-

exit $ERROR
