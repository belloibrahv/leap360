import { NextRequest, NextResponse } from 'next/server';

// Shared constants
export const API_BASE_URL = 'http://host.docker.internal:18002/api/v1';

// Shared types
export interface ApiErrorResponse {
  error: string;
  message?: string;
}

export interface ApiSuccessResponse<T> {
  data: T;
}

// Shared utility functions
export function extractAuthToken(request: NextRequest): string | null {
  return request.headers.get('Authorization')?.split(' ')[1] || null;
}

export function createUnauthorizedResponse(): NextResponse {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  );
}

export function createInternalErrorResponse(error?: Error): NextResponse {
  return NextResponse.json(
    {
      error: 'Internal server error',
      text: error ? error.message : '',
    },
    { status: 500 }
  );
}

export function createServiceUnavailableResponse(): NextResponse {
  return NextResponse.json(
    { error: 'Backend service unavailable' },
    { status: 502 }
  );
}

export async function handleApiResponse(response: Response): Promise<NextResponse> {
  const contentType = response.headers.get('content-type');
  let data;
  
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    
    if (response.status === 404) {
      return NextResponse.json({ data: [] });
    } else {
      return createServiceUnavailableResponse();
    }
  }

  if (!response.ok) {
    return NextResponse.json(
      { error: data.message || `HTTP ${response.status}` },
      { status: response.status }
    );
  }

  return NextResponse.json(data);
}

export async function makeBackendRequest(
  endpoint: string, 
  token: string, 
  options: RequestInit = {}
): Promise<Response> {
  return fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
    ...options,
  });
}
