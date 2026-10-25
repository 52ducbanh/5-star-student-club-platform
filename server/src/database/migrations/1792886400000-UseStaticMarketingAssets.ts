import { MigrationInterface, QueryRunner } from 'typeorm';

export class UseStaticMarketingAssets1792886400000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    for (const filename of ['tuyen-quan-sv5t.png', 'trai-he.jpg', 'logo-5ss.png', 'nhap-hoc-cung-5-tot.png']) {
      for (const table of ['news', 'events']) {
        await queryRunner.query(`UPDATE "${table}" SET "imageUrl" = $1 WHERE "imageUrl" = $2`, [`/assets/${filename}`, `/uploads/${filename}`]);
      }
    }
  }
  async down(): Promise<void> { /* Static URLs remain valid on rollback. */ }
}
