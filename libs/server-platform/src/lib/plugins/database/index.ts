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
} from './init.js';
import { createStore } from './store.js';
import { createUserSettingsStore } from './userSettingsStore.js';
import { createPageStore } from './pageStore.js';
import type { ServerPlatformDbClient } from '../../contracts/plugin.contract.js';

export type {
  AuthStore,
  AuthStoreUser,
  AuthStoreSession,
  OAuthProviderData,
  OAuthProviderType,
  UserSettingsStore,
  PageStore,
} from './types.js';
export { createSessionExpiration } from './types.js';

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
  fastify.decorate('db', db as unknown as ServerPlatformDbClient);

  fastify.addHook('onClose', async () => {
    db.close();
  });
});
