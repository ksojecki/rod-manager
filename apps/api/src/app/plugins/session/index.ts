import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import cookie from '@fastify/cookie';
import './types';
import { registerRequireAuthenticatedSessionDecorator } from './requireAuthenticatedSession';
import { registerSessionMutation } from './mutateSession';
import { registerCheckingSession } from './checkSession';

export { SESSION_COOKIE_NAME } from './types';

/**
 * Registers cookie parsing plus session helpers for request and reply lifecycle.
 */
export default fp(function sessionPlugin(fastify: FastifyInstance) {
  fastify.register(cookie, {
    secret: 'secret',
  });

  registerCheckingSession(fastify);
  registerSessionMutation(fastify);
  registerRequireAuthenticatedSessionDecorator(fastify);
});
