import type { FastifyInstance } from 'fastify';
import type { ServerPlatformPlugin } from './contracts/plugin.contract.js';
import { createPluginRegistrar } from './serverPluginRegistry.js';
import databasePlugin from './plugins/database/index.js';
import sessionPlugin from './plugins/session/index.js';
import oauthPlugin from './plugins/oauth/index.js';
import sensiblePlugin from './plugins/sensible.js';
import authRoutes from './routes/auth.js';
import oauthRoutes from './routes/oauth.js';
import rootRoute from './routes/root.js';
import ssrRoute from './routes/ssr.js';
import userSettingsRoutes from './routes/user-settings.js';

export interface ServerPlatformOptions {
  logLevel?: string;
  plugins?: ServerPlatformPlugin[];
}

/** Registers all core plugins and routes on the given Fastify instance. */
export async function createServerPlatform(
  fastify: FastifyInstance,
  opts: ServerPlatformOptions = {},
): Promise<void> {
  // Core plugins
  await fastify.register(sensiblePlugin);
  await fastify.register(databasePlugin);
  await fastify.register(sessionPlugin);
  await fastify.register(oauthPlugin);

  // Core routes
  fastify.register(authRoutes);
  fastify.register(oauthRoutes);
  fastify.register(rootRoute);
  fastify.register(userSettingsRoutes);
  fastify.register(ssrRoute);

  // Feature plugins
  if (opts.plugins && opts.plugins.length > 0) {
    fastify.register(createPluginRegistrar(opts.plugins));
  }
}
