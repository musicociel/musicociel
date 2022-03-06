import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  base: "./",
  root: "src/ui/",
  build: {
    outDir: "../../build/public"
  },
  plugins: [
    VitePWA({
      strategies: "injectManifest",
      injectRegister: null,
      srcDir: ".",
      filename: "sw.ts",
      manifest: {
        name: "Musicociel",
        short_name: "Musicociel",
        display: "standalone",
        start_url: ".",
        icons: [
          {
            src: "favicon.ico",
            sizes: "16x16",
            type: "image/x-icon"
          },
          {
            src: "favicon144.png",
            sizes: "144x144",
            type: "image/png"
          },
          {
            src: "favicon512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "favicon.svg",
            sizes: "600x600",
            type: "image/svg+xml"
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
