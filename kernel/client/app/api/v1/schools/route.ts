import { NextRequest } from 'next/server';
import { 
  extractAuthToken, 
  createUnauthorizedResponse, 
  createInternalErrorResponse,
  makeBackendRequest,
  handleApiResponse
} from '@/core/utils/apiUtils';

export async function GET(request: NextRequest) {
  try {
    const token = extractAuthToken(request);
    if (!token) {
      return createUnauthorizedResponse();
    }

    const response = await makeBackendRequest('/schools', token);
    return await handleApiResponse(response);
  } catch (error) {
    return createInternalErrorResponse((error as Error));
  }
}
