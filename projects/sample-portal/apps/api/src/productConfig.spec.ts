import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('samplePortalProjectConfig', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('uses the default database path and disables seeding when the env is unset', async () => {
    vi.unstubAllEnvs();
    vi.resetModules();

    const { samplePortalProjectConfig } = await import('./productConfig');

    expect(samplePortalProjectConfig.database.path).toBe(
      'tmp/sample-portal/auth.sqlite',
    );
    expect(samplePortalProjectConfig.database.seedInitialUser).toBe(false);
  });

  it("parses the seed flag when the env is set to 'true'", async () => {
    vi.stubEnv('SAMPLE_PORTAL_AUTH_SEED_INITIAL_USER', 'true');
    vi.resetModules();

    const { samplePortalProjectConfig } = await import('./productConfig');

    expect(samplePortalProjectConfig.database.seedInitialUser).toBe(true);
  });

  it('resolves SSR production paths to sample-portal build outputs', async () => {
    const { samplePortalProjectConfig } = await import('./productConfig');
    expect(samplePortalProjectConfig.ssr).toBeDefined();
    const ssr = samplePortalProjectConfig.ssr!;

    expect(ssr.webRoot).toBe(
      path.resolve(process.cwd(), 'projects/sample-portal/apps/web'),
    );
    expect(ssr.production.clientRoot).toBe(
      path.resolve(
        process.cwd(),
        'dist/projects/sample-portal/apps/web/client',
      ),
    );
    expect(ssr.production.serverEntryPath).toBe(
      path.resolve(
        process.cwd(),
        'dist/projects/sample-portal/apps/web/server/entry-server.mjs',
      ),
    );
  });
});
