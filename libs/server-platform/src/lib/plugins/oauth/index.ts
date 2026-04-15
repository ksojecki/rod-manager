import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { createOAuthConfigs } from './providers';
import { generatePKCE } from './pkce';
import { createOAuthService } from './service';

export type { OAuthConfig, OAuthService, OAuthState } from './types';
export { generatePKCE };

/**
 * Register OAuth plugin with Fastify.
 */
export default fp(function oauthPlugin(fastify: FastifyInstance) {
  const configs = createOAuthConfigs();
  const oauthService = createOAuthService(configs);

  fastify.decorate('oauth', oauthService);
});
