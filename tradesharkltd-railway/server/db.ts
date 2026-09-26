import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { config } from './config';

/**
 * Tiny document store.
 * - With DATABASE_URL (Railway Postgres): every collection is persisted to Postgres (JSONB) and files as BYTEA.
 * - Without it: data is persisted to DATA_DIR/db.json and DATA_DIR/uploads (attach a Railway volume to keep it).
 * All reads are served from an in-memory cache that is loaded at boot (single-instance deployment).
 */

export type Collection =
  | 'users' | 'admins' | 'transactions' | 'auditLogs' | 'positions' | 'emails'
  | 'copies' | 'tokens' | 'submissions' | 'subscribers' | 'settings';

const COLLECTIONS: Collection[] = [
  'users', 'admins', 'transactions', 'auditLogs', 'positions', 'emails',
  'copies', 'tokens', 'submissions', 'subscribers', 'settings'
];

type Doc = { id: string; [k: string]: any };

export interface StoredFile {
  id: string;
  ownerId: string;
  kind: string;
  filename: string;
  mime: string;
  size: number;
  createdAt: string;
}

class Store {
  private cache = new Map<Collection, Map<string, Doc>>();
  private pool: pg.Pool | null = null;
  private jsonPath = '';
  private uploadsDir = '';
  private flushTimer: NodeJS.Timeout | null = null;
  mode: 'postgres' | 'file' = 'file';

  async init() {
    COLLECTIONS.forEach(c => this.cache.set(c, new Map()));

    if (config.databaseUrl) {
      this.mode = 'postgres';
      const needsSsl = !/localhost|127\.0\.0\.1|\.railway\.internal/.test(config.databaseUrl) && !/sslmode=disable/.test(config.databaseUrl);
      this.pool = new pg.Pool({
        connectionString: config.databaseUrl,
        ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
        max: 10,
      });
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS app_documents (
          collection TEXT NOT NULL,
          id TEXT NOT NULL,
          data JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          PRIMARY KEY (collection, id)
        );
        CREATE TABLE IF NOT EXISTS app_files (
          id TEXT PRIMARY KEY,
          owner_id TEXT NOT NULL,
          kind TEXT NOT NULL,
          filename TEXT NOT NULL,
          mime TEXT NOT NULL,
          size INTEGER NOT NULL,
          data BYTEA NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
      const { rows } = await this.pool.query('SELECT collection, id, data FROM app_documents');
      for (const r of rows) {
        const coll = this.cache.get(r.collection as Collection);
        if (coll) coll.set(r.id, r.data);
      }
      console.log(`[db] Postgres connected - loaded ${rows.length} documents`);
    } else {
      this.mode = 'file';
      fs.mkdirSync(config.dataDir, { recursive: true });
      this.jsonPath = path.join(config.dataDir, 'db.json');
      this.uploadsDir = path.join(config.dataDir, 'uploads');
      fs.mkdirSync(this.uploadsDir, { recursive: true });
      if (fs.existsSync(this.jsonPath)) {
        const raw = JSON.parse(fs.readFileSync(this.jsonPath, 'utf8'));
        for (const c of COLLECTIONS) {
          for (const d of (raw[c] || []) as Doc[]) this.cache.get(c)!.set(d.id, d);
        }
      }
      console.warn(`[db] DATABASE_URL not set - using file storage at ${path.resolve(this.jsonPath)}. Add a Railway Postgres database (recommended) or a volume to keep data between deploys.`);
    }
  }

  all<T = any>(c: Collection): T[] {
    return Array.from(this.cache.get(c)!.values()) as T[];
  }

  get<T = any>(c: Collection, id: string): T | undefined {
    return this.cache.get(c)!.get(id) as T | undefined;
  }

  find<T = any>(c: Collection, pred: (d: T) => boolean): T | undefined {
    return this.all<T>(c).find(pred);
  }

  filter<T = any>(c: Collection, pred: (d: T) => boolean): T[] {
    return this.all<T>(c).filter(pred);
  }

  async put<T extends Doc>(c: Collection, doc: T): Promise<T> {
    this.cache.get(c)!.set(doc.id, doc);
    if (this.pool) {
      await this.pool.query(
        `INSERT INTO app_documents (collection, id, data, updated_at) VALUES ($1, $2, $3, NOW())
         ON CONFLICT (collection, id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
        [c, doc.id, JSON.stringify(doc)]
      );
    } else {
      this.scheduleFlush();
    }
    return doc;
  }

  async update<T extends Doc>(c: Collection, id: string, patch: Partial<T>): Promise<T | undefined> {
    const existing = this.get<T>(c, id);
    if (!existing) return undefined;
    return this.put(c, { ...existing, ...patch });
  }

  async remove(c: Collection, id: string) {
    this.cache.get(c)!.delete(id);
    if (this.pool) {
      await this.pool.query('DELETE FROM app_documents WHERE collection = $1 AND id = $2', [c, id]);
    } else {
      this.scheduleFlush();
    }
  }

  // ---------- Files ----------
  async saveFile(meta: Omit<StoredFile, 'createdAt'>, data: Buffer): Promise<StoredFile> {
    const file: StoredFile = { ...meta, createdAt: new Date().toISOString() };
    if (this.pool) {
      await this.pool.query(
        'INSERT INTO app_files (id, owner_id, kind, filename, mime, size, data) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [file.id, file.ownerId, file.kind, file.filename, file.mime, file.size, data]
      );
    } else {
      fs.writeFileSync(path.join(this.uploadsDir, file.id), data);
      fs.writeFileSync(path.join(this.uploadsDir, `${file.id}.json`), JSON.stringify(file));
    }
    return file;
  }

  async getFile(id: string): Promise<{ meta: StoredFile; data: Buffer } | null> {
    if (!/^[A-Za-z0-9_-]+$/.test(id)) return null;
    if (this.pool) {
      const { rows } = await this.pool.query('SELECT * FROM app_files WHERE id = $1', [id]);
      if (!rows[0]) return null;
      const r = rows[0];
      return {
        meta: { id: r.id, ownerId: r.owner_id, kind: r.kind, filename: r.filename, mime: r.mime, size: r.size, createdAt: r.created_at },
        data: r.data,
      };
    }
    const p = path.join(this.uploadsDir, id);
    if (!fs.existsSync(p)) return null;
    return { meta: JSON.parse(fs.readFileSync(`${p}.json`, 'utf8')), data: fs.readFileSync(p) };
  }

  async ping(): Promise<boolean> {
    if (!this.pool) return true;
    try { await this.pool.query('SELECT 1'); return true; } catch { return false; }
  }

  private scheduleFlush() {
    if (this.flushTimer) return;
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      this.flushNow();
    }, 150);
  }

  flushNow() {
    if (this.mode !== 'file' || !this.jsonPath) return;
    const out: Record<string, Doc[]> = {};
    for (const c of COLLECTIONS) out[c] = this.all(c);
    const tmp = `${this.jsonPath}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(out));
    fs.renameSync(tmp, this.jsonPath);
  }
}

export const db = new Store();

export const newId = (prefix: string, len = 8) =>
  `${prefix}-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 2 + len).toUpperCase()}`;

export const shortNumericId = (prefix: string, existing: (id: string) => boolean) => {
  for (let i = 0; i < 50; i++) {
    const id = `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
    if (!existing(id)) return id;
  }
  return newId(prefix);
};

export const nowStamp = (len = 16) => new Date().toISOString().replace('T', ' ').substring(0, len);
