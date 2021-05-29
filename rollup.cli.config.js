import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import { terser } from "rollup-plugin-terser";
import typescript from "@rollup/plugin-typescript";
import { string } from "rollup-plugin-string";

const pkg = require("./package.json");
const production = !process.env.ROLLUP_WATCH;
console.log(`Building for ${production ? "PRODUCTION" : "DEVELOPMENT"}`);

export default {
  input: "src/cli/main.ts",
  output: {
    sourcemap: !production,
    format: "cjs",
    name: "musicociel",
    inlineDynamicImports: true,
    file: "build/cli.js"
  },
  external: ["http", "https", "fs", "path", "url", "zlib", "child_process", ...Object.keys(pkg.dependencies)],
  plugins: [
    replace({
      preventAssignment: true,
      "process.env.NODE_ENV": JSON.stringify(production ? "production" : "development")
    }),
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
    }),
    production && terser()
  ],
  watch: {
    clearScreen: false
  }
};
