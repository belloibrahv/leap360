/**
 * Students API Client
 * 
 * Handles all student-related API operations for the multi-tenant platform.
 */

import { ApiClient } from './apiClient';

export interface Student {
  id: string;
  student_number: string;
  first_name: string;
  last_name: string;
  full_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  enrollment_date: string;
  status: 'active' | 'transferred' | 'graduated' | 'withdrawn' | 'suspended';
  school_id: string;
  class_id?: string;
  age: number;
  created_at: string;
  updated_at: string;
}

export interface StudentsListResponse {
  status: string;
  data: {
    students: Student[];
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

export interface StudentResponse {
  status: string;
  data: Student;
}

export interface CreateStudentRequest {
  student_number: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  enrollment_date: string;
  school_id: string;
  class_id?: string;
  parent_email?: string;
}

export interface UpdateStudentRequest {
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  status?: 'active' | 'transferred' | 'graduated' | 'withdrawn' | 'suspended';
  class_id?: string;
}

/**
 * Students API client
 */
export class StudentsApiClient {
  /**
   * Get list of students
   */
  static async getStudents(params?: {
    page?: number;
    limit?: number;
    school_id?: string;
    class_id?: string;
    status?: string;
    gender?: string;
    search?: string;
  }): Promise<StudentsListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.school_id) queryParams.append('school_id', params.school_id);
    if (params?.class_id) queryParams.append('class_id', params.class_id);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.gender) queryParams.append('gender', params.gender);
    if (params?.search) queryParams.append('search', params.search);
    
    const queryString = queryParams.toString();
    const endpoint = `/api/v1/students${queryString ? `?${queryString}` : ''}`;
    
    return ApiClient.get<StudentsListResponse>(endpoint);
  }

  /**
   * Get a specific student by ID
   */
  static async getStudent(studentId: string): Promise<StudentResponse> {
    return ApiClient.get<StudentResponse>(`/api/v1/students/${studentId}`);
  }

  /**
   * Create a new student
   */
  static async createStudent(studentData: CreateStudentRequest): Promise<StudentResponse> {
    return ApiClient.post<StudentResponse>('/api/v1/students', studentData);
  }

  /**
   * Update a student
   */
  static async updateStudent(studentId: string, studentData: UpdateStudentRequest): Promise<StudentResponse> {
    return ApiClient.put<StudentResponse>(`/api/v1/students/${studentId}`, studentData);
  }

  /**
   * Delete a student (soft delete)
   */
  static async deleteStudent(studentId: string): Promise<{ status: string; message: string }> {
    return ApiClient.delete(`/api/v1/students/${studentId}`);
  }

  /**
   * Create parent-student association
   */
  static async createParentAssociation(
    studentId: string, 
    associationData: {
      parent_email: string;
      relationship_type: 'father' | 'mother' | 'guardian' | 'uncle' | 'aunt' | 'grandparent' | 'other';
      is_primary_contact?: boolean;
      is_emergency_contact?: boolean;
    }
  ): Promise<any> {
    return ApiClient.post(`/api/v1/students/${studentId}/parents`, associationData);
  }
}

/**
 * React hooks for students data
 */
export const useStudents = () => {
  const getStudents = async (params?: Parameters<typeof StudentsApiClient.getStudents>[0]) => {
    try {
      return await StudentsApiClient.getStudents(params);
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  };

  const getStudent = async (studentId: string) => {
    try {
      return await StudentsApiClient.getStudent(studentId);
    } catch (error) {
      console.error('Error fetching student:', error);
      throw error;
    }
  };

  return {
    getStudents,
    getStudent,
    createStudent: StudentsApiClient.createStudent,
    updateStudent: StudentsApiClient.updateStudent,
    deleteStudent: StudentsApiClient.deleteStudent,
    createParentAssociation: StudentsApiClient.createParentAssociation,
  };
};