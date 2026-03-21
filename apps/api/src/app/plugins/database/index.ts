import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import Database from 'better-sqlite3';
import {
  getDatabasePath,
  initializeSchema,
  ensureUserRoleColumn,
  seedInitialUser,
  shouldSeedInitialUser,
  ensureAdministratorExists,
} from './init';
import { createStore } from './store';

export type {
  AuthStore,
  AuthStoreUser,
  AuthStoreSession,
  OAuthProviderData,
  OAuthProviderType,
} from './types';
export { createSessionExpiration } from './types';

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
