import Fastify from 'fastify';
import { describe, expect, it } from 'vitest';
import rootRoutes from './root';

describe('root route', () => {
  it('returns hello message on /api', async () => {
    const server = Fastify();

    rootRoutes(server);

    const response = await server.inject({
      method: 'GET',
      url: '/api',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ message: 'Hello API' });

    await server.close();
  });
});
