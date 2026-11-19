# Production Dockerfile for KhoNhac on Render
FROM node:22-bookworm-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Runner stage
FROM node:22-bookworm-slim

WORKDIR /app

# Install ca-certificates, curl and standalone yt-dlp binary
RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates curl && \
    curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp && \
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
ENV YTDLP_PATH=/usr/local/bin/yt-dlp

EXPOSE 3001

CMD ["node", "--experimental-sqlite", "server.js"]
