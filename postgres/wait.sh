#!/bin/bash

while [[ "$(grep "database system is ready to accept connections" ./postgres.log 2> /dev/null | wc -l)" != "2" ]] ; do sleep 1; done
