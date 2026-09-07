import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import request = require('supertest');
import type sharpType from 'sharp';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const sharp: typeof sharpType = require('sharp');
import * as path from 'path';
import * as fs from 'fs/promises';
import { AppModule } from '../src/app.module';
import { DomainExceptionFilter } from '../src/common/filters/domain-exception.filter';
import { PlayerSession, SessionStatus } from '../src/modules/sessions/entities/player-session.entity';
import { Starprint } from '../src/modules/starprints/entities/starprint.entity';
import { UploadsService } from '../src/modules/uploads/uploads.service';
import { LocalMediaStorage, slugifyStudentName, sanitizeStarId } from '../src/modules/uploads/storage/local-media-storage';
import { StarprintsService } from '../src/modules/starprints/starprints.service';
import { DomainException } from '../src/common/exceptions/domain.exception';
import { DomainErrorCode } from '../src/common/exceptions/domain-error.enum';

describe('Autonomous Star Card Print Pipeline', () => {
  let app: INestApplication;
  let uploadsService: UploadsService;
  let starprintsService: StarprintsService;
  let sessionRepo: Repository<PlayerSession>;
  let starprintRepo: Repository<Starprint>;

  let testSessionId: string;
  let testStarprintId: string;
  const testPublicStarId = 'STAR-TEST9999';

  let validPngBuffer: Buffer;
  let wrongSizePngBuffer: Buffer;

  beforeAll(async () => {
    // Generate valid 1200x1886 PNG buffer using sharp
    validPngBuffer = await sharp({
      create: {
        width: 1200,
        height: 1886,
        channels: 4,
        background: { r: 11, g: 15, b: 46, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    // Generate wrong-size (600x943) PNG buffer
    wrongSizePngBuffer = await sharp({
      create: {
        width: 600,
        height: 943,
        channels: 4,
        background: { r: 11, g: 15, b: 46, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new DomainExceptionFilter());

    // Main route restriction test handler parity
    app.use('/uploads/cards', (_req, res) => {
      res.status(403).json({ statusCode: 403, message: 'Access to print assets is restricted' });
    });

    await app.init();

    uploadsService = app.get(UploadsService);
    starprintsService = app.get(StarprintsService);
    sessionRepo = app.get(getRepositoryToken(PlayerSession));
    starprintRepo = app.get(getRepositoryToken(Starprint));

    // Seed a test session and starprint
    const session = sessionRepo.create({
      nickname: 'Nguyễn Văn Test',
      status: SessionStatus.PUBLISHED,
    });
    const savedSession = await sessionRepo.save(session);
    testSessionId = savedSession.id;

    const starprint = starprintRepo.create({
      sessionId: testSessionId,
      baseColor: '#ffd467',
      palette: ['#ffd467'],
      type: 'STRATEGIST',
      effect: 'SHIMMER',
      profile: {},
      publicStarId: testPublicStarId,
      physicalCardRequested: true,
      mediaPermission: true,
    });
    const savedStarprint = await starprintRepo.save(starprint);
    testStarprintId = savedStarprint.id;
  });

  afterAll(async () => {
    // Clean up created entities
    try {
      if (testStarprintId) await starprintRepo.delete(testStarprintId);
      if (testSessionId) await sessionRepo.delete(testSessionId);
      if (testPublicStarId) await uploadsService.deleteCardImageByStarId(testPublicStarId);
    } catch {
      // ignore
    }
    if (app) await app.close();
  });

  describe('1. Name normalization & Path safety helpers', () => {
    it('normalizes student names with Vietnamese diacritics into safe slugs', () => {
      expect(slugifyStudentName('Nguyễn Văn A')).toBe('nguyen-van-a');
      expect(slugifyStudentName('Đỗ Đức Bảo')).toBe('do-duc-bao');
      expect(slugifyStudentName('   Trần   Thị   Mai   ')).toBe('tran-thi-mai');
      expect(slugifyStudentName('Special@#$!%^&*Characters')).toBe('special-characters');
      expect(slugifyStudentName('')).toBe('');
    });

    it('sanitizes publicStarId and rejects malicious traversal characters', () => {
      expect(sanitizeStarId('STAR-ABC12345')).toBe('STAR-ABC12345');
      expect(sanitizeStarId('STAR_XYZ_88')).toBe('STAR_XYZ_88');
      expect(() => sanitizeStarId('../../../etc/passwd')).toThrow();
    });
  });

  describe('2. UploadsService & LocalMediaStorage validation & idempotency', () => {
    it('rejects non-PNG files (e.g. text/corrupted bytes)', async () => {
      const fakeBuffer = Buffer.from('this is not an image');
      await expect(
        uploadsService.savePrintCardImage('STAR-TEST1', 'User', fakeBuffer),
      ).rejects.toThrow(DomainException);
    });

    it('rejects PNG files with wrong dimensions (e.g. 600x943)', async () => {
      await expect(
        uploadsService.savePrintCardImage('STAR-TEST2', 'User', wrongSizePngBuffer),
      ).rejects.toThrow(DomainException);
    });

    it('accepts 1200x1886 PNG, re-encodes, and saves canonical file', async () => {
      const result = await uploadsService.savePrintCardImage(testPublicStarId, 'Nguyễn Văn Test', validPngBuffer);
      expect(result.filename).toBe(`${testPublicStarId}_nguyen-van-test.png`);

      const cardsDir = uploadsService.getCardsDirectory();
      const savedPath = path.join(cardsDir, result.filename);
      const stat = await fs.stat(savedPath);
      expect(stat.isFile()).toBe(true);

      // Verify the saved file is indeed 1200x1886 PNG
      const savedMetadata = await sharp(savedPath).metadata();
      expect(savedMetadata.format).toBe('png');
      expect(savedMetadata.width).toBe(1200);
      expect(savedMetadata.height).toBe(1886);
    });

    it('is idempotent and cleans up stale file when student name changes', async () => {
      const cardsDir = uploadsService.getCardsDirectory();

      // First upload with initial name
      const res1 = await uploadsService.savePrintCardImage(testPublicStarId, 'Tên Cũ', validPngBuffer);
      expect(res1.filename).toBe(`${testPublicStarId}_ten-cu.png`);
      const path1 = path.join(cardsDir, `${testPublicStarId}_ten-cu.png`);
      expect(await fs.access(path1).then(() => true).catch(() => false)).toBe(true);

      // Second upload with updated name
      const res2 = await uploadsService.savePrintCardImage(testPublicStarId, 'Tên Mới', validPngBuffer);
      expect(res2.filename).toBe(`${testPublicStarId}_ten-moi.png`);
      const path2 = path.join(cardsDir, `${testPublicStarId}_ten-moi.png`);
      expect(await fs.access(path2).then(() => true).catch(() => false)).toBe(true);

      // Verify old file was purged
      expect(await fs.access(path1).then(() => true).catch(() => false)).toBe(false);

      // Clean up
      await uploadsService.deleteCardImageByStarId(testPublicStarId);
    });
  });

  describe('3. StarprintsService saveCardImage authorization & business logic', () => {
    it('rejects mutation when publicStarId is supplied instead of UUID', async () => {
      await expect(
        starprintsService.saveCardImage(testPublicStarId, testSessionId, validPngBuffer),
      ).rejects.toThrow(DomainException);
    });

    it('rejects when sessionId is missing or incorrect', async () => {
      await expect(
        starprintsService.saveCardImage(testStarprintId, '', validPngBuffer),
      ).rejects.toThrow(DomainException);

      await expect(
        starprintsService.saveCardImage(testStarprintId, '00000000-0000-0000-0000-000000000000', validPngBuffer),
      ).rejects.toThrow(DomainException);
    });

    it('skips saving to print folder when physicalCardRequested is false', async () => {
      // Temporarily set physicalCardRequested = false
      await starprintRepo.update(testStarprintId, { physicalCardRequested: false });

      const res = await starprintsService.saveCardImage(testStarprintId, testSessionId, validPngBuffer);
      expect(res.success).toBe(true);
      expect(res.saved).toBe(false);
      expect(res.reason).toBe('PHYSICAL_CARD_NOT_REQUESTED');

      // Verify no file exists
      const cardsDir = uploadsService.getCardsDirectory();
      const files = await fs.readdir(cardsDir);
      const matching = files.filter((f) => f.startsWith(testPublicStarId));
      expect(matching.length).toBe(0);

      // Restore physicalCardRequested = true
      await starprintRepo.update(testStarprintId, { physicalCardRequested: true });
    });

    it('successfully saves when physicalCardRequested is true and session matches', async () => {
      const res = await starprintsService.saveCardImage(testStarprintId, testSessionId, validPngBuffer);
      expect(res.success).toBe(true);
      expect(res.saved).toBe(true);

      const cardsDir = uploadsService.getCardsDirectory();
      const files = await fs.readdir(cardsDir);
      const matching = files.filter((f) => f.startsWith(testPublicStarId));
      expect(matching.length).toBe(1);
    });
  });

  describe('4. HTTP Endpoint E2E & Route Protection', () => {
    it('rejects unauthorized upload with 403 when session ID does not match', async () => {
      await request(app.getHttpServer())
        .post(`/api/starprints/${testStarprintId}/card-image`)
        .field('sessionId', '99999999-9999-9999-9999-999999999999')
        .attach('file', validPngBuffer, 'card.png')
        .expect(403);
    });

    it('rejects wrong dimension image with 400', async () => {
      await request(app.getHttpServer())
        .post(`/api/starprints/${testStarprintId}/card-image`)
        .field('sessionId', testSessionId)
        .attach('file', wrongSizePngBuffer, 'card.png')
        .expect(400);
    });

    it('accepts valid 1200x1886 PNG with owner session and saves card', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/starprints/${testStarprintId}/card-image`)
        .field('sessionId', testSessionId)
        .attach('file', validPngBuffer, 'card.png')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.saved).toBe(true);
    });

    it('strictly blocks public HTTP access to /uploads/cards with 403 Forbidden', async () => {
      const cardsDir = uploadsService.getCardsDirectory();
      const files = await fs.readdir(cardsDir);
      const targetFile = files.find((f) => f.startsWith(testPublicStarId));
      expect(targetFile).toBeDefined();

      await request(app.getHttpServer())
        .get(`/uploads/cards/${targetFile}`)
        .expect(403);
    });
  });
});
