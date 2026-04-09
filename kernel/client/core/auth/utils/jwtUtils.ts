/**
 * JWT Utilities
 * 
 * Provides JWT token parsing and validation utilities for multi-tenant authentication.
 */

import { JWTPayload, UserRole } from '@/types';

/**
 * Decode JWT token payload without verification
 * Note: This is for client-side parsing only. Server-side verification is still required.
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    // JWT has 3 parts separated by dots: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    // Decode the payload (second part)
    const payload = parts[1];
    
    // Add padding if needed for base64 decoding
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    
    // Decode base64
    const decodedPayload = atob(paddedPayload);
    
    // Parse JSON
    const parsedPayload = JSON.parse(decodedPayload);
    
    return parsedPayload as JWTPayload;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

/**
 * Check if JWT token is expired
 */
export function isJWTExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return true;
  }

  // JWT exp is in seconds, Date.now() is in milliseconds
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}

/**
 * Get token expiry time in milliseconds
 */
export function getJWTExpiry(token: string): number | null {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return null;
  }

  // Convert from seconds to milliseconds
  return payload.exp * 1000;
}

/**
 * Extract user information from JWT token
 */
export function extractUserFromJWT(token: string): {
  userId: string;
  email: string;
  tenantId: string;
  role: UserRole;
  permissions: string[];
} | null {
  const payload = decodeJWT(token);
  if (!payload) {
    return null;
  }

  return {
    userId: payload.sub,
    email: payload.email,
    tenantId: payload.tenant_id,
    role: payload.role,
    permissions: payload.permissions || [],
  };
}

/**
 * Check if token is a refresh token
 */
export function isRefreshToken(token: string): boolean {
  const payload = decodeJWT(token);
  return payload?.type === 'refresh';
}

/**
 * Check if token is an access token
 */
export function isAccessToken(token: string): boolean {
  const payload = decodeJWT(token);
  return payload?.type === 'access';
}

/**
 * Get time until token expires in milliseconds
 */
export function getTimeUntilExpiry(token: string): number {
  const expiryTime = getJWTExpiry(token);
  if (!expiryTime) {
    return 0;
  }

  const timeUntilExpiry = expiryTime - Date.now();
  return Math.max(0, timeUntilExpiry);
}

/**
 * Check if token will expire within the specified time (in milliseconds)
 */
export function willExpireSoon(token: string, thresholdMs: number = 5 * 60 * 1000): boolean {
  const timeUntilExpiry = getTimeUntilExpiry(token);
  return timeUntilExpiry <= thresholdMs;
}