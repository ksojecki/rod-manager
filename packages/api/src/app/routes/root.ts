import type { FastifyInstance } from 'fastify';

export default function (fastify: FastifyInstance) {
  fastify.get('/', function () {
    return { message: 'Hello API' };
  });
}
