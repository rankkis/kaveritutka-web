export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface TokenRefreshResponse {
  token: string;
  refreshToken: string;
}
