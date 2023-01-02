import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "fr.musicociel.app",
  appName: "Musicociel",
  webDir: "build/public",
  bundledWebRuntime: false,
  android: {
    buildOptions: {
      keystorePath: "keys/keys.keystore",
      keystoreAlias: "keys",
      keystorePassword: process.env.KEYSTORE_PASS,
      keystoreAliasPassword: process.env.KEYSTORE_ALIAS_PASS,
      releaseType: "APK"
    }
  }
};

export default config;
