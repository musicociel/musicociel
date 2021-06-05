const path = require("path");

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  rootDir: path.join(__dirname, ".."),
  testMatch: ["<rootDir>/test/**/*.test.ts"],
  coverageDirectory: "coverage",
  collectCoverageFrom: ["src/**/*"],
  preset: "ts-jest/presets/default",
  verbose: true
};
