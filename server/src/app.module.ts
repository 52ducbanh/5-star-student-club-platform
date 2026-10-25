import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import { DatabaseModule } from './database/database.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { GamesModule } from './modules/games/games.module';
import { StarprintsModule } from './modules/starprints/starprints.module';
import { SkyModule } from './modules/sky/sky.module';
import { NewsModule } from './modules/news/news.module';
import { EventsModule } from './modules/events/events.module';
import { ContactModule } from './modules/contact/contact.module';
import { HealthModule } from './modules/health/health.module';
import { APP_GUARD } from '@nestjs/core';
import { WriteRateLimitGuard } from './common/guards/write-rate-limit.guard';

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
    SkyModule,
    NewsModule,
    EventsModule,
    ContactModule,
    HealthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: WriteRateLimitGuard }],
})
export class AppModule {}
