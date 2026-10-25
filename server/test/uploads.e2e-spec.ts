import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request = require('supertest');
import { AppModule } from '../src/app.module';
describe('Retired server file storage (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    await app.init();
  });
  afterAll(async () => { await app?.close(); });
  it('does not accept portraits', async () => {
    await request(app.getHttpServer()).post('/api/sessions/00000000-0000-0000-0000-000000000001/photo')
      .attach('file', Buffer.from('image'), 'portrait.png').expect(404);
  });
  it('does not accept print cards', async () => {
    await request(app.getHttpServer()).post('/api/starprints/00000000-0000-0000-0000-000000000001/card-image')
      .attach('file', Buffer.from('image'), 'card.png').expect(404);
  });
});
