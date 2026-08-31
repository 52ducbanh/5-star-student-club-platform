import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StarprintsController } from './starprints.controller';
import { StarprintsService } from './starprints.service';
import { Starprint } from './entities/starprint.entity';
import { TypeEngine } from './domain/type-engine';
import { PaletteEngine } from './domain/palette-engine';
import { GamesModule } from '../games/games.module';
import { SessionsModule } from '../sessions/sessions.module';
import { SkyModule } from '../sky/sky.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Starprint]),
    GamesModule,
    SessionsModule,
    SkyModule
  ],
  controllers: [StarprintsController],
  providers: [StarprintsService, TypeEngine, PaletteEngine],
})
export class StarprintsModule {}
