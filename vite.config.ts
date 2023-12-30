import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  base: "./",
  root: "src/ui/",
  publicDir: "public",
  build: {
    emptyOutDir: true,
    outDir: "../../build/public"
  },
  plugins: [
    VitePWA({
      strategies: "injectManifest",
      injectManifest: {
        globPatterns: ["**/*"]
      },
      injectRegister: null,
      srcDir: ".",
      filename: "sw.ts",
      manifest: {
        name: "Musicociel",
        short_name: "Musicociel",
        display: "standalone",
        start_url: ".",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        icons: [
          {
            src: "android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ],
        file_handlers: [
          {
            action: ".",
            accept: {
              "text/plain": [".txt", ".chordpro", ".cho", ".crd", ".chopro", ".chord", ".pro"]
            }
          }
        ]
      }
    }),
    svelte({
      configFile: "../../svelte.config.js"
    })
  ]
});
