import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import Database from 'better-sqlite3';
import {
  getDatabasePath,
  initializeSchema,
  ensureUserSettingsModel,
  ensureUserRoleColumn,
  ensureNameColumns,
  seedInitialUser,
  shouldSeedInitialUser,
  ensureAdministratorExists,
} from './init';
import { createStore } from './store';
import { createUserSettingsStore } from './userSettingsStore';

export type {
  AuthStore,
  AuthStoreUser,
  AuthStoreSession,
  OAuthProviderData,
  OAuthProviderType,
  UserSettingsStore,
} from './types';
export { createSessionExpiration } from './types';

/**
 * Registers SQLite-backed store for authentication and session persistence.
 */
export default fp(function databasePlugin(fastify: FastifyInstance) {
  const db = new Database(getDatabasePath());

  initializeSchema(db);
  ensureUserSettingsModel(db);
  ensureUserRoleColumn(db);
  ensureNameColumns(db);

  if (shouldSeedInitialUser()) {
    seedInitialUser(db);
  }

  ensureAdministratorExists(db);

  fastify.decorate('authStore', createStore(db));
  fastify.decorate('userSettingsStore', createUserSettingsStore(db));

  fastify.addHook('onClose', async () => {
    db.close();
  });
});
