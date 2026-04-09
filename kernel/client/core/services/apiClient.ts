/**
 * Authenticated API Client
 * 
 * Provides a wrapper around fetch that automatically handles authentication headers,
 * token refresh, and error handling for API requests.
 */

import { TokenManager } from './authApi';
import { ApiError } from '../../types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export interface ApiRequestOptions extends RequestInit {
  requireAuth?: boolean;
  skipAuthRefresh?: boolean;
}

/**
 * Authenticated API client
 */
export class ApiClient {
  /**
   * Make an authenticated API request
   */
  static async request<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const {
      requireAuth = true,
      skipAuthRefresh = false,
      headers = {},
      ...fetchOptions
    } = options;

    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Tenant-Subdomain': 'lagos-state', // Default tenant for demo
    };

    // Add authentication header if required
    if (requireAuth) {
      const token = skipAuthRefresh 
        ? TokenManager.getAccessToken()
        : await TokenManager.getValidAccessToken();
      
      if (!token) {
        throw new ApiError(401, {
          status: 'error',
          message: 'Authentication required',
          errors: []
        });
      }

      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          ...defaultHeaders,
          ...headers,
        },
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${text}`);
        }
        return text as T;
      }

      if (!response.ok) {
        throw new ApiError(response.status, data);
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
   * GET request
   */
  static async get<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  static async post<T>(
    endpoint: string, 
    data?: any, 
    options?: ApiRequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  static async put<T>(
    endpoint: string, 
    data?: any, 
    options?: ApiRequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  static async delete<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * PATCH request
   */
  static async patch<T>(
    endpoint: string, 
    data?: any, 
    options?: ApiRequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

/**
 * Convenience functions for common API patterns
 */
export const api = {
  // Authentication endpoints (no auth required)
  auth: {
    login: (data: any) => ApiClient.post('/api/v1/auth/login', data, { requireAuth: false }),
    refresh: (data: any) => ApiClient.post('/api/v1/auth/refresh', data, { requireAuth: false }),
  },

  // Authenticated endpoints
  user: {
    me: () => ApiClient.get('/api/v1/auth/me'),
    list: (params?: any) => ApiClient.get(`/api/v1/auth/users${params ? `?${new URLSearchParams(params)}` : ''}`),
    create: (data: any) => ApiClient.post('/api/v1/auth/users', data),
    update: (id: string, data: any) => ApiClient.put(`/api/v1/auth/users/${id}`, data),
    delete: (id: string) => ApiClient.delete(`/api/v1/auth/users/${id}`),
  },

  // Schools endpoints (example)
  schools: {
    list: (params?: any) => ApiClient.get(`/api/v1/schools${params ? `?${new URLSearchParams(params)}` : ''}`),
    get: (id: string) => ApiClient.get(`/api/v1/schools/${id}`),
    create: (data: any) => ApiClient.post('/api/v1/schools', data),
    update: (id: string, data: any) => ApiClient.put(`/api/v1/schools/${id}`, data),
    delete: (id: string) => ApiClient.delete(`/api/v1/schools/${id}`),
  },
};