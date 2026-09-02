import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Changes the default value for the four consent/card boolean columns from FALSE to TRUE
 * to align with the new product rule (opt-in by default).
 *
 * Also backfills existing starprint rows for consentName and consentPhoto ONLY:
 *   - consentName  = true  -> existing Sky entries show nicknames
 *   - consentPhoto = true  -> existing Sky entries show photos
 *
 * NOTE: physicalCardRequested and mediaPermission existing values are preserved
 * so existing explicit user opt-outs are not overwritten.
 *
 * The down migration restores the old FALSE defaults but does NOT roll back data
 * (user-saved FALSE values after this migration are intentional opt-outs and must be kept).
 */
export class UpdateConsentDefaultsToTrue1762000000000 implements MigrationInterface {
    name = 'UpdateConsentDefaultsToTrue1762000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Update column defaults so NEW rows get true automatically
        await queryRunner.query(`
            ALTER TABLE "starprints"
              ALTER COLUMN "consentName"            SET DEFAULT true,
              ALTER COLUMN "consentPhoto"           SET DEFAULT true,
              ALTER COLUMN "physicalCardRequested"  SET DEFAULT true,
              ALTER COLUMN "mediaPermission"        SET DEFAULT true;
        `);

        // 2. Backfill ONLY consentName and consentPhoto for existing rows.
        //    consentName and consentPhoto are no longer user-configurable (effective value true).
        //    physicalCardRequested and mediaPermission remain user-configurable,
        //    so existing false values may represent explicit user opt-outs and MUST NOT be overwritten.
        await queryRunner.query(`
            UPDATE "starprints"
            SET
              "consentName"  = true,
              "consentPhoto" = true;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Restore old column defaults only -- do not touch data
        await queryRunner.query(`
            ALTER TABLE "starprints"
              ALTER COLUMN "consentName"            SET DEFAULT false,
              ALTER COLUMN "consentPhoto"           SET DEFAULT false,
              ALTER COLUMN "physicalCardRequested"  SET DEFAULT false,
              ALTER COLUMN "mediaPermission"        SET DEFAULT false;
        `);
    }
}
