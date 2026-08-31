import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { LocalMediaStorage } from './storage/local-media-storage';
import { SessionsModule } from '../sessions/sessions.module';

@Module({
  imports: [SessionsModule],
  controllers: [UploadsController],
  providers: [UploadsService, LocalMediaStorage],
})
export class UploadsModule {}
