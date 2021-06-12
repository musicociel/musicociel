FROM docker.io/library/node:14-alpine
WORKDIR /usr/app
COPY package.json package-lock.json ./
RUN npm ci --production
COPY musicociel .
COPY build build/
USER node
EXPOSE 8080
ENV MUSICOCIEL_PORT=8081 \
    MUSICOCIEL_HOST=0.0.0.0 \
    MUSICOCIEL_ADDRESS=http://127.0.0.1:8081
ENTRYPOINT ["./musicociel"]
CMD ["server"]
