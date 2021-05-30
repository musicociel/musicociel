import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import html, { makeHtmlAttributes } from "@rollup/plugin-html";
import { injectManifest } from "rollup-plugin-workbox";
import commonjs from "@rollup/plugin-commonjs";
import copy from "rollup-plugin-copy";
import replace from "@rollup/plugin-replace";
import json from "@rollup/plugin-json";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";
import postcss from "rollup-plugin-postcss";
import purgecss from "@fullhuman/postcss-purgecss";
import sveltePreprocess from "svelte-preprocess";
import typescript from "@rollup/plugin-typescript";
import { join } from "path";

const production = !process.env.ROLLUP_WATCH;
console.log(`Building UI for ${production ? "PRODUCTION" : "DEVELOPMENT"}`);

const OUTPUT_FOLDER = join(__dirname, "build/public");

export default [
  {
    input: "src/ui/sw.ts",
    output: {
      file: join(OUTPUT_FOLDER, "sw.js")
    },
    plugins: [
      copy({
        targets: [{ src: "src/ui/public/*", dest: OUTPUT_FOLDER }]
      }),
      replace({
        preventAssignment: true,
        "process.env.NODE_ENV": JSON.stringify(production ? "production" : "development")
      }),
      resolve({
        browser: true
      }),
      commonjs(),
      typescript({
        sourceMap: !production,
        inlineSources: !production,
        tsconfig: "tsconfig.ui.json"
      }),
      production && terser()
    ]
  },
  {
    input: "src/ui/main.ts",
    output: {
      sourcemap: !production,
      format: "esm",
      name: "musicociel",
      dir: OUTPUT_FOLDER,
      entryFileNames: "js/[hash].js",
      chunkFileNames: "js/[hash].js"
    },
    plugins: [
      postcss({
        extract: "css/musicociel.css",
        minimize: production,
        plugins: [
          production &&
            purgecss({
              content: ["src/**/*.svelte"],
              safelist: {
                standard: [/^svelte-/, "html", "body"]
              }
            })
        ]
      }),
      json(),
      svelte({
        compilerOptions: {
          dev: !production
        },
        emitCss: true,
        preprocess: sveltePreprocess()
      }),
      html({
        title: "Musicociel",
        template: ({ attributes, files, publicPath, title }) => {
          const scripts = (files.js || [])
            .filter(({ isEntry }) => isEntry)
            .map(({ fileName }) => {
              const attrs = makeHtmlAttributes(attributes.script);
              return `<script src="${publicPath}${fileName}"${attrs}></script>`;
            })
            .join("\n");

          const links = (files.css || [])
            .map(({ fileName }) => {
              const attrs = makeHtmlAttributes(attributes.link);
              return `<link href="${publicPath}${fileName}" rel="stylesheet"${attrs}>`;
            })
            .join("\n");

          return `<!doctype html><html class="h-100"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="manifest" href="manifest.json"><title>${title}</title>${links}</head><body class="h-100">${scripts}</body></html>`;
        }
      }),
      replace({
        preventAssignment: true,
        "process.env.NODE_ENV": JSON.stringify(production ? "production" : "development"),
        "root.JS_SHA256_NO_NODE_JS": "true"
      }),
      resolve({
        // cf https://github.com/rollup/plugins/issues/684 why not updating to version 11
        browser: true,
        dedupe: ["svelte"]
      }),
      commonjs(),
      typescript({
        sourceMap: !production,
        inlineSources: !production,
        tsconfig: "tsconfig.ui.json"
      }),
      production &&
        injectManifest({
          injectionPoint: "self.__INJECTION_POINT__",
          swSrc: join(OUTPUT_FOLDER, "sw.js"),
          swDest: join(OUTPUT_FOLDER, "sw.js"),
          globDirectory: OUTPUT_FOLDER,
          globPatterns: ["**/*.{js,json,css,html,svg,png,ico}"],
          globIgnores: ["musicociel.json"]
        }),
      !production && livereload(OUTPUT_FOLDER),
      production && terser()
    ],
    onwarn(warning, warn) {
      // suppress some warnings:
      if (warning.code === "EVAL") return;
      if (warning.code === "PLUGIN_WARNING" && warning.pluginCode === "a11y-missing-attribute") return;
      warn(warning);
    },
    watch: {
      clearScreen: false
    }
  }
];
