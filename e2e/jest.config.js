const path = require("path");

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  rootDir: path.join(__dirname, ".."),
  testMatch: ["<rootDir>/e2e/**/*.test.ts"],
  preset: "ts-jest/presets/default",
  verbose: true
};
