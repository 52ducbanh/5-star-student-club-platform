import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MediaStorage } from './media-storage.interface';
import { join } from 'path';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';

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

  async saveFile(buffer: Buffer, _originalName?: string): Promise<string> {
    await this.ensureDirExists();
    const filename = `${uuidv4()}.webp`;
    const filepath = join(this.uploadDir, filename);
    await fs.writeFile(filepath, buffer);
    return `/uploads/${filename}`;
  }
}
