import { readFileSync } from 'fs';

export function databaseOptions(env: NodeJS.ProcessEnv = process.env, migration = false) {
  const production = env.NODE_ENV === 'production';
  const url = (migration ? env.MIGRATION_DATABASE_URL : undefined) || env.DATABASE_URL;
  if (production && !url) throw new Error('DATABASE_URL is required in production');
  const sslEnabled = env.DATABASE_SSL === 'true' || production;
  if (sslEnabled && url && /[?&]ssl(mode|cert|key|rootcert)=/i.test(url)) {
    throw new Error('Configure TLS with DATABASE_SSL_CA or DATABASE_SSL_CA_FILE; remove SSL query parameters from DATABASE_URL');
  }
  const ca = env.DATABASE_SSL_CA?.replace(/\\n/g, '\n') ||
    (env.DATABASE_SSL_CA_FILE ? readFileSync(env.DATABASE_SSL_CA_FILE, 'utf8') : undefined);
  return {
    type: 'postgres' as const,
    url: url || 'postgresql://postgres:postgres@localhost:5432/5ss',
    ssl: sslEnabled ? { rejectUnauthorized: true, ...(ca ? { ca } : {}) } : false,
    synchronize: false,
    extra: {
      max: migration ? 2 : Number(env.DATABASE_MAX_CONNECTIONS || 5),
      min: Number(env.DATABASE_MIN_CONNECTIONS || 0),
      idleTimeoutMillis: Number(env.DATABASE_IDLE_TIMEOUT_MS || 30000),
      connectionTimeoutMillis: Number(env.DATABASE_CONNECT_TIMEOUT_MS || 3000),
      options: '-c search_path=public,extensions',
    },
  };
}
