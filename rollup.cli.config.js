import { fileURLToPath } from "url";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import typescript from "@rollup/plugin-typescript";
import { string } from "rollup-plugin-string";
import json from "@rollup/plugin-json";
import { rm } from "fs/promises";
import { join } from "path";
import pkg from "./package.json" assert { type: "json" };

const production = !process.env.ROLLUP_WATCH;
console.log(`Building CLI for ${production ? "PRODUCTION" : "DEVELOPMENT"}`);

const clean = () => ({
  async buildStart() {
    await rm(join(fileURLToPath(import.meta.url), "../build/cli.cjs"), { force: true });
  }
});

export default {
  input: "src/cli/main.ts",
  output: {
    sourcemap: !production,
    format: "cjs",
    name: "musicociel",
    inlineDynamicImports: true,
    file: "build/cli.cjs"
  },
  external: ["http", "https", "fs", "path", "url", "zlib", "child_process", ...Object.keys(pkg.dependencies)],
  plugins: [
    clean(),
    replace({
      preventAssignment: true,
      "process.env.NODE_ENV": JSON.stringify(production ? "production" : "development")
    }),
    json(),
    resolve({
      browser: false,
      preferBuiltins: true
    }),
    string({
      include: "**/*.sql"
    }),
    commonjs(),
    typescript({
      sourceMap: !production,
      inlineSources: !production,
      tsconfig: "tsconfig.cli.json"
    })
  ],
  watch: {
    clearScreen: false
  }
};
