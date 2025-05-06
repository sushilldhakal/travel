import { jwtDecode } from 'jwt-decode';

// Types
export type AccessTokenType = {
  sub: string;
  roles: string;
  iat: number;
  exp: number;
};

// Token utilities
export const getAccessToken = (): string | null => {
  const raw = localStorage.getItem('token-store');
  try {
    const parsed = JSON.parse(raw || '{}');
    return parsed.state?.token || null;
  } catch {
    return null;
  }
};

export const isValidToken = (token: string | null): boolean => {
  if (!token) return false;
  try {
    const decoded = jwtDecode<AccessTokenType>(token);
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

// User utilities
export const getUserId = (): string | null => {
  const accessToken = getAccessToken();
  if (!isValidToken(accessToken)) return null;

  try {
    const decoded = jwtDecode<AccessTokenType>(accessToken!);
    return decoded.sub;
  } catch (e) {
    console.error('Failed to decode token:', e);
    return null;
  }
};

export const getAuthUserRoles = (): string | null => {
  const accessToken = getAccessToken();
  if (!isValidToken(accessToken)) return null;
  
  try {
    const decoded = jwtDecode<AccessTokenType>(accessToken!);
    return decoded.roles;
  } catch {
    return null;
  }
};
