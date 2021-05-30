# <img src="./src/ui/public/favicon144.png" width="32"> Musicociel

[![npm](https://img.shields.io/npm/v/musicociel)](https://www.npmjs.com/package/musicociel) [![dockerhub](https://img.shields.io/docker/v/davdiv/musicociel?label=dockerhub)](https://hub.docker.com/r/davdiv/musicociel/) [![license](https://img.shields.io/badge/license-AGPL--3.0-brightgreen)](./LICENSE.md) [![GitHub Workflow Status](https://img.shields.io/github/workflow/status/musicociel/musicociel/ci)](https://github.com/musicociel/musicociel/actions/workflows/ci.yml?query=branch%3Amain)

Web application to display and edit songs with lyrics and chords.

**Note that this application is still at an early stage of development and many features are either missing or not working as expected.**

## Demo

A _static_ _development_ version of the application is available at https://musicociel.github.io/musicociel/

As it is a _static_ version, it only shows part of the features of the application. Especially, it does not include any of the features that require the server part.

As it is a _development_ version, it is unstable. It is automatically deployed when the _main_ branch of this repository is updated.

## Installation

Musicociel is published on [npm](https://www.npmjs.com/package/musicociel) and [dockerhub](https://hub.docker.com/r/davdiv/musicociel/).

## Development

Musicociel is written in [TypeScript](https://www.typescriptlang.org/).

Make sure you have [node.js](https://nodejs.org/) installed on your machine.

After cloning this repository, use the following command (from the repository folder) to install dependencies and execute the build:

```
npm install
```

Then to start the server, use the following command:

```
npm start
```

The server is then listening at http://localhost:8081.

After changing source files, it is necessary to rebuild with the following command:

```
npm run build
```

Instead of manually running the build again after each change, it is possible to start the build in watch mode which means it is automatically re-executed when any of the source files changed. For this, use the following command:

```
npm run build:dev
```

To start the server and automatically restart it when files are changed, use the following command:

```
npm run start:dev
```

## License

<pre>
Musicociel: web application to display and edit songs with lyrics and chords.
Copyright (C) 2021 <a href="mailto:divde@musicociel.fr">DivDE</a>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the <a href="./LICENSE.md">GNU Affero General Public License</a>
along with this program. If not, see <a href="https://www.gnu.org/licenses/">https://www.gnu.org/licenses/</a>.
</pre>
