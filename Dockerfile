FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
RUN apk add --no-cache tzdata
ENV TZ=America/Santiago
ENV DATA_DIR=/data
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server

VOLUME /data
EXPOSE 3000
CMD ["node", "server/index.js"]
