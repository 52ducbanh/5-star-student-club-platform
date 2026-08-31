import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkyController } from './sky.controller';
import { SkyService } from './sky.service';
import { SkyGateway } from './sky.gateway';
import { Starprint } from '../starprints/entities/starprint.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Starprint])],
  controllers: [SkyController],
  providers: [SkyService, SkyGateway],
  exports: [SkyGateway],
})
export class SkyModule {}
