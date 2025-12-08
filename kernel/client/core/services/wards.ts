import { ApiResponse } from './api';
import { Ward, WardApiResponse } from '../types/ward';
import { makeAuthenticatedRequest, makeAuthenticatedSingleRequest, createTransformFunction } from '../utils/serviceUtils';

// Transform backend API response to frontend format
const transformWardData = createTransformFunction<WardApiResponse, Ward>((apiWard) => ({
  id: apiWard.id,
  name: apiWard.name,
  className: apiWard.class_name,
  relationship: apiWard.relationship
}));

export async function getWards(schoolId: string): Promise<ApiResponse<Ward[]>> {
  return makeAuthenticatedRequest<Ward>(`/api/v1/schools/${schoolId}/wards`, transformWardData);
}

export async function getWard(schoolId: string, wardId: string): Promise<ApiResponse<Ward>> {
  return makeAuthenticatedSingleRequest<Ward>(`/api/v1/schools/${schoolId}/wards/${wardId}`, transformWardData);
}
