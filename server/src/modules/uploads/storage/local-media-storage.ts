import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MediaStorage } from './media-storage.interface';
import { join } from 'path';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';

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

@Injectable()
export class LocalMediaStorage implements MediaStorage {
  private readonly uploadDir: string;

  constructor(private configService: ConfigService) {
    this.uploadDir = join(process.cwd(), this.configService.get<string>('media.localDir', 'uploads'));
    this.ensureDirExists();
  }

  private async ensureDirExists() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
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
}
