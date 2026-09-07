import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MediaStorage } from './media-storage.interface';
import { join, resolve, isAbsolute } from 'path';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/exceptions/domain-error.enum';

export function sanitizeFileName(name?: string): string {
  if (!name || !name.trim()) {
    return 'card';
  }
  return (
    name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'card'
  );
}

export function slugifyStudentName(name?: string, maxLength = 40): string {
  if (!name || !name.trim()) {
    return '';
  }
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLength)
    .replace(/-+$/, '');
}

export function sanitizeStarId(starId: string): string {
  if (!starId || typeof starId !== 'string') {
    throw new DomainException(DomainErrorCode.UPLOAD_INVALID, 'Invalid star identifier', 400);
  }
  const trimmed = starId.trim();
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    throw new DomainException(DomainErrorCode.UPLOAD_INVALID, 'Invalid characters in star identifier', 400);
  }
  return trimmed;
}

@Injectable()
export class LocalMediaStorage implements MediaStorage {
  private readonly uploadDir: string;
  private readonly cardsDir: string;

  constructor(private configService: ConfigService) {
    this.uploadDir = join(process.cwd(), this.configService.get<string>('media.localDir', 'uploads'));
    const configuredCardDir = this.configService.get<string>('media.cardDir');
    this.cardsDir = configuredCardDir
      ? (isAbsolute(configuredCardDir) ? configuredCardDir : join(process.cwd(), configuredCardDir))
      : join(this.uploadDir, 'cards');
    this.ensureDirExists();
  }

  private async ensureDirExists() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  private async ensureCardsDirExists() {
    try {
      await fs.access(this.cardsDir);
    } catch {
      await fs.mkdir(this.cardsDir, { recursive: true });
    }
  }

  getCardsDirectory(): string {
    return this.cardsDir;
  }

  async saveFile(buffer: Buffer, identifier?: string): Promise<string> {
    await this.ensureDirExists();
    const baseSlug = sanitizeFileName(identifier);
    const shortId = uuidv4().slice(0, 8);
    const filename = `${baseSlug}-${shortId}.webp`;
    const filepath = join(this.uploadDir, filename);
    await fs.writeFile(filepath, buffer);
    return `/uploads/${filename}`;
  }

  async saveCardFile(publicStarId: string, nickname: string, buffer: Buffer): Promise<string> {
    await this.ensureCardsDirExists();

    const safeId = sanitizeStarId(publicStarId);
    const safeSlug = slugifyStudentName(nickname);
    const filename = safeSlug ? `${safeId}_${safeSlug}.png` : `${safeId}.png`;
    const targetFilepath = join(this.cardsDir, filename);

    // Prevent path traversal
    const normalizedTarget = resolve(targetFilepath);
    const normalizedCardsDir = resolve(this.cardsDir);
    if (!normalizedTarget.startsWith(normalizedCardsDir)) {
      throw new DomainException(DomainErrorCode.UPLOAD_INVALID, 'Path traversal detected in card filename', 400);
    }

    // Atomic write via temporary file
    const tempFilename = `.${safeId}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}.tmp`;
    const tempFilepath = join(this.cardsDir, tempFilename);

    try {
      await fs.writeFile(tempFilepath, buffer);
      await fs.rename(tempFilepath, targetFilepath);
    } catch (err) {
      try {
        await fs.unlink(tempFilepath);
      } catch {
        // ignore
      }
      throw err;
    }

    // Idempotency & cleanup: remove any old file with same publicStarId prefix that isn't the target file
    try {
      const files = await fs.readdir(this.cardsDir);
      for (const f of files) {
        if (f !== filename && (f.startsWith(`${safeId}_`) || f === `${safeId}.png`)) {
          await fs.unlink(join(this.cardsDir, f)).catch(() => {});
        }
      }
    } catch {
      // non-fatal cleanup error
    }

    return filename;
  }

  async deleteCardFileByStarId(publicStarId: string): Promise<void> {
    try {
      await this.ensureCardsDirExists();
      const safeId = sanitizeStarId(publicStarId);
      const files = await fs.readdir(this.cardsDir);
      for (const f of files) {
        if (f.startsWith(`${safeId}_`) || f === `${safeId}.png`) {
          await fs.unlink(join(this.cardsDir, f)).catch(() => {});
        }
      }
    } catch {
      // non-fatal
    }
  }
}
