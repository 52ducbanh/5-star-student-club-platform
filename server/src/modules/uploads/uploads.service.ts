import { Injectable } from '@nestjs/common';
import type sharpType from 'sharp';
import { LocalMediaStorage } from './storage/local-media-storage';
import { DomainException } from '../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../common/exceptions/domain-error.enum';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const sharp: typeof sharpType = require('sharp');

// Limit Sharp thread concurrency and disable buffer caching to avoid memory/CPU spikes
sharp.concurrency(2);
sharp.cache(false);

@Injectable()
export class UploadsService {
  constructor(private readonly storage: LocalMediaStorage) {}

  async processAndSaveImage(file: Express.Multer.File, identifier?: string): Promise<string> {
    if (!file) {
      throw new DomainException(DomainErrorCode.UPLOAD_INVALID, 'File is missing');
    }

    try {
      const processedBuffer = await sharp(file.buffer)
        .rotate()
        .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();

      return await this.storage.saveFile(processedBuffer, identifier || file.originalname);
    } catch {
      throw new DomainException(DomainErrorCode.UPLOAD_INVALID, 'Failed to process image');
    }
  }
}
