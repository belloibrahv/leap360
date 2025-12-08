import { NextRequest } from 'next/server';
import { 
  extractAuthToken, 
  createUnauthorizedResponse, 
  createInternalErrorResponse,
  makeBackendRequest,
  handleApiResponse
} from '@/core/utils/apiUtils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const token = extractAuthToken(request);
    if (!token) {
      return createUnauthorizedResponse();
    }

    const { schoolId } = await params;
    const response = await makeBackendRequest(`/schools/${schoolId}/classes`, token);
    return await handleApiResponse(response);
  } catch (error) {
    return createInternalErrorResponse((error as Error));
  }
}
