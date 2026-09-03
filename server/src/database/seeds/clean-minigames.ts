import * as fs from 'fs';
import * as path from 'path';
import dataSource from '../data-source';
import { Starprint } from '../../modules/starprints/entities/starprint.entity';
import { GameResult } from '../../modules/games/entities/game-result.entity';
import { PlayerSession } from '../../modules/sessions/entities/player-session.entity';

async function cleanMinigames() {
  console.log('Connecting to database...');
  await dataSource.initialize();
  console.log('Connected.');

  const starprintRepo = dataSource.getRepository(Starprint);
  const gameResultRepo = dataSource.getRepository(GameResult);
  const sessionRepo = dataSource.getRepository(PlayerSession);

  // 1. Count before deletion
  const starprintCount = await starprintRepo.count();
  const gameResultCount = await gameResultRepo.count();
  const sessionCount = await sessionRepo.count();

  console.log('Current minigame records in database:');
  console.log(`- Starprints: ${starprintCount}`);
  console.log(`- Game results: ${gameResultCount}`);
  console.log(`- Player sessions: ${sessionCount}`);

  // 2. Clear tables in order
  console.log('Deleting minigame records...');
  await starprintRepo.createQueryBuilder().delete().from(Starprint).execute();
  await gameResultRepo.createQueryBuilder().delete().from(GameResult).execute();
  await sessionRepo.createQueryBuilder().delete().from(PlayerSession).execute();
  console.log('Minigame database tables cleared successfully.');

  // 3. Clean up uploaded user avatar images (UUID format webp files)
  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    const uuidWebpRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$/i;
    let deletedFiles = 0;
    for (const file of files) {
      if (uuidWebpRegex.test(file)) {
        fs.unlinkSync(path.join(uploadsDir, file));
        deletedFiles++;
      }
    }
    console.log(`Cleaned up ${deletedFiles} avatar image files in uploads/. Official assets preserved.`);
  }

  // 4. Verify other tables remain untouched
  const newsCount = await dataSource.query('SELECT COUNT(*) FROM news');
  const eventCount = await dataSource.query('SELECT COUNT(*) FROM events');
  const contactCount = await dataSource.query('SELECT COUNT(*) FROM contact_submissions');
  const eventRegCount = await dataSource.query('SELECT COUNT(*) FROM event_registrations');
  console.log('Verified intact data:');
  console.log(`- News: ${newsCount[0].count}`);
  console.log(`- Events: ${eventCount[0].count}`);
  console.log(`- Contact submissions: ${contactCount[0].count}`);
  console.log(`- Event registrations: ${eventRegCount[0].count}`);

  await dataSource.destroy();
  console.log('Minigame data cleanup complete.');
}

cleanMinigames().catch((err) => {
  console.error('Clean error:', err);
  process.exit(1);
});
