import type { FastifyReply, FastifyRequest } from 'fastify';
import { SESSION_COOKIE_NAME } from './types';
import type { AuthStore, AuthStoreSession } from '../database/index';
import { resolveSessionFromRequest } from './checkSession';

export const COOKIE_OPTIONS = {
  path: '/',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
} as const;

export const COOKIE_MAX_AGE = 60 * 60 * 8;

/**
 * Reads the session token from request cookies.
 */
export function getSessionToken(this: FastifyRequest): string | undefined {
  return this.cookies[SESSION_COOKIE_NAME];
}

/**
 * Creates a request-bound function that resolves and caches the current session.
 */
export function createGetSessionDecorator(getAuthStore: () => AuthStore) {
  return function getSession(
    this: FastifyRequest,
  ): AuthStoreSession | undefined {
    return resolveSessionFromRequest(getAuthStore(), this);
  };
}

/**
 * Checks whether an authenticated session exists for the current request.
 */
export function hasSession(this: FastifyRequest): boolean {
  return this.getSession() !== undefined;
}

/**
 * Creates a reply-bound function that starts a new authenticated session.
 */
export function createStartSessionDecorator(getAuthStore: () => AuthStore) {
  return function startSession(this: FastifyReply, userId: string): void {
    const authStore = getAuthStore();

    this.removeSession();

    const token = authStore.createSession(userId);

    this.setCookie(SESSION_COOKIE_NAME, token, {
      ...COOKIE_OPTIONS,
      maxAge: COOKIE_MAX_AGE,
    });

    this.request.authenticatedSession = authStore.findSession(token);
  };
}

/**
 * Creates a reply-bound function that removes the active authenticated session.
 */
export function createRemoveSessionDecorator(getAuthStore: () => AuthStore) {
  return function removeSession(this: FastifyReply): void {
    const authStore = getAuthStore();

    const token = this.request.getSessionToken();

    if (token !== undefined) {
      authStore.deleteSession(token);
    }

    this.request.authenticatedSession = undefined;
    this.clearCookie(SESSION_COOKIE_NAME, COOKIE_OPTIONS);
  };
}
