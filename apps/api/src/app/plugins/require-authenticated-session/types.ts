import type { preHandlerAsyncHookHandler } from 'fastify';
import type { AuthStoreSession } from '../database';

export type RequireAuthenticatedSessionHook = preHandlerAsyncHookHandler;

declare module 'fastify' {
  interface FastifyInstance {
    requireAuthenticatedSession: RequireAuthenticatedSessionHook;
  }

  interface FastifyRequest {
    authenticatedSession: AuthStoreSession | undefined;
  }
}
