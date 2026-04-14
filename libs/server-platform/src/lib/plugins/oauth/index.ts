import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { createOAuthConfigs } from './providers.js';
import { generatePKCE } from './pkce.js';
import { createOAuthService } from './service.js';

export type { OAuthConfig, OAuthService, OAuthState } from './types.js';
export { generatePKCE };

/**
 * Register OAuth plugin with Fastify.
 */
export default fp(function oauthPlugin(fastify: FastifyInstance) {
  const configs = createOAuthConfigs();
  const oauthService = createOAuthService(configs);

  fastify.decorate('oauth', oauthService);
});
