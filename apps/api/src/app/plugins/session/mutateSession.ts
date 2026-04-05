import type { FastifyInstance } from 'fastify';
import { SESSION_COOKIE_NAME } from './types';

export const COOKIE_OPTIONS = {
  path: '/',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
} as const;

export const COOKIE_MAX_AGE = 60 * 60 * 8;

/**
 * Registers reply decorators used to start and remove application sessions.
 */
export function registerSessionMutation(fastify: FastifyInstance): void {
  fastify.decorateReply('startSession', function (userId: string) {
    this.removeSession();

    const token = fastify.authStore.createSession(userId);

    this.setCookie(SESSION_COOKIE_NAME, token, {
      ...COOKIE_OPTIONS,
      maxAge: COOKIE_MAX_AGE,
    });

    this.request.authenticatedSession = fastify.authStore.findSession(token);
  });

  fastify.decorateReply('removeSession', function () {
    const token = this.request.getSessionToken();

    if (token !== undefined) {
      fastify.authStore.deleteSession(token);
    }

    this.request.authenticatedSession = undefined;
    this.clearCookie(SESSION_COOKIE_NAME, COOKIE_OPTIONS);
  });
}
