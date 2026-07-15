export interface AccessTokenPayload {
  sub: number;
  email: string;
  role: string;
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: number;
  type: 'refresh';
}

export interface TokenUser {
  id: number;
  email: string;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
