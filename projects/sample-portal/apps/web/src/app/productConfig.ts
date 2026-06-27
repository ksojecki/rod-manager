export interface FrontendProductRoutes {
  account: string;
  home: string;
  register: string;
}

export interface FrontendProductAuthConfig {
  guestRedirectTo: string;
  oauthAuthenticatedFallbackTo: string;
  oauthGuestFallbackTo: string;
  postLoginRedirectTo: string;
  postRegistrationRedirectTo: string;
}

export interface FrontendProductRegistrationConfig {
  disabledRedirectTo: string;
  enabled: boolean;
}

export interface FrontendProductLoginPromptConfig {
  queryParam: string;
  queryValue: string;
}

export interface FrontendProductConfig {
  auth: FrontendProductAuthConfig;
  loginPrompt: FrontendProductLoginPromptConfig;
  registration: FrontendProductRegistrationConfig;
  routes: FrontendProductRoutes;
}

export const frontendProductConfig: FrontendProductConfig = {
  routes: {
    home: '/',
    account: '/account',
    register: '/register',
  },
  auth: {
    guestRedirectTo: '/?login=1',
    postLoginRedirectTo: '/account',
    postRegistrationRedirectTo: '/account',
    oauthAuthenticatedFallbackTo: '/account',
    oauthGuestFallbackTo: '/',
  },
  registration: {
    enabled: true,
    disabledRedirectTo: '/',
  },
  loginPrompt: {
    queryParam: 'login',
    queryValue: '1',
  },
};

export function buildLoginPromptHref(): string {
  const searchParams = new URLSearchParams({
    [frontendProductConfig.loginPrompt.queryParam]:
      frontendProductConfig.loginPrompt.queryValue,
  });

  return `${frontendProductConfig.routes.home}?${searchParams.toString()}`;
}

export function clearLoginPrompt(
  searchParams: URLSearchParams,
): URLSearchParams {
  const nextSearchParams = new URLSearchParams(searchParams);
  nextSearchParams.delete(frontendProductConfig.loginPrompt.queryParam);
  return nextSearchParams;
}

export function isLoginPromptRequested(searchParams: URLSearchParams): boolean {
  return (
    searchParams.get(frontendProductConfig.loginPrompt.queryParam) ===
    frontendProductConfig.loginPrompt.queryValue
  );
}
