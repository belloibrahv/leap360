import { ApiResponse } from './api';
import { SchoolClass, ClassApiResponse } from '../types/class';
import { makeAuthenticatedRequest, makeAuthenticatedSingleRequest, createTransformFunction } from '../utils/serviceUtils';

// Transform backend API response to frontend format
const transformClassData = createTransformFunction<ClassApiResponse, SchoolClass>((apiClass) => ({
  id: apiClass.id,
  name: apiClass.name,
  studentsCount: apiClass.students_count
}));

export async function getClasses(schoolId: string): Promise<ApiResponse<SchoolClass[]>> {
  return makeAuthenticatedRequest<SchoolClass>(`/api/v1/schools/${schoolId}/classes`, transformClassData);
}

export async function getClass(schoolId: string, classId: string): Promise<ApiResponse<SchoolClass>> {
  return makeAuthenticatedSingleRequest<SchoolClass>(`/api/v1/schools/${schoolId}/classes/${classId}`, transformClassData);
}
