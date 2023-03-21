#!/bin/bash

keytool -genkey -v -keystore keys.keystore -alias keys -keyalg RSA -keysize 2048 -validity 100000 -storetype jks -storepass "$KEYSTORE_PASS" -keypass "$KEYSTORE_ALIAS_PASS" -dname "CN=Musicociel"
