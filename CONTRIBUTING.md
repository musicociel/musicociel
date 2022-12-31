# Contributing to Musicociel

## Building

Musicociel is written in [TypeScript](https://www.typescriptlang.org/).

In order to build it, make sure you have [node.js](https://nodejs.org/) installed on your machine and that [corepack is enabled](https://nodejs.org/api/corepack.html#enabling-the-feature) (with `corepack enable`).

After cloning this repository, use the following command (from the repository folder) to install dependencies and execute the build:

```
yarn install
yarn build
```

Then to start the server, use the following command:

```
yarn start
```

The server is then listening at http://localhost:8081.

After changing source files, it is necessary to rebuild with the following command:

```
yarn build
```

### Watch mode

Instead of manually running the build again after each change, it is possible to start the build in watch mode which means it is automatically re-executed when any of the source files changed. For this, use the following command:

```
yarn build:dev
```

To start the server and automatically restart it when files are changed, use the following command:

```
yarn start:dev
```

Note that the build in watch mode is different than the production build (no minification, livereload feature).
