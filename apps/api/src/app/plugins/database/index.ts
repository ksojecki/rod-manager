import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import Database from 'better-sqlite3';
import {
  getDatabasePath,
  initializeSchema,
  ensureUserSettingsModel,
  ensureUserRoleColumn,
  ensureNameColumns,
  ensurePageSlugValidationRules,
  ensureSeedPages,
  seedInitialUser,
  shouldSeedInitialUser,
  ensureAdministratorExists,
} from './init';
import { createStore } from './store';
import { createUserSettingsStore } from './userSettingsStore';
import { createPageStore } from './pageStore';

export type {
  AuthStore,
  AuthStoreUser,
  AuthStoreSession,
  OAuthProviderData,
  OAuthProviderType,
  UserSettingsStore,
  PageStore,
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
  ensurePageSlugValidationRules(db);
  ensureSeedPages(db);

  if (shouldSeedInitialUser()) {
    seedInitialUser(db);
  }

  ensureAdministratorExists(db);

  fastify.decorate('authStore', createStore(db));
  fastify.decorate('userSettingsStore', createUserSettingsStore(db));
  fastify.decorate('pageStore', createPageStore(db));

  fastify.addHook('onClose', async () => {
    db.close();
  });
});
