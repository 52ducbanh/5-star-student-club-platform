import { Controller, Post, Delete, Param, UseInterceptors, UploadedFile, HttpCode } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UploadsService } from './uploads.service';
import { SessionsService } from '../sessions/sessions.service';
import { DomainException } from '../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../common/exceptions/domain-error.enum';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

@ApiTags('uploads')
@Controller('api/sessions/:sessionId/photo')
export class UploadsController {
  constructor(
    private readonly uploadsService: UploadsService,
    private readonly sessionsService: SessionsService,
  ) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: 'Upload a photo for a session' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
      fileFilter: (_req, file, callback) => {
        if (!file) {
          return callback(new DomainException(DomainErrorCode.PHOTO_REQUIRED, 'Photo file is required'), false);
        }
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase())) {
          return callback(
            new DomainException(DomainErrorCode.UPLOAD_INVALID, 'Only JPEG, PNG and WebP images are allowed'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadPhoto(
    @Param('sessionId') sessionId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new DomainException(DomainErrorCode.PHOTO_REQUIRED, 'Photo file is required');
    }

    // Verify session exists
    await this.sessionsService.findOne(sessionId);

    const photoUrl = await this.uploadsService.processAndSaveImage(file);
    await this.sessionsService.updatePhoto(sessionId, photoUrl);

    return { photoUrl };
  }

  @Delete()
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove photo for a session' })
  async deletePhoto(@Param('sessionId') sessionId: string): Promise<void> {
    await this.sessionsService.findOne(sessionId);
    await this.sessionsService.updatePhoto(sessionId, null);
  }
}
