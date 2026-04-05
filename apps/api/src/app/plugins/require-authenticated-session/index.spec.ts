import Fastify from 'fastify';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import cookiePlugin, { SESSION_COOKIE_NAME } from '../cookie';
import databasePlugin from '../database';
import requireAuthenticatedSessionPlugin from './index';

describe('require authenticated session plugin', () => {
  beforeEach(() => {
    process.env.AUTH_DB_PATH = ':memory:';
    process.env.AUTH_SEED_INITIAL_USER = 'true';
    process.env.AUTH_INITIAL_USER_EMAIL = 'admin@rod-manager.local';
    process.env.AUTH_INITIAL_USER_PASSWORD = 'admin1234';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.AUTH_DB_PATH;
    delete process.env.AUTH_SEED_INITIAL_USER;
    delete process.env.AUTH_INITIAL_USER_EMAIL;
    delete process.env.AUTH_INITIAL_USER_PASSWORD;
  });

  it('returns unauthorized when the session cookie is missing', async () => {
    const server = Fastify();
    await server.register(cookiePlugin);
    await server.register(databasePlugin);
    await server.register(requireAuthenticatedSessionPlugin);

    server.get(
      '/protected',
      {
        preHandler: server.requireAuthenticatedSession,
      },
      async (request, reply) => {
        await reply.send({ userId: request.authenticatedSession?.userId });
      },
    );

    const response = await server.inject({
      method: 'GET',
      url: '/protected',
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ message: 'Not authenticated.' });

    await server.close();
  });

  it('reads the session token through request.getSessionToken()', async () => {
    const server = Fastify();
    await server.register(cookiePlugin);
    await server.register(databasePlugin);
    await server.register(requireAuthenticatedSessionPlugin);

    server.get('/token', async (request, reply) => {
      await reply.send({ token: request.getSessionToken() });
    });

    const response = await server.inject({
      method: 'GET',
      url: '/token',
      cookies: {
        [SESSION_COOKIE_NAME]: 'session-token-value',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ token: 'session-token-value' });

    await server.close();
  });

  it('attaches the authenticated session to the request', async () => {
    const server = Fastify();
    await server.register(cookiePlugin);
    await server.register(databasePlugin);
    await server.register(requireAuthenticatedSessionPlugin);

    server.get(
      '/protected',
      {
        preHandler: server.requireAuthenticatedSession,
      },
      async (request, reply) => {
        await reply.send({ userId: request.authenticatedSession?.userId });
      },
    );

    const token = server.authStore.createSession('initial-admin-user');
    const response = await server.inject({
      method: 'GET',
      url: '/protected',
      cookies: {
        [SESSION_COOKIE_NAME]: token,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ userId: 'initial-admin-user' });

    await server.close();
  });

  it('deletes expired sessions and returns unauthorized', async () => {
    const server = Fastify();
    await server.register(cookiePlugin);
    await server.register(databasePlugin);
    await server.register(requireAuthenticatedSessionPlugin);

    server.get(
      '/protected',
      {
        preHandler: server.requireAuthenticatedSession,
      },
      async (request, reply) => {
        await reply.send({ userId: request.authenticatedSession?.userId });
      },
    );

    const token = server.authStore.createSession('initial-admin-user');
    const session = server.authStore.findSession(token);

    if (session === undefined) {
      throw new Error('Expected a session to be created for the test.');
    }

    vi.spyOn(Date, 'now').mockReturnValue(session.expiresAt + 1);

    const response = await server.inject({
      method: 'GET',
      url: '/protected',
      cookies: {
        [SESSION_COOKIE_NAME]: token,
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ message: 'Not authenticated.' });
    expect(server.authStore.findSession(token)).toBeUndefined();

    await server.close();
  });
});
