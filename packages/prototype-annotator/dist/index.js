import { Router, json, static as _static } from 'express';
import path4 from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import initSqlJs from 'sql.js';
import { z } from 'zod';
import { v4 } from 'uuid';

// src/middleware/factory.ts
var DatabaseWrapper = class {
  db;
  dbPath;
  saveTimeout = null;
  constructor(db2, dbPath) {
    this.db = db2;
    this.dbPath = dbPath;
  }
  prepare(sql) {
    return new StatementWrapper(this.db, sql, () => this.scheduleSave());
  }
  exec(sql) {
    this.db.run(sql);
    this.scheduleSave();
  }
  pragma(_pragma) {
  }
  close() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
    this.saveNow();
    this.db.close();
  }
  scheduleSave() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveNow();
      this.saveTimeout = null;
    }, 100);
  }
  saveNow() {
    try {
      const data = this.db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(this.dbPath, buffer);
    } catch (error) {
      console.error("[prototype-annotator] Failed to save database:", error);
    }
  }
};
var StatementWrapper = class {
  db;
  sql;
  onWrite;
  constructor(db2, sql, onWrite) {
    this.db = db2;
    this.sql = sql;
    this.onWrite = onWrite;
  }
  run(...params) {
    this.db.run(this.sql, params);
    this.onWrite();
  }
  get(...params) {
    const stmt = this.db.prepare(this.sql);
    stmt.bind(params);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return void 0;
  }
  all(...params) {
    const results = [];
    const stmt = this.db.prepare(this.sql);
    stmt.bind(params);
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }
};
var db = null;
var SQL = null;
var sqlJsPromise = initSqlJs();
sqlJsPromise.then((instance) => {
  SQL = instance;
});
function getDatabase() {
  if (!db) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return db;
}
async function initDatabaseAsync(dbPath) {
  if (!SQL) {
    SQL = await sqlJsPromise;
  }
  const dir = path4.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  let sqlJsDb;
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    sqlJsDb = new SQL.Database(fileBuffer);
  } else {
    sqlJsDb = new SQL.Database();
  }
  db = new DatabaseWrapper(sqlJsDb, dbPath);
  runMigrations(db);
  return db;
}
function initDatabase(dbPath) {
  if (!SQL) {
    throw new Error(
      "sql.js not yet initialized. Use initDatabaseAsync() or wait for module to load."
    );
  }
  const dir = path4.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  let sqlJsDb;
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    sqlJsDb = new SQL.Database(fileBuffer);
  } else {
    sqlJsDb = new SQL.Database();
  }
  db = new DatabaseWrapper(sqlJsDb, dbPath);
  runMigrations(db);
  return db;
}
function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}
function runMigrations(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL
    )
  `);
  const migrations = [
    {
      name: "001_initial.sql",
      sql: `
        CREATE TABLE IF NOT EXISTS annotations (
          id TEXT PRIMARY KEY,
          url_full TEXT NOT NULL,
          url_canonical TEXT NOT NULL,
          title TEXT NOT NULL,
          body TEXT NOT NULL,
          anchor_type TEXT CHECK(anchor_type IN ('element', 'rect')) NOT NULL,
          anchor_payload TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          deleted_at TEXT,
          created_by TEXT NOT NULL,
          updated_by TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_annotations_url_canonical ON annotations(url_canonical);
        CREATE INDEX IF NOT EXISTS idx_annotations_deleted_at ON annotations(deleted_at);

        CREATE TABLE IF NOT EXISTS annotation_events (
          id TEXT PRIMARY KEY,
          annotation_id TEXT,
          event_type TEXT CHECK(event_type IN ('CREATE', 'UPDATE', 'DELETE', 'RESTORE', 'EXPORT_PROMPT')) NOT NULL,
          actor TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          diff TEXT,
          meta TEXT
        );

        CREATE INDEX IF NOT EXISTS idx_events_annotation_id ON annotation_events(annotation_id);
        CREATE INDEX IF NOT EXISTS idx_events_timestamp ON annotation_events(timestamp);

        CREATE TABLE IF NOT EXISTS prompt_exports (
          id TEXT PRIMARY KEY,
          created_at TEXT NOT NULL,
          actor TEXT NOT NULL,
          url_scope TEXT NOT NULL,
          annotation_ids TEXT NOT NULL,
          template_id TEXT NOT NULL,
          prompt_markdown TEXT NOT NULL,
          saved_path_md TEXT NOT NULL,
          saved_path_json TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_prompt_exports_created_at ON prompt_exports(created_at);
      `
    }
  ];
  const appliedMigrations = /* @__PURE__ */ new Set();
  const rows = database.prepare("SELECT name FROM _migrations").all();
  for (const row of rows) {
    appliedMigrations.add(row.name);
  }
  for (const migration of migrations) {
    if (!appliedMigrations.has(migration.name)) {
      database.exec(migration.sql);
      database.prepare(
        "INSERT INTO _migrations (name, applied_at) VALUES (?, ?)"
      ).run(migration.name, (/* @__PURE__ */ new Date()).toISOString());
      console.log(`Applied migration: ${migration.name}`);
    }
  }
}
function getCanonicalUrl(urlFull) {
  try {
    const url = new URL(urlFull);
    return `${url.origin}${url.pathname}`;
  } catch {
    return urlFull;
  }
}
function parseAnnotation(row) {
  return {
    id: row.id,
    url_full: row.url_full,
    url_canonical: row.url_canonical,
    title: row.title,
    body: row.body,
    anchor_type: row.anchor_type,
    anchor_payload: JSON.parse(row.anchor_payload),
    created_at: row.created_at,
    updated_at: row.updated_at,
    deleted_at: row.deleted_at,
    created_by: row.created_by,
    updated_by: row.updated_by
  };
}
var AnnotationRepository = class {
  create(input) {
    const db2 = getDatabase();
    const id = v4();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const urlCanonical = getCanonicalUrl(input.url_full);
    const stmt = db2.prepare(`
      INSERT INTO annotations (
        id, url_full, url_canonical, title, body, anchor_type, anchor_payload,
        created_at, updated_at, deleted_at, created_by, updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)
    `);
    stmt.run(
      id,
      input.url_full,
      urlCanonical,
      input.title,
      input.body,
      input.anchor_type,
      JSON.stringify(input.anchor_payload),
      now,
      now,
      input.actor,
      input.actor
    );
    return this.findById(id);
  }
  findById(id) {
    const db2 = getDatabase();
    const row = db2.prepare("SELECT * FROM annotations WHERE id = ?").get(id);
    return row ? parseAnnotation(row) : null;
  }
  findByUrl(urlCanonical, includeDeleted = false) {
    const db2 = getDatabase();
    const query = includeDeleted ? "SELECT * FROM annotations WHERE url_canonical = ? ORDER BY created_at DESC" : "SELECT * FROM annotations WHERE url_canonical = ? AND deleted_at IS NULL ORDER BY created_at DESC";
    const rows = db2.prepare(query).all(urlCanonical);
    return rows.map(parseAnnotation);
  }
  findAll(includeDeleted = false) {
    const db2 = getDatabase();
    const query = includeDeleted ? "SELECT * FROM annotations ORDER BY created_at DESC" : "SELECT * FROM annotations WHERE deleted_at IS NULL ORDER BY created_at DESC";
    const rows = db2.prepare(query).all();
    return rows.map(parseAnnotation);
  }
  findByIds(ids) {
    if (ids.length === 0) return [];
    const db2 = getDatabase();
    const placeholders = ids.map(() => "?").join(",");
    const rows = db2.prepare(
      `SELECT * FROM annotations WHERE id IN (${placeholders}) AND deleted_at IS NULL`
    ).all(...ids);
    return rows.map(parseAnnotation);
  }
  update(id, input) {
    const db2 = getDatabase();
    const existing = this.findById(id);
    if (!existing || existing.deleted_at) return null;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const updates = ["updated_at = ?", "updated_by = ?"];
    const values = [now, input.actor];
    if (input.title !== void 0) {
      updates.push("title = ?");
      values.push(input.title);
    }
    if (input.body !== void 0) {
      updates.push("body = ?");
      values.push(input.body);
    }
    if (input.anchor_type !== void 0) {
      updates.push("anchor_type = ?");
      values.push(input.anchor_type);
    }
    if (input.anchor_payload !== void 0) {
      updates.push("anchor_payload = ?");
      values.push(JSON.stringify(input.anchor_payload));
    }
    values.push(id);
    db2.prepare(`UPDATE annotations SET ${updates.join(", ")} WHERE id = ?`).run(...values);
    return this.findById(id);
  }
  softDelete(id, actor) {
    const db2 = getDatabase();
    const existing = this.findById(id);
    if (!existing || existing.deleted_at) return null;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    db2.prepare("UPDATE annotations SET deleted_at = ?, updated_at = ?, updated_by = ? WHERE id = ?").run(now, now, actor, id);
    return this.findById(id);
  }
  restore(id, actor) {
    const db2 = getDatabase();
    const row = db2.prepare("SELECT * FROM annotations WHERE id = ?").get(id);
    if (!row || !row.deleted_at) return null;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    db2.prepare("UPDATE annotations SET deleted_at = NULL, updated_at = ?, updated_by = ? WHERE id = ?").run(now, actor, id);
    return this.findById(id);
  }
  getPages() {
    const db2 = getDatabase();
    const rows = db2.prepare(`
      SELECT
        url_canonical,
        COUNT(*) as annotation_count,
        MAX(updated_at) as latest_annotation_at
      FROM annotations
      WHERE deleted_at IS NULL
      GROUP BY url_canonical
      ORDER BY latest_annotation_at DESC
    `).all();
    return rows;
  }
};
function parseEvent(row) {
  return {
    id: row.id,
    annotation_id: row.annotation_id,
    event_type: row.event_type,
    actor: row.actor,
    timestamp: row.timestamp,
    diff: row.diff ? JSON.parse(row.diff) : null,
    meta: row.meta ? JSON.parse(row.meta) : null
  };
}
var EventRepository = class {
  create(input) {
    const db2 = getDatabase();
    const id = v4();
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const stmt = db2.prepare(`
      INSERT INTO annotation_events (id, annotation_id, event_type, actor, timestamp, diff, meta)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      input.annotation_id ?? null,
      input.event_type,
      input.actor,
      timestamp,
      input.diff ? JSON.stringify(input.diff) : null,
      input.meta ? JSON.stringify(input.meta) : null
    );
    return this.findById(id);
  }
  findById(id) {
    const db2 = getDatabase();
    const row = db2.prepare("SELECT * FROM annotation_events WHERE id = ?").get(id);
    return row ? parseEvent(row) : null;
  }
  findByAnnotationId(annotationId) {
    const db2 = getDatabase();
    const rows = db2.prepare(
      "SELECT * FROM annotation_events WHERE annotation_id = ? ORDER BY timestamp DESC"
    ).all(annotationId);
    return rows.map(parseEvent);
  }
  findAll(limit = 100, offset = 0) {
    const db2 = getDatabase();
    const rows = db2.prepare(
      "SELECT * FROM annotation_events ORDER BY timestamp DESC LIMIT ? OFFSET ?"
    ).all(limit, offset);
    return rows.map(parseEvent);
  }
  findByEventType(eventType, limit = 100) {
    const db2 = getDatabase();
    const rows = db2.prepare(
      "SELECT * FROM annotation_events WHERE event_type = ? ORDER BY timestamp DESC LIMIT ?"
    ).all(eventType, limit);
    return rows.map(parseEvent);
  }
  countAll() {
    const db2 = getDatabase();
    const result = db2.prepare("SELECT COUNT(*) as count FROM annotation_events").get();
    return result.count;
  }
  findByDateRange(startDate, endDate) {
    const db2 = getDatabase();
    const rows = db2.prepare(
      "SELECT * FROM annotation_events WHERE timestamp >= ? AND timestamp <= ? ORDER BY timestamp DESC"
    ).all(startDate, endDate);
    return rows.map(parseEvent);
  }
  findByUrlCanonical(urlCanonical, limit = 100) {
    const db2 = getDatabase();
    const rows = db2.prepare(`
      SELECT e.* FROM annotation_events e
      INNER JOIN annotations a ON e.annotation_id = a.id
      WHERE a.url_canonical = ?
      ORDER BY e.timestamp DESC
      LIMIT ?
    `).all(urlCanonical, limit);
    return rows.map(parseEvent);
  }
};

// src/services/annotation.service.ts
var AnnotationService = class {
  annotationRepo;
  eventRepo;
  constructor() {
    this.annotationRepo = new AnnotationRepository();
    this.eventRepo = new EventRepository();
  }
  create(input) {
    const annotation = this.annotationRepo.create(input);
    this.eventRepo.create({
      annotation_id: annotation.id,
      event_type: "CREATE",
      actor: input.actor,
      meta: {
        url_full: annotation.url_full,
        title: annotation.title
      }
    });
    return annotation;
  }
  findById(id) {
    return this.annotationRepo.findById(id);
  }
  findByUrl(urlCanonical, includeDeleted = false) {
    return this.annotationRepo.findByUrl(urlCanonical, includeDeleted);
  }
  findAll(includeDeleted = false) {
    return this.annotationRepo.findAll(includeDeleted);
  }
  findByIds(ids) {
    return this.annotationRepo.findByIds(ids);
  }
  update(id, input) {
    const existing = this.annotationRepo.findById(id);
    if (!existing || existing.deleted_at) return null;
    const diff = {};
    if (input.title !== void 0 && input.title !== existing.title) {
      diff.title = { old: existing.title, new: input.title };
    }
    if (input.body !== void 0 && input.body !== existing.body) {
      diff.body = { old: existing.body, new: input.body };
    }
    if (input.anchor_type !== void 0 && input.anchor_type !== existing.anchor_type) {
      diff.anchor_type = { old: existing.anchor_type, new: input.anchor_type };
    }
    if (input.anchor_payload !== void 0) {
      diff.anchor_payload = { old: existing.anchor_payload, new: input.anchor_payload };
    }
    const updated = this.annotationRepo.update(id, input);
    if (!updated) return null;
    if (Object.keys(diff).length > 0) {
      this.eventRepo.create({
        annotation_id: id,
        event_type: "UPDATE",
        actor: input.actor,
        diff
      });
    }
    return updated;
  }
  delete(id, actor) {
    const deleted = this.annotationRepo.softDelete(id, actor);
    if (!deleted) return null;
    this.eventRepo.create({
      annotation_id: id,
      event_type: "DELETE",
      actor,
      meta: {
        title: deleted.title,
        url_canonical: deleted.url_canonical
      }
    });
    return deleted;
  }
  restore(id, actor) {
    const restored = this.annotationRepo.restore(id, actor);
    if (!restored) return null;
    this.eventRepo.create({
      annotation_id: id,
      event_type: "RESTORE",
      actor
    });
    return restored;
  }
  getPages() {
    return this.annotationRepo.getPages();
  }
};

// src/api/annotations.routes.ts
var CreateAnnotationSchema = z.object({
  url_full: z.string().url(),
  title: z.string().min(1).max(500),
  body: z.string(),
  anchor_type: z.enum(["element", "rect"]),
  anchor_payload: z.record(z.unknown()),
  actor: z.string().optional()
});
var UpdateAnnotationSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  body: z.string().optional(),
  anchor_type: z.enum(["element", "rect"]).optional(),
  anchor_payload: z.record(z.unknown()).optional(),
  actor: z.string().optional()
});
function createAnnotationsRouter(config) {
  const router = Router();
  const service = new AnnotationService();
  router.get("/", (_req, res) => {
    try {
      const includeDeleted = _req.query.includeDeleted === "true";
      const annotations = service.findAll(includeDeleted);
      res.json({ success: true, data: annotations });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });
  router.get("/by-url", (req, res) => {
    try {
      const url = req.query.url;
      if (!url) {
        res.status(400).json({ success: false, error: "url query parameter required" });
        return;
      }
      const includeDeleted = req.query.includeDeleted === "true";
      const annotations = service.findByUrl(url, includeDeleted);
      res.json({ success: true, data: annotations });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });
  router.get("/:id", (req, res) => {
    try {
      const annotation = service.findById(req.params.id);
      if (!annotation) {
        res.status(404).json({ success: false, error: "Annotation not found" });
        return;
      }
      res.json({ success: true, data: annotation });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });
  router.post("/", (req, res) => {
    try {
      const result = CreateAnnotationSchema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({ success: false, error: result.error.message });
        return;
      }
      const annotation = service.create({
        ...result.data,
        anchor_payload: result.data.anchor_payload,
        actor: result.data.actor || config.defaultActor
      });
      res.status(201).json({ success: true, data: annotation });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });
  router.patch("/:id", (req, res) => {
    try {
      const result = UpdateAnnotationSchema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({ success: false, error: result.error.message });
        return;
      }
      const updated = service.update(req.params.id, {
        ...result.data,
        anchor_payload: result.data.anchor_payload,
        actor: result.data.actor || config.defaultActor
      });
      if (!updated) {
        res.status(404).json({ success: false, error: "Annotation not found" });
        return;
      }
      res.json({ success: true, data: updated });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });
  router.delete("/:id", (req, res) => {
    try {
      const actor = req.query.actor || config.defaultActor;
      const deleted = service.delete(req.params.id, actor);
      if (!deleted) {
        res.status(404).json({ success: false, error: "Annotation not found" });
        return;
      }
      res.json({ success: true, data: deleted });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });
  router.post("/:id/restore", (req, res) => {
    try {
      const actor = req.body.actor || config.defaultActor;
      const restored = service.restore(req.params.id, actor);
      if (!restored) {
        res.status(404).json({ success: false, error: "Annotation not found or not deleted" });
        return;
      }
      res.json({ success: true, data: restored });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });
  return router;
}

// src/services/event.service.ts
var EventService = class {
  eventRepo;
  constructor() {
    this.eventRepo = new EventRepository();
  }
  findById(id) {
    return this.eventRepo.findById(id);
  }
  findByAnnotationId(annotationId) {
    return this.eventRepo.findByAnnotationId(annotationId);
  }
  findAll(limit = 100, offset = 0) {
    return this.eventRepo.findAll(limit, offset);
  }
  findByEventType(eventType, limit = 100) {
    return this.eventRepo.findByEventType(eventType, limit);
  }
  findByDateRange(startDate, endDate) {
    return this.eventRepo.findByDateRange(startDate, endDate);
  }
  countAll() {
    return this.eventRepo.countAll();
  }
  getRecentActivity(limit = 20) {
    return this.eventRepo.findAll(limit, 0);
  }
  findByUrlCanonical(urlCanonical, limit = 100) {
    return this.eventRepo.findByUrlCanonical(urlCanonical, limit);
  }
};

// src/api/events.routes.ts
function createEventsRouter() {
  const router = Router();
  const service = new EventService();
  router.get("/", (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 100, 500);
      const offset = parseInt(req.query.offset) || 0;
      const annotationId = req.query.annotationId;
      const urlCanonical = req.query.url_canonical;
      let events;
      let total;
      if (annotationId) {
        events = service.findByAnnotationId(annotationId);
        total = events.length;
      } else if (urlCanonical) {
        events = service.findByUrlCanonical(urlCanonical, limit);
        total = events.length;
      } else {
        events = service.findAll(limit, offset);
        total = service.countAll();
      }
      res.json({
        success: true,
        data: {
          items: events,
          total,
          limit,
          offset
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });
  router.get("/by-annotation/:annotationId", (req, res) => {
    try {
      const events = service.findByAnnotationId(req.params.annotationId);
      res.json({ success: true, data: events });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });
  router.get("/by-type/:eventType", (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 100, 500);
      const eventType = req.params.eventType.toUpperCase();
      const validTypes = ["CREATE", "UPDATE", "DELETE", "RESTORE", "EXPORT_PROMPT"];
      if (!validTypes.includes(eventType)) {
        res.status(400).json({ success: false, error: "Invalid event type" });
        return;
      }
      const events = service.findByEventType(eventType, limit);
      res.json({ success: true, data: events });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });
  router.get("/:id", (req, res) => {
    try {
      const event = service.findById(req.params.id);
      if (!event) {
        res.status(404).json({ success: false, error: "Event not found" });
        return;
      }
      res.json({ success: true, data: event });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });
  router.get("/recent/activity", (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 20, 100);
      const events = service.getRecentActivity(limit);
      res.json({ success: true, data: events });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });
  return router;
}
function parsePromptExport(row) {
  return {
    id: row.id,
    created_at: row.created_at,
    actor: row.actor,
    url_scope: JSON.parse(row.url_scope),
    annotation_ids: JSON.parse(row.annotation_ids),
    template_id: row.template_id,
    prompt_markdown: row.prompt_markdown,
    saved_path_md: row.saved_path_md,
    saved_path_json: row.saved_path_json
  };
}
var PromptExportRepository = class {
  create(input) {
    const db2 = getDatabase();
    const id = v4();
    const createdAt = (/* @__PURE__ */ new Date()).toISOString();
    const stmt = db2.prepare(`
      INSERT INTO prompt_exports (
        id, created_at, actor, url_scope, annotation_ids, template_id,
        prompt_markdown, saved_path_md, saved_path_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      createdAt,
      input.actor,
      JSON.stringify(input.url_scope),
      JSON.stringify(input.annotation_ids),
      input.template_id,
      input.prompt_markdown,
      input.saved_path_md,
      input.saved_path_json
    );
    return this.findById(id);
  }
  findById(id) {
    const db2 = getDatabase();
    const row = db2.prepare("SELECT * FROM prompt_exports WHERE id = ?").get(id);
    return row ? parsePromptExport(row) : null;
  }
  findAll(limit = 50, offset = 0) {
    const db2 = getDatabase();
    const rows = db2.prepare(
      "SELECT * FROM prompt_exports ORDER BY created_at DESC LIMIT ? OFFSET ?"
    ).all(limit, offset);
    return rows.map(parsePromptExport);
  }
  findByActor(actor) {
    const db2 = getDatabase();
    const rows = db2.prepare(
      "SELECT * FROM prompt_exports WHERE actor = ? ORDER BY created_at DESC"
    ).all(actor);
    return rows.map(parsePromptExport);
  }
  countAll() {
    const db2 = getDatabase();
    const result = db2.prepare("SELECT COUNT(*) as count FROM prompt_exports").get();
    return result.count;
  }
};

// src/services/prompt.service.ts
var AGENTIC_DEV_TEMPLATE = `# Implementation Prompt

## Context

This document contains feedback and annotations collected from a prototype review session. The annotations describe required changes, observations, and suggestions for improvement.

## Screens in Scope

{{screens_section}}

## Observations

{{observations_section}}

## Required Changes

{{changes_section}}

## Acceptance Criteria

{{acceptance_section}}

## Suggested Tests / Checks

{{tests_section}}

## Assumptions & Out of Scope

- Authentication and authorization are not in scope for this change
- Performance optimization is not required unless explicitly mentioned
- Backwards compatibility should be maintained where possible

---

**Generated:** {{generated_at}}
**Annotations included:** {{annotation_count}}
**Template:** agentic-dev

*Generated by prototype-annotator*
`;
var PromptService = class {
  annotationRepo;
  promptRepo;
  eventRepo;
  config;
  constructor(config) {
    this.annotationRepo = new AnnotationRepository();
    this.promptRepo = new PromptExportRepository();
    this.eventRepo = new EventRepository();
    this.config = config;
  }
  async generate(input) {
    let annotations = [];
    if (input.annotation_ids && input.annotation_ids.length > 0) {
      annotations = this.annotationRepo.findByIds(input.annotation_ids);
    } else if (input.urls && input.urls.length > 0) {
      for (const url of input.urls) {
        const urlAnnotations = this.annotationRepo.findByUrl(url);
        annotations.push(...urlAnnotations);
      }
    } else {
      annotations = this.annotationRepo.findAll();
    }
    const markdown = this.generateMarkdown(annotations);
    return {
      markdown,
      annotations,
      enhanced: false
    };
  }
  async confirm(input) {
    let markdown = input.markdown;
    let annotations = [];
    if (!markdown) {
      const generated = await this.generate(input);
      markdown = generated.markdown;
      annotations = generated.annotations;
    } else {
      if (input.annotation_ids && input.annotation_ids.length > 0) {
        annotations = this.annotationRepo.findByIds(input.annotation_ids);
      } else if (input.urls && input.urls.length > 0) {
        for (const url of input.urls) {
          const urlAnnotations = this.annotationRepo.findByUrl(url);
          annotations.push(...urlAnnotations);
        }
      }
    }
    if (!fs.existsSync(this.config.exportDir)) {
      fs.mkdirSync(this.config.exportDir, { recursive: true });
    }
    const now = /* @__PURE__ */ new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toISOString().slice(11, 16).replace(":", "");
    const slug = this.generateSlug(annotations);
    const baseFilename = `${dateStr}__${timeStr}__${slug}`;
    const mdPath = path4.join(this.config.exportDir, `${baseFilename}.md`);
    const jsonPath = path4.join(this.config.exportDir, `${baseFilename}.json`);
    fs.writeFileSync(mdPath, markdown, "utf-8");
    const jsonContent = {
      generated_at: now.toISOString(),
      actor: input.actor,
      urls: input.urls || [...new Set(annotations.map((a) => a.url_full))],
      annotation_ids: annotations.map((a) => a.id),
      template_id: input.template_id || "agentic-dev",
      prompt_markdown: markdown,
      annotations
    };
    fs.writeFileSync(jsonPath, JSON.stringify(jsonContent, null, 2), "utf-8");
    const promptExport = this.promptRepo.create({
      actor: input.actor,
      url_scope: input.urls || [...new Set(annotations.map((a) => a.url_full))],
      annotation_ids: annotations.map((a) => a.id),
      template_id: input.template_id || "agentic-dev",
      prompt_markdown: markdown,
      saved_path_md: mdPath,
      saved_path_json: jsonPath
    });
    this.eventRepo.create({
      annotation_id: null,
      event_type: "EXPORT_PROMPT",
      actor: input.actor,
      meta: {
        export_id: promptExport.id,
        annotation_count: annotations.length,
        paths: { md: mdPath, json: jsonPath }
      }
    });
    return promptExport;
  }
  // Keep export as alias for confirm for backwards compatibility
  async export(input) {
    return this.confirm(input);
  }
  findExportById(id) {
    return this.promptRepo.findById(id);
  }
  findAllExports(limit = 50, offset = 0) {
    return this.promptRepo.findAll(limit, offset);
  }
  generateSlug(annotations) {
    if (annotations.length === 0) return "empty";
    const title = annotations[0].title;
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30) || "annotations";
  }
  formatElementLocation(annotation) {
    if (annotation.anchor_type === "element") {
      const anchor = annotation.anchor_payload;
      const parts = [];
      if (anchor.selector) {
        parts.push(`Selector: \`${anchor.selector}\``);
      }
      if (anchor.textContent) {
        const text = anchor.textContent.length > 100 ? anchor.textContent.slice(0, 100) + "..." : anchor.textContent;
        parts.push(`Text: "${text}"`);
      }
      return parts.join(" | ");
    } else {
      return "Region selection (coordinates captured)";
    }
  }
  generateMarkdown(annotations) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const byUrl = /* @__PURE__ */ new Map();
    for (const annotation of annotations) {
      const url = annotation.url_full;
      if (!byUrl.has(url)) {
        byUrl.set(url, []);
      }
      byUrl.get(url).push(annotation);
    }
    const screensSection = Array.from(byUrl.keys()).map((url) => `- ${url}`).join("\n") || "- No screens specified";
    let observationsSection = "";
    for (const [url, urlAnnotations] of byUrl) {
      observationsSection += `### ${new URL(url).pathname}

`;
      for (const a of urlAnnotations) {
        observationsSection += `- **${a.title}**
`;
        observationsSection += `  - Element: ${this.formatElementLocation(a)}
`;
        if (a.body) {
          observationsSection += `  - Note: ${a.body}
`;
        }
        observationsSection += "\n";
      }
    }
    observationsSection = observationsSection.trim() || "No observations recorded.";
    let changesSection = "";
    let changeNum = 1;
    for (const annotation of annotations) {
      changesSection += `${changeNum}. **${annotation.title}**
`;
      if (annotation.body) {
        changesSection += `   - ${annotation.body}
`;
      }
      changesSection += `   - Element: ${this.formatElementLocation(annotation)}
`;
      changesSection += `   - Page: ${annotation.url_canonical}

`;
      changeNum++;
    }
    changesSection = changesSection.trim() || "No changes specified.";
    let acceptanceSection = "";
    for (const annotation of annotations) {
      acceptanceSection += `- [ ] ${annotation.title} has been implemented
`;
    }
    acceptanceSection = acceptanceSection.trim() || "- [ ] All changes have been reviewed and approved";
    let testsSection = "";
    for (const annotation of annotations) {
      testsSection += `- [ ] Verify: ${annotation.title}
`;
    }
    testsSection += "- [ ] Visual regression test passes\n";
    testsSection += "- [ ] No console errors in browser\n";
    testsSection = testsSection.trim();
    let output = AGENTIC_DEV_TEMPLATE;
    output = output.replace("{{screens_section}}", screensSection);
    output = output.replace("{{observations_section}}", observationsSection);
    output = output.replace("{{changes_section}}", changesSection);
    output = output.replace("{{acceptance_section}}", acceptanceSection);
    output = output.replace("{{tests_section}}", testsSection);
    output = output.replace("{{generated_at}}", now);
    output = output.replace("{{annotation_count}}", String(annotations.length));
    return output;
  }
};

// src/api/prompts.routes.ts
var GeneratePromptSchema = z.object({
  urls: z.array(z.string()).optional(),
  annotation_ids: z.array(z.string()).optional(),
  template_id: z.string().optional(),
  enhance_with_ai: z.boolean().optional(),
  actor: z.string().optional()
});
var ConfirmPromptSchema = z.object({
  urls: z.array(z.string()).optional(),
  annotation_ids: z.array(z.string()).optional(),
  template_id: z.string().optional(),
  markdown: z.string().optional(),
  actor: z.string().optional()
});
function createPromptsRouter(config) {
  const router = Router();
  const service = new PromptService(config);
  router.post("/generate", async (req, res) => {
    try {
      const result = GeneratePromptSchema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({ success: false, error: result.error.message });
        return;
      }
      const generated = await service.generate({
        ...result.data,
        actor: result.data.actor || config.defaultActor
      });
      res.json({ success: true, data: generated });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });
  router.post("/confirm", async (req, res) => {
    try {
      const result = ConfirmPromptSchema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({ success: false, error: result.error.message });
        return;
      }
      const exported = await service.confirm({
        ...result.data,
        actor: result.data.actor || config.defaultActor
      });
      res.status(201).json({ success: true, data: exported });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });
  router.post("/export", async (req, res) => {
    try {
      const result = ConfirmPromptSchema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({ success: false, error: result.error.message });
        return;
      }
      const exported = await service.confirm({
        ...result.data,
        actor: result.data.actor || config.defaultActor
      });
      res.status(201).json({ success: true, data: exported });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });
  router.get("/exports", (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 50, 200);
      const offset = parseInt(req.query.offset) || 0;
      const exports$1 = service.findAllExports(limit, offset);
      res.json({ success: true, data: exports$1 });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });
  router.get("/exports/:id", (req, res) => {
    try {
      const exported = service.findExportById(req.params.id);
      if (!exported) {
        res.status(404).json({ success: false, error: "Export not found" });
        return;
      }
      res.json({ success: true, data: exported });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });
  return router;
}

// src/api/router.ts
function createApiRouter(config) {
  const router = Router();
  const annotationService = new AnnotationService();
  router.use("/annotations", createAnnotationsRouter(config));
  router.use("/events", createEventsRouter());
  router.use("/prompts", createPromptsRouter(config));
  router.get("/pages", (_req, res) => {
    try {
      const pages = annotationService.getPages();
      res.json({ success: true, data: pages });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });
  router.get("/health", (_req, res) => {
    res.json({
      success: true,
      data: {
        status: "ok",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
  });
  return router;
}

// src/middleware/injector.ts
function createInjector(basePath, clientConfig) {
  return (req, res, next) => {
    if (req.path.startsWith(basePath)) {
      next();
      return;
    }
    const originalWrite = res.write.bind(res);
    const originalEnd = res.end.bind(res);
    let chunks = [];
    let isHtml = false;
    res.write = function(chunk, encodingOrCallback, callback) {
      const encoding = typeof encodingOrCallback === "function" ? void 0 : encodingOrCallback;
      const cb = typeof encodingOrCallback === "function" ? encodingOrCallback : callback;
      if (chunk) {
        if (Buffer.isBuffer(chunk)) {
          chunks.push(chunk);
        } else if (typeof chunk === "string") {
          chunks.push(Buffer.from(chunk, encoding || "utf-8"));
        }
      }
      if (chunks.length === 1) {
        const contentType = res.getHeader("content-type");
        isHtml = typeof contentType === "string" && contentType.includes("text/html");
      }
      if (cb) {
        cb(null);
      }
      return true;
    };
    res.end = function(chunk, encodingOrCallback, callback) {
      const encoding = typeof encodingOrCallback === "function" ? void 0 : encodingOrCallback;
      const cb = typeof encodingOrCallback === "function" ? encodingOrCallback : callback;
      if (chunk) {
        if (Buffer.isBuffer(chunk)) {
          chunks.push(chunk);
        } else if (typeof chunk === "string") {
          chunks.push(Buffer.from(chunk, encoding || "utf-8"));
        }
      }
      const contentType = res.getHeader("content-type");
      isHtml = typeof contentType === "string" && contentType.includes("text/html");
      if (isHtml && chunks.length > 0) {
        let html = Buffer.concat(chunks).toString("utf-8");
        if (html.includes("</body>") && !html.includes("prototype-annotator-root")) {
          const configScript = `<script>window.__PROTOTYPE_ANNOTATOR_CONFIG__=${JSON.stringify(clientConfig)};</script>`;
          const overlayScript = `<script src="${basePath}/overlay.js"></script>`;
          html = html.replace("</body>", `${configScript}${overlayScript}</body>`);
          res.setHeader("content-length", Buffer.byteLength(html));
        }
        res.write = originalWrite;
        res.end = originalEnd;
        return res.end(html, "utf-8", cb);
      }
      res.write = originalWrite;
      res.end = originalEnd;
      if (chunks.length > 0) {
        const body = Buffer.concat(chunks);
        return res.end(body, cb);
      }
      return res.end(cb);
    };
    next();
  };
}

// src/middleware/error-handler.ts
function errorHandler(err, _req, res, _next) {
  console.error("Prototype Annotator Error:", err);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  res.status(statusCode).json({
    success: false,
    error: message,
    code: err.code
  });
}
function notFoundHandler(_req, res) {
  res.status(404).json({
    success: false,
    error: "Not found"
  });
}
var ConfigSchema = z.object({
  basePath: z.string().default("/__prototype-annotator"),
  dbPath: z.string().default("./prototype-annotator/annotator.sqlite"),
  exportDir: z.string().default("./prototype_annotator_exports"),
  defaultActor: z.string().default("anonymous"),
  enableOverlay: z.boolean().default(true),
  enableDashboard: z.boolean().default(true),
  urlMode: z.enum(["full", "canonical"]).default("full"),
  actorMode: z.enum(["prompt", "anonymous", "fixed"]).default("prompt")
});
function resolveConfig(input) {
  const parsed = ConfigSchema.parse(input ?? {});
  let basePath = parsed.basePath;
  if (!basePath.startsWith("/")) {
    basePath = "/" + basePath;
  }
  basePath = basePath.replace(/\/+$/, "");
  const dbPath = path4.isAbsolute(parsed.dbPath) ? parsed.dbPath : path4.resolve(process.cwd(), parsed.dbPath);
  const exportDir = path4.isAbsolute(parsed.exportDir) ? parsed.exportDir : path4.resolve(process.cwd(), parsed.exportDir);
  return {
    basePath,
    dbPath,
    exportDir,
    defaultActor: parsed.defaultActor,
    enableOverlay: parsed.enableOverlay,
    enableDashboard: parsed.enableDashboard,
    urlMode: parsed.urlMode,
    actorMode: parsed.actorMode
  };
}
function getClientConfig(config) {
  return {
    basePath: config.basePath,
    apiUrl: `${config.basePath}/api`,
    defaultActor: config.defaultActor,
    actorMode: config.actorMode
  };
}

// src/middleware/factory.ts
var __filename$1 = fileURLToPath(import.meta.url);
var __dirname$1 = path4.dirname(__filename$1);
function getClientDistPath() {
  const installedPath = path4.resolve(__dirname$1, "../client/dist");
  const devPath = path4.resolve(__dirname$1, "../../client/dist");
  if (__dirname$1.endsWith("dist") || __dirname$1.includes("dist/")) {
    return installedPath;
  }
  return devPath;
}
async function createPrototypeAnnotator(userConfig) {
  const config = resolveConfig(userConfig);
  await initDatabaseAsync(config.dbPath);
  const router = Router();
  router.use(json());
  const clientConfig = getClientConfig(config);
  router.use(`${config.basePath}/api`, createApiRouter(config));
  const clientDistPath = getClientDistPath();
  const overlayPath = path4.join(clientDistPath, "overlay.js");
  console.log(`[prototype-annotator] Client dist path: ${clientDistPath}`);
  console.log(`[prototype-annotator] __dirname: ${__dirname$1}`);
  console.log(`[prototype-annotator] overlay.js exists: ${fs.existsSync(overlayPath)} at ${overlayPath}`);
  router.get(`${config.basePath}/overlay.js`, (_req, res) => {
    const filePath = path4.join(clientDistPath, "overlay.js");
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error(`[prototype-annotator] Failed to send overlay.js from ${filePath}:`, err.message);
        res.status(404).json({ error: "overlay.js not found", path: filePath });
      }
    });
  });
  router.get(`${config.basePath}/overlay.js.map`, (_req, res) => {
    const filePath = path4.join(clientDistPath, "overlay.js.map");
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error(`[prototype-annotator] Failed to send overlay.js.map from ${filePath}:`, err.message);
        res.status(404).json({ error: "overlay.js.map not found", path: filePath });
      }
    });
  });
  if (config.enableDashboard) {
    router.use(
      `${config.basePath}/dashboard`,
      _static(path4.join(clientDistPath, "dashboard"))
    );
    router.get(`${config.basePath}/dashboard/*`, (_req, res) => {
      res.sendFile(path4.join(clientDistPath, "dashboard", "index.html"));
    });
  }
  router.use(`${config.basePath}/api`, notFoundHandler);
  router.use(`${config.basePath}/api`, errorHandler);
  const injector = config.enableOverlay ? createInjector(config.basePath, clientConfig) : null;
  const combinedMiddleware = Router();
  if (injector) {
    combinedMiddleware.use(injector);
  }
  combinedMiddleware.use(router);
  const injectorMiddleware = injector || ((_req, _res, next) => next());
  return {
    middleware: () => combinedMiddleware,
    router,
    // Just API routes and static files (no injection)
    injector: injectorMiddleware,
    config
  };
}

export { closeDatabase, createPrototypeAnnotator, getClientConfig, getDatabase, initDatabase, resolveConfig };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map