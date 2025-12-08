const API_BASE_URL = process.env.NEXT_PUBLIC_LEAP360_API_BASE_URL || "";
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  data: {
    access_token: string;
  };
  warnings: string[];
  failures: string[];
}

// Generic API client function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    // Handle non-JSON responses
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      return {
        error: data?.message || data?.error || `HTTP ${response.status}`,
        message: data?.message || 'An error occurred',
      };
    }

    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Network error',
      message: 'Unable to connect to server',
    };
  }
}

export async function login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  try {
    const response = await apiRequest<LoginResponse>('/api/v1/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Check if we have failures in the response
    if (response.data?.failures && response.data.failures.length > 0) {
      return {
        error: 'true',
        message: response.data.failures[0],
      };
    }

    // Check if we have the access token
    if (!response.data?.data?.access_token) {
      return {
        error: 'true',
        message: 'Invalid response from server',
      };
    }

    return {
      data: response.data,
      error: undefined,
    };
  } catch (error) { // eslint-disable-line
    return {
      error: 'true',
      message: 'Network error. Please try again.',
    };
  }
}
