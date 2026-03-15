export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface SessionResponse {
  authenticated: boolean;
  user: AuthUser;
}

export interface ApiErrorResponse {
  message: string;
}
