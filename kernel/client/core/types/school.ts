export type MembershipRole = 'Owner' | 'Teacher' | 'Guardian';

// Backend API response interface
export interface SchoolApiResponse {
  id: string;
  name: string;
  logo?: string; // Optional since backend might not always provide logo
  children_count: number;
  is_owner: boolean;
  is_teacher: boolean;
  is_guardian: boolean;
}

// Frontend interface for display
export interface School {
  id: string;
  name: string;
  logo: string; // Always string on frontend (empty string if no logo)
  childrenCount: number;
  roles: MembershipRole[];
}
