import type { FastifyInstance, FastifyReply } from 'fastify';
import { SESSION_COOKIE_NAME } from './types';

export const COOKIE_OPTIONS = {
  path: '/',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
} as const;

export const COOKIE_MAX_AGE = 60 * 60 * 8;

/**
 * Creates decorator implementation that starts a new authenticated session.
 */
export function createStartSessionDecorator(fastify: FastifyInstance) {
  return function startSession(this: FastifyReply, userId: string): void {
    this.removeSession();

    const token = fastify.authStore.createSession(userId);

    this.setCookie(SESSION_COOKIE_NAME, token, {
      ...COOKIE_OPTIONS,
      maxAge: COOKIE_MAX_AGE,
    });

    this.request.authenticatedSession = fastify.authStore.findSession(token);
  };
}

/**
 * Creates decorator implementation that removes active authenticated session.
 */
export function createRemoveSessionDecorator(fastify: FastifyInstance) {
  return function removeSession(this: FastifyReply): void {
    const token = this.request.getSessionToken();

    if (token !== undefined) {
      fastify.authStore.deleteSession(token);
    }

    this.request.authenticatedSession = undefined;
    this.clearCookie(SESSION_COOKIE_NAME, COOKIE_OPTIONS);
  };
}
