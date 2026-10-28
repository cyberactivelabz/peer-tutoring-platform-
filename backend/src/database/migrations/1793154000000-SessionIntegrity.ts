import { MigrationInterface, QueryRunner } from 'typeorm';

export class SessionIntegrity1793154000000 implements MigrationInterface {
  name = 'SessionIntegrity1793154000000';
  async up(queryRunner: QueryRunner): Promise<void> {
    // Refuse to silently delete existing participation or review data.
    for (const table of ['session_participants', 'reviews']) {
      const duplicates = await queryRunner.query(
        `SELECT 1 FROM "${table}" GROUP BY "sessionId", "learnerId" HAVING COUNT(*) > 1 LIMIT 1`,
      );
      if (duplicates.length)
        throw new Error(
          `Duplicate records found in ${table}. Review and resolve them before retrying this migration; no records were deleted.`,
        );
    }
    await queryRunner.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS "UQ_session_participant" ON "session_participants" ("sessionId", "learnerId")',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS "UQ_session_review" ON "reviews" ("sessionId", "learnerId")',
    );
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "UQ_session_review"');
    await queryRunner.query('DROP INDEX IF EXISTS "UQ_session_participant"');
  }
}
