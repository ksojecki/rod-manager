import path from 'node:path';
import type { ServerPlatformProjectConfig } from '@sojecki/platform-server-platform';

export const samplePortalProjectConfig: ServerPlatformProjectConfig = {
  projectId: 'sample-portal',
  database: {
    path:
      process.env.SAMPLE_PORTAL_AUTH_DB_PATH ?? 'tmp/sample-portal/auth.sqlite',
    seedInitialUser:
      process.env.SAMPLE_PORTAL_AUTH_SEED_INITIAL_USER === 'true',
  },
  ssr: {
    webRoot: path.resolve(process.cwd(), 'projects/sample-portal/apps/web'),
    production: {
      clientRoot: path.resolve(
        process.cwd(),
        'dist/projects/sample-portal/apps/web/client',
      ),
      serverEntryPath: path.resolve(
        process.cwd(),
        'dist/projects/sample-portal/apps/web/server/entry-server.mjs',
      ),
    },
  },
};
