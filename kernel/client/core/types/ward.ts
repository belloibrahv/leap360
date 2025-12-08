// Types for ward/student data from the API

export type RelationshipType = 'father' | 'guardian' | 'mother' | 'other';

// Backend API response interface for individual ward
export interface WardApiResponse {
  id: string;
  name: string;
  class_name: string;
  relationship: RelationshipType;
}

// Backend API response interface for wards list
export interface WardsApiResponse {
  data: WardApiResponse[];
  warnings: string[];
  failures: string[];
}

// Frontend interface for ward/student data
export interface Ward {
  id: string;
  name: string;
  className: string;
  relationship: RelationshipType;
}

// Note: Using WardsApiResponse directly for consistency with backend