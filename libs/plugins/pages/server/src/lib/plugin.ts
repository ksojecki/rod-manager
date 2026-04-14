import type { ServerPlatformPlugin } from '@rod-manager/server-platform';
import { createPageStore } from './store.js';
import { registerPagesRoutes } from './routes.js';
import {
  pagesSchemaMigration,
  pagesValidationRulesMigration,
  pagesSeedMigration,
} from './migrations.js';

/** Creates the pages server plugin descriptor for use with createServerPlatform. */
export function pagesServerPlugin(): ServerPlatformPlugin {
  return {
    meta: {
      id: 'pages',
      version: '0.0.1',
      description: 'Content pages feature plugin',
    },
    migrations: [
      pagesSchemaMigration,
      pagesValidationRulesMigration,
      pagesSeedMigration,
    ],
    register(ctx) {
      const pageStore = createPageStore(ctx.services.db);
      registerPagesRoutes(ctx.fastify, pageStore);
    },
  };
}
