import Fastify from 'fastify';
import { describe, expect, it } from 'vitest';
import authRoutes from './auth';

describe('auth routes', () => {
  it('creates a session on successful login and returns it', async () => {
    const server = Fastify();

    authRoutes(server);

    const loginResponse = await server.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'demo@rod-manager.local',
        password: 'demo1234',
      },
    });

    expect(loginResponse.statusCode).toBe(200);

    const sessionCookie = loginResponse.cookies.find(
      (cookie) => cookie.name === 'rod_manager_session',
    );

    expect(sessionCookie).toBeDefined();

    const sessionResponse = await server.inject({
      method: 'GET',
      url: '/api/auth/session',
      cookies: {
        rod_manager_session: sessionCookie?.value ?? '',
      },
    });

    expect(sessionResponse.statusCode).toBe(200);
    expect(sessionResponse.json()).toEqual({
      authenticated: true,
      user: {
        id: 'demo-user',
        email: 'demo@rod-manager.local',
        displayName: 'Demo User',
      },
    });

    await server.close();
  });

  it('returns unauthorized for wrong credentials', async () => {
    const server = Fastify();

    authRoutes(server);

    const response = await server.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'demo@rod-manager.local',
        password: 'wrong-password',
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ message: 'Invalid email or password.' });

    await server.close();
  });
});
