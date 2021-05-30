FROM node:14
WORKDIR /usr/app
COPY package.json package-lock.json ./
RUN npm ci --prod
COPY musicociel .
COPY build build/
USER node
EXPOSE 8080
ENV MUSICOCIEL_PORT=8081 \
    MUSICOCIEL_HOST=0.0.0.0 \
    MUSICOCIEL_ADDRESS=http://127.0.0.1:8081
ENTRYPOINT ["./musicociel", "server"]
