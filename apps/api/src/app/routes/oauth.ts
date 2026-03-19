import { randomUUID } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import type { OAuthProviderType } from '@rod-manager/shared';
import { generatePKCE } from '../plugins/oauth';
import { SESSION_COOKIE_NAME } from '../plugins/cookie';

const OAUTH_STATE_TTL = 10 * 60 * 1000; // 10 minutes
const oauthStates = new Map<
  string,
  { provider: OAuthProviderType; expiresAt: number; codeVerifier: string }
>();

/**
 * Clean up expired OAuth states
 */
function cleanupExpiredStates(): void {
  const now = Date.now();
  for (const [state, data] of oauthStates.entries()) {
    if (data.expiresAt < now) {
      oauthStates.delete(state);
    }
  }
}

function oauthRoutes(fastify: FastifyInstance) {
  /**
   * Initiate OAuth authorization flow
   * POST /api/auth/oauth/authorize/:provider
   */
  fastify.post<{ Params: { provider: string } }>(
    '/api/auth/oauth/authorize/:provider',
    async (request, reply) => {
      const { provider } = request.params;

      // Validate provider
      if (!['google', 'apple', 'facebook'].includes(provider)) {
        await reply.status(400).send({ message: 'Invalid OAuth provider.' });
        return;
      }

      try {
        // Generate PKCE parameters
        const { codeVerifier, codeChallenge } = generatePKCE();

        // Create OAuth state
        const state = randomUUID();
        cleanupExpiredStates();
        oauthStates.set(state, {
          provider: provider as OAuthProviderType,
          expiresAt: Date.now() + OAUTH_STATE_TTL,
          codeVerifier,
        });

        // Generate authorization URL
        const authUrl = fastify.oauth.generateAuthorizationUrl(
          provider as OAuthProviderType,
          state,
          codeChallenge,
        );

        await reply.send({
          authorizationUrl: authUrl,
          state,
          codeVerifier,
        });
      } catch (error) {
        fastify.log.error(error);
        await reply.status(500).send({
          message: `Failed to initiate OAuth authorization: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    },
  );

  /**
   * Handle OAuth callback
   * GET /api/auth/oauth/callback/:provider
   */
  fastify.get<{
    Params: { provider: string };
    Querystring: { code: string; state: string; error?: string };
  }>('/api/auth/oauth/callback/:provider', async (request, reply) => {
    const { provider } = request.params;
    const { code, state, error } = request.query;

    // Validate provider
    if (!['google', 'apple', 'facebook'].includes(provider)) {
      await reply.status(400).send({ message: 'Invalid OAuth provider.' });
      return;
    }

    // Check for OAuth error from provider
    if (error) {
      await reply.status(400).send({
        message: `OAuth authorization denied: ${error}`,
      });
      return;
    }

    // Validate state
    if (!state || !code) {
      await reply
        .status(400)
        .send({ message: 'Missing state or code parameter.' });
      return;
    }

    cleanupExpiredStates();
    const oauthState = oauthStates.get(state);
    if (!oauthState) {
      await reply
        .status(401)
        .send({ message: 'Invalid or expired OAuth state.' });
      return;
    }

    // Consume state
    oauthStates.delete(state);

    try {
      // Exchange code for token
      const { accessToken, refreshToken, expiresIn } =
        await fastify.oauth.exchangeCodeForToken(
          provider as OAuthProviderType,
          code,
          oauthState.codeVerifier,
        );

      // Get user info
      const userInfo = await fastify.oauth.getUserInfo(
        provider as OAuthProviderType,
        accessToken,
      );

      // Find or create user
      const user = fastify.authStore.findOrCreateUserByOAuth(
        provider as OAuthProviderType,
        userInfo.id,
        userInfo.email,
        userInfo.name,
      );

      // Update OAuth token in database
      const accessTokenExpiresAt = Date.now() + expiresIn * 1000;
      fastify.authStore.linkOAuthProvider(
        user.id,
        provider as OAuthProviderType,
        userInfo.id,
        accessToken,
        refreshToken,
        accessTokenExpiresAt,
      );

      // Create session
      const token = fastify.authStore.createSession(user.id);
      reply.setSessionCookie(token);

      // Redirect to home or dashboard
      // In a real app, you might include the session token in the URL or use the cookie
      const redirectUrl = new URL('http://localhost:3000'); // Replace with actual base URL from env
      redirectUrl.pathname = '/';
      await reply.redirect(redirectUrl.toString());
    } catch (error) {
      fastify.log.error(error);
      await reply.status(500).send({
        message: `OAuth callback failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  });

  /**
   * Link OAuth provider to existing account
   * POST /api/auth/oauth/link/:provider
   */
  fastify.post<{ Params: { provider: string } }>(
    '/api/auth/oauth/link/:provider',
    async (request, reply) => {
      const { provider } = request.params;
      const token = request.cookies[SESSION_COOKIE_NAME];

      // Validate provider
      if (!['google', 'apple', 'facebook'].includes(provider)) {
        await reply.status(400).send({ message: 'Invalid OAuth provider.' });
        return;
      }

      // Check authentication
      if (!token) {
        await reply.status(401).send({ message: 'Not authenticated.' });
        return;
      }

      const session = fastify.authStore.findSession(token);
      if (!session) {
        await reply.status(401).send({ message: 'Invalid session.' });
        return;
      }

      try {
        // Generate PKCE parameters
        const { codeVerifier, codeChallenge } = generatePKCE();

        // Create OAuth state
        const state = randomUUID();
        cleanupExpiredStates();
        oauthStates.set(state, {
          provider: provider as OAuthProviderType,
          expiresAt: Date.now() + OAUTH_STATE_TTL,
          codeVerifier,
        });

        // Generate authorization URL
        const authUrl = fastify.oauth.generateAuthorizationUrl(
          provider as OAuthProviderType,
          state,
          codeChallenge,
        );

        await reply.send({
          authorizationUrl: authUrl,
          state,
          codeVerifier,
        });
      } catch (error) {
        fastify.log.error(error);
        await reply.status(500).send({
          message: `Failed to initiate OAuth linking: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    },
  );

  /**
   * Unlink OAuth provider from account
   * DELETE /api/auth/oauth/link/:provider
   */
  fastify.delete<{ Params: { provider: string } }>(
    '/api/auth/oauth/link/:provider',
    async (request, reply) => {
      const { provider } = request.params;
      const token = request.cookies[SESSION_COOKIE_NAME];

      // Validate provider
      if (!['google', 'apple', 'facebook'].includes(provider)) {
        await reply.status(400).send({ message: 'Invalid OAuth provider.' });
        return;
      }

      // Check authentication
      if (!token) {
        await reply.status(401).send({ message: 'Not authenticated.' });
        return;
      }

      const session = fastify.authStore.findSession(token);
      if (!session) {
        await reply.status(401).send({ message: 'Invalid session.' });
        return;
      }

      try {
        fastify.authStore.unlinkOAuthProvider(
          session.userId,
          provider as OAuthProviderType,
        );

        await reply.send({ message: 'OAuth provider unlinked.' });
      } catch (error) {
        fastify.log.error(error);
        await reply.status(500).send({
          message: `Failed to unlink OAuth provider: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    },
  );
}

export default oauthRoutes;
