import Fastify from 'fastify';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import sessionPlugin, { SESSION_COOKIE_NAME } from '../plugins/session';
import databasePlugin from '../plugins/database';
import authRoutes from './auth';
import pagesRoutes from './pages';

describe('pages routes', () => {
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

  it('lists pages for authenticated users', async () => {
    const server = Fastify();
    await server.register(sessionPlugin);
    await server.register(databasePlugin);

    authRoutes(server);
    pagesRoutes(server);

    const loginResponse = await server.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'admin@rod-manager.local',
        password: 'admin1234',
      },
    });

    const sessionCookie = loginResponse.cookies.find(
      (cookie) => cookie.name === SESSION_COOKIE_NAME,
    );

    const pagesResponse = await server.inject({
      method: 'GET',
      url: '/api/pages',
      cookies: {
        [SESSION_COOKIE_NAME]: sessionCookie?.value ?? '',
      },
    });

    expect(pagesResponse.statusCode).toBe(200);
    expect(pagesResponse.json()).toEqual({
      pages: [{ slug: 'about' }, { slug: 'home' }, { slug: 'rules' }],
    });

    await server.close();
  });

  it('returns page content by slug', async () => {
    const server = Fastify();
    await server.register(sessionPlugin);
    await server.register(databasePlugin);

    pagesRoutes(server);

    const response = await server.inject({
      method: 'GET',
      url: '/api/pages/about',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      page: {
        slug: 'about',
        contentMd:
          '# About\n\nThis page is stored in the database as Markdown content.',
      },
    });

    await server.close();
  });

  it('returns not found for missing page slug', async () => {
    const server = Fastify();
    await server.register(sessionPlugin);
    await server.register(databasePlugin);

    pagesRoutes(server);

    const response = await server.inject({
      method: 'GET',
      url: '/api/pages/missing-page',
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ message: 'Page not found.' });

    await server.close();
  });
});
