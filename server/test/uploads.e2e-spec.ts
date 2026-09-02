import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import request = require('supertest');
import { AppModule } from '../src/app.module';
import { DomainExceptionFilter } from '../src/common/filters/domain-exception.filter';
import { PlayerSession } from '../src/modules/sessions/entities/player-session.entity';

describe('Photo Upload & Persistence (e2e)', () => {
  let app: INestApplication;
  let sessionId: string;
  let sessionRepo: Repository<PlayerSession>;

  beforeAll(async () => {
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
    await app.init();

    sessionRepo = app.get(getRepositoryToken(PlayerSession));
  });

  afterAll(async () => {
    if (app) {
      if (sessionId && sessionRepo) {
        try {
          await sessionRepo.delete(sessionId);
        } catch {
          // ignore
        }
      }
      await app.close();
    }
  });

  it('1. Creates a session for photo upload test', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/sessions')
      .send({ nickname: 'PhotoTestUser' })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.photoUrl).toBeNull();
    sessionId = res.body.id;
  });

  it('2. Rejects upload when no file is provided', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/sessions/${sessionId}/photo`)
      .expect(400);

    expect(res.body.code).toBe('PHOTO_REQUIRED');
  });

  it('3. Rejects upload with invalid mime type (e.g. text/plain)', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/sessions/${sessionId}/photo`)
      .attach('file', Buffer.from('not an image'), 'test.txt')
      .expect(400);

    expect(res.body.code).toBe('UPLOAD_INVALID');
  });

  it('4. Rejects upload for non-existent session ID', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';
    const validPng = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64',
    );
    const res = await request(app.getHttpServer())
      .post(`/api/sessions/${nonExistentId}/photo`)
      .attach('file', validPng, 'portrait.png')
      .expect(404);

    expect(res.body.code).toBe('SESSION_NOT_FOUND');
  });

  it('5. Successfully uploads valid PNG image, converts to WebP, updates session', async () => {
    const validPng = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64',
    );
    const res = await request(app.getHttpServer())
      .post(`/api/sessions/${sessionId}/photo`)
      .attach('file', validPng, 'my-portrait.png')
      .expect(200);

    expect(res.body.photoUrl).toBeDefined();
    expect(res.body.photoUrl).toMatch(/^\/uploads\/[0-9a-f-]+\.webp$/);

    // Verify session in database has updated photoUrl
    const sessionRes = await request(app.getHttpServer())
      .get(`/api/sessions/${sessionId}`)
      .expect(200);
    expect(sessionRes.body.photoUrl).toBe(res.body.photoUrl);
  });

  it('6. DELETE /api/sessions/:id/photo removes photo and sets session photoUrl to null', async () => {
    await request(app.getHttpServer())
      .delete(`/api/sessions/${sessionId}/photo`)
      .expect(204);

    const sessionRes = await request(app.getHttpServer())
      .get(`/api/sessions/${sessionId}`)
      .expect(200);
    expect(sessionRes.body.photoUrl).toBeNull();
  });
});
