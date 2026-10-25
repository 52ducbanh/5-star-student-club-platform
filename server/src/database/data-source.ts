import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { join } from 'path';
import { databaseOptions } from '../config/database.config';

config();

export default new DataSource({
  ...databaseOptions(process.env, true),
  entities: [join(__dirname, '../**/*.entity.js')],
  migrations: [join(__dirname, 'migrations/*.js')],
});
