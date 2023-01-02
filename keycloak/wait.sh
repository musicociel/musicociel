#!/bin/bash

while ! grep "Startup for Musicociel successfully executed!" ./keycloak.log &> /dev/null ; do sleep 1; done
