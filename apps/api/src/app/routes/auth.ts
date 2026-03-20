import type { FastifyInstance } from 'fastify';
import type {
  AuthUser,
  LoginRequestBody,
  SessionResponse,
} from '@rod-manager/shared';
import { SESSION_COOKIE_NAME } from '../plugins/cookie';

export default function authRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: LoginRequestBody }>(
    '/api/auth/login',
    async (request, reply) => {
      const { email, password } = request.body;
      const user = fastify.authStore.findUserByEmail(email);

      if (
        user === undefined ||
        !fastify.authStore.verifyPassword(password, user.passwordHash)
      ) {
        await reply.status(401).send({ message: 'Invalid email or password.' });
        return;
      }

      const token = fastify.authStore.createSession(user.id);
      reply.setSessionCookie(token);
      const sessionResponse: SessionResponse = {
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
        },
      };

      await reply.send(sessionResponse);
    },
  );

  fastify.get('/api/auth/session', async (request, reply) => {
    fastify.authStore.deleteExpiredSessions(Date.now());
    const token = request.cookies[SESSION_COOKIE_NAME];

    if (token === undefined) {
      await reply.status(401).send({ message: 'Not authenticated.' });
      return;
    }

    const session = fastify.authStore.findSession(token);

    if (session === undefined || Date.now() > session.expiresAt) {
      fastify.authStore.deleteSession(token);
      await reply.status(401).send({ message: 'Not authenticated.' });
      return;
    }

    const user: AuthUser = {
      id: session.userId,
      email: session.userEmail,
      displayName: session.userDisplayName,
      role: session.userRole,
    };

    const sessionResponse: SessionResponse = {
      authenticated: true,
      user,
    };

    await reply.send(sessionResponse);
  });

  fastify.post('/api/auth/logout', async (request, reply) => {
    const token = request.cookies[SESSION_COOKIE_NAME];

    if (token !== undefined) {
      fastify.authStore.deleteSession(token);
    }

    reply.clearSessionCookie();
    await reply.status(204).send();
  });
}
