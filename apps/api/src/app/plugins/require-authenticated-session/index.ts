import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

const NOT_AUTHENTICATED_MESSAGE = 'Not authenticated.';

/**
 * Registers a pre-handler that resolves the authenticated session for protected routes.
 */
export default fp(
  function requireAuthenticatedSessionPlugin(fastify: FastifyInstance) {
    fastify.decorateRequest('authenticatedSession', undefined);

    fastify.decorate(
      'requireAuthenticatedSession',
      async function requireAuthenticatedSession(
        request: FastifyRequest,
        reply: FastifyReply,
      ): Promise<void> {
        request.authenticatedSession = undefined;

        const now = Date.now();

        fastify.authStore.deleteExpiredSessions(now);

        const token = request.getSessionToken();

        if (token === undefined) {
          await sendNotAuthenticated(reply);
          return;
        }

        const session = fastify.authStore.findSession(token);

        if (session === undefined || now > session.expiresAt) {
          fastify.authStore.deleteSession(token);
          await sendNotAuthenticated(reply);
          return;
        }

        request.authenticatedSession = session;
      },
    );
  },
  {
    name: 'requireAuthenticatedSessionPlugin',
  },
);

async function sendNotAuthenticated(reply: FastifyReply): Promise<void> {
  await reply.status(401).send({ message: NOT_AUTHENTICATED_MESSAGE });
}
