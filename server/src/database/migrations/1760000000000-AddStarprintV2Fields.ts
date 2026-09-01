import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStarprintV2Fields1760000000000 implements MigrationInterface {
    name = 'AddStarprintV2Fields1760000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Additive v2 columns for game_results
        await queryRunner.query(`
            ALTER TABLE "game_results"
            ADD COLUMN IF NOT EXISTS "localTraitProfile" jsonb DEFAULT NULL,
            ADD COLUMN IF NOT EXISTS "payloadVersion" character varying DEFAULT NULL,
            ADD COLUMN IF NOT EXISTS "contentVersion" character varying DEFAULT NULL,
            ADD COLUMN IF NOT EXISTS "scoringVersion" character varying DEFAULT NULL,
            ADD COLUMN IF NOT EXISTS "rawExpiresAt" TIMESTAMP DEFAULT NULL;
        `);

        // Additive v2 columns for starprints
        await queryRunner.query(`
            ALTER TABLE "starprints"
            ADD COLUMN IF NOT EXISTS "signatureColor" character varying(7) DEFAULT NULL,
            ADD COLUMN IF NOT EXISTS "wingPalette" jsonb DEFAULT NULL,
            ADD COLUMN IF NOT EXISTS "globalHiddenProfile" jsonb DEFAULT NULL,
            ADD COLUMN IF NOT EXISTS "publicStarId" character varying(32) DEFAULT NULL,
            ADD COLUMN IF NOT EXISTS "modelVersion" character varying DEFAULT NULL,
            ADD COLUMN IF NOT EXISTS "paletteAlgorithmVersion" character varying DEFAULT NULL,
            ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP DEFAULT NULL;
        `);

        // Create unique index on publicStarId where not null
        await queryRunner.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS "IDX_starprints_publicStarId"
            ON "starprints" ("publicStarId")
            WHERE "publicStarId" IS NOT NULL;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_starprints_publicStarId";`);

        await queryRunner.query(`
            ALTER TABLE "starprints"
            DROP COLUMN IF EXISTS "publishedAt",
            DROP COLUMN IF EXISTS "paletteAlgorithmVersion",
            DROP COLUMN IF EXISTS "modelVersion",
            DROP COLUMN IF EXISTS "publicStarId",
            DROP COLUMN IF EXISTS "globalHiddenProfile",
            DROP COLUMN IF EXISTS "wingPalette",
            DROP COLUMN IF EXISTS "signatureColor";
        `);

        await queryRunner.query(`
            ALTER TABLE "game_results"
            DROP COLUMN IF EXISTS "rawExpiresAt",
            DROP COLUMN IF EXISTS "scoringVersion",
            DROP COLUMN IF EXISTS "contentVersion",
            DROP COLUMN IF EXISTS "payloadVersion",
            DROP COLUMN IF EXISTS "localTraitProfile";
        `);
    }
}
