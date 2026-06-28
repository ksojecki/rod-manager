import { describe, expect, it } from 'vitest';
import { buildLoginPromptHref as buildSharedLoginPromptHref } from '@sojecki/platform-web-platform';

import { buildLoginPromptHref, frontendProductConfig } from './productConfig';

describe('frontendProductConfig', () => {
  it('keeps route, auth, and registration defaults aligned', () => {
    expect(frontendProductConfig.routes).toEqual({
      home: '/',
      account: '/account',
      register: '/register',
    });
    expect(frontendProductConfig.auth).toEqual({
      guestRedirectTo: '/?login=1',
      postLoginRedirectTo: '/account',
      postRegistrationRedirectTo: '/account',
      oauthAuthenticatedFallbackTo: '/account',
      oauthGuestFallbackTo: '/',
    });
    expect(frontendProductConfig.registration).toEqual({
      enabled: true,
      disabledRedirectTo: '/',
    });
  });

  it('builds the login prompt href through the shared helper contract', () => {
    expect(buildLoginPromptHref()).toBe(
      buildSharedLoginPromptHref(
        frontendProductConfig.routes.home,
        frontendProductConfig.loginPrompt,
      ),
    );
    expect(buildLoginPromptHref()).toBe('/?login=1');
  });
});
