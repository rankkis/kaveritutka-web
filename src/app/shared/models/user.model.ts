export interface User {
  id: string;
  displayName?: string;
  createdAt: Date;
  // Legacy field for backward compatibility
  name?: string;
  email?: string;
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
  accessToken: string;
  refreshToken: string;
}

export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UpdateUserDto {
  displayName: string;
}
