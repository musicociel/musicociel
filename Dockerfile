# syntax=docker/dockerfile:1.2
FROM docker.io/library/node:18-alpine
WORKDIR /usr/app
COPY .yarn/releases .yarn/releases
COPY package.json yarn.lock .yarnrc.yml ./
RUN corepack enable
RUN --mount=type=bind,target=/usr/app/.yarn,source=.yarn,rw yarn workspaces focus --all --production
COPY musicociel .
COPY build build/
USER node
EXPOSE 8081
ENV MUSICOCIEL_PORT=8081 \
    MUSICOCIEL_HOST=0.0.0.0 \
    MUSICOCIEL_ADDRESS=http://127.0.0.1:8081
ENTRYPOINT ["./musicociel"]
CMD ["server"]
