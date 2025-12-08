// Static mapping of school names to their images
// This mapping is used when the backend doesn't provide logo URLs

export const schoolImageMapping: Record<string, string> = {
  'Queens College, Yaba': '/mock-schools/school5.png',
  'Baptist Academy, Obanikoro': '/mock-schools/school4.jpg',
  'Ikeja Senior High School, Ikeja': '/mock-schools/school2.jpg',
  'Lagos State Model College, Badore': '/mock-schools/school3.jpg',
  'Ajumoni Secondary School, Mushin': '/mock-schools/school1.jpg',
};

// Generic school logo fallback
export const GENERIC_SCHOOL_LOGO = '/images/generic-school-logo.svg';

// Function to get school image with fallback logic
export function getSchoolImage(schoolName: string, backendLogo?: string): string {
  // 1. Use backend logo if provided and not empty
  if (backendLogo && backendLogo.trim() !== '' && backendLogo !== 'null') {
    return backendLogo;
  }
  
  // 2. Check static mapping by exact name
  if (schoolImageMapping[schoolName]) {
    return schoolImageMapping[schoolName];
  }
  
  // 3. Check static mapping by partial name match (case insensitive)
  const lowerSchoolName = schoolName.toLowerCase();
  for (const [mappedName, imagePath] of Object.entries(schoolImageMapping)) {
    if (lowerSchoolName.includes(mappedName.toLowerCase()) || 
        mappedName.toLowerCase().includes(lowerSchoolName)) {
      return imagePath;
    }
  }
  
  // 4. Use generic school logo as final fallback
  return GENERIC_SCHOOL_LOGO;
}
