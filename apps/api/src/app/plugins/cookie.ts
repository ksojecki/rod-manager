import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import cookie from '@fastify/cookie';

declare module 'fastify' {
  interface FastifyReply {
    setSessionCookie: (token: string) => void;
    clearSessionCookie: () => void;
    getSessionToken: () => string | undefined;
  }
}

export const SESSION_COOKIE_NAME = 'rod_manager_session';

const COOKIE_OPTIONS = {
  path: '/',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
} as const;

const SESSION_TTL_SECONDS = 60 * 60 * 8;

/**
 * Registers cookie parsing and serialization support for request and reply helpers.
 */
export default fp(function cookiePlugin(fastify: FastifyInstance) {
  fastify.register(cookie, {
    secret: 'secret',
  });

  fastify.decorateReply('setSessionCookie', function (token: string) {
    this.setCookie(SESSION_COOKIE_NAME, token, {
      ...COOKIE_OPTIONS,
      maxAge: SESSION_TTL_SECONDS,
    });
  });

  fastify.decorateReply('clearSessionCookie', function () {
    this.clearCookie(SESSION_COOKIE_NAME, COOKIE_OPTIONS);
  });

  fastify.decorateRequest('getSessionToken', function (): string | undefined {
    return this.cookies[SESSION_COOKIE_NAME];
  });
});
