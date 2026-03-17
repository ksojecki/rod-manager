import {
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import Database from 'better-sqlite3';

export interface AuthStoreUser {
  id: string;
  email: string;
  displayName: string;
  passwordHash: string;
}

export interface AuthStoreSession {
  token: string;
  userId: string;
  expiresAt: number;
  userEmail: string;
  userDisplayName: string;
}

export interface AuthStore {
  findUserByEmail(email: string): AuthStoreUser | undefined;
  verifyPassword(password: string, passwordHash: string): boolean;
  createSession(userId: string): string;
  findSession(token: string): AuthStoreSession | undefined;
  deleteSession(token: string): void;
  deleteExpiredSessions(now: number): void;
}

interface UserRow {
  id: string;
  email: string;
  display_name: string;
  password_hash: string;
}

interface SessionRow {
  token: string;
  user_id: string;
  expires_at: number;
  email: string;
  display_name: string;
}

declare module 'fastify' {
  interface FastifyInstance {
    authStore: AuthStore;
  }
}

const SESSION_TTL_SECONDS = 60 * 60 * 8;

export function createSessionExpiration(now = Date.now()): number {
  return now + SESSION_TTL_SECONDS * 1000;
}

/**
 * Registers SQLite-backed store for authentication and session persistence.
 */
export default fp(function databasePlugin(fastify: FastifyInstance) {
  const db = new Database(getDatabasePath());

  initializeSchema(db);

  if (shouldSeedDemoUser()) {
    seedDemoUser(db);
  }

  fastify.decorate('authStore', createStore(db));

  fastify.addHook('onClose', async () => {
    db.close();
  });
});

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, 64).toString('hex');

  return `${salt}:${derived}`;
}

function verifyPassword(password: string, passwordHash: string): boolean {
  const [salt, expectedHex] = passwordHash.split(':') as [
    string | undefined,
    string | undefined,
  ];

  if (salt === undefined || expectedHex === undefined) {
    return false;
  }

  const expected = Buffer.from(expectedHex, 'hex');
  const actual = scryptSync(password, salt, expected.length);

  if (expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(expected, actual);
}

function getDatabasePath(): string {
  const configuredPath = process.env.AUTH_DB_PATH ?? 'tmp/auth.sqlite';

  if (configuredPath === ':memory:') {
    return configuredPath;
  }

  const resolvedPath = resolve(process.cwd(), configuredPath);
  mkdirSync(dirname(resolvedPath), { recursive: true });

  return resolvedPath;
}

function initializeSchema(db: Database.Database): void {
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
  `);
}

function seedDemoUser(db: Database.Database): void {
  const demoEmail = process.env.AUTH_DEMO_EMAIL ?? 'demo@rod-manager.local';
  const demoPassword = process.env.AUTH_DEMO_PASSWORD ?? 'demo1234';

  db.prepare(
    `INSERT INTO users (id, email, password_hash, display_name)
      VALUES (@id, @email, @password_hash, @display_name)
      ON CONFLICT(email) DO UPDATE SET
        password_hash = excluded.password_hash,
        display_name = excluded.display_name`,
  ).run({
    id: 'demo-user',
    email: demoEmail,
    password_hash: hashPassword(demoPassword),
    display_name: 'Demo User',
  });
}

function shouldSeedDemoUser(): boolean {
  return process.env.AUTH_SEED_DEMO_USER === 'true';
}

function createStore(db: Database.Database): AuthStore {
  const findUserByEmailStatement = db.prepare<[string], UserRow>(
    `SELECT id, email, display_name, password_hash FROM users WHERE email = ?`,
  );

  const createSessionStatement = db.prepare(
    `INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)`,
  );

  const findSessionStatement = db.prepare<[string], SessionRow>(
    `SELECT s.token, s.user_id, s.expires_at, u.email, u.display_name
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.token = ?`,
  );

  const deleteSessionStatement = db.prepare(
    `DELETE FROM sessions WHERE token = ?`,
  );

  const deleteExpiredSessionsStatement = db.prepare(
    `DELETE FROM sessions WHERE expires_at <= ?`,
  );

  return {
    findUserByEmail(email) {
      const row = findUserByEmailStatement.get(email);

      if (row === undefined) {
        return undefined;
      }

      return {
        id: row.id,
        email: row.email,
        displayName: row.display_name,
        passwordHash: row.password_hash,
      };
    },
    verifyPassword,
    createSession(userId) {
      const token = createSessionToken();
      createSessionStatement.run(token, userId, createSessionExpiration());
      return token;
    },
    findSession(token) {
      const row = findSessionStatement.get(token);

      if (row === undefined) {
        return undefined;
      }

      return {
        token: row.token,
        userId: row.user_id,
        expiresAt: row.expires_at,
        userEmail: row.email,
        userDisplayName: row.display_name,
      };
    },
    deleteSession(token) {
      deleteSessionStatement.run(token);
    },
    deleteExpiredSessions(now) {
      deleteExpiredSessionsStatement.run(now);
    },
  };
}

function createSessionToken(): string {
  return `${randomUUID()}-${randomBytes(16).toString('hex')}`;
}
