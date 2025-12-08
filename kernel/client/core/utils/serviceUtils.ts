import { ApiResponse } from '../services/api';
import { authStore } from '../auth/store/authStore';

// Shared service utilities
export async function makeAuthenticatedRequest<T>(
  endpoint: string,
  transformFn?: (data: any) => T
): Promise<ApiResponse<T[]>> {
  try {
    const token = authStore.getToken();
    if (!token) {
      return { error: 'Authentication required' };
    }

    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return { 
        error: data.error || `HTTP ${response.status}`,
        message: data.message || 'Request failed'
      };
    }

    // Handle empty data arrays
    if (!data.data || (Array.isArray(data.data) && data.data.length === 0)) {
      return { data: [] };
    }

    // Transform data if transform function provided
    if (transformFn && Array.isArray(data.data)) {
      const transformedData = data.data.map(transformFn);
      return { data: transformedData };
    }

    return { data: Array.isArray(data.data) ? data.data : [data.data] };
  } catch (error) {
    return { 
      error: error instanceof Error ? error.message : 'Network error',
      message: 'Unable to connect to server'
    };
  }
}

export async function makeAuthenticatedSingleRequest<T>(
  endpoint: string,
  transformFn?: (data: any) => T
): Promise<ApiResponse<T>> {
  try {
    const token = authStore.getToken();
    if (!token) {
      return { error: 'Authentication required' };
    }

    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return { 
        error: data.error || `HTTP ${response.status}`,
        message: data.message || 'Request failed'
      };
    }

    // Transform data if transform function provided
    if (transformFn && data.data) {
      const transformedData = transformFn(data.data);
      return { data: transformedData };
    }

    return { data: data.data || data };
  } catch (error) {
    return { 
      error: error instanceof Error ? error.message : 'Network error',
      message: 'Unable to connect to server'
    };
  }
}

export function createTransformFunction<TInput, TOutput>(
  transformFn: (input: TInput) => TOutput
) {
  return transformFn;
}
