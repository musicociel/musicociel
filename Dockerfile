# syntax=docker/dockerfile:1.2
FROM docker.io/library/node:20-alpine
WORKDIR /usr/app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY musicociel.js .
COPY build build/
USER node
EXPOSE 8081
ENV MUSICOCIEL_PORT=8081 \
    MUSICOCIEL_HOST=0.0.0.0 \
    MUSICOCIEL_ADDRESS=http://127.0.0.1:8081
ENTRYPOINT ["./musicociel.js"]
CMD ["server"]
