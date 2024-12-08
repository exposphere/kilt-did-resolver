# Build stage
FROM --platform=$BUILDPLATFORM node:22-bookworm-slim AS builder

# Install curl (for healthcheck) and ca-certificates
RUN apt-get update \
&& apt-get install -y --no-install-recommends curl ca-certificates \
&& rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies first to cache the layer
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build \
    && npm prune --production

# Production stage
FROM --platform=$TARGETPLATFORM gcr.io/distroless/nodejs22-debian12:nonroot

# Copy built assets and production node_modules
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /usr/bin/curl /usr/bin/curl
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Set environment defaults
ENV NODE_ENV=production \
    PORT=3000 \
    KILT_NODE_URL=wss://spiritnet.kilt.io \
    PLC_RESOLVER=https://plc.directory \
    CACHE_TTL_SECONDS=3600 \
    RATE_LIMIT_WINDOW_MS=900000 \
    RATE_LIMIT_MAX_REQUESTS=100

# Start app
CMD ["dist/index.js"]
