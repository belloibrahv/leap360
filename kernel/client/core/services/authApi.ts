/**
 * Enhanced Authentication API Client
 * 
 * Implements the authentication API contract with multi-tenant support.
 * Handles login, logout, token refresh, tenant switching, and user profile operations.
 */

import { 
  LoginRequest, 
  LoginResponse, 
  RefreshTokenRequest, 
  TokenResponse, 
  UserProfileResponse,
  ApiError,
  ErrorResponse,
} from '../../types/auth';
import type { TenantSwitchResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

function normalizeErrorResponse(status: number, payload: unknown): ErrorResponse {
  if (payload && typeof payload === 'object') {
    const errorPayload = payload as Record<string, unknown>;
    const detail = errorPayload.detail;
    const message =
      typeof errorPayload.message === 'string'
        ? errorPayload.message
        : typeof detail === 'string'
          ? detail
          : `Request failed with status ${status}`;

    const errors = Array.isArray(errorPayload.errors)
      ? (errorPayload.errors as ErrorResponse['errors'])
      : undefined;

    return {
      status: typeof errorPayload.status === 'string' ? errorPayload.status : 'error',
      message,
      detail: detail as ErrorResponse['detail'],
      errors,
    };
  }

  return {
    status: 'error',
    message: `Request failed with status ${status}`,
    errors: [],
  };
}

/**
 * Generic API request function with error handling
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const storedTenantId =
      endpoint === '/api/v1/auth/login' ? null : TokenManager.getTenantContext();
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(storedTenantId
        ? { 'X-Tenant-ID': storedTenantId }
        : { 'X-Tenant-Subdomain': 'lagos-state' }),
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Unexpected response format: ${text}`);
    }

    if (!response.ok) {
      throw new ApiError(response.status, normalizeErrorResponse(response.status, data));
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    throw new ApiError(0, {
      status: 'error',
      message: error instanceof Error ? error.message : 'Network error',
      errors: []
    });
  }
}

/**
 * Enhanced Authentication API client with multi-tenant support
 */
export class AuthApiClient {
  /**
   * Login user with email and password
   */
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    return apiRequest<LoginResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  /**
   * Logout current user
   */
  static async logout(token: string): Promise<void> {
    await apiRequest('/api/v1/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const request: RefreshTokenRequest = { refresh_token: refreshToken };
    
    return apiRequest<TokenResponse>('/api/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get current user profile with enhanced information
   */
  static async getCurrentUser(token: string): Promise<UserProfileResponse> {
    return apiRequest<UserProfileResponse>('/api/v1/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  /**
   * Switch tenant context
   */
  static async switchTenant(token: string, tenantId: string): Promise<TenantSwitchResponse> {
    return apiRequest<TenantSwitchResponse>('/api/v1/auth/switch-tenant', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ tenant_id: tenantId }),
    });
  }

  /**
   * Get available tenants for current user
   */
  static async getAvailableTenants(token: string): Promise<{
    status: string;
    data: {
      tenants: Array<{
        id: string;
        name: string;
        slug: string;
        role: string;
        permissions: string[];
      }>;
    };
  }> {
    return apiRequest('/api/v1/auth/tenants', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  /**
   * Update user preferences
   */
  static async updatePreferences(token: string, preferences: any): Promise<{
    status: string;
    message: string;
  }> {
    return apiRequest('/api/v1/auth/preferences', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(preferences),
    });
  }

  /**
   * Check if a token is valid by attempting to get user profile
   */
  static async validateToken(token: string): Promise<boolean> {
    try {
      await this.getCurrentUser(token);
      return true;
    } catch (error) {
      return false;
    }
  }
}

/**
 * Enhanced Token management utilities with multi-tenant support
 */
export class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'leap360_access_token';
  private static readonly REFRESH_TOKEN_KEY = 'leap360_refresh_token';
  private static readonly TOKEN_EXPIRY_KEY = 'leap360_token_expiry';
  private static readonly TENANT_CONTEXT_KEY = 'leap360_tenant_context';
  private static readonly USER_PREFERENCES_KEY = 'leap360_user_preferences';

  /**
   * Store tokens in localStorage with tenant context
   */
  static storeTokens(accessToken: string, refreshToken: string, expiresIn: number, tenantId?: string): void {
    if (typeof window === 'undefined') return;

    const expiryTime = Date.now() + (expiresIn * 1000);
    
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
    
    if (tenantId) {
      this.storeTenantContext(tenantId);
    }
  }

  /**
   * Store tenant context separately from tokens.
   */
  static storeTenantContext(tenantId: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.TENANT_CONTEXT_KEY, tenantId);
  }

  /**
   * Get access token from localStorage
   */
  static getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Get refresh token from localStorage
   */
  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Get stored tenant context
   */
  static getTenantContext(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TENANT_CONTEXT_KEY);
  }

  /**
   * Store user preferences
   */
  static storeUserPreferences(preferences: any): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.USER_PREFERENCES_KEY, JSON.stringify(preferences));
  }

  /**
   * Get user preferences
   */
  static getUserPreferences(): any | null {
    if (typeof window === 'undefined') return null;
    
    const stored = localStorage.getItem(this.USER_PREFERENCES_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  /**
   * Check if access token is expired
   */
  static isTokenExpired(): boolean {
    if (typeof window === 'undefined') return true;

    const expiryTime = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!expiryTime) return true;

    return Date.now() > parseInt(expiryTime);
  }

  /**
   * Clear all tokens and context from localStorage
   */
  static clearTokens(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    localStorage.removeItem(this.TENANT_CONTEXT_KEY);
    localStorage.removeItem(this.USER_PREFERENCES_KEY);
  }

  /**
   * Get valid access token, refreshing if necessary
   */
  static async getValidAccessToken(): Promise<string | null> {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    if (!accessToken) {
      return null;
    }

    // If token is not expired, return it
    if (!this.isTokenExpired()) {
      return accessToken;
    }

    if (!refreshToken) {
      return null;
    }

    // Try to refresh the token
    try {
      const response = await AuthApiClient.refreshToken(refreshToken);
      
      // Store new access token
      this.storeTokens(
        response.data.access_token,
        refreshToken, // Keep the same refresh token
        response.data.expires_in
      );

      return response.data.access_token;
    } catch (error) {
      // Refresh failed, clear tokens
      this.clearTokens();
      return null;
    }
  }
}
