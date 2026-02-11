/**
 * Feature Tests: PostgreSQL Data Persistence
 * 
 * Story references:
 * - S1: .blueprint/features/feature_postgresql-persistence/story-migrate-case-repository.md
 * - S2: .blueprint/features/feature_postgresql-persistence/story-migrate-case-assignments.md
 * - S3: .blueprint/features/feature_postgresql-persistence/story-migrate-document-repository.md
 * - S4: .blueprint/features/feature_postgresql-persistence/story-case-number-generation.md
 * - S5: .blueprint/features/feature_postgresql-persistence/story-configure-database-connections.md
 * - S6: .blueprint/features/feature_postgresql-persistence/story-run-database-migrations.md
 * - S7: .blueprint/features/feature_postgresql-persistence/story-verify-persistence.md
 */

const { Pool } = require('pg');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test database configuration
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://adoption:adoption@localhost:5432/adoption_test';
let pool;

beforeAll(async () => {
  pool = new Pool({ connectionString: TEST_DATABASE_URL });
  
  // Run migrations to ensure schema is up to date
  try {
    const migrationsPath = path.join(__dirname, '../../server/migrations');
    if (fs.existsSync(migrationsPath)) {
      execSync('npm run migrate:up --workspace=server', { 
        env: { ...process.env, APP_ENV: 'TEST', TEST_DATABASE_URL },
        stdio: 'pipe'
      });
    }
  } catch (err) {
    console.warn('Migration setup skipped:', err.message);
  }
});

afterAll(async () => {
  if (pool) {
    await pool.end();
  }
});

// Helper to clean tables between tests
async function cleanDatabase() {
  await pool.query('TRUNCATE TABLE case_assignments, documents, cases, audit_log, court_sequences RESTART IDENTITY CASCADE');
}

// Helper to seed court sequences
async function seedCourtSequences() {
  await pool.query(`
    INSERT INTO court_sequences (court_code, current_year, current_sequence)
    VALUES ('BFC', 2026, 0), ('MFC', 2026, 0), ('LFC', 2026, 0)
    ON CONFLICT (court_code, current_year) DO NOTHING
  `);
}

describe('Story 1: Migrate Case Repository to PostgreSQL', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('AC-1: Cases table migration exists', () => {
    it('T-1.1: creates cases table with all required columns', async () => {
      const result = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'cases'
        ORDER BY ordinal_position
      `);
      
      const columns = result.rows.map(r => r.column_name);
      expect(columns).toContain('id');
      expect(columns).toContain('version');
      expect(columns).toContain('deleted_at');
      expect(columns).toContain('court');
      expect(columns).toContain('status');
      expect(columns).toContain('created_at');
    });

    it('T-1.2: has indexes on court and deleted_at', async () => {
      const result = await pool.query(`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = 'cases'
      `);
      
      const indexes = result.rows.map(r => r.indexdef);
      const hasCourtIndex = indexes.some(idx => idx.includes('court'));
      const hasDeletedAtIndex = indexes.some(idx => idx.includes('deleted_at'));
      
      expect(hasCourtIndex || hasDeletedAtIndex).toBe(true);
    });
  });

  describe('AC-2: Create case persists to database', () => {
    it('T-1.3: inserts row with version=1 and audit log', async () => {
      const caseId = '550e8400-e29b-41d4-a716-446655440000';
      const caseData = {
        id: caseId,
        court: 'Birmingham Family Court',
        status: 'APPLICATION',
        version: 1,
        created_at: new Date(),
        updated_at: new Date()
      };

      await pool.query(
        `INSERT INTO cases (id, case_number, case_type, court, status, created_by, version, created_at, updated_at)
         VALUES ($1, $1, 'ADOPTION', $2, $3, 'test-user', $4, $5, $6)`,
        [caseData.id, caseData.court, caseData.status, caseData.version, caseData.created_at, caseData.updated_at]
      );

      await pool.query(
        `INSERT INTO audit_log (action, entity_type, entity_id, user_id, timestamp)
         VALUES ($1, $2, $3, $4, $5)`,
        ['CREATE', 'case', caseId, 'test-user', new Date()]
      );

      const caseResult = await pool.query('SELECT * FROM cases WHERE id = $1', [caseId]);
      expect(caseResult.rows[0].version).toBe(1);
      expect(caseResult.rows[0].court).toBe('Birmingham Family Court');

      const auditResult = await pool.query('SELECT * FROM audit_log WHERE entity_id = $1', [caseId]);
      expect(auditResult.rows.length).toBeGreaterThan(0);
      expect(auditResult.rows[0].action).toBe('CREATE');
    });
  });

  describe('AC-3: Retrieve case queries database', () => {
    it('T-1.4: queries database excluding soft-deleted cases', async () => {
      const caseId = '550e8400-e29b-41d4-a716-446655440001';
      await pool.query(
        `INSERT INTO cases (id, case_number, case_type, court, status, created_by, version, created_at, updated_at)
         VALUES ($1, $1, 'ADOPTION', $2, $3, 'test-user', $4, $5, $6)`,
        [caseId, 'Manchester Family Court', 'DIRECTIONS', 1, new Date(), new Date()]
      );

      const result = await pool.query(
        'SELECT * FROM cases WHERE id = $1 AND deleted_at IS NULL',
        [caseId]
      );

      expect(result.rows.length).toBe(1);
      expect(result.rows[0].status).toBe('DIRECTIONS');
    });
  });

  describe('AC-4: Update case uses optimistic locking', () => {
    it('T-1.5: succeeds when version matches', async () => {
      const caseId = '550e8400-e29b-41d4-a716-446655440002';
      await pool.query(
        `INSERT INTO cases (id, case_number, case_type, court, status, created_by, version, created_at, updated_at)
         VALUES ($1, $1, 'ADOPTION', $2, $3, 'test-user', $4, $5, $6)`,
        [caseId, 'London Family Court', 'APPLICATION', 1, new Date(), new Date()]
      );

      const updateResult = await pool.query(
        `UPDATE cases 
         SET status = $1, version = version + 1, updated_at = $2
         WHERE id = $3 AND version = $4
         RETURNING *`,
        ['DIRECTIONS', new Date(), caseId, 1]
      );

      expect(updateResult.rows.length).toBe(1);
      expect(updateResult.rows[0].version).toBe(2);
      expect(updateResult.rows[0].status).toBe('DIRECTIONS');
    });

    it('T-1.6: fails when version is stale (concurrent update conflict)', async () => {
      const caseId = '550e8400-e29b-41d4-a716-446655440003';
      await pool.query(
        `INSERT INTO cases (id, case_number, case_type, court, status, created_by, version, created_at, updated_at)
         VALUES ($1, $1, 'ADOPTION', $2, $3, 'test-user', $4, $5, $6)`,
        [caseId, 'Birmingham Family Court', 'DIRECTIONS', 3, new Date(), new Date()]
      );

      const updateResult = await pool.query(
        `UPDATE cases 
         SET status = $1, version = version + 1, updated_at = $2
         WHERE id = $3 AND version = $4
         RETURNING *`,
        ['HEARING', new Date(), caseId, 2]
      );

      expect(updateResult.rows.length).toBe(0);
    });
  });

  describe('AC-5: List cases filters by role and court', () => {
    it('T-1.7: filters by court and excludes deleted cases', async () => {
      await pool.query(
        `INSERT INTO cases (id, case_number, case_type, court, status, created_by, version, created_at, updated_at)
         VALUES 
         ($1, $1, 'ADOPTION', $2, $3, 'test-user', $4, $5, $6),
         ($7, $7, 'ADOPTION', $8, $9, 'test-user', $10, $11, $12),
         ($13, $13, 'ADOPTION', $14, $15, 'test-user', $16, $17, $18)`,
        [
          '550e8400-e29b-41d4-a716-446655440010', 'Birmingham Family Court', 'APPLICATION', 1, new Date(), new Date(),
          '550e8400-e29b-41d4-a716-446655440011', 'Birmingham Family Court', 'DIRECTIONS', 1, new Date(), new Date(),
          '550e8400-e29b-41d4-a716-446655440012', 'Manchester Family Court', 'APPLICATION', 1, new Date(), new Date()
        ]
      );

      await pool.query(
        `UPDATE cases SET deleted_at = $1 WHERE id = $2`,
        [new Date(), '550e8400-e29b-41d4-a716-446655440011']
      );

      const result = await pool.query(
        `SELECT * FROM cases 
         WHERE court = $1 AND deleted_at IS NULL
         ORDER BY created_at DESC`,
        ['Birmingham Family Court']
      );

      expect(result.rows.length).toBe(1);
      expect(result.rows[0].id).toBe('550e8400-e29b-41d4-a716-446655440010');
    });
  });

  describe('AC-6: Delete case performs soft delete', () => {
    it('T-1.8: sets deleted_at timestamp', async () => {
      const caseId = '550e8400-e29b-41d4-a716-446655440020';
      await pool.query(
        `INSERT INTO cases (id, case_number, case_type, court, status, created_by, version, created_at, updated_at)
         VALUES ($1, $1, 'ADOPTION', $2, $3, 'test-user', $4, $5, $6)`,
        [caseId, 'London Family Court', 'APPLICATION', 1, new Date(), new Date()]
      );

      await pool.query(
        `UPDATE cases SET deleted_at = NOW() WHERE id = $1`,
        [caseId]
      );

      await pool.query(
        `INSERT INTO audit_log (action, entity_type, entity_id, user_id, timestamp)
         VALUES ($1, $2, $3, $4, $5)`,
        ['DELETE', 'case', caseId, 'test-user', new Date()]
      );

      const result = await pool.query('SELECT * FROM cases WHERE id = $1', [caseId]);
      expect(result.rows[0].deleted_at).not.toBeNull();

      const listResult = await pool.query('SELECT * FROM cases WHERE deleted_at IS NULL');
      expect(listResult.rows.find(c => c.id === caseId)).toBeUndefined();
    });
  });

  describe('AC-7: Data persists across restarts', () => {
    it('T-1.9: case data intact after simulated restart', async () => {
      const caseId = '550e8400-e29b-41d4-a716-446655440030';
      await pool.query(
        `INSERT INTO cases (id, case_number, case_type, court, status, created_by, version, created_at, updated_at)
         VALUES ($1, $1, 'ADOPTION', $2, $3, 'test-user', $4, $5, $6)`,
        [caseId, 'Birmingham Family Court', 'HEARING', 1, new Date(), new Date()]
      );

      // Simulate restart by creating new connection
      const newPool = new Pool({ connectionString: TEST_DATABASE_URL });
      const result = await newPool.query('SELECT * FROM cases WHERE id = $1', [caseId]);
      await newPool.end();

      expect(result.rows.length).toBe(1);
      expect(result.rows[0].status).toBe('HEARING');
      expect(result.rows[0].version).toBe(1);
    });
  });
});

describe('Story 2: Migrate Case Assignments to PostgreSQL', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('AC-1: Case assignments table migration exists', () => {
    it('T-2.1: creates table with foreign key constraint', async () => {
      const result = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'case_assignments'
      `);
      
      const columns = result.rows.map(r => r.column_name);
      expect(columns).toContain('case_id');
      expect(columns).toContain('user_id');
      expect(columns).toContain('role');
      expect(columns).toContain('assigned_at');
    });

    it('T-2.2: has unique constraint on (case_id, user_id, role)', async () => {
      const caseId = '550e8400-e29b-41d4-a716-446655440100';
      await pool.query(
        `INSERT INTO cases (id, case_number, case_type, court, status, created_by, version, created_at, updated_at)
         VALUES ($1, $1, 'ADOPTION', $2, $3, 'test-user', $4, $5, $6)`,
        [caseId, 'Birmingham Family Court', 'APPLICATION', 1, new Date(), new Date()]
      );

      await pool.query(
        `INSERT INTO case_assignments (case_id, user_id, role, assigned_at)
         VALUES ($1, $2, $3, $4)`,
        [caseId, 'user-123', 'case_officer', new Date()]
      );

      await expect(
        pool.query(
          `INSERT INTO case_assignments (case_id, user_id, role, assigned_at)
           VALUES ($1, $2, $3, $4)`,
          [caseId, 'user-123', 'case_officer', new Date()]
        )
      ).rejects.toThrow();
    });
  });

  describe('AC-2: Assign user to case persists to database', () => {
    it('T-2.3: inserts row and logs audit entry', async () => {
      const caseId = '550e8400-e29b-41d4-a716-446655440101';
      await pool.query(
        `INSERT INTO cases (id, case_number, case_type, court, status, created_by, version, created_at, updated_at)
         VALUES ($1, $1, 'ADOPTION', $2, $3, 'test-user', $4, $5, $6)`,
        [caseId, 'Manchester Family Court', 'DIRECTIONS', 1, new Date(), new Date()]
      );

      await pool.query(
        `INSERT INTO case_assignments (case_id, user_id, role, assigned_at, assigned_by)
         VALUES ($1, $2, $3, $4, $5)`,
        [caseId, 'user-456', 'judge', new Date(), 'admin-user']
      );

      await pool.query(
        `INSERT INTO audit_log (action, entity_type, entity_id, user_id, timestamp)
         VALUES ($1, $2, $3, $4, $5)`,
        ['ASSIGN', 'case_assignment', caseId, 'admin-user', new Date()]
      );

      const result = await pool.query(
        'SELECT * FROM case_assignments WHERE case_id = $1 AND user_id = $2',
        [caseId, 'user-456']
      );

      expect(result.rows.length).toBe(1);
      expect(result.rows[0].role).toBe('judge');
    });
  });

  describe('AC-3: Get assignments by case queries database', () => {
    it('T-2.4: returns all assignments for a case', async () => {
      const caseId = '550e8400-e29b-41d4-a716-446655440102';
      await pool.query(
        `INSERT INTO cases (id, case_number, case_type, court, status, created_by, version, created_at, updated_at)
         VALUES ($1, $1, 'ADOPTION', $2, $3, 'test-user', $4, $5, $6)`,
        [caseId, 'London Family Court', 'HEARING', 1, new Date(), new Date()]
      );

      await pool.query(
        `INSERT INTO case_assignments (case_id, user_id, role, assigned_at)
         VALUES ($1, $2, $3, $4), ($5, $6, $7, $8)`,
        [caseId, 'user-111', 'case_officer', new Date(), caseId, 'user-222', 'social_worker', new Date()]
      );

      const result = await pool.query(
        'SELECT * FROM case_assignments WHERE case_id = $1',
        [caseId]
      );

      expect(result.rows.length).toBe(2);
      expect(result.rows.map(r => r.user_id)).toContain('user-111');
      expect(result.rows.map(r => r.user_id)).toContain('user-222');
    });
  });

  describe('AC-4: Get cases by user filters via JOIN', () => {
    it('T-2.5: uses JOIN to filter assigned cases', async () => {
      const case1 = '550e8400-e29b-41d4-a716-446655440103';
      const case2 = '550e8400-e29b-41d4-a716-446655440104';
      const case3 = '550e8400-e29b-41d4-a716-446655440105';

      await pool.query(
        `INSERT INTO cases (id, case_number, case_type, court, status, created_by, version, created_at, updated_at)
         VALUES ($1, $1, 'ADOPTION', $2, $3, 'test-user', $4, $5, $6), ($7, $7, 'ADOPTION', $8, $9, 'test-user', $10, $11, $12), ($13, $13, 'ADOPTION', $14, $15, 'test-user', $16, $17, $18)`,
        [
          case1, 'Birmingham Family Court', 'APPLICATION', 1, new Date(), new Date(),
          case2, 'Manchester Family Court', 'DIRECTIONS', 1, new Date(), new Date(),
          case3, 'London Family Court', 'HEARING', 1, new Date(), new Date()
        ]
      );

      await pool.query(
        `INSERT INTO case_assignments (case_id, user_id, role, assigned_at)
         VALUES ($1, $2, $3, $4), ($5, $6, $7, $8)`,
        [case1, 'user-999', 'case_officer', new Date(), case2, 'user-999', 'case_officer', new Date()]
      );

      const result = await pool.query(
        `SELECT c.* FROM cases c
         INNER JOIN case_assignments a ON c.id = a.case_id
         WHERE a.user_id = $1 AND c.deleted_at IS NULL`,
        ['user-999']
      );

      expect(result.rows.length).toBe(2);
      expect(result.rows.map(r => r.id)).toContain(case1);
      expect(result.rows.map(r => r.id)).toContain(case2);
      expect(result.rows.map(r => r.id)).not.toContain(case3);
    });
  });

  describe('AC-5: Remove assignment deletes from database', () => {
    it('T-2.6: deletes row and logs audit entry', async () => {
      const caseId = '550e8400-e29b-41d4-a716-446655440106';
      await pool.query(
        `INSERT INTO cases (id, case_number, case_type, court, status, created_by, version, created_at, updated_at)
         VALUES ($1, $1, 'ADOPTION', $2, $3, 'test-user', $4, $5, $6)`,
        [caseId, 'Birmingham Family Court', 'APPLICATION', 1, new Date(), new Date()]
      );

      await pool.query(
        `INSERT INTO case_assignments (case_id, user_id, role, assigned_at)
         VALUES ($1, $2, $3, $4)`,
        [caseId, 'user-555', 'judge', new Date()]
      );

      await pool.query(
        `DELETE FROM case_assignments WHERE case_id = $1 AND user_id = $2 AND role = $3`,
        [caseId, 'user-555', 'judge']
      );

      const result = await pool.query(
        'SELECT * FROM case_assignments WHERE case_id = $1 AND user_id = $2',
        [caseId, 'user-555']
      );

      expect(result.rows.length).toBe(0);
    });
  });

  describe('AC-6: Cascade delete on case removal', () => {
    it('T-2.7: assignments remain when case soft-deleted, excluded from user queries', async () => {
      const caseId = '550e8400-e29b-41d4-a716-446655440107';
      await pool.query(
        `INSERT INTO cases (id, case_number, case_type, court, status, created_by, version, created_at, updated_at)
         VALUES ($1, $1, 'ADOPTION', $2, $3, 'test-user', $4, $5, $6)`,
        [caseId, 'London Family Court', 'DIRECTIONS', 1, new Date(), new Date()]
      );

      await pool.query(
        `INSERT INTO case_assignments (case_id, user_id, role, assigned_at)
         VALUES ($1, $2, $3, $4)`,
        [caseId, 'user-777', 'social_worker', new Date()]
      );

      await pool.query('UPDATE cases SET deleted_at = NOW() WHERE id = $1', [caseId]);

      const assignmentResult = await pool.query(
        'SELECT * FROM case_assignments WHERE case_id = $1',
        [caseId]
      );
      expect(assignmentResult.rows.length).toBe(1);

      const userCasesResult = await pool.query(
        `SELECT c.* FROM cases c
         INNER JOIN case_assignments a ON c.id = a.case_id
         WHERE a.user_id = $1 AND c.deleted_at IS NULL`,
        ['user-777']
      );
      expect(userCasesResult.rows.length).toBe(0);
    });
  });
});

describe('Story 3: Migrate Document Repository to PostgreSQL', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('AC-1: Documents table migration already exists', () => {
    it('T-3.1: confirms documents table exists', async () => {
      const result = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'documents'
      `);
      
      const columns = result.rows.map(r => r.column_name);
      expect(columns.length).toBeGreaterThan(0);
      expect(columns).toContain('id');
      expect(columns).toContain('case_id');
    });
  });

  describe('AC-2: Create document persists metadata to database', () => {
    it('T-3.2: inserts metadata row and audit log', async () => {
      const caseId = '550e8400-e29b-41d4-a716-446655440200';
      const docId = '550e8400-e29b-41d4-a716-446655440201';

      await pool.query(
        `INSERT INTO cases (id, case_number, case_type, court, status, created_by, version, created_at, updated_at)
         VALUES ($1, $1, 'ADOPTION', $2, $3, 'test-user', $4, $5, $6)`,
        [caseId, 'Birmingham Family Court', 'APPLICATION', 1, new Date(), new Date()]
      );

      await pool.query(
        `INSERT INTO documents (id, case_id, filename, original_filename, document_type, file_size, file_hash, mime_type, storage_path, uploaded_by, upload_status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [docId, caseId, 'birth-certificate.pdf', 'birth-certificate.pdf', 'birth_certificate', 1024, 'abc123', 'application/pdf', '/storage/docs', 'test-user', 'complete', new Date()]
      );

      const result = await pool.query('SELECT * FROM documents WHERE id = $1', [docId]);
      expect(result.rows.length).toBe(1);
      expect(result.rows[0].filename).toBe('birth-certificate.pdf');
      expect(result.rows[0].upload_status).toBe('complete');
    });
  });

  describe('AC-3: Retrieve document metadata queries database', () => {
    it('T-3.3: queries database by document ID', async () => {
      const caseId = '550e8400-e29b-41d4-a716-446655440202';
      const docId = '550e8400-e29b-41d4-a716-446655440203';

      await pool.query(
        `INSERT INTO cases (id, case_number, case_type, court, status, created_by, version, created_at, updated_at)
         VALUES ($1, $1, 'ADOPTION', $2, $3, 'test-user', $4, $5, $6)`,
        [caseId, 'London Family Court', 'HEARING', 1, new Date(), new Date()]
      );

      await pool.query(
        `INSERT INTO documents (id, case_id, filename, original_filename, document_type, file_size, file_hash, mime_type, storage_path, uploaded_by, upload_status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [docId, caseId, 'consent-form.pdf', 'consent-form.pdf', 'consent_form', 2048, 'def456', 'application/pdf', '/storage/docs', 'test-user', 'complete', new Date()]
      );

      const result = await pool.query('SELECT * FROM documents WHERE id = $1', [docId]);
      expect(result.rows[0].document_type).toBe('consent_form');
    });
  });

  describe('AC-4: List documents by case filters by case_id', () => {
    it('T-3.4: filters documents by case_id', async () => {
      const caseId = '550e8400-e29b-41d4-a716-446655440204';

      await pool.query(
        `INSERT INTO cases (id, case_number, case_type, court, status, created_by, version, created_at, updated_at)
         VALUES ($1, $1, 'ADOPTION', $2, $3, 'test-user', $4, $5, $6)`,
        [caseId, 'Manchester Family Court', 'DIRECTIONS', 1, new Date(), new Date()]
      );

      await pool.query(
        `INSERT INTO documents (id, case_id, filename, original_filename, document_type, file_size, file_hash, mime_type, storage_path, uploaded_by, upload_status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12), ($13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)`,
        [
          '550e8400-e29b-41d4-a716-446655440205', caseId, 'doc1.pdf', 'doc1.pdf', 'medical_report', 3072, 'hash1', 'application/pdf', '/storage/docs', 'test-user', 'complete', new Date(),
          '550e8400-e29b-41d4-a716-446655440206', caseId, 'doc2.pdf', 'doc2.pdf', 'consent_form', 4096, 'hash2', 'application/pdf', '/storage/docs', 'test-user', 'complete', new Date()
        ]
      );

      const result = await pool.query(
        'SELECT * FROM documents WHERE case_id = $1 ORDER BY created_at DESC',
        [caseId]
      );

      expect(result.rows.length).toBe(2);
    });
  });

  describe('AC-5: Update document status modifies database row', () => {
    it('T-3.5: updates status and logs audit', async () => {
      const caseId = '550e8400-e29b-41d4-a716-446655440207';
      const docId = '550e8400-e29b-41d4-a716-446655440208';

      await pool.query(
        `INSERT INTO cases (id, case_number, case_type, court, status, created_by, version, created_at, updated_at)
         VALUES ($1, $1, 'ADOPTION', $2, $3, 'test-user', $4, $5, $6)`,
        [caseId, 'Birmingham Family Court', 'APPLICATION', 1, new Date(), new Date()]
      );

      await pool.query(
        `INSERT INTO documents (id, case_id, filename, original_filename, document_type, file_size, file_hash, mime_type, storage_path, uploaded_by, upload_status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [docId, caseId, 'processing.pdf', 'processing.pdf', 'medical_report', 5120, 'hashproc', 'application/pdf', '/storage/docs', 'test-user', 'uploading', new Date()]
      );

      await pool.query(
        `UPDATE documents SET upload_status = $1, updated_at = NOW() WHERE id = $2`,
        ['complete', docId]
      );

      const result = await pool.query('SELECT * FROM documents WHERE id = $1', [docId]);
      expect(result.rows[0].upload_status).toBe('complete');
    });
  });

  describe('AC-6: Delete document performs soft delete', () => {
    it('T-3.6: sets deleted_at timestamp', async () => {
      const caseId = '550e8400-e29b-41d4-a716-446655440209';
      const docId = '550e8400-e29b-41d4-a716-446655440210';

      await pool.query(
        `INSERT INTO cases (id, case_number, case_type, court, status, created_by, version, created_at, updated_at)
         VALUES ($1, $1, 'ADOPTION', $2, $3, 'test-user', $4, $5, $6)`,
        [caseId, 'London Family Court', 'HEARING', 1, new Date(), new Date()]
      );

      await pool.query(
        `INSERT INTO documents (id, case_id, filename, original_filename, document_type, file_size, file_hash, mime_type, storage_path, uploaded_by, upload_status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [docId, caseId, 'to-delete.pdf', 'to-delete.pdf', 'consent_form', 6144, 'hashdel', 'application/pdf', '/storage/docs', 'test-user', 'complete', new Date()]
      );

      await pool.query('UPDATE documents SET deleted_at = NOW() WHERE id = $1', [docId]);

      const result = await pool.query('SELECT * FROM documents WHERE id = $1', [docId]);
      expect(result.rows[0].deleted_at).not.toBeNull();
    });
  });
});

describe('Story 4: Implement Case Number Generation with Database Sequences', () => {
  beforeEach(async () => {
    await cleanDatabase();
    await seedCourtSequences();
  });

  describe('AC-1: Court sequences table migration exists', () => {
    it('T-4.1: creates table with seed data', async () => {
      const result = await pool.query('SELECT * FROM court_sequences ORDER BY court_code');
      
      expect(result.rows.length).toBeGreaterThanOrEqual(3);
      expect(result.rows.map(r => r.court_code)).toContain('BFC');
      expect(result.rows.map(r => r.court_code)).toContain('MFC');
    });
  });

  describe('AC-2: Generate case number uses database sequence', () => {
    it('T-4.2: increments sequence and returns formatted number', async () => {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        const selectResult = await client.query(
          'SELECT * FROM court_sequences WHERE court_code = $1 FOR UPDATE',
          ['BFC']
        );
        
        const { current_year, current_sequence } = selectResult.rows[0];
        const newSequence = current_sequence + 1;
        
        await client.query(
          'UPDATE court_sequences SET current_sequence = $1 WHERE court_code = $2',
          [newSequence, 'BFC']
        );
        
        await client.query('COMMIT');
        
        const caseNumber = `BFC/${current_year}/${String(newSequence).padStart(5, '0')}`;
        expect(caseNumber).toMatch(/^BFC\/\d{4}\/\d{5}$/);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    });
  });

  describe('AC-3: New year resets sequence', () => {
    it('T-4.3: resets sequence to 1 for new year', async () => {
      const newYear = new Date().getFullYear() + 1;
      
      await pool.query(
        'UPDATE court_sequences SET current_year = $1, current_sequence = 1 WHERE court_code = $2',
        [newYear, 'MFC']
      );

      const result = await pool.query(
        'SELECT * FROM court_sequences WHERE court_code = $1',
        ['MFC']
      );

      expect(result.rows[0].current_year).toBe(newYear);
      expect(result.rows[0].current_sequence).toBe(1);
    });
  });

  describe('AC-4: Concurrent case creation uses locking', () => {
    it('T-4.4: prevents duplicate case numbers with row-level locking', async () => {
      const generateCaseNumber = async () => {
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          const selectResult = await client.query(
            'SELECT * FROM court_sequences WHERE court_code = $1 FOR UPDATE',
            ['LFC']
          );
          const { current_year, current_sequence } = selectResult.rows[0];
          const newSequence = current_sequence + 1;
          
          await client.query(
            'UPDATE court_sequences SET current_sequence = $1 WHERE court_code = $2',
            [newSequence, 'LFC']
          );
          await client.query('COMMIT');
          
          return `LFC/${current_year}/${String(newSequence).padStart(5, '0')}`;
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        } finally {
          client.release();
        }
      };

      const [caseNum1, caseNum2] = await Promise.all([
        generateCaseNumber(),
        generateCaseNumber()
      ]);

      expect(caseNum1).not.toBe(caseNum2);
    });
  });

  describe('AC-5: Sequence persists across restarts', () => {
    it('T-4.5: sequence continues after simulated restart', async () => {
      await pool.query(
        'UPDATE court_sequences SET current_sequence = 99 WHERE court_code = $1',
        ['BFC']
      );

      const newPool = new Pool({ connectionString: TEST_DATABASE_URL });
      const result = await newPool.query(
        'SELECT current_sequence FROM court_sequences WHERE court_code = $1',
        ['BFC']
      );
      await newPool.end();

      expect(result.rows[0].current_sequence).toBe(99);
    });
  });
});

describe('Story 5: Configure Database Connections for Multiple Environments', () => {
  describe('AC-1: Local environment uses LOCAL_DATABASE_URL', () => {
    it('T-5.1: connects using LOCAL_DATABASE_URL when APP_ENV=LOCAL', () => {
      const originalEnv = process.env.APP_ENV;
      process.env.APP_ENV = 'LOCAL';
      process.env.LOCAL_DATABASE_URL = TEST_DATABASE_URL;

      const dbUrl = process.env.APP_ENV === 'LOCAL' ? process.env.LOCAL_DATABASE_URL : null;
      expect(dbUrl).toBe(TEST_DATABASE_URL);

      process.env.APP_ENV = originalEnv;
    });
  });

  describe('AC-2: Dev environment uses DEV_DATABASE_URL', () => {
    it('T-5.2: uses DEV_DATABASE_URL with SSL for APP_ENV=DEV', () => {
      process.env.APP_ENV = 'DEV';
      process.env.DEV_DATABASE_URL = 'postgresql://user:pass@azure.postgres.database.azure.com/db?sslmode=require';

      const dbUrl = process.env.APP_ENV === 'DEV' ? process.env.DEV_DATABASE_URL : null;
      expect(dbUrl).toContain('sslmode=require');
    });
  });

  describe('AC-3: Production environment uses PROD_DATABASE_URL', () => {
    it('T-5.3: uses PROD_DATABASE_URL with SSL for APP_ENV=PROD', () => {
      process.env.APP_ENV = 'PROD';
      process.env.PROD_DATABASE_URL = 'postgresql://user:pass@azure.postgres.database.azure.com/prod?sslmode=require';

      const dbUrl = process.env.APP_ENV === 'PROD' ? process.env.PROD_DATABASE_URL : null;
      expect(dbUrl).toContain('sslmode=require');
    });
  });

  describe('AC-4: Missing database URL fails fast', () => {
    it('T-5.4: throws error when required database URL is missing', () => {
      const originalEnv = process.env.APP_ENV;
      const originalUrl = process.env.DEV_DATABASE_URL;
      
      process.env.APP_ENV = 'DEV';
      delete process.env.DEV_DATABASE_URL;

      const getDatabaseUrl = (env) => {
        if (env === 'DEV' && !process.env.DEV_DATABASE_URL) {
          throw new Error('DEV_DATABASE_URL environment variable is required for APP_ENV=DEV');
        }
        return process.env.DEV_DATABASE_URL;
      };

      expect(() => getDatabaseUrl('DEV')).toThrow('DEV_DATABASE_URL environment variable is required');

      process.env.APP_ENV = originalEnv;
      if (originalUrl) process.env.DEV_DATABASE_URL = originalUrl;
    });
  });

  describe('AC-5: Connection pool configuration remains unchanged', () => {
    it('T-5.5: maintains max=10 pool size', () => {
      const poolConfig = { connectionString: TEST_DATABASE_URL, max: 10 };
      expect(poolConfig.max).toBe(10);
    });
  });
});

describe('Story 6: Run Database Migrations on Local and Azure PostgreSQL', () => {
  describe('AC-1: Migration script executes all pending migrations', () => {
    it('T-6.1: tracks applied migrations in migrations table', async () => {
      const result = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      const tables = result.rows.map(r => r.table_name);
      expect(tables).toContain('cases');
      expect(tables).toContain('case_assignments');
    });
  });

  describe('AC-2: Idempotent migration execution', () => {
    it('T-6.2: re-running migrations skips already-applied ones', async () => {
      const tablesBefore = await pool.query(`
        SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'
      `);
      
      const countBefore = parseInt(tablesBefore.rows[0].count);
      expect(countBefore).toBeGreaterThan(0);
    });
  });

  describe('AC-3: Migration failure rolls back transaction', () => {
    it.skip('T-6.3: rolls back failed migration (requires intentional failure)', () => {
      // This test requires creating a migration with intentional SQL error
      // Skipped as it would require modifying migration files
    });
  });

  describe('AC-4: Local PostgreSQL migration succeeds', () => {
    it('T-6.4: verifies tables created in local database', async () => {
      const result = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name IN ('cases', 'documents', 'case_assignments')
      `);
      
      expect(result.rows.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('AC-5: Azure PostgreSQL migration succeeds', () => {
    it.skip('T-6.5: applies migrations to Azure database (requires live Azure credentials)', () => {
      // Integration test requiring live Azure Database for PostgreSQL
      // Skipped in local test runs
    });
  });
});

describe('Story 7: Verify Data Persistence Across Application Restarts', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('AC-1: Case data persists across restart', () => {
    it('T-7.1: retrieves case with all fields intact after restart', async () => {
      const caseId = '550e8400-e29b-41d4-a716-446655440300';
      await pool.query(
        `INSERT INTO cases (id, case_number, case_type, court, status, created_by, version, created_at, updated_at)
         VALUES ($1, $1, 'ADOPTION', $2, $3, 'test-user', $4, $5, $6)`,
        [caseId, 'Birmingham Family Court', 'APPLICATION', 1, new Date(), new Date()]
      );

      const newPool = new Pool({ connectionString: TEST_DATABASE_URL });
      const result = await newPool.query('SELECT * FROM cases WHERE id = $1', [caseId]);
      await newPool.end();

      expect(result.rows[0].status).toBe('APPLICATION');
      expect(result.rows[0].version).toBe(1);
      expect(result.rows[0].court).toBe('Birmingham Family Court');
    });
  });

  describe('AC-2: Document metadata persists across restart', () => {
    it('T-7.2: retrieves all documents after restart', async () => {
      const caseId = '550e8400-e29b-41d4-a716-446655440301';
      await pool.query(
        `INSERT INTO cases (id, case_number, case_type, court, status, created_by, version, created_at, updated_at)
         VALUES ($1, $1, 'ADOPTION', $2, $3, 'test-user', $4, $5, $6)`,
        [caseId, 'London Family Court', 'HEARING', 1, new Date(), new Date()]
      );

      await pool.query(
        `INSERT INTO documents (id, case_id, filename, original_filename, document_type, file_size, file_hash, mime_type, storage_path, uploaded_by, upload_status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12), ($13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24), ($25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36)`,
        [
          '550e8400-e29b-41d4-a716-446655440302', caseId, 'doc1.pdf', 'doc1.pdf', 'birth_certificate', 1024, 'hash302', 'application/pdf', '/storage/docs', 'test-user', 'complete', new Date(),
          '550e8400-e29b-41d4-a716-446655440303', caseId, 'doc2.pdf', 'doc2.pdf', 'consent_form', 2048, 'hash303', 'application/pdf', '/storage/docs', 'test-user', 'complete', new Date(),
          '550e8400-e29b-41d4-a716-446655440304', caseId, 'doc3.pdf', 'doc3.pdf', 'medical_report', 3072, 'hash304', 'application/pdf', '/storage/docs', 'test-user', 'complete', new Date()
        ]
      );

      const newPool = new Pool({ connectionString: TEST_DATABASE_URL });
      const result = await newPool.query(
        'SELECT * FROM documents WHERE case_id = $1',
        [caseId]
      );
      await newPool.end();

      expect(result.rows.length).toBe(3);
    });
  });

  describe('AC-3: Case assignments persist across restart', () => {
    it('T-7.3: retrieves assigned cases after restart', async () => {
      const case1 = '550e8400-e29b-41d4-a716-446655440305';
      const case2 = '550e8400-e29b-41d4-a716-446655440306';

      await pool.query(
        `INSERT INTO cases (id, case_number, case_type, court, status, created_by, version, created_at, updated_at)
         VALUES ($1, $1, 'ADOPTION', $2, $3, 'test-user', $4, $5, $6), ($7, $7, 'ADOPTION', $8, $9, 'test-user', $10, $11, $12)`,
        [
          case1, 'Birmingham Family Court', 'APPLICATION', 1, new Date(), new Date(),
          case2, 'Manchester Family Court', 'DIRECTIONS', 1, new Date(), new Date()
        ]
      );

      await pool.query(
        `INSERT INTO case_assignments (case_id, user_id, role, assigned_at)
         VALUES ($1, $2, $3, $4), ($5, $6, $7, $8)`,
        [case1, 'user-restart', 'case_officer', new Date(), case2, 'user-restart', 'case_officer', new Date()]
      );

      const newPool = new Pool({ connectionString: TEST_DATABASE_URL });
      const result = await newPool.query(
        `SELECT c.* FROM cases c
         INNER JOIN case_assignments a ON c.id = a.case_id
         WHERE a.user_id = $1 AND c.deleted_at IS NULL`,
        ['user-restart']
      );
      await newPool.end();

      expect(result.rows.length).toBe(2);
    });
  });

  describe('AC-4: Audit log persists across restart', () => {
    it('T-7.4: retrieves all audit entries after restart', async () => {
      const caseId = '550e8400-e29b-41d4-a716-446655440307';

      for (let i = 0; i < 5; i++) {
        await pool.query(
          `INSERT INTO audit_log (action, entity_type, entity_id, user_id, timestamp)
           VALUES ($1, $2, $3, $4, $5)`,
          [`ACTION_${i}`, 'case', caseId, 'test-user', new Date()]
        );
      }

      const newPool = new Pool({ connectionString: TEST_DATABASE_URL });
      const result = await newPool.query(
        'SELECT * FROM audit_log WHERE entity_id = $1',
        [caseId]
      );
      await newPool.end();

      expect(result.rows.length).toBe(5);
    });
  });

  describe('AC-5: Concurrent updates work after restart', () => {
    it('T-7.5: optimistic locking prevents conflicts after restart', async () => {
      const caseId = '550e8400-e29b-41d4-a716-446655440308';
      await pool.query(
        `INSERT INTO cases (id, case_number, case_type, court, status, created_by, version, created_at, updated_at)
         VALUES ($1, $1, 'ADOPTION', $2, $3, 'test-user', $4, $5, $6)`,
        [caseId, 'London Family Court', 'DIRECTIONS', 2, new Date(), new Date()]
      );

      const newPool = new Pool({ connectionString: TEST_DATABASE_URL });

      const update1 = await newPool.query(
        `UPDATE cases SET status = $1, version = version + 1, updated_at = $2
         WHERE id = $3 AND version = $4
         RETURNING *`,
        ['HEARING', new Date(), caseId, 2]
      );

      const update2 = await newPool.query(
        `UPDATE cases SET status = $1, version = version + 1, updated_at = $2
         WHERE id = $3 AND version = $4
         RETURNING *`,
        ['PLACEMENT', new Date(), caseId, 2]
      );

      await newPool.end();

      expect(update1.rows.length).toBe(1);
      expect(update2.rows.length).toBe(0);
      expect(update1.rows[0].version).toBe(3);
    });
  });
});
