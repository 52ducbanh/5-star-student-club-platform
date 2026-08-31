import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1700000000000 implements MigrationInterface {
    name = 'InitialSchema1700000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Ensure UUID extension exists for PostgreSQL
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "public"."player_sessions_status_enum" AS ENUM('IN_PROGRESS', 'READY_TO_GENERATE', 'GENERATED', 'PUBLISHED');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "player_sessions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "nickname" character varying(24) NOT NULL, 
                "photoUrl" character varying, 
                "status" "public"."player_sessions_status_enum" NOT NULL DEFAULT 'IN_PROGRESS', 
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
                CONSTRAINT "PK_b945d9f0f62d1a3c613e51a719c" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "public"."game_results_gameid_enum" AS ENUM('solve', 'sense', 'sprint', 'support', 'sync');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "game_results" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "sessionId" uuid NOT NULL, 
                "gameId" "public"."game_results_gameid_enum" NOT NULL, 
                "rawResult" jsonb NOT NULL, 
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
                CONSTRAINT "UQ_12a9bc47558d4a9829f03264b15" UNIQUE ("sessionId", "gameId"), 
                CONSTRAINT "PK_dbba2a4667d4e5f412493540bf8" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "starprints" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "sessionId" uuid NOT NULL, 
                "baseColor" character varying(7) NOT NULL, 
                "palette" jsonb NOT NULL, 
                "type" character varying NOT NULL, 
                "effect" character varying NOT NULL, 
                "profile" jsonb NOT NULL, 
                "isPublic" boolean NOT NULL DEFAULT false, 
                "consentPhoto" boolean NOT NULL DEFAULT false, 
                "consentName" boolean NOT NULL DEFAULT false, 
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
                CONSTRAINT "UQ_7159cc4142f9b8b0cfccfa1cd55" UNIQUE ("sessionId"), 
                CONSTRAINT "PK_6a31c518bb9d1b09228d4ea9f9e" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            DO $$ BEGIN
                ALTER TABLE "game_results" 
                ADD CONSTRAINT "FK_2604618e7e1ef56ea4f9c565d77" FOREIGN KEY ("sessionId") 
                REFERENCES "player_sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        await queryRunner.query(`
            DO $$ BEGIN
                ALTER TABLE "starprints" 
                ADD CONSTRAINT "FK_7159cc4142f9b8b0cfccfa1cd55" FOREIGN KEY ("sessionId") 
                REFERENCES "player_sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "starprints" DROP CONSTRAINT IF EXISTS "FK_7159cc4142f9b8b0cfccfa1cd55"`);
        await queryRunner.query(`ALTER TABLE "game_results" DROP CONSTRAINT IF EXISTS "FK_2604618e7e1ef56ea4f9c565d77"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "starprints"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "game_results"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."game_results_gameid_enum"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "player_sessions"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."player_sessions_status_enum"`);
    }
}
