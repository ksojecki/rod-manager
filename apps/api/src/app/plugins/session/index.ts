import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import cookie from '@fastify/cookie';
import './types';
import {
  createGetSessionDecorator,
  createGetSessionTokenDecorator,
  createHasSessionDecorator,
} from './checkSession';
import {
  createRemoveSessionDecorator,
  createStartSessionDecorator,
} from './mutateSession';
import { createRequireAuthenticatedSessionDecorator } from './requireAuthenticatedSession';

export { SESSION_COOKIE_NAME } from './types';

/**
 * Registers cookie parsing plus session helpers for request and reply lifecycle.
 */
export default fp(function sessionPlugin(fastify: FastifyInstance) {
  fastify.register(cookie, {
    secret: 'secret',
  });

  const decorators = createSessionDecorators(fastify);

  fastify.decorateRequest('authenticatedSession', undefined);
  fastify.decorateRequest('getSessionToken', decorators.getSessionToken);
  fastify.decorateRequest('getSession', decorators.getSession);
  fastify.decorateRequest('hasSession', decorators.hasSession);

  fastify.decorateReply('startSession', decorators.startSession);
  fastify.decorateReply('removeSession', decorators.removeSession);

  fastify.decorate(
    'requireAuthenticatedSession',
    decorators.requireAuthenticatedSession,
  );
});

function createSessionDecorators(fastify: FastifyInstance) {
  return {
    getSessionToken: createGetSessionTokenDecorator(),
    getSession: createGetSessionDecorator(fastify),
    hasSession: createHasSessionDecorator(),
    startSession: createStartSessionDecorator(fastify),
    removeSession: createRemoveSessionDecorator(fastify),
    requireAuthenticatedSession:
      createRequireAuthenticatedSessionDecorator(fastify),
  };
}
