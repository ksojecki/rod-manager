import type { FastifyInstance } from 'fastify';

export default function (fastify: FastifyInstance) {
  fastify.get('/api', function () {
    return { message: 'Hello API' };
  });
}
