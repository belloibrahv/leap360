/**
 * Schools API Client
 * 
 * Handles all school-related API operations for the multi-tenant platform.
 */

import { ApiClient } from './apiClient';

export interface School {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  status: string;
  principal_id?: string;
  created_at: string;
  updated_at: string;
}

export interface SchoolsListResponse {
  status: string;
  data: {
    schools: School[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
  };
}

export interface SchoolResponse {
  status: string;
  data: School;
}

export interface CreateSchoolRequest {
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  principal_email?: string;
}

export interface UpdateSchoolRequest {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  status?: string;
  principal_email?: string;
}

/**
 * Schools API client
 */
export class SchoolsApiClient {
  /**
   * Get list of schools
   */
  static async getSchools(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<SchoolsListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    
    const queryString = queryParams.toString();
    const endpoint = `/api/v1/schools${queryString ? `?${queryString}` : ''}`;
    
    return ApiClient.get<SchoolsListResponse>(endpoint);
  }

  /**
   * Get a specific school by ID
   */
  static async getSchool(schoolId: string): Promise<SchoolResponse> {
    return ApiClient.get<SchoolResponse>(`/api/v1/schools/${schoolId}`);
  }

  /**
   * Create a new school
   */
  static async createSchool(schoolData: CreateSchoolRequest): Promise<SchoolResponse> {
    return ApiClient.post<SchoolResponse>('/api/v1/schools', schoolData);
  }

  /**
   * Update a school
   */
  static async updateSchool(schoolId: string, schoolData: UpdateSchoolRequest): Promise<SchoolResponse> {
    return ApiClient.put<SchoolResponse>(`/api/v1/schools/${schoolId}`, schoolData);
  }

  /**
   * Delete a school (soft delete)
   */
  static async deleteSchool(schoolId: string): Promise<{ status: string; message: string }> {
    return ApiClient.delete(`/api/v1/schools/${schoolId}`);
  }

  /**
   * Get classes for a specific school
   */
  static async getSchoolClasses(schoolId: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/api/v1/schools/${schoolId}/classes${queryString ? `?${queryString}` : ''}`;
    
    return ApiClient.get(endpoint);
  }
}

/**
 * React hooks for schools data
 */
export const useSchools = () => {
  // This would typically use React Query or SWR for caching and state management
  // For now, we'll implement basic functionality
  
  const getSchools = async (params?: Parameters<typeof SchoolsApiClient.getSchools>[0]) => {
    try {
      return await SchoolsApiClient.getSchools(params);
    } catch (error) {
      console.error('Error fetching schools:', error);
      throw error;
    }
  };

  const getSchool = async (schoolId: string) => {
    try {
      return await SchoolsApiClient.getSchool(schoolId);
    } catch (error) {
      console.error('Error fetching school:', error);
      throw error;
    }
  };

  return {
    getSchools,
    getSchool,
    createSchool: SchoolsApiClient.createSchool,
    updateSchool: SchoolsApiClient.updateSchool,
    deleteSchool: SchoolsApiClient.deleteSchool,
    getSchoolClasses: SchoolsApiClient.getSchoolClasses,
  };
};