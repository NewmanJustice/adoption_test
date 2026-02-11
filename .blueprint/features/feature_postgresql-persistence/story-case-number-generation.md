# Story 4 — Implement Case Number Generation with Database Sequences

## User story
As a **developer**, I want case numbers to be generated using a database-backed sequence per court, so that case numbers are unique, sequential, and survive application restarts.

---

## Context / scope
- Infrastructure story (no user-facing changes)
- Replaces in-memory Map for court sequences (`courtSequences` in `caseRepository.ts`)
- Case number format: `{CourtCode}/{Year}/{SequenceNumber}` (e.g., `BFC/2026/00001`)
- Each court has an independent sequence (e.g., Birmingham Family Court, Manchester Family Court)
- Scope: Create database table for sequence tracking with row-level locking

---

## Acceptance criteria

**AC-1 — Court sequences table migration exists**
- Given a new migration file `006_create_court_sequences_table.sql` is created,
- When the migration is executed,
- Then a `court_sequences` table is created with columns: `court_code` (TEXT PRIMARY KEY), `current_year` (INTEGER), `current_sequence` (INTEGER),
- And an index exists on `court_code` for fast lookups,
- And seed data is inserted for known courts (e.g., BFC, MFC, LFC).

**AC-2 — Generate case number uses database sequence**
- Given Birmingham Family Court (BFC) has current sequence 42 for year 2026,
- When `generateCaseNumber('BFC')` is called,
- Then a SQL query with row-level locking is executed: `SELECT * FROM court_sequences WHERE court_code = $1 FOR UPDATE`,
- And if current year matches 2026, the sequence is incremented: `UPDATE court_sequences SET current_sequence = current_sequence + 1 WHERE court_code = $1 RETURNING *`,
- And the case number `BFC/2026/00043` is returned.

**AC-3 — New year resets sequence**
- Given Birmingham Family Court has sequence 150 for year 2025,
- When `generateCaseNumber('BFC')` is called in January 2026,
- Then the year is updated and sequence is reset: `UPDATE court_sequences SET current_year = 2026, current_sequence = 1 WHERE court_code = $1`,
- And the case number `BFC/2026/00001` is returned.

**AC-4 — Concurrent case creation uses locking**
- Given two case creation requests for BFC occur simultaneously,
- When both call `generateCaseNumber('BFC')` in parallel,
- Then row-level locking (`FOR UPDATE`) ensures sequential execution,
- And one request gets `BFC/2026/00044` and the other gets `BFC/2026/00045`,
- And no duplicate case numbers are generated.

**AC-5 — Sequence persists across restarts**
- Given Birmingham Family Court sequence is 99,
- When the application restarts,
- And a new case is created for BFC,
- Then the case number `BFC/2026/00100` is generated,
- And the sequence continues from the persisted value.

---

## Out of scope
- Court code validation (assumes court codes are valid)
- Manual sequence adjustment UI (database-only for MVP)
- Historical case number migration (only applies to new cases)
- Complex court hierarchy (flat list of courts)
