import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { AuthStoreSession } from '../database';
import { SESSION_COOKIE_NAME } from './types';

/**
 * Registers request decorators used to read and cache the current authenticated session.
 */
export function registerCheckingSession(fastify: FastifyInstance): void {
  fastify.decorateRequest('authenticatedSession', undefined);

  fastify.decorateRequest('getSessionToken', function (): string | undefined {
    return this.cookies[SESSION_COOKIE_NAME];
  });

  fastify.decorateRequest('getSession', function ():
    | AuthStoreSession
    | undefined {
    return resolveSessionFromRequest(fastify, this);
  });

  fastify.decorateRequest('hasSession', function (): boolean {
    return this.getSession() !== undefined;
  });
}

function resolveSessionFromRequest(
  fastify: FastifyInstance,
  request: FastifyRequest,
): AuthStoreSession | undefined {
  if (request.authenticatedSession !== undefined) {
    return request.authenticatedSession;
  }

  const now = Date.now();

  fastify.authStore.deleteExpiredSessions(now);

  const token = request.getSessionToken();

  if (token === undefined) {
    return undefined;
  }

  const session = fastify.authStore.findSession(token);

  if (session === undefined || now > session.expiresAt) {
    fastify.authStore.deleteSession(token);
    return undefined;
  }

  request.authenticatedSession = session;
  return session;
}
