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

  async savePrintCardImage(
    publicStarId: string,
    nickname: string,
    buffer: Buffer,
  ): Promise<{ filename: string }> {
    if (!buffer || buffer.length === 0) {
      throw new DomainException(DomainErrorCode.UPLOAD_INVALID, 'Card image buffer is empty', 400);
    }

    try {
      const image = sharp(buffer);
      const metadata = await image.metadata();

      if (metadata.format !== 'png') {
        throw new DomainException(
          DomainErrorCode.UPLOAD_INVALID,
          `Invalid card image format: expected PNG, got ${metadata.format || 'unknown'}`,
          400,
        );
      }

      if (metadata.width !== 1200 || metadata.height !== 1886) {
        throw new DomainException(
          DomainErrorCode.UPLOAD_INVALID,
          `Invalid card dimensions: expected 1200x1886, got ${metadata.width}x${metadata.height}`,
          400,
        );
      }

      // Re-encode PNG to strip arbitrary chunks and ensure clean, canonical decodable file
      const normalizedBuffer = await sharp(buffer)
        .png({ compressionLevel: 9, adaptiveFiltering: true })
        .toBuffer();

      const filename = await this.storage.saveCardFile(publicStarId, nickname, normalizedBuffer);
      return { filename };
    } catch (err) {
      if (err instanceof DomainException) {
        throw err;
      }
      throw new DomainException(
        DomainErrorCode.UPLOAD_INVALID,
        'Failed to decode and validate print card image',
        400,
      );
    }
  }

  async deleteCardImageByStarId(publicStarId: string): Promise<void> {
    await this.storage.deleteCardFileByStarId(publicStarId);
  }

  getCardsDirectory(): string {
    return this.storage.getCardsDirectory();
  }
}
