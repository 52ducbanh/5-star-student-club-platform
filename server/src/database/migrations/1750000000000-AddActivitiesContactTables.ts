import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddActivitiesContactTables1750000000000 implements MigrationInterface {
  name = 'AddActivitiesContactTables1750000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "news" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "slug" character varying NOT NULL,
        "title" character varying NOT NULL,
        "excerpt" character varying NOT NULL,
        "body" jsonb NOT NULL,
        "tag" character varying NOT NULL,
        "imageUrl" character varying,
        "publishedAt" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_news_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_news_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_news_publishedAt" ON "news" ("publishedAt" DESC)
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "events" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "slug" character varying NOT NULL,
        "title" character varying NOT NULL,
        "excerpt" character varying NOT NULL,
        "body" jsonb NOT NULL,
        "location" character varying NOT NULL,
        "imageUrl" character varying,
        "startAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "endAt" TIMESTAMP WITH TIME ZONE,
        "registrationDeadline" TIMESTAMP WITH TIME ZONE,
        "capacity" integer,
        "registrationEnabled" boolean NOT NULL DEFAULT true,
        "published" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_events_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_events_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_events_startAt" ON "events" ("startAt" DESC)
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "event_registrations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "eventId" uuid NOT NULL,
        "name" character varying NOT NULL,
        "studentId" character varying NOT NULL,
        "email" character varying NOT NULL,
        "phone" character varying NOT NULL,
        "unit" character varying NOT NULL,
        "message" character varying,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_event_registrations_eventId_studentId" UNIQUE ("eventId", "studentId"),
        CONSTRAINT "PK_event_registrations_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_event_registrations_eventId" ON "event_registrations" ("eventId")
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "event_registrations"
        ADD CONSTRAINT "FK_event_registrations_eventId" FOREIGN KEY ("eventId")
        REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "contact_submissions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "email" character varying NOT NULL,
        "message" text NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_contact_submissions_id" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "contact_submissions"`);
    await queryRunner.query(
      `ALTER TABLE "event_registrations" DROP CONSTRAINT IF EXISTS "FK_event_registrations_eventId"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "event_registrations"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "events"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "news"`);
  }
}
