import { Controller, Post, Get, Param, Body, HttpCode, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { StarprintsService } from './starprints.service';
import { GenerateStarprintDto, PublishStarprintDto } from './dto/generate-starprint.dto';
import { DomainException } from '../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../common/exceptions/domain-error.enum';

@ApiTags('starprints')
@Controller('api/starprints')
export class StarprintsController {
  constructor(private readonly starprintsService: StarprintsService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate a starprint from completed games' })
  async generate(@Body() dto: GenerateStarprintDto) {
    return this.starprintsService.generate(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a starprint by ID' })
  async findOne(@Param('id') id: string) {
    return this.starprintsService.findOne(id);
  }

  @Post(':id/publish')
  @HttpCode(200)
  @ApiOperation({ summary: 'Publish a starprint to the sky' })
  async publish(@Param('id') id: string, @Body() dto: PublishStarprintDto) {
    await this.starprintsService.publish(id, dto);
    return { success: true };
  }

  @Post(':id/card-image')
  @HttpCode(200)
  @ApiOperation({ summary: 'Upload generated print card image for a starprint' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        sessionId: { type: 'string' },
      },
      required: ['file', 'sessionId'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
      fileFilter: (_req, file, callback) => {
        if (!file) {
          return callback(new DomainException(DomainErrorCode.PHOTO_REQUIRED, 'Card image file is required'), false);
        }
        if (file.mimetype.toLowerCase() !== 'image/png') {
          return callback(
            new DomainException(DomainErrorCode.UPLOAD_INVALID, 'Only PNG images are allowed for card print image'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadCardImage(
    @Param('id') id: string,
    @Body('sessionId') sessionId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new DomainException(DomainErrorCode.PHOTO_REQUIRED, 'Card image file is required');
    }
    return this.starprintsService.saveCardImage(id, sessionId, file.buffer);
  }
}
