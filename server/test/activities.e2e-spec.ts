import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import request = require('supertest');
import { AppModule } from '../src/app.module';
import { DomainExceptionFilter } from '../src/common/filters/domain-exception.filter';
import { News } from '../src/modules/news/entities/news.entity';
import { Event } from '../src/modules/events/entities/event.entity';
import { EventRegistration } from '../src/modules/events/entities/event-registration.entity';
import { ContactSubmission } from '../src/modules/contact/entities/contact-submission.entity';

describe('Activities & Dynamic Content (e2e)', () => {
  let app: INestApplication;
  let newsRepo: Repository<News>;
  let eventRepo: Repository<Event>;
  let registrationRepo: Repository<EventRegistration>;
  let contactRepo: Repository<ContactSubmission>;

  const createdNewsIds: string[] = [];
  const createdEventIds: string[] = [];
  const createdContactIds: string[] = [];

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

    newsRepo = app.get(getRepositoryToken(News));
    eventRepo = app.get(getRepositoryToken(Event));
    registrationRepo = app.get(getRepositoryToken(EventRegistration));
    contactRepo = app.get(getRepositoryToken(ContactSubmission));
  });

  afterAll(async () => {
    if (app) {
      // Clean up test data
      for (const id of createdNewsIds) {
        await newsRepo.delete(id).catch(() => {});
      }
      for (const id of createdEventIds) {
        await eventRepo.delete(id).catch(() => {});
      }
      for (const id of createdContactIds) {
        await contactRepo.delete(id).catch(() => {});
      }
      await app.close();
    }
  });

  describe('News API', () => {
    let publishedNews1: News;
    let publishedNews2: News;
    let draftNews: News;

    beforeAll(async () => {
      publishedNews1 = await newsRepo.save(
        newsRepo.create({
          slug: 'test-news-published-older',
          title: 'Older Published News',
          excerpt: 'Excerpt 1',
          body: ['Paragraph 1'],
          tag: 'Test',
          publishedAt: new Date(Date.now() - 100000),
        }),
      );
      createdNewsIds.push(publishedNews1.id);

      publishedNews2 = await newsRepo.save(
        newsRepo.create({
          slug: 'test-news-published-newer',
          title: 'Newer Published News',
          excerpt: 'Excerpt 2',
          body: ['Paragraph 1', 'Paragraph 2'],
          tag: 'Test',
          publishedAt: new Date(Date.now() - 50000),
        }),
      );
      createdNewsIds.push(publishedNews2.id);

      draftNews = await newsRepo.save(
        newsRepo.create({
          slug: 'test-news-draft',
          title: 'Draft News',
          excerpt: 'Draft excerpt',
          body: ['Draft body'],
          tag: 'Draft',
          publishedAt: null, // Draft
        }),
      );
      createdNewsIds.push(draftNews.id);
    });

    it('GET /api/news - returns published news ordered by publishedAt DESC, excluding drafts', async () => {
      const res = await request(app.getHttpServer()).get('/api/news').expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const testItems = res.body.filter((item: any) =>
        [publishedNews1.slug, publishedNews2.slug, draftNews.slug].includes(item.slug),
      );

      // Draft must be excluded
      expect(testItems.some((i: any) => i.slug === draftNews.slug)).toBe(false);
      // Published must be present
      expect(testItems.length).toBe(2);
      // Ordered DESC: newer should come before older
      expect(testItems[0].slug).toBe(publishedNews2.slug);
      expect(testItems[1].slug).toBe(publishedNews1.slug);
    });

    it('GET /api/news/:slug - returns single published item by slug', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/news/${publishedNews2.slug}`)
        .expect(200);

      expect(res.body.slug).toBe(publishedNews2.slug);
      expect(res.body.title).toBe(publishedNews2.title);
      expect(res.body.body).toEqual(['Paragraph 1', 'Paragraph 2']);
      expect(typeof res.body.publishedAt).toBe('string');
    });

    it('GET /api/news/:slug - returns 404 for unknown slug', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/news/non-existent-slug-xyz')
        .expect(404);

      expect(res.body.code).toBe('NEWS_NOT_FOUND');
    });

    it('GET /api/news/:slug - returns 404 for draft item', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/news/${draftNews.slug}`)
        .expect(404);

      expect(res.body.code).toBe('NEWS_NOT_FOUND');
    });
  });

  describe('Events API', () => {
    let upcomingEvent: Event;
    let ongoingEvent: Event;
    let pastEvent: Event;
    let draftEvent: Event;

    beforeAll(async () => {
      upcomingEvent = await eventRepo.save(
        eventRepo.create({
          slug: 'test-event-upcoming',
          title: 'Upcoming Event',
          excerpt: 'Upcoming excerpt',
          body: ['Upcoming body'],
          location: 'Room 101',
          startAt: new Date(Date.now() + 86400000 * 5), // in 5 days
          endAt: new Date(Date.now() + 86400000 * 5 + 7200000),
          registrationEnabled: true,
          published: true,
        }),
      );
      createdEventIds.push(upcomingEvent.id);

      ongoingEvent = await eventRepo.save(
        eventRepo.create({
          slug: 'test-event-ongoing',
          title: 'Ongoing Event',
          excerpt: 'Ongoing excerpt',
          body: ['Ongoing body'],
          location: 'Hall A',
          startAt: new Date(Date.now() - 3600000), // started 1h ago
          endAt: new Date(Date.now() + 3600000), // ends in 1h
          registrationEnabled: true,
          published: true,
        }),
      );
      createdEventIds.push(ongoingEvent.id);

      pastEvent = await eventRepo.save(
        eventRepo.create({
          slug: 'test-event-past',
          title: 'Past Event',
          excerpt: 'Past excerpt',
          body: ['Past body'],
          location: 'Hall B',
          startAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
          endAt: new Date(Date.now() - 86400000 * 2 + 7200000),
          registrationEnabled: false,
          published: true,
        }),
      );
      createdEventIds.push(pastEvent.id);

      draftEvent = await eventRepo.save(
        eventRepo.create({
          slug: 'test-event-draft',
          title: 'Draft Event',
          excerpt: 'Draft',
          body: ['Body'],
          location: 'Secret Room',
          startAt: new Date(Date.now() + 86400000),
          published: false,
        }),
      );
      createdEventIds.push(draftEvent.id);
    });

    it('GET /api/events - returns published events with correct derived status and excludes drafts', async () => {
      const res = await request(app.getHttpServer()).get('/api/events').expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const testEvents = res.body.filter((e: any) =>
        [upcomingEvent.slug, ongoingEvent.slug, pastEvent.slug, draftEvent.slug].includes(e.slug),
      );

      // Draft excluded
      expect(testEvents.some((e: any) => e.slug === draftEvent.slug)).toBe(false);
      expect(testEvents.length).toBe(3);

      const foundUpcoming = testEvents.find((e: any) => e.slug === upcomingEvent.slug);
      const foundOngoing = testEvents.find((e: any) => e.slug === ongoingEvent.slug);
      const foundPast = testEvents.find((e: any) => e.slug === pastEvent.slug);

      // Status derivation verification
      expect(foundUpcoming.status).toBe('upcoming');
      expect(foundOngoing.status).toBe('upcoming'); // in-progress event is not past
      expect(foundPast.status).toBe('past');
    });

    it('GET /api/events/:slug - returns single event by slug', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/events/${upcomingEvent.slug}`)
        .expect(200);

      expect(res.body.slug).toBe(upcomingEvent.slug);
      expect(res.body.title).toBe(upcomingEvent.title);
      expect(res.body.status).toBe('upcoming');
      expect(res.body.registrationAvailable).toBe(true);
    });

    it('GET /api/events/:slug - returns 404 for unknown slug', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/events/non-existent-event-slug')
        .expect(404);

      expect(res.body.code).toBe('EVENT_NOT_FOUND');
    });
  });

  describe('Event Registration API', () => {
    let openEvent: Event;
    let secondEvent: Event;
    let closedEvent: Event;
    let expiredDeadlineEvent: Event;
    let fullEvent: Event;

    beforeAll(async () => {
      openEvent = await eventRepo.save(
        eventRepo.create({
          slug: 'reg-test-open',
          title: 'Open Event',
          excerpt: 'Open for registration',
          body: ['Body'],
          location: 'Auditorium',
          startAt: new Date(Date.now() + 86400000 * 10),
          registrationEnabled: true,
          capacity: 5,
          published: true,
        }),
      );
      createdEventIds.push(openEvent.id);

      secondEvent = await eventRepo.save(
        eventRepo.create({
          slug: 'reg-test-second',
          title: 'Second Open Event',
          excerpt: 'Second event',
          body: ['Body'],
          location: 'Lab 2',
          startAt: new Date(Date.now() + 86400000 * 10),
          registrationEnabled: true,
          published: true,
        }),
      );
      createdEventIds.push(secondEvent.id);

      closedEvent = await eventRepo.save(
        eventRepo.create({
          slug: 'reg-test-closed',
          title: 'Closed Event',
          excerpt: 'Disabled',
          body: ['Body'],
          location: 'Auditorium',
          startAt: new Date(Date.now() + 86400000 * 10),
          registrationEnabled: false,
          published: true,
        }),
      );
      createdEventIds.push(closedEvent.id);

      expiredDeadlineEvent = await eventRepo.save(
        eventRepo.create({
          slug: 'reg-test-expired',
          title: 'Expired Deadline Event',
          excerpt: 'Deadline passed',
          body: ['Body'],
          location: 'Auditorium',
          startAt: new Date(Date.now() + 86400000 * 10),
          registrationDeadline: new Date(Date.now() - 3600000), // deadline passed 1h ago
          registrationEnabled: true,
          published: true,
        }),
      );
      createdEventIds.push(expiredDeadlineEvent.id);

      fullEvent = await eventRepo.save(
        eventRepo.create({
          slug: 'reg-test-full',
          title: 'Full Event',
          excerpt: 'Capacity 1',
          body: ['Body'],
          location: 'Room 3',
          startAt: new Date(Date.now() + 86400000 * 10),
          registrationEnabled: true,
          capacity: 1,
          published: true,
        }),
      );
      createdEventIds.push(fullEvent.id);
    });

    it('POST /api/events/:eventId/registrations - registers successfully with trimmed studentId and normalized email', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/events/${openEvent.id}/registrations`)
        .send({
          name: 'Nguyen Van A',
          studentId: '  22021234  ',
          email: '  NguyenVanA@vnu.edu.vn  ',
          phone: '0912345678',
          unit: 'K67-CACLC',
          message: 'Mong muốn tham gia',
        })
        .expect(201);

      expect(typeof res.body.id).toBe('string');

      // Verify normalization in database
      const row = await registrationRepo.findOne({ where: { id: res.body.id } });
      expect(row).toBeDefined();
      expect(row!.studentId).toBe('22021234');
      expect(row!.email).toBe('nguyenvana@vnu.edu.vn');
      expect(row!.name).toBe('Nguyen Van A');
    });

    it('POST /api/events/:eventId/registrations - rejects duplicate studentId for the SAME event with 409 DUPLICATE_REGISTRATION', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/events/${openEvent.id}/registrations`)
        .send({
          name: 'Nguyen Van A (Duplicate)',
          studentId: '22021234', // Same studentId
          email: 'different-email@vnu.edu.vn',
          phone: '0987654321',
          unit: 'K67-CACLC',
        })
        .expect(409);

      expect(res.body.code).toBe('DUPLICATE_REGISTRATION');
    });

    it('POST /api/events/:eventId/registrations - allows the SAME studentId to register for a DIFFERENT event', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/events/${secondEvent.id}/registrations`)
        .send({
          name: 'Nguyen Van A',
          studentId: '22021234', // Same studentId on another event
          email: 'nguyenvana@vnu.edu.vn',
          phone: '0912345678',
          unit: 'K67-CACLC',
        })
        .expect(201);

      expect(typeof res.body.id).toBe('string');
    });

    it('POST /api/events/:eventId/registrations - rejects registration when registrationEnabled is false', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/events/${closedEvent.id}/registrations`)
        .send({
          name: 'Tran Van B',
          studentId: '22025678',
          email: 'tranb@vnu.edu.vn',
          phone: '0912345678',
          unit: 'K67-CACLC',
        })
        .expect(422);

      expect(res.body.code).toBe('EVENT_REGISTRATION_CLOSED');
    });

    it('POST /api/events/:eventId/registrations - rejects registration when deadline has passed', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/events/${expiredDeadlineEvent.id}/registrations`)
        .send({
          name: 'Le Van C',
          studentId: '22029999',
          email: 'lec@vnu.edu.vn',
          phone: '0912345678',
          unit: 'K67-CACLC',
        })
        .expect(422);

      expect(res.body.code).toBe('EVENT_REGISTRATION_CLOSED');
    });

    it('POST /api/events/:eventId/registrations - rejects registration when capacity is reached', async () => {
      // First registration should succeed (capacity = 1)
      await request(app.getHttpServer())
        .post(`/api/events/${fullEvent.id}/registrations`)
        .send({
          name: 'User One',
          studentId: '22020001',
          email: 'user1@vnu.edu.vn',
          phone: '0912345678',
          unit: 'K67',
        })
        .expect(201);

      // Second registration should fail with EVENT_FULL
      const res = await request(app.getHttpServer())
        .post(`/api/events/${fullEvent.id}/registrations`)
        .send({
          name: 'User Two',
          studentId: '22020002',
          email: 'user2@vnu.edu.vn',
          phone: '0912345678',
          unit: 'K67',
        })
        .expect(422);

      expect(res.body.code).toBe('EVENT_FULL');
    });

    it('POST /api/events/:eventId/registrations - returns 404 for unknown eventId', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/events/00000000-0000-0000-0000-000000000000/registrations')
        .send({
          name: 'Test',
          studentId: '22029988',
          email: 'test@vnu.edu.vn',
          phone: '0912345678',
          unit: 'K67',
        })
        .expect(404);

      expect(res.body.code).toBe('EVENT_NOT_FOUND');
    });

    it('POST /api/events/:eventId/registrations - rejects invalid payload (e.g. invalid email / studentId)', async () => {
      await request(app.getHttpServer())
        .post(`/api/events/${openEvent.id}/registrations`)
        .send({
          name: 'Test',
          studentId: 'abc', // too short (< 4 chars)
          email: 'not-an-email',
          phone: '123', // too short
          unit: '',
        })
        .expect(400);
    });
  });

  describe('Contact API', () => {
    it('POST /api/contact - saves submission with valid payload and returns { ok: true }', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/contact')
        .send({
          name: 'Hoang Thi D',
          email: '  HoangD@gmail.com  ',
          message: 'Toi muon tim hieu them ve CLB 5SS.',
        })
        .expect(201);

      expect(res.body).toEqual({ ok: true });

      const row = await contactRepo.findOne({
        where: { email: 'hoangd@gmail.com' },
      });
      expect(row).toBeDefined();
      expect(row!.name).toBe('Hoang Thi D');
      expect(row!.email).toBe('hoangd@gmail.com');
      expect(row!.message).toBe('Toi muon tim hieu them ve CLB 5SS.');
      if (row) createdContactIds.push(row.id);
    });

    it('POST /api/contact - rejects invalid payload (missing fields or bad email)', async () => {
      await request(app.getHttpServer())
        .post('/api/contact')
        .send({
          name: '',
          email: 'bad-email',
          message: '',
        })
        .expect(400);
    });
  });
});
