import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import request = require('supertest');
import { HealthController } from '../src/modules/health/health.controller';
describe('Health probes', () => {
  let app: INestApplication;
  const query = jest.fn();
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: DataSource, useValue: { driver: { master: { query } } } }],
    }).compile();
    app = module.createNestApplication(); await app.init();
  });
  beforeEach(() => { query.mockReset(); });
  afterAll(async () => { await app.close(); });
  it('keeps liveness independent of the database', async () => {
    await request(app.getHttpServer()).get('/api/health').expect('Cache-Control', 'no-store')
      .expect(200, { status: 'ok', service: '5ss-api' });
    expect(query).not.toHaveBeenCalled();
  });
  it('bounds its readiness query', async () => {
    query.mockResolvedValue({ rows: [{ value: 1 }] });
    await request(app.getHttpServer()).get('/api/health/ready').expect(200);
    expect(query).toHaveBeenCalledWith({ text: 'SELECT 1', query_timeout: 2000 });
  });
  it('returns 503 without leaking internal errors', async () => {
    query.mockRejectedValue(new Error('secret connection string'));
    const result = await request(app.getHttpServer()).get('/api/health/ready').expect(503);
    expect(result.body).toEqual({ status: 'error', service: '5ss-api', database: 'unavailable' });
  });
});
