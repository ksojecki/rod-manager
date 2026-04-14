import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import cookie from '@fastify/cookie';
import './types.js';
import {
  createGetSessionDecorator,
  getSessionToken,
  hasSession,
} from './checkSession.js';
import {
  createRemoveSessionDecorator,
  createStartSessionDecorator,
} from './mutateSession.js';
import { requireAuthenticatedSession } from './requireAuthenticatedSession.js';

export { SESSION_COOKIE_NAME } from './types.js';

/**
 * Registers cookie parsing plus session helpers for request and reply lifecycle.
 */
export default fp(function sessionPlugin(fastify: FastifyInstance) {
  const sessionCookieSecret =
    process.env.SESSION_COOKIE_SECRET?.trim() || 'secret';
  const getAuthStore = () => fastify.authStore;

  fastify.register(cookie, {
    secret: sessionCookieSecret,
  });

  fastify.decorateRequest('authenticatedSession', undefined);
  fastify.decorateRequest('getSessionToken', getSessionToken);

  fastify.decorateRequest('hasSession', hasSession);
  fastify.decorateRequest(
    'getSession',
    createGetSessionDecorator(getAuthStore),
  );
  fastify.decorateReply(
    'startSession',
    createStartSessionDecorator(getAuthStore),
  );
  fastify.decorateReply(
    'removeSession',
    createRemoveSessionDecorator(getAuthStore),
  );

  fastify.decorate('requireAuthenticatedSession', requireAuthenticatedSession);
});
