import type { FastifyInstance, FastifyRequest } from 'fastify';
import { SESSION_COOKIE_NAME } from '../plugins/cookie';

interface UpdateUserLanguageRequestBody {
  language: 'en' | 'pl';
}

export default function userSettingsRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: UpdateUserLanguageRequestBody }>(
    '/api/user-settings/language',
    async (
      request: FastifyRequest<{ Body: UpdateUserLanguageRequestBody }>,
      reply,
    ) => {
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

      const { language } = request.body;

      fastify.userSettingsStore.updateUserPreferredLanguage(
        session.userId,
        language,
      );

      await reply.status(204).send();
    },
  );
}
