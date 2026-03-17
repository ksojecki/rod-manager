import type {
  ApiErrorResponse,
  LoginRequestBody,
  SessionResponse,
} from '@rod-manager/shared';

export async function login(input: LoginRequestBody): Promise<SessionResponse> {
  return requestJson<SessionResponse>('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });
}

export async function loadSession(): Promise<SessionResponse> {
  return requestJson<SessionResponse>('/api/auth/session', {
    method: 'GET',
  });
}

export async function logout(): Promise<void> {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok && response.status !== 204) {
    throw new Error(await parseErrorMessage(response));
  }
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const error = (await response.json()) as ApiErrorResponse;

    if (error.message.length > 0) {
      return error.message;
    }
  } catch {
    return 'Unexpected server error.';
  }

  return 'Unexpected server error.';
}

async function requestJson<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: 'include',
    ...init,
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as T;
}
