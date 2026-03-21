import { randomUUID } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import type {
  OAuthCallbackRequestBody,
  OAuthCallbackResponseBody,
  OAuthIntent,
  OAuthProviderType,
  OAuthProvidersResponseBody,
} from '@rod-manager/shared';
import { generatePKCE } from '../plugins/oauth';
import { SESSION_COOKIE_NAME } from '../plugins/cookie';

interface OAuthStateData {
  provider: OAuthProviderType;
  expiresAt: number;
  codeVerifier: string;
  intent: OAuthIntent;
  redirectTo: string;
  userId?: string;
}

type OAuthStateInput = Omit<OAuthStateData, 'expiresAt'>;

interface CompletedOAuthFlow {
  intent: OAuthIntent;
  redirectTo: string;
  message?: string;
  sessionToken?: string;
}

const OAUTH_PROVIDERS: OAuthProviderType[] = ['google', 'apple', 'facebook'];
const OAUTH_STATE_TTL = 10 * 60 * 1000;
const oauthStates = new Map<string, OAuthStateData>();

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

function isOAuthProviderType(provider: string): provider is OAuthProviderType {
  return OAUTH_PROVIDERS.includes(provider as OAuthProviderType);
}

function getFrontendBaseUrl(): string {
  return process.env.OAUTH_REDIRECT_BASE_URL ?? 'http://localhost:3000';
}

function createRedirectUrl(pathname: string): string {
  const redirectUrl = new URL(getFrontendBaseUrl());
  redirectUrl.pathname = pathname;
  redirectUrl.search = '';
  return redirectUrl.toString();
}

function createOAuthState(input: OAuthStateInput): {
  state: string;
  stateData: OAuthStateData;
} {
  const state = randomUUID();
  const stateData: OAuthStateData = {
    ...input,
    expiresAt: Date.now() + OAUTH_STATE_TTL,
  };

  cleanupExpiredStates();
  oauthStates.set(state, stateData);

  return { state, stateData };
}

function getOAuthErrorStatusCode(error: unknown): number {
  const message = error instanceof Error ? error.message : '';

  if (message === 'Invalid or expired OAuth state.') {
    return 401;
  }

  if (
    message === 'Missing authenticated user for OAuth linking.' ||
    message === 'OAuth link target user does not exist.'
  ) {
    return 401;
  }

  if (
    message === 'This OAuth account is already linked to another user.' ||
    message === 'A different OAuth account is already linked for this provider.'
  ) {
    return 409;
  }

  return 500;
}

async function completeOAuthFlow(
  fastify: FastifyInstance,
  provider: OAuthProviderType,
  code: string,
  state: string,
): Promise<CompletedOAuthFlow> {
  cleanupExpiredStates();
  const oauthState = oauthStates.get(state);

  if (oauthState === undefined || oauthState.provider !== provider) {
    throw new Error('Invalid or expired OAuth state.');
  }

  oauthStates.delete(state);

  const { accessToken, refreshToken, expiresIn, idToken } =
    await fastify.oauth.exchangeCodeForToken(
      provider,
      code,
      oauthState.codeVerifier,
    );

  const userInfo = await fastify.oauth.getUserInfo(
    provider,
    accessToken,
    idToken,
  );
  const accessTokenExpiresAt = Date.now() + expiresIn * 1000;

  if (oauthState.intent === 'login') {
    const user = fastify.authStore.findOrCreateUserByOAuth(
      provider,
      userInfo.id,
      userInfo.email,
      userInfo.name,
      userInfo.surname,
    );

    fastify.authStore.linkOAuthProvider(
      user.id,
      provider,
      userInfo.id,
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
    );

    return {
      intent: 'login',
      redirectTo: oauthState.redirectTo,
      sessionToken: fastify.authStore.createSession(user.id),
    };
  }

  if (oauthState.userId === undefined) {
    throw new Error('Missing authenticated user for OAuth linking.');
  }

  const existingUser = fastify.authStore.findUserById(oauthState.userId);

  if (existingUser === undefined) {
    throw new Error('OAuth link target user does not exist.');
  }

  const linkedUser = fastify.authStore.findUserByOAuthProvider(
    provider,
    userInfo.id,
  );

  if (linkedUser !== undefined && linkedUser.id !== existingUser.id) {
    throw new Error('This OAuth account is already linked to another user.');
  }

  const existingProvider = fastify.authStore.getOAuthProvider(
    existingUser.id,
    provider,
  );

  if (
    existingProvider !== undefined &&
    existingProvider.providerUserId !== userInfo.id
  ) {
    throw new Error(
      'A different OAuth account is already linked for this provider.',
    );
  }

  fastify.authStore.linkOAuthProvider(
    existingUser.id,
    provider,
    userInfo.id,
    accessToken,
    refreshToken,
    accessTokenExpiresAt,
  );

  return {
    intent: 'link',
    redirectTo: oauthState.redirectTo,
    message: 'OAuth provider linked.',
  };
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
      if (!isOAuthProviderType(provider)) {
        await reply.status(400).send({ message: 'Invalid OAuth provider.' });
        return;
      }

      try {
        // Generate PKCE parameters
        const { codeVerifier, codeChallenge } = generatePKCE();

        // Create OAuth state
        const { state } = createOAuthState({
          provider,
          codeVerifier,
          intent: 'login',
          redirectTo: '/account',
        });

        // Generate authorization URL
        const authUrl = fastify.oauth.generateAuthorizationUrl(
          provider,
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
    if (!isOAuthProviderType(provider)) {
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

    try {
      const result = await completeOAuthFlow(fastify, provider, code, state);

      if (result.sessionToken !== undefined) {
        reply.setSessionCookie(result.sessionToken);
      }

      await reply.redirect(createRedirectUrl(result.redirectTo));
    } catch (error) {
      fastify.log.error(error);
      await reply.status(getOAuthErrorStatusCode(error)).send({
        message: `OAuth callback failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  });

  fastify.post<{
    Params: { provider: string };
    Body: OAuthCallbackRequestBody;
  }>('/api/auth/oauth/callback/:provider', async (request, reply) => {
    const { provider } = request.params;
    const { code, state } = request.body;

    if (!isOAuthProviderType(provider)) {
      await reply.status(400).send({ message: 'Invalid OAuth provider.' });
      return;
    }

    if (!code || !state) {
      await reply
        .status(400)
        .send({ message: 'Missing state or code parameter.' });
      return;
    }

    try {
      const result = await completeOAuthFlow(fastify, provider, code, state);

      if (result.sessionToken !== undefined) {
        reply.setSessionCookie(result.sessionToken);
      }

      const response: OAuthCallbackResponseBody = {
        intent: result.intent,
        redirectTo: result.redirectTo,
        message: result.message,
      };

      await reply.send(response);
    } catch (error) {
      fastify.log.error(error);
      await reply.status(getOAuthErrorStatusCode(error)).send({
        message: `OAuth callback failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  });

  fastify.get('/api/auth/oauth/providers', async (request, reply) => {
    const token = request.cookies[SESSION_COOKIE_NAME];

    if (token === undefined) {
      await reply.status(401).send({ message: 'Not authenticated.' });
      return;
    }

    const session = fastify.authStore.findSession(token);

    if (session === undefined) {
      await reply.status(401).send({ message: 'Invalid session.' });
      return;
    }

    const linkedProviders = new Set(
      fastify.authStore.listLinkedOAuthProviders(session.userId),
    );

    const response: OAuthProvidersResponseBody = {
      providers: OAUTH_PROVIDERS.map((provider) => ({
        provider,
        linked: linkedProviders.has(provider),
      })),
    };

    await reply.send(response);
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
      if (!isOAuthProviderType(provider)) {
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
        const { state } = createOAuthState({
          provider,
          codeVerifier,
          intent: 'link',
          redirectTo: '/account',
          userId: session.userId,
        });

        // Generate authorization URL
        const authUrl = fastify.oauth.generateAuthorizationUrl(
          provider,
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
      if (!isOAuthProviderType(provider)) {
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
        fastify.authStore.unlinkOAuthProvider(session.userId, provider);

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
