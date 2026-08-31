import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { PlayerSession } from './entities/player-session.entity';
import { GameResult } from '../games/entities/game-result.entity';
import { Starprint } from '../starprints/entities/starprint.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlayerSession, GameResult, Starprint])],
  controllers: [SessionsController],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}

