# Production Dockerfile for KhoNhac
FROM node:22-bullseye-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Runner stage
FROM node:22-bullseye-slim

WORKDIR /app

# Install Python3, ffmpeg & yt-dlp
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 python3-pip ffmpeg && \
    pip3 install --no-cache-dir --break-system-packages yt-dlp && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./
COPY --from=builder /app/db.js ./
COPY --from=builder /app/public ./public

RUN mkdir -p downloads

ENV PORT=3001
ENV NODE_ENV=production
ENV YTDLP_PATH=yt-dlp

EXPOSE 3001

CMD ["node", "--experimental-sqlite", "server.js"]
