#!/bin/bash

podman run --rm -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=admin -e POSTGRES_DB=musicociel -p 127.0.0.1:5432:5432 docker.io/library/postgres:15.2-alpine 2>&1 | tee postgres.log
