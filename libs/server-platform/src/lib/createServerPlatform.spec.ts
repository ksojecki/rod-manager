import type { FastifyInstance } from 'fastify';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ServerPlatformProjectConfig } from './contracts/bootstrap.contract';
import type { ServerPlatformSsrOptions } from './routes/ssr';

const mocks = vi.hoisted(() => ({
  authRoutes: Symbol('authRoutes'),
  createPluginRegistrar: vi.fn<
    (plugins: unknown[]) => { kind: string; plugins: unknown[] }
  >((plugins: unknown[]) => ({
    kind: 'plugin-registrar',
    plugins,
  })),
  databasePlugin: Symbol('databasePlugin'),
  oauthPlugin: Symbol('oauthPlugin'),
  oauthRoutes: Symbol('oauthRoutes'),
  rootRoute: Symbol('rootRoute'),
  sensiblePlugin: Symbol('sensiblePlugin'),
  sessionPlugin: Symbol('sessionPlugin'),
  ssrRoute: Symbol('ssrRoute'),
  userSettingsRoutes: Symbol('userSettingsRoutes'),
}));

vi.mock('./plugins/database', () => ({ default: mocks.databasePlugin }));
vi.mock('./plugins/oauth', () => ({ default: mocks.oauthPlugin }));
vi.mock('./plugins/sensible', () => ({ default: mocks.sensiblePlugin }));
vi.mock('./plugins/session', () => ({ default: mocks.sessionPlugin }));
vi.mock('./routes/auth', () => ({ default: mocks.authRoutes }));
vi.mock('./routes/oauth', () => ({ default: mocks.oauthRoutes }));
vi.mock('./routes/root', () => ({ default: mocks.rootRoute }));
vi.mock('./routes/ssr', () => ({ default: mocks.ssrRoute }));
vi.mock('./routes/user-settings', () => ({
  default: mocks.userSettingsRoutes,
}));
vi.mock('./serverPluginRegistry', () => ({
  createPluginRegistrar: mocks.createPluginRegistrar,
}));

import { createServerPlatform } from './createServerPlatform';

const testProjectConfig: ServerPlatformProjectConfig = {
  projectId: 'test-project',
  database: {
    path: ':memory:',
    seedInitialUser: false,
  },
};

describe('createServerPlatform', () => {
  beforeEach(() => {
    mocks.createPluginRegistrar.mockClear();
  });

  it('throws an actionable error when project config is missing', async () => {
    const register = vi.fn<(plugin: unknown, options?: unknown) => void>();
    const fastify = { register } as unknown as FastifyInstance;

    await expect(
      createServerPlatform(fastify, {} as never),
    ).rejects.toThrowError(
      'createServerPlatform requires opts.project with database.path and database.seedInitialUser.',
    );
    expect(register).not.toHaveBeenCalled();
  });

  it('throws the same actionable error when options are undefined', async () => {
    const register = vi.fn<(plugin: unknown, options?: unknown) => void>();
    const fastify = { register } as unknown as FastifyInstance;

    await expect(createServerPlatform(fastify, undefined)).rejects.toThrowError(
      'createServerPlatform requires opts.project with database.path and database.seedInitialUser.',
    );
    expect(register).not.toHaveBeenCalled();
  });

  it('skips SSR route registration when SSR options are not provided', async () => {
    const register = vi.fn<(plugin: unknown, options?: unknown) => void>();
    const fastify = { register } as unknown as FastifyInstance;

    await createServerPlatform(fastify, { project: testProjectConfig });

    expect(register).toHaveBeenCalledWith(mocks.databasePlugin, {
      project: testProjectConfig,
    });
    expect(register).not.toHaveBeenCalledWith(mocks.ssrRoute);
  });

  it('registers the SSR route with explicit product configuration', async () => {
    const register = vi.fn<(plugin: unknown, options?: unknown) => void>();
    const fastify = { register } as unknown as FastifyInstance;
    const ssr: ServerPlatformSsrOptions = {
      webRoot: 'apps/storefront',
      production: {
        clientRoot: 'dist/apps/storefront/client',
        serverEntryPath: 'dist/apps/storefront/server/entry-server.mjs',
      },
    };

    await createServerPlatform(fastify, {
      project: {
        ...testProjectConfig,
        ssr,
      },
    });

    expect(register).toHaveBeenCalledWith(mocks.ssrRoute, ssr);
  });
});
