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
import type { UserRole } from '@rod-manager/shared';

export type OAuthProviderType = 'google' | 'apple' | 'facebook';

export interface AuthStoreUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  passwordHash: string;
}

export interface OAuthProviderData {
  id: string;
  userId: string;
  provider: OAuthProviderType;
  providerUserId: string;
  accessToken: string;
  refreshToken: string | null;
  accessTokenExpiresAt: number;
  createdAt: number;
}

export interface AuthStoreSession {
  token: string;
  userId: string;
  expiresAt: number;
  userEmail: string;
  userDisplayName: string;
  userRole: UserRole;
}

export interface AuthStore {
  findUserById(id: string): AuthStoreUser | undefined;
  findUserByEmail(email: string): AuthStoreUser | undefined;
  findUserByOAuthProvider(
    provider: OAuthProviderType,
    providerUserId: string,
  ): AuthStoreUser | undefined;
  findOrCreateUserByOAuth(
    provider: OAuthProviderType,
    providerUserId: string,
    email: string,
    displayName: string,
  ): AuthStoreUser;
  linkOAuthProvider(
    userId: string,
    provider: OAuthProviderType,
    providerUserId: string,
    accessToken: string,
    refreshToken: string | null,
    accessTokenExpiresAt: number,
  ): void;
  unlinkOAuthProvider(userId: string, provider: OAuthProviderType): void;
  getOAuthProvider(
    userId: string,
    provider: OAuthProviderType,
  ): OAuthProviderData | undefined;
  updateOAuthToken(
    userId: string,
    provider: OAuthProviderType,
    accessToken: string,
    refreshToken: string | null,
    accessTokenExpiresAt: number,
  ): void;
  listLinkedOAuthProviders(userId: string): OAuthProviderType[];
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
  role: UserRole;
  password_hash: string;
}

interface SessionRow {
  token: string;
  user_id: string;
  expires_at: number;
  email: string;
  display_name: string;
  role: UserRole;
}

interface CountRow {
  count: number;
}

interface OAuthProviderListRow {
  provider: OAuthProviderType;
}

interface OAuthProviderRow {
  id: string;
  user_id: string;
  provider: OAuthProviderType;
  provider_user_id: string;
  access_token: string;
  refresh_token: string | null;
  access_token_expires_at: number;
  created_at: number;
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
  ensureUserRoleColumn(db);

  if (shouldSeedInitialUser()) {
    seedInitialUser(db);
  }

  ensureAdministratorExists(db);

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
      role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS oauth_providers (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      provider TEXT NOT NULL,
      provider_user_id TEXT NOT NULL,
      access_token TEXT NOT NULL,
      refresh_token TEXT,
      access_token_expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(provider, provider_user_id)
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
    CREATE INDEX IF NOT EXISTS idx_oauth_providers_user_id ON oauth_providers(user_id);
  `);
}

function ensureUserRoleColumn(db: Database.Database): void {
  const userColumns = db
    .prepare<[], { name: string }>(`PRAGMA table_info('users')`)
    .all();

  const hasRoleColumn = userColumns.some((column) => column.name === 'role');

  if (!hasRoleColumn) {
    db.exec(`ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'`);
  }

  db.prepare(
    `UPDATE users SET role = 'user' WHERE role NOT IN ('admin', 'user')`,
  ).run();
}

function seedInitialUser(db: Database.Database): void {
  const initialUserEmail =
    process.env.AUTH_INITIAL_USER_EMAIL ?? 'admin@rod-manager.local';
  const initialUserPassword =
    process.env.AUTH_INITIAL_USER_PASSWORD ?? 'admin1234';

  db.prepare(
    `INSERT INTO users (id, email, password_hash, display_name, role)
      VALUES (@id, @email, @password_hash, @display_name, @role)
      ON CONFLICT(email) DO UPDATE SET
        password_hash = excluded.password_hash,
        display_name = excluded.display_name,
        role = excluded.role`,
  ).run({
    id: 'initial-admin-user',
    email: initialUserEmail,
    password_hash: hashPassword(initialUserPassword),
    display_name: 'Administrator',
    role: 'admin' satisfies UserRole,
  });
}

function shouldSeedInitialUser(): boolean {
  return process.env.AUTH_SEED_INITIAL_USER === 'true';
}

function ensureAdministratorExists(db: Database.Database): void {
  const adminCount = db
    .prepare<
      [],
      CountRow
    >(`SELECT COUNT(*) AS count FROM users WHERE role = 'admin'`)
    .get();

  if ((adminCount?.count ?? 0) > 0) {
    return;
  }

  db.prepare(
    `UPDATE users
      SET role = 'admin'
      WHERE id = (
        SELECT id
        FROM users
        ORDER BY created_at ASC, rowid ASC
        LIMIT 1
      )`,
  ).run();
}

function getRoleForNewUser(db: Database.Database): UserRole {
  const userCount = db
    .prepare<[], CountRow>(`SELECT COUNT(*) AS count FROM users`)
    .get();

  return (userCount?.count ?? 0) === 0 ? 'admin' : 'user';
}

function createStore(db: Database.Database): AuthStore {
  const findUserByIdStatement = db.prepare<[string], UserRow>(
    `SELECT id, email, display_name, role, password_hash FROM users WHERE id = ?`,
  );

  const findUserByEmailStatement = db.prepare<[string], UserRow>(
    `SELECT id, email, display_name, role, password_hash FROM users WHERE email = ?`,
  );

  const findUserByOAuthProviderStatement = db.prepare<
    [string, string],
    UserRow
  >(
    `SELECT u.id, u.email, u.display_name, u.role, u.password_hash FROM users u
      JOIN oauth_providers o ON u.id = o.user_id
      WHERE o.provider = ? AND o.provider_user_id = ?`,
  );

  const createUserStatement = db.prepare(
    `INSERT INTO users (id, email, password_hash, display_name, role)
      VALUES (?, ?, ?, ?, ?)`,
  );

  const createOAuthProviderStatement = db.prepare(
    `INSERT INTO oauth_providers (id, user_id, provider, provider_user_id, access_token, refresh_token, access_token_expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
  );

  const getOAuthProviderStatement = db.prepare<
    [string, string],
    OAuthProviderRow
  >(
    `SELECT id, user_id, provider, provider_user_id, access_token, refresh_token, access_token_expires_at, created_at
      FROM oauth_providers
      WHERE user_id = ? AND provider = ?`,
  );

  const updateOAuthTokenStatement = db.prepare(
    `UPDATE oauth_providers SET access_token = ?, refresh_token = ?, access_token_expires_at = ?
      WHERE user_id = ? AND provider = ?`,
  );

  const updateLinkedOAuthProviderStatement = db.prepare(
    `UPDATE oauth_providers
      SET provider_user_id = ?, access_token = ?, refresh_token = ?, access_token_expires_at = ?
      WHERE user_id = ? AND provider = ?`,
  );

  const deleteOAuthProviderStatement = db.prepare(
    `DELETE FROM oauth_providers WHERE user_id = ? AND provider = ?`,
  );

  const listLinkedOAuthProvidersStatement = db.prepare<
    [string],
    OAuthProviderListRow
  >(
    `SELECT provider FROM oauth_providers WHERE user_id = ? ORDER BY provider ASC`,
  );

  const createSessionStatement = db.prepare(
    `INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)`,
  );

  const findSessionStatement = db.prepare<[string], SessionRow>(
    `SELECT s.token, s.user_id, s.expires_at, u.email, u.display_name, u.role
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
    findUserById(id) {
      const row = findUserByIdStatement.get(id);

      if (row === undefined) {
        return undefined;
      }

      return {
        id: row.id,
        email: row.email,
        displayName: row.display_name,
        role: row.role,
        passwordHash: row.password_hash,
      };
    },
    findUserByEmail(email) {
      const row = findUserByEmailStatement.get(email);

      if (row === undefined) {
        return undefined;
      }

      return {
        id: row.id,
        email: row.email,
        displayName: row.display_name,
        role: row.role,
        passwordHash: row.password_hash,
      };
    },
    findUserByOAuthProvider(provider, providerUserId) {
      const row = findUserByOAuthProviderStatement.get(
        provider,
        providerUserId,
      );

      if (row === undefined) {
        return undefined;
      }

      return {
        id: row.id,
        email: row.email,
        displayName: row.display_name,
        role: row.role,
        passwordHash: row.password_hash,
      };
    },
    findOrCreateUserByOAuth(provider, providerUserId, email, displayName) {
      // Check if OAuth provider is already linked
      const oauthUser = this.findUserByOAuthProvider(provider, providerUserId);
      if (oauthUser !== undefined) {
        return oauthUser;
      }

      // Check if user with this email exists
      const existingUser = this.findUserByEmail(email);
      const userId = existingUser?.id ?? randomUUID();

      if (existingUser === undefined) {
        // Create new user with random password (OAuth user doesn't have password)
        const randomPassword = randomBytes(32).toString('hex');
        const role = getRoleForNewUser(db);
        createUserStatement.run(
          userId,
          email,
          hashPassword(randomPassword),
          displayName,
          role,
        );

        this.linkOAuthProvider(userId, provider, providerUserId, '', null, 0);

        return {
          id: userId,
          email,
          displayName,
          role,
          passwordHash: '',
        };
      }

      // Link OAuth provider
      this.linkOAuthProvider(userId, provider, providerUserId, '', null, 0);

      return {
        id: userId,
        email,
        displayName,
        role: existingUser.role,
        passwordHash: '',
      };
    },
    linkOAuthProvider(
      userId,
      provider,
      providerUserId,
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
    ) {
      const existingProvider = getOAuthProviderStatement.get(userId, provider);

      if (existingProvider !== undefined) {
        updateLinkedOAuthProviderStatement.run(
          providerUserId,
          accessToken,
          refreshToken,
          accessTokenExpiresAt,
          userId,
          provider,
        );
        return;
      }

      const id = randomUUID();
      createOAuthProviderStatement.run(
        id,
        userId,
        provider,
        providerUserId,
        accessToken,
        refreshToken,
        accessTokenExpiresAt,
      );
    },
    unlinkOAuthProvider(userId, provider) {
      deleteOAuthProviderStatement.run(userId, provider);
    },
    getOAuthProvider(userId, provider) {
      const row = getOAuthProviderStatement.get(userId, provider);

      if (row === undefined) {
        return undefined;
      }

      return {
        id: row.id,
        userId: row.user_id,
        provider: row.provider,
        providerUserId: row.provider_user_id,
        accessToken: row.access_token,
        refreshToken: row.refresh_token,
        accessTokenExpiresAt: row.access_token_expires_at,
        createdAt: row.created_at,
      };
    },
    updateOAuthToken(
      userId,
      provider,
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
    ) {
      updateOAuthTokenStatement.run(
        accessToken,
        refreshToken,
        accessTokenExpiresAt,
        userId,
        provider,
      );
    },
    listLinkedOAuthProviders(userId) {
      return listLinkedOAuthProvidersStatement
        .all(userId)
        .map((row) => row.provider);
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
        userRole: row.role,
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
