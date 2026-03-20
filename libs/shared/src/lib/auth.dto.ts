export type OAuthProviderType = 'google' | 'apple' | 'facebook';

export type UserRole = 'admin' | 'user';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface OAuthInitiateRequestBody {
  provider: OAuthProviderType;
  codeChallenge: string;
  codeChallengeMethod: 'S256';
}

export interface OAuthCallbackQueryParams {
  code: string;
  state: string;
  provider: OAuthProviderType;
}

export interface OAuthTokenResponseBody {
  accessToken: string;
  accessTokenExpiresIn: number;
  refreshToken?: string;
}

export interface OAuthUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface SessionResponse {
  authenticated: boolean;
  user: AuthUser;
}

export interface ApiErrorResponse {
  message: string;
}
