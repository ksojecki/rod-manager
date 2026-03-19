import { randomBytes, createHash } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import type { OAuthProviderType, OAuthUserInfo } from '@rod-manager/shared';

// Exported types
/**
 * OAuth provider configuration
 */
export interface OAuthConfig {
  provider: OAuthProviderType;
  clientId: string;
  clientSecret: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  userInfoEndpoint: string;
  redirectUri: string;
}

/**
 * OAuth state stored during authorization
 */
export interface OAuthState {
  provider: OAuthProviderType;
  codeVerifier: string;
  expiresAt: number;
}

/**
 * OAuth service for handling provider authentication
 */
export interface OAuthService {
  generateAuthorizationUrl(
    provider: OAuthProviderType,
    state: string,
    codeChallenge: string,
  ): string;

  exchangeCodeForToken(
    provider: OAuthProviderType,
    code: string,
    codeVerifier: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string | null;
    expiresIn: number;
  }>;

  getUserInfo(
    provider: OAuthProviderType,
    accessToken: string,
  ): Promise<OAuthUserInfo>;

  refreshAccessToken(
    provider: OAuthProviderType,
    refreshToken: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string | null;
    expiresIn: number;
  }>;
}

// Non-exported types
/**
 * OAuth token response from provider
 */
interface ProviderTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  token_type?: string;
}

declare module 'fastify' {
  interface FastifyInstance {
    oauth: OAuthService;
  }
}

// Constants
const PKCE_CODE_LENGTH = 32;

// Helper functions
/**
 * Generate PKCE code challenge from code verifier (SHA256)
 */
function generateCodeChallenge(codeVerifier: string): string {
  const hash = createHash('sha256');
  hash.update(codeVerifier);
  return hash
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Create a random code verifier for PKCE
 */
function generateCodeVerifier(): string {
  return randomBytes(PKCE_CODE_LENGTH)
    .toString('base64')
    .replace(/[^a-zA-Z0-9_-]/g, '');
}

// Exported functions
/**
 * Generate PKCE code verifier and challenge
 */
// eslint-disable-next-line no-restricted-syntax -- Utility function exported before default plugin export
export function generatePKCE(): {
  codeVerifier: string;
  codeChallenge: string;
} {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  return { codeVerifier, codeChallenge };
}

/**
 * Register OAuth plugin with Fastify
 */
export default fp(function oauthPlugin(fastify: FastifyInstance) {
  const configs: Map<OAuthProviderType, OAuthConfig> = new Map();

  // Google OAuth configuration
  const googleClientId = process.env.OAUTH_GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.OAUTH_GOOGLE_CLIENT_SECRET;
  if (googleClientId && googleClientSecret) {
    configs.set('google', {
      provider: 'google',
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      userInfoEndpoint: 'https://openidconnect.googleapis.com/v1/userinfo',
      redirectUri: `${
        process.env.OAUTH_REDIRECT_BASE_URL ?? 'http://localhost:3000'
      }/auth/oauth/callback/google`,
    });
  }

  // Apple OAuth configuration
  const appleClientId = process.env.OAUTH_APPLE_CLIENT_ID;
  const appleClientSecret = process.env.OAUTH_APPLE_CLIENT_SECRET;
  const appleTeamId = process.env.OAUTH_APPLE_TEAM_ID;
  if (appleClientId && appleClientSecret && appleTeamId) {
    configs.set('apple', {
      provider: 'apple',
      clientId: appleClientId,
      clientSecret: appleClientSecret,
      authorizationEndpoint: 'https://appleid.apple.com/auth/authorize',
      tokenEndpoint: 'https://appleid.apple.com/auth/token',
      userInfoEndpoint: '', // Apple returns user info in the ID token
      redirectUri: `${
        process.env.OAUTH_REDIRECT_BASE_URL ?? 'http://localhost:3000'
      }/auth/oauth/callback/apple`,
    });
  }

  // Facebook OAuth configuration
  const facebookClientId = process.env.OAUTH_FACEBOOK_CLIENT_ID;
  const facebookClientSecret = process.env.OAUTH_FACEBOOK_CLIENT_SECRET;
  if (facebookClientId && facebookClientSecret) {
    configs.set('facebook', {
      provider: 'facebook',
      clientId: facebookClientId,
      clientSecret: facebookClientSecret,
      authorizationEndpoint: 'https://www.facebook.com/v18.0/dialog/oauth',
      tokenEndpoint: 'https://graph.instagram.com/v18.0/oauth/access_token',
      userInfoEndpoint: 'https://graph.instagram.com/v18.0/me',
      redirectUri: `${
        process.env.OAUTH_REDIRECT_BASE_URL ?? 'http://localhost:3000'
      }/auth/oauth/callback/facebook`,
    });
  }

  const oauthService: OAuthService = {
    generateAuthorizationUrl(provider, state, codeChallenge) {
      const config = configs.get(provider);
      if (!config) {
        throw new Error(`OAuth provider ${provider} is not configured`);
      }

      const baseParams: Record<string, string> = {
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        response_type: 'code',
        state,
      };

      const params = new URLSearchParams(baseParams);

      if (provider === 'google') {
        params.set('scope', 'openid profile email');
        params.set('code_challenge', codeChallenge);
        params.set('code_challenge_method', 'S256');
      } else if (provider === 'apple') {
        params.set('scope', 'openid profile email');
        params.set('response_mode', 'form_post');
        params.set('code_challenge', codeChallenge);
        params.set('code_challenge_method', 'S256');
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Safe runtime check
      } else if (provider === 'facebook') {
        params.set('scope', 'email public_profile');
      }

      return `${config.authorizationEndpoint}?${params.toString()}`;
    },

    async exchangeCodeForToken(provider, code, codeVerifier) {
      const config = configs.get(provider);
      if (!config) {
        throw new Error(`OAuth provider ${provider} is not configured`);
      }

      const body: Record<string, string> = {
        grant_type: 'authorization_code',
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.redirectUri,
      };

      if (provider !== 'facebook') {
        body.code_verifier = codeVerifier;
      }

      const response = await fetch(config.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(body),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          `Failed to exchange code for token: ${String(response.status)} ${errorData}`,
        );
      }

      const data = (await response.json()) as ProviderTokenResponse;

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token ?? null,
        expiresIn: data.expires_in || 3600,
      };
    },

    async getUserInfo(provider, accessToken) {
      const config = configs.get(provider);
      if (!config) {
        throw new Error(`OAuth provider ${provider} is not configured`);
      }

      let userInfo: OAuthUserInfo;

      if (provider === 'google' || provider === 'apple') {
        const response = await fetch(config.userInfoEndpoint, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to get user info from ${provider}`);
        }

        const data = (await response.json()) as Record<string, unknown>;
        userInfo = {
          id: (data.sub as string) || (data.id as string),
          email: data.email as string,
          name: (data.name as string) || (data.given_name as string),
          picture: data.picture as string | undefined,
        };
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Safe runtime check
      } else if (provider === 'facebook') {
        // Facebook
        const accessTokenParam = encodeURIComponent(accessToken);
        const response = await fetch(
          `${config.userInfoEndpoint}?fields=id,name,email,picture&access_token=${accessTokenParam}`,
        );

        if (!response.ok) {
          throw new Error('Failed to get user info from Facebook');
        }

        const data = (await response.json()) as Record<string, unknown>;
        const picture = data.picture as Record<string, unknown> | undefined;
        userInfo = {
          id: data.id as string,
          email: data.email as string,
          name: data.name as string,
          picture: (picture?.data as Record<string, unknown> | undefined)
            ?.url as string | undefined,
        };
      } else {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions -- Provider is exhaustively checked, this is unreachable
        throw new Error(`Unsupported provider: ${provider}`);
      }

      return userInfo;
    },

    async refreshAccessToken(provider, refreshToken) {
      const config = configs.get(provider);
      if (!config) {
        throw new Error(`OAuth provider ${provider} is not configured`);
      }

      const body: Record<string, string> = {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: config.clientId,
        client_secret: config.clientSecret,
      };

      const response = await fetch(config.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(body),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh access token');
      }

      const data = (await response.json()) as ProviderTokenResponse;

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token ?? refreshToken,
        expiresIn: data.expires_in || 3600,
      };
    },
  };

  fastify.decorate('oauth', oauthService);
});
