import { databaseOptions } from '../src/config/database.config';
describe('Deployment database configuration', () => {
  it('requires a production connection', () => {
    expect(() => databaseOptions({ NODE_ENV: 'production' })).toThrow('DATABASE_URL');
  });
  it('verifies TLS and uses a small application pool', () => {
    const options = databaseOptions({ NODE_ENV: 'production', DATABASE_URL: 'postgresql://user:pass@db/db', DATABASE_SSL_CA: 'certificate' });
    expect(options.ssl).toEqual({ rejectUnauthorized: true, ca: 'certificate' });
    expect(options.extra.max).toBe(5);
    expect(options.synchronize).toBe(false);
  });
  it('separates migration credentials', () => {
    const env = { DATABASE_URL: 'runtime', MIGRATION_DATABASE_URL: 'migration' };
    expect(databaseOptions(env).url).toBe('runtime');
    expect(databaseOptions(env, true).url).toBe('migration');
  });
  it('rejects SSL query options that could replace certificate verification', () => {
    expect(() => databaseOptions({ NODE_ENV: 'production', DATABASE_URL: 'postgresql://db/db?sslmode=require' })).toThrow('remove SSL query');
  });
});
