import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { AuthStoreSession } from '../database';
import { SESSION_COOKIE_NAME } from './types';

/**
 * Creates decorator implementation that reads session token from cookies.
 */
export function createGetSessionTokenDecorator() {
  return function getSessionToken(this: FastifyRequest): string | undefined {
    return this.cookies[SESSION_COOKIE_NAME];
  };
}

/**
 * Creates decorator implementation that resolves and caches the current session.
 */
export function createGetSessionDecorator(fastify: FastifyInstance) {
  return function getSession(
    this: FastifyRequest,
  ): AuthStoreSession | undefined {
    return resolveSessionFromRequest(fastify, this);
  };
}

/**
 * Creates decorator implementation that checks if an authenticated session exists.
 */
export function createHasSessionDecorator() {
  return function hasSession(this: FastifyRequest): boolean {
    return this.getSession() !== undefined;
  };
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
