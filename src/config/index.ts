// src/config/index.ts
export const config = {
  kiltNode: process.env.KILT_NODE_URL || 'wss://spiritnet.kilt.io',
  plcResolver: process.env.PLC_RESOLVER || 'https://plc.directory',
  port: process.env.PORT || 3000,
  cache: {
    ttlSeconds: parseInt(process.env.CACHE_TTL_SECONDS || '3600', 10) // 1 hour default
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes default
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10) // Limit each IP to 100 requests per windowMs default
  }
};
