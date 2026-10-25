import dataSource from './data-source';

async function migrate() {
  await dataSource.initialize();
  const lock = dataSource.createQueryRunner();
  let acquired = false;
  try {
    await lock.connect();
    for (let attempt = 0; attempt < 30; attempt++) {
      const [result] = await lock.query('SELECT pg_try_advisory_lock(5052026) AS acquired');
      if (result.acquired) { acquired = true; break; }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    if (!acquired) throw new Error('Another deployment is applying migrations');
    const applied = await dataSource.runMigrations({ transaction: 'all' });
    console.log(`Applied ${applied.length} pending migration(s).`);
  } finally {
    if (acquired) await lock.query('SELECT pg_advisory_unlock(5052026)');
    await lock.release();
    await dataSource.destroy();
  }
}

migrate().catch(() => {
  console.error('Database migration failed. Inspect connectivity, permissions and migration history before retrying.');
  process.exitCode = 1;
});
