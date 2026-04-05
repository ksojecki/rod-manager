import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

const NOT_AUTHENTICATED_MESSAGE = 'Not authenticated.';

/**
 * Creates a pre-handler decorator that enforces an authenticated session.
 */
export function createRequireAuthenticatedSessionDecorator(
  _fastify: FastifyInstance,
) {
  return async function requireAuthenticatedSession(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const session = request.getSession();

    if (session === undefined) {
      reply.removeSession();
      await reply.status(401).send({ message: NOT_AUTHENTICATED_MESSAGE });
      return;
    }

    request.authenticatedSession = session;
  };
}
