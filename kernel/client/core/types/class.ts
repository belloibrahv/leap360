// Types for class data from the API

// Backend API response interface for individual class
export interface ClassApiResponse {
  id: string;
  name: string;
  students_count: number;
}

// Backend API response interface for classes list
export interface ClassesApiResponse {
  data: ClassApiResponse[];
  warnings: string[];
  failures: string[];
}

// Frontend interface for class data
export interface SchoolClass {
  id: string;
  name: string;
  studentsCount: number;
}

// Note: Using ClassesApiResponse directly for consistency with backend
