import { ApiResponse } from './api';
import { School, SchoolApiResponse } from '../types/school';
import { makeAuthenticatedRequest, makeAuthenticatedSingleRequest, createTransformFunction } from '../utils/serviceUtils';

const transformSchoolData = createTransformFunction<SchoolApiResponse, School>((apiSchool) => {
  const roles: string[] = [];
  
  if (apiSchool.is_owner) roles.push('Owner');
  if (apiSchool.is_teacher) roles.push('Teacher');
  if (apiSchool.is_guardian) roles.push('Guardian');

  return {
    id: apiSchool.id,
    name: apiSchool.name,
    logo: apiSchool.logo || '',
    childrenCount: apiSchool.children_count,
    roles: roles as any[]
  };
});

export async function getSchools(): Promise<ApiResponse<School[]>> {
  return makeAuthenticatedRequest<School>('/api/v1/schools', transformSchoolData);
}

export async function getSchool(id: string): Promise<ApiResponse<School>> {
  return makeAuthenticatedSingleRequest<School>(`/api/v1/schools/${id}`, transformSchoolData);
}
