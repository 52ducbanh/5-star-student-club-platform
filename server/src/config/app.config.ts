export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/5ss',
    maxConnections: parseInt(process.env.DATABASE_MAX_CONNECTIONS || '30', 10),
    minConnections: parseInt(process.env.DATABASE_MIN_CONNECTIONS || '5', 10),
    idleTimeoutMs: parseInt(process.env.DATABASE_IDLE_TIMEOUT_MS || '30000', 10),
    connectionTimeoutMs: parseInt(process.env.DATABASE_CONNECT_TIMEOUT_MS || '5000', 10),
  },
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  media: {
    storage: process.env.MEDIA_STORAGE || 'local',
    localDir: process.env.MEDIA_LOCAL_DIR || 'uploads',
  }
});
