export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/5ss',
  },
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  media: {
    storage: process.env.MEDIA_STORAGE || 'local',
    localDir: process.env.MEDIA_LOCAL_DIR || 'uploads',
  }
});
