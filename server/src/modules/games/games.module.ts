import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { GameResult } from './entities/game-result.entity';
import { ScoringService } from './scoring/scoring.service';
import { SessionsModule } from '../sessions/sessions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GameResult]),
    SessionsModule,
  ],
  controllers: [GamesController],
  providers: [GamesService, ScoringService],
  exports: [ScoringService, TypeOrmModule],
})
export class GamesModule {}
