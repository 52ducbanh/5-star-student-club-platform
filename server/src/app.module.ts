import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import { DatabaseModule } from './database/database.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { GamesModule } from './modules/games/games.module';
import { StarprintsModule } from './modules/starprints/starprints.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { SkyModule } from './modules/sky/sky.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    DatabaseModule,
    SessionsModule,
    GamesModule,
    StarprintsModule,
    UploadsModule,
    SkyModule,
  ],
})
export class AppModule {}
