/**
 * JWT Utilities Tests
 */

import { 
  decodeJWT, 
  isJWTExpired, 
  extractUserFromJWT, 
  isRefreshToken, 
  isAccessToken,
  willExpireSoon 
} from '../jwtUtils';
import { UserRole } from '@/types';

// Mock JWT tokens for testing
const createMockJWT = (payload: any): string => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  const signature = 'mock-signature';
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

describe('JWT Utilities', () => {
  const mockPayload = {
    sub: 'user-123',
    email: 'test@example.com',
    tenant_id: 'tenant-456',
    role: UserRole.TEACHER,
    permissions: ['students:read:class', 'grades:write:assigned'],
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    iat: Math.floor(Date.now() / 1000),
    type: 'access'
  };

  const mockToken = createMockJWT(mockPayload);

  describe('decodeJWT', () => {
    it('should decode a valid JWT token', () => {
      const decoded = decodeJWT(mockToken);
      expect(decoded).toEqual(mockPayload);
    });

    it('should return null for invalid JWT format', () => {
      const decoded = decodeJWT('invalid-token');
      expect(decoded).toBeNull();
    });

    it('should return null for malformed JWT', () => {
      const decoded = decodeJWT('header.payload');
      expect(decoded).toBeNull();
    });
  });

  describe('isJWTExpired', () => {
    it('should return false for non-expired token', () => {
      const expired = isJWTExpired(mockToken);
      expect(expired).toBe(false);
    });

    it('should return true for expired token', () => {
      const expiredPayload = {
        ...mockPayload,
        exp: Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
      };
      const expiredToken = createMockJWT(expiredPayload);
      const expired = isJWTExpired(expiredToken);
      expect(expired).toBe(true);
    });

    it('should return true for token without exp claim', () => {
      const noExpPayload = { ...mockPayload };
      delete noExpPayload.exp;
      const noExpToken = createMockJWT(noExpPayload);
      const expired = isJWTExpired(noExpToken);
      expect(expired).toBe(true);
    });
  });

  describe('extractUserFromJWT', () => {
    it('should extract user information from JWT', () => {
      const userInfo = extractUserFromJWT(mockToken);
      expect(userInfo).toEqual({
        userId: 'user-123',
        email: 'test@example.com',
        tenantId: 'tenant-456',
        role: UserRole.TEACHER,
        permissions: ['students:read:class', 'grades:write:assigned']
      });
    });

    it('should return null for invalid token', () => {
      const userInfo = extractUserFromJWT('invalid-token');
      expect(userInfo).toBeNull();
    });
  });

  describe('isRefreshToken', () => {
    it('should return true for refresh token', () => {
      const refreshPayload = { ...mockPayload, type: 'refresh' };
      const refreshToken = createMockJWT(refreshPayload);
      expect(isRefreshToken(refreshToken)).toBe(true);
    });

    it('should return false for access token', () => {
      expect(isRefreshToken(mockToken)).toBe(false);
    });
  });

  describe('isAccessToken', () => {
    it('should return true for access token', () => {
      expect(isAccessToken(mockToken)).toBe(true);
    });

    it('should return false for refresh token', () => {
      const refreshPayload = { ...mockPayload, type: 'refresh' };
      const refreshToken = createMockJWT(refreshPayload);
      expect(isAccessToken(refreshToken)).toBe(false);
    });
  });

  describe('willExpireSoon', () => {
    it('should return false for token with plenty of time left', () => {
      const willExpire = willExpireSoon(mockToken, 5 * 60 * 1000); // 5 minutes threshold
      expect(willExpire).toBe(false);
    });

    it('should return true for token expiring soon', () => {
      const soonExpiredPayload = {
        ...mockPayload,
        exp: Math.floor(Date.now() / 1000) + 60 // 1 minute from now
      };
      const soonExpiredToken = createMockJWT(soonExpiredPayload);
      const willExpire = willExpireSoon(soonExpiredToken, 5 * 60 * 1000); // 5 minutes threshold
      expect(willExpire).toBe(true);
    });
  });
});