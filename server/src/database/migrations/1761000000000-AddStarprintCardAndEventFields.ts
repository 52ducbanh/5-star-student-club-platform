import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStarprintCardAndEventFields1761000000000 implements MigrationInterface {
    name = 'AddStarprintCardAndEventFields1761000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Additive columns for player_sessions
        await queryRunner.query(`
            ALTER TABLE "player_sessions"
            ADD COLUMN IF NOT EXISTS "assignedSolveQuestionIds" jsonb DEFAULT NULL,
            ADD COLUMN IF NOT EXISTS "assignedSenseScenarioIds" jsonb DEFAULT NULL,
            ADD COLUMN IF NOT EXISTS "assignedSprintTrackId" character varying(32) DEFAULT 'track-a';
        `);

        // Additive columns for starprints
        await queryRunner.query(`
            ALTER TABLE "starprints"
            ADD COLUMN IF NOT EXISTS "publishedToSky" boolean DEFAULT true,
            ADD COLUMN IF NOT EXISTS "physicalCardRequested" boolean DEFAULT false,
            ADD COLUMN IF NOT EXISTS "mediaPermission" boolean DEFAULT false,
            ADD COLUMN IF NOT EXISTS "eventId" character varying DEFAULT 'default-2026',
            ADD COLUMN IF NOT EXISTS "eventEdition" character varying DEFAULT '2026.1';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "starprints"
            DROP COLUMN IF EXISTS "eventEdition",
            DROP COLUMN IF EXISTS "eventId",
            DROP COLUMN IF EXISTS "mediaPermission",
            DROP COLUMN IF EXISTS "physicalCardRequested",
            DROP COLUMN IF EXISTS "publishedToSky";
        `);

        await queryRunner.query(`
            ALTER TABLE "player_sessions"
            DROP COLUMN IF EXISTS "assignedSprintTrackId",
            DROP COLUMN IF EXISTS "assignedSenseScenarioIds",
            DROP COLUMN IF EXISTS "assignedSolveQuestionIds";
        `);
    }
}
