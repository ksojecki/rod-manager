import { describe, expect, it } from 'vitest';
import type { LoginRequestBody, SessionResponse } from './auth.dto';

describe('auth dto', () => {
  it('matches expected login payload shape', () => {
    const payload: LoginRequestBody = {
      email: 'admin@rod-manager.local',
      password: 'admin1234',
    };

    expect(payload).toEqual({
      email: 'admin@rod-manager.local',
      password: 'admin1234',
    });
  });

  it('matches expected session response shape', () => {
    const response: SessionResponse = {
      authenticated: true,
      user: {
        id: 'initial-admin-user',
        email: 'admin@rod-manager.local',
        displayName: 'Administrator',
        role: 'admin',
      },
    };

    expect(response.user.email).toBe('admin@rod-manager.local');
  });
});
