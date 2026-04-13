import type { FastifyInstance } from 'fastify';
import type {
  ContentPageListResponseBody,
  ContentPageResponseBody,
} from '@rod-manager/shared';

export default function pagesRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/api/pages',
    {
      preHandler: fastify.requireAuthenticatedSession,
    },
    async (request, reply) => {
      if (request.authenticatedSession === undefined) {
        return;
      }

      const response: ContentPageListResponseBody = {
        pages: fastify.pageStore.listPages(),
      };

      await reply.send(response);
    },
  );

  fastify.get<{ Params: { slug: string } }>(
    '/api/pages/:slug',
    async (request, reply) => {
      const page = fastify.pageStore.findPageBySlug(request.params.slug);

      if (page === undefined) {
        await reply.status(404).send({ message: 'Page not found.' });
        return;
      }

      const response: ContentPageResponseBody = {
        page,
      };

      await reply.send(response);
    },
  );
}
