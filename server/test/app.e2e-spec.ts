import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import request = require('supertest');
import { AppModule } from '../src/app.module';
import { DomainExceptionFilter } from '../src/common/filters/domain-exception.filter';
import { PlayerSession } from '../src/modules/sessions/entities/player-session.entity';

describe('STARPRINT Full Lifecycle (e2e)', () => {
  let app: INestApplication;
  let sessionId: string;
  let starprintId: string;
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
      // Test isolation: Clean up created test data so test runs do not pollute database
      if (sessionId && sessionRepo) {
        try {
          await sessionRepo.delete(sessionId);
        } catch {
          // Cleanup best-effort
        }
      }
      await app.close();
    }
  });

  it('1. POST /api/sessions - creates a new player session', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/sessions')
      .send({ nickname: 'SinhVienUET' })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.nickname).toBe('SinhVienUET');
    expect(res.body.status).toBe('IN_PROGRESS');
    expect(res.body.completedGameIds).toEqual([]);
    sessionId = res.body.id;
  });

  it('2. POST /api/sessions/:id/games/sprint - rejects submitting out of order (expects solve first)', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/sessions/${sessionId}/games/sprint`)
      .send({
        rawResult: {
          gameId: 'sprint',
          durationMs: 20000,
          obstaclesAvoided: 5,
          obstaclesEncountered: 5,
        },
      })
      .expect(400);

    expect(res.body.code).toBe('INVALID_GAME_STATE');
  });

  it('3. POST /api/sessions/:id/games/solve - rejects invalid rawResult payload (BUG-API-01 verification)', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/sessions/${sessionId}/games/solve`)
      .send({
        rawResult: {
          gameId: 'solve',
          answers: [
            { questionId: 'invalid_q_id', selectedOptionId: 'x' },
          ],
        },
      })
      .expect(400);

    expect(res.body.code).toBe('INVALID_GAME_RESULT');
  });

  it('4. POST /api/starprints/generate - rejects generation before 5 games complete', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/starprints/generate')
      .send({ sessionId, baseColor: '#ffd467' })
      .expect(400);

    expect(res.body.code).toBe('NOT_ALL_GAMES_COMPLETED');
  });

  it('5. Submits valid SOLVE game and rejects duplicate SOLVE submission', async () => {
    // 5.1 Submit valid SOLVE
    const solveRes = await request(app.getHttpServer())
      .post(`/api/sessions/${sessionId}/games/solve`)
      .send({
        rawResult: {
          gameId: 'solve',
          answers: [
            { questionId: 'q1', selectedOptionId: 'b', responseTimeMs: 1500 },
            { questionId: 'q2', selectedOptionId: 'c', responseTimeMs: 2000 },
            { questionId: 'q3', selectedOptionId: 'c', responseTimeMs: 1800 },
            { questionId: 'q4', selectedOptionId: 'c', responseTimeMs: 2200 },
          ],
          totalDurationMs: 7500,
        },
      })
      .expect(201);
    expect(solveRes.body.completedGameIds).toEqual(['solve']);

    // 5.2 Re-submit SOLVE -> Expect GAME_ALREADY_SUBMITTED
    const dupRes = await request(app.getHttpServer())
      .post(`/api/sessions/${sessionId}/games/solve`)
      .send({
        rawResult: {
          gameId: 'solve',
          answers: [],
          totalDurationMs: 5000,
        },
      })
      .expect(400);
    expect(dupRes.body.code).toBe('GAME_ALREADY_SUBMITTED');
  });

  it('6. Sequential mini-game submissions: SENSE -> SPRINT -> SUPPORT -> SYNC', async () => {
    // 6.1 SENSE
    const senseRes = await request(app.getHttpServer())
      .post(`/api/sessions/${sessionId}/games/sense`)
      .send({
        rawResult: {
          gameId: 'sense',
          decisions: [
            { scenarioId: 's1', optionId: 'a', responseTimeMs: 3000 },
            { scenarioId: 's2', optionId: 'b', responseTimeMs: 3500 },
            { scenarioId: 's3', optionId: 'a', responseTimeMs: 2800 },
          ],
          totalDurationMs: 9300,
        },
      })
      .expect(201);
    expect(senseRes.body.completedGameIds).toEqual(['solve', 'sense']);

    // 6.2 SPRINT
    const sprintRes = await request(app.getHttpServer())
      .post(`/api/sessions/${sessionId}/games/sprint`)
      .send({
        rawResult: {
          gameId: 'sprint',
          durationMs: 20000,
          obstaclesAvoided: 8,
          obstaclesEncountered: 8,
          collectiblesCollected: 6,
          collectiblesAvailable: 6,
          collisions: 0,
          jumpCount: 12,
        },
      })
      .expect(201);
    expect(sprintRes.body.completedGameIds).toEqual(['solve', 'sense', 'sprint']);

    // 6.3 SUPPORT
    const supportRes = await request(app.getHttpServer())
      .post(`/api/sessions/${sessionId}/games/support`)
      .send({
        rawResult: {
          gameId: 'support',
          completed: true,
          rotations: 7,
          elapsedMs: 12000,
        },
      })
      .expect(201);
    expect(supportRes.body.completedGameIds).toEqual(['solve', 'sense', 'sprint', 'support']);

    // 6.4 SYNC
    const syncRes = await request(app.getHttpServer())
      .post(`/api/sessions/${sessionId}/games/sync`)
      .send({
        rawResult: {
          gameId: 'sync',
          completed: true,
          pairsMatched: 4,
          flips: 8,
          mismatches: 0,
          elapsedMs: 14000,
        },
      })
      .expect(201);
    expect(syncRes.body.completedGameIds).toEqual(['solve', 'sense', 'sprint', 'support', 'sync']);
  });

  it('7. GET /api/sessions/:id - restores session state upon page reload', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/sessions/${sessionId}`)
      .expect(200);

    expect(res.body.id).toBe(sessionId);
    expect(res.body.status).toBe('READY_TO_GENERATE');
    expect(res.body.completedGameIds.length).toBe(5);
  });

  it('8. POST /api/starprints/generate - generates authoritative Starprint with atomic transaction', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/starprints/generate')
      .send({ sessionId, baseColor: '#ffd467' })
      .expect(201);

    starprintId = res.body.id;
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('palette');
    expect(res.body.palette.length).toBe(5);
    expect(res.body).toHaveProperty('type');
    expect(res.body.type).toHaveProperty('name');
    expect(res.body.effect).toBeDefined();
    // Hidden behavioral profile is NOT exposed to client
    expect(res.body).not.toHaveProperty('profile');
  });

  it('9. GET /api/starprints/:id - retrieves starprint details', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/starprints/${starprintId}`)
      .expect(200);

    expect(res.body.id).toBe(starprintId);
    expect(res.body.nickname).toBe('SinhVienUET');
  });

  it('10. POST /api/starprints/:id/publish - publishes to 5SS Sky with consent', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/starprints/${starprintId}/publish`)
      .send({ consentName: true, consentPhoto: false })
      .expect(200);

    expect(res.body.success).toBe(true);
  });

  it('11. GET /api/sky - lists public stars, respecting privacy consents', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/sky')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    const star = res.body.find((s: any) => s.id === starprintId);
    expect(star).toBeDefined();
    expect(star.nickname).toBe('SinhVienUET'); // consentName = true
    expect(star.photoUrl).toBeNull(); // consentPhoto = false
  });
});
