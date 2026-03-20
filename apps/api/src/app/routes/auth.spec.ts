import Fastify from 'fastify';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import databasePlugin from '../plugins/database';
import cookiePlugin from '../plugins/cookie';
import authRoutes from './auth';
import { SESSION_COOKIE_NAME } from '../plugins/cookie';

describe('auth routes', () => {
  beforeEach(() => {
    process.env.AUTH_DB_PATH = ':memory:';
    process.env.AUTH_SEED_INITIAL_USER = 'true';
    process.env.AUTH_INITIAL_USER_EMAIL = 'admin@rod-manager.local';
    process.env.AUTH_INITIAL_USER_PASSWORD = 'admin1234';
  });

  afterEach(() => {
    delete process.env.AUTH_DB_PATH;
    delete process.env.AUTH_SEED_INITIAL_USER;
    delete process.env.AUTH_INITIAL_USER_EMAIL;
    delete process.env.AUTH_INITIAL_USER_PASSWORD;
  });

  it('creates a session on successful login and returns it', async () => {
    const server = Fastify();
    await server.register(cookiePlugin);
    await server.register(databasePlugin);

    authRoutes(server);

    const loginResponse = await server.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'admin@rod-manager.local',
        password: 'admin1234',
      },
    });

    expect(loginResponse.statusCode).toBe(200);

    const sessionCookie = loginResponse.cookies.find(
      (cookie) => cookie.name === SESSION_COOKIE_NAME,
    );

    expect(sessionCookie).toBeDefined();

    const sessionResponse = await server.inject({
      method: 'GET',
      url: '/api/auth/session',
      cookies: {
        [SESSION_COOKIE_NAME]: sessionCookie?.value ?? '',
      },
    });

    expect(sessionResponse.statusCode).toBe(200);
    expect(sessionResponse.json()).toEqual({
      authenticated: true,
      user: {
        id: 'initial-admin-user',
        email: 'admin@rod-manager.local',
        displayName: 'Administrator',
        role: 'admin',
      },
    });

    await server.close();
  });

  it('returns unauthorized for wrong credentials', async () => {
    const server = Fastify();
    await server.register(cookiePlugin);
    await server.register(databasePlugin);

    authRoutes(server);

    const response = await server.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'admin@rod-manager.local',
        password: 'wrong-password',
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ message: 'Invalid email or password.' });

    await server.close();
  });
});
