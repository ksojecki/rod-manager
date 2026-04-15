import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import type {
  ServerPlatformAuthStore,
  ServerPlatformPlugin,
  ServerPlatformPluginContext,
  ServerPlatformSessionService,
} from './contracts/plugin.contract';
import type { AuthStore } from './plugins/database/types';

/** Creates a Fastify plugin that registers the given ServerPlatformPlugin list in order. */
export function createPluginRegistrar(plugins: ServerPlatformPlugin[]) {
  return fp(async function serverPluginRegistrar(fastify: FastifyInstance) {
    for (const plugin of plugins) {
      await fastify.register(
        fp(async function serverPlugin(instance: FastifyInstance) {
          const ctx: ServerPlatformPluginContext = {
            fastify: instance,
            services: {
              authStore: createAuthStoreAdapter(instance.authStore),
              sessionService: createSessionServiceAdapter(instance.authStore),
              db: instance.db,
              logger: instance.log,
            },
          };

          if (plugin.migrations) {
            for (const migration of plugin.migrations) {
              await migration.up(ctx);
            }
          }

          await plugin.register(ctx);
        }),
      );
    }
  });
}

function createSessionServiceAdapter(
  authStore: AuthStore,
): ServerPlatformSessionService {
  return {
    createSession(userId: string): string {
      return authStore.createSession(userId);
    },
    invalidateSession(token: string): void {
      authStore.deleteSession(token);
    },
    deleteExpiredSessions(now: number): void {
      authStore.deleteExpiredSessions(now);
    },
  };
}

function createAuthStoreAdapter(authStore: AuthStore): ServerPlatformAuthStore {
  return {
    findUserById(id: string) {
      const user = authStore.findUserById(id);
      if (user === undefined) return undefined;
      return {
        id: user.id,
        email: user.email,
        role: user.role,
        displayName: user.displayName,
      };
    },
    findSession(token: string) {
      const session = authStore.findSession(token);
      if (session === undefined) return undefined;
      return {
        token: session.token,
        userId: session.userId,
        expiresAt: session.expiresAt,
        userEmail: session.userEmail,
        userRole: session.userRole,
      };
    },
    createSession(userId: string): string {
      return authStore.createSession(userId);
    },
    deleteSession(token: string): void {
      authStore.deleteSession(token);
    },
  };
}
