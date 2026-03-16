import { describe, expect, it } from 'vitest';
import type { LoginRequestBody, SessionResponse } from './auth.dto';

describe('auth dto', () => {
  it('matches expected login payload shape', () => {
    const payload: LoginRequestBody = {
      email: 'demo@rod-manager.local',
      password: 'demo1234',
    };

    expect(payload).toEqual({
      email: 'demo@rod-manager.local',
      password: 'demo1234',
    });
  });

  it('matches expected session response shape', () => {
    const response: SessionResponse = {
      authenticated: true,
      user: {
        id: 'demo-user',
        email: 'demo@rod-manager.local',
        displayName: 'Demo User',
      },
    };

    expect(response.user.email).toBe('demo@rod-manager.local');
  });
});
