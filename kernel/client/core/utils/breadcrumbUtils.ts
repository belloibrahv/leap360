// Breadcrumb utility functions for consistent navigation

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

// Generate breadcrumb for school details page
export const generateSchoolBreadcrumb = (schoolName: string): BreadcrumbItem[] => [
  { label: 'Schools', href: '/schools' },
  { label: schoolName }
];

// Generate breadcrumb for parent results page
export const generateParentResultsBreadcrumb = (schoolName: string, schoolId: string): BreadcrumbItem[] => [
  { label: 'Schools', href: '/schools' },
  { label: schoolName, href: `/schools/${schoolId}` },
  { label: 'Results' }
];

// Generate breadcrumb for teacher results page
export const generateTeacherResultsBreadcrumb = (
  schoolName: string, 
  schoolId: string, 
  className: string, 
  classId: string
): BreadcrumbItem[] => [
  { label: 'Schools', href: '/schools' },
  { label: schoolName, href: `/schools/${schoolId}` },
  { label: 'Classes', href: `/schools/${schoolId}` },
  { label: className, href: `/schools/${schoolId}` },
  { label: 'Results' }
];

// Generate breadcrumb for dashboard page
export const generateDashboardBreadcrumb = (): BreadcrumbItem[] => [
  { label: 'Dashboard' }
];

// Generate breadcrumb for teachers page
export const generateTeachersBreadcrumb = (): BreadcrumbItem[] => [
  { label: 'Teachers', href: '/teachers' }
];

// Generate breadcrumb for teacher classes page
export const generateTeacherClassesBreadcrumb = (teacherId: string): BreadcrumbItem[] => [
  { label: 'Teachers', href: '/teachers' },
  { label: 'My Classes', href: `/teachers/${teacherId}/classes` }
];
