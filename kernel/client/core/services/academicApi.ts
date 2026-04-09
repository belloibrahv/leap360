/**
 * Academic Management API Client
 * 
 * Handles all academic-related API operations for the multi-tenant platform.
 */

import { ApiClient } from './apiClient';

// Academic Session Types
export interface AcademicSession {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'archived' | 'draft';
  school_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAcademicSessionRequest {
  name: string;
  start_date: string;
  end_date: string;
  status?: 'active' | 'completed' | 'archived' | 'draft';
  school_id: string;
}

// Subject Types
export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  credit_hours?: number;
  school_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSubjectRequest {
  name: string;
  code: string;
  description?: string;
  credit_hours?: number;
  school_id: string;
}

// Assessment Types
export interface Assessment {
  id: string;
  title: string;
  description?: string;
  assessment_type: 'exam' | 'test' | 'quiz' | 'assignment' | 'project' | 'participation' | 'homework' | 'lab' | 'presentation' | 'other';
  max_score: number;
  weight: number;
  due_date?: string;
  class_id: string;
  subject_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAssessmentRequest {
  title: string;
  description?: string;
  assessment_type: 'exam' | 'test' | 'quiz' | 'assignment' | 'project' | 'participation' | 'homework' | 'lab' | 'presentation' | 'other';
  max_score: number;
  weight?: number;
  due_date?: string;
  class_id: string;
  subject_id: string;
}

// Grade Types
export interface Grade {
  id: string;
  score: number;
  comments?: string;
  graded_at: string;
  student_id: string;
  assessment_id: string;
  graded_by: string;
  percentage: number;
  created_at: string;
  updated_at: string;
}

export interface CreateGradeRequest {
  score: number;
  comments?: string;
  graded_at?: string;
  student_id: string;
  assessment_id: string;
}

export interface BulkGradeEntry {
  student_id: string;
  score: number;
}

export interface BulkGradeRequest {
  assessment_id: string;
  grades: BulkGradeEntry[];
}

// Attendance Types
export interface Attendance {
  id: string;
  attendance_date: string;
  status: 'present' | 'absent' | 'late' | 'excused' | 'sick' | 'suspended';
  notes?: string;
  student_id: string;
  class_id: string;
  recorded_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAttendanceRequest {
  attendance_date: string;
  status: 'present' | 'absent' | 'late' | 'excused' | 'sick' | 'suspended';
  notes?: string;
  student_id: string;
  class_id: string;
}

export interface BulkAttendanceEntry {
  student_id: string;
  status: 'present' | 'absent' | 'late' | 'excused' | 'sick' | 'suspended';
  notes?: string;
}

export interface BulkAttendanceRequest {
  class_id: string;
  attendance_date: string;
  attendance_records: BulkAttendanceEntry[];
}

// API Response Types
export interface AcademicSessionResponse {
  status: string;
  data: AcademicSession;
}

export interface AcademicSessionsListResponse {
  status: string;
  data: {
    sessions: AcademicSession[];
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

export interface SubjectResponse {
  status: string;
  data: Subject;
}

export interface SubjectsListResponse {
  status: string;
  data: {
    subjects: Subject[];
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

export interface AssessmentResponse {
  status: string;
  data: Assessment;
}

export interface AssessmentsListResponse {
  status: string;
  data: {
    assessments: Assessment[];
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

export interface GradeResponse {
  status: string;
  data: Grade;
}

export interface AttendanceResponse {
  status: string;
  data: Attendance;
}

/**
 * Academic Management API client
 */
export class AcademicApiClient {
  // Academic Session Methods
  static async getAcademicSessions(params?: {
    page?: number;
    limit?: number;
    school_id?: string;
  }): Promise<AcademicSessionsListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.school_id) queryParams.append('school_id', params.school_id);
    
    const queryString = queryParams.toString();
    const endpoint = `/api/v1/academic/sessions${queryString ? `?${queryString}` : ''}`;
    
    return ApiClient.get<AcademicSessionsListResponse>(endpoint);
  }

  static async createAcademicSession(sessionData: CreateAcademicSessionRequest): Promise<AcademicSessionResponse> {
    return ApiClient.post<AcademicSessionResponse>('/api/v1/academic/sessions', sessionData);
  }

  // Subject Methods
  static async getSubjects(params?: {
    page?: number;
    limit?: number;
    school_id?: string;
  }): Promise<SubjectsListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.school_id) queryParams.append('school_id', params.school_id);
    
    const queryString = queryParams.toString();
    const endpoint = `/api/v1/academic/subjects${queryString ? `?${queryString}` : ''}`;
    
    return ApiClient.get<SubjectsListResponse>(endpoint);
  }

  static async createSubject(subjectData: CreateSubjectRequest): Promise<SubjectResponse> {
    return ApiClient.post<SubjectResponse>('/api/v1/academic/subjects', subjectData);
  }

  // Assessment Methods
  static async getAssessments(params?: {
    page?: number;
    limit?: number;
    class_id?: string;
    subject_id?: string;
    assessment_type?: string;
  }): Promise<AssessmentsListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.class_id) queryParams.append('class_id', params.class_id);
    if (params?.subject_id) queryParams.append('subject_id', params.subject_id);
    if (params?.assessment_type) queryParams.append('assessment_type', params.assessment_type);
    
    const queryString = queryParams.toString();
    const endpoint = `/api/v1/academic/assessments${queryString ? `?${queryString}` : ''}`;
    
    return ApiClient.get<AssessmentsListResponse>(endpoint);
  }

  static async createAssessment(assessmentData: CreateAssessmentRequest): Promise<AssessmentResponse> {
    return ApiClient.post<AssessmentResponse>('/api/v1/academic/assessments', assessmentData);
  }

  // Grade Methods
  static async createGrade(gradeData: CreateGradeRequest): Promise<GradeResponse> {
    return ApiClient.post<GradeResponse>('/api/v1/academic/grades', gradeData);
  }

  static async createBulkGrades(bulkData: BulkGradeRequest): Promise<any> {
    return ApiClient.post('/api/v1/academic/grades/bulk', bulkData);
  }

  // Attendance Methods
  static async createAttendance(attendanceData: CreateAttendanceRequest): Promise<AttendanceResponse> {
    return ApiClient.post<AttendanceResponse>('/api/v1/academic/attendance', attendanceData);
  }

  static async createBulkAttendance(bulkData: BulkAttendanceRequest): Promise<any> {
    return ApiClient.post('/api/v1/academic/attendance/bulk', bulkData);
  }

  // Migration Methods (for setup)
  static async createAcademicTables(): Promise<any> {
    return ApiClient.post('/api/v1/migration/academic-tables');
  }

  static async createAcademicDemoData(): Promise<any> {
    return ApiClient.post('/api/v1/migration/academic-demo-data');
  }
}

/**
 * React hooks for academic data
 */
export const useAcademic = () => {
  const getAcademicSessions = async (params?: Parameters<typeof AcademicApiClient.getAcademicSessions>[0]) => {
    try {
      return await AcademicApiClient.getAcademicSessions(params);
    } catch (error) {
      console.error('Error fetching academic sessions:', error);
      throw error;
    }
  };

  const getSubjects = async (params?: Parameters<typeof AcademicApiClient.getSubjects>[0]) => {
    try {
      return await AcademicApiClient.getSubjects(params);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      throw error;
    }
  };

  const getAssessments = async (params?: Parameters<typeof AcademicApiClient.getAssessments>[0]) => {
    try {
      return await AcademicApiClient.getAssessments(params);
    } catch (error) {
      console.error('Error fetching assessments:', error);
      throw error;
    }
  };

  return {
    // Academic Sessions
    getAcademicSessions,
    createAcademicSession: AcademicApiClient.createAcademicSession,
    
    // Subjects
    getSubjects,
    createSubject: AcademicApiClient.createSubject,
    
    // Assessments
    getAssessments,
    createAssessment: AcademicApiClient.createAssessment,
    
    // Grades
    createGrade: AcademicApiClient.createGrade,
    createBulkGrades: AcademicApiClient.createBulkGrades,
    
    // Attendance
    createAttendance: AcademicApiClient.createAttendance,
    createBulkAttendance: AcademicApiClient.createBulkAttendance,
    
    // Migration
    createAcademicTables: AcademicApiClient.createAcademicTables,
    createAcademicDemoData: AcademicApiClient.createAcademicDemoData,
  };
};