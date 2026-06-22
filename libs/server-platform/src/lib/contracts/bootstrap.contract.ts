import type { ServerPlatformSsrOptions } from '../routes/ssr';

export interface ServerPlatformProjectConfig {
  projectId: string;
  database: {
    path: string;
    seedInitialUser: boolean;
  };
  ssr?: ServerPlatformSsrOptions;
}
