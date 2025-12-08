import { School } from '@/core/types/school';
import { Ward } from '@/core/types/ward';
import { SchoolClass } from '@/core/types/class';

export const mockSchools: School[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Queens College, Yaba',
    logo: '/mock-schools/school5.png',
    childrenCount: 3,
    roles: ['Guardian']
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002', 
    name: 'Baptist Academy, Obanikoro',
    logo: '/mock-schools/school4.jpg',
    childrenCount: 2,
    roles: ['Teacher', 'Guardian']
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Ikeja Senior High School, Ikeja', 
    logo: '/mock-schools/school2.jpg',
    childrenCount: 1,
    roles: ['Owner', 'Teacher']
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    name: 'Lagos State Model College, Badore',
    logo: '/mock-schools/school3.jpg', 
    childrenCount: 4,
    roles: ['Guardian']
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    name: 'Ajumoni Secondary School, Mushin',
    logo: '/mock-schools/school1.jpg',
    childrenCount: 2,
    roles: ['Teacher']
  }
];

export const mockWards: Record<string, Ward[]> = {
  '550e8400-e29b-41d4-a716-446655440001': [
    {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      name: 'Aisha Bello',
      className: 'SS1',
      relationship: 'mother'
    },
    {
      id: 'b2c3d4e5-f6g7-8901-bcde-f23456789012', 
      name: 'Fatima Bello',
      className: 'SS2',
      relationship: 'mother'
    },
    {
      id: 'c3d4e5f6-g7h8-9012-cdef-345678901234',
      name: 'Ahmed Bello', 
      className: 'SS3',
      relationship: 'father'
    }
  ],
  '550e8400-e29b-41d4-a716-446655440002': [
    {
      id: 'd4e5f6g7-h8i9-0123-defg-456789012345',
      name: 'Tunde Okoro',
      className: 'SS1', 
      relationship: 'father'
    },
    {
      id: 'e5f6g7h8-i9j0-1234-efgh-567890123456',
      name: 'Blessing Okoro',
      className: 'SS3',
      relationship: 'mother'
    }
  ],
  '550e8400-e29b-41d4-a716-446655440003': [
    {
      id: 'f6g7h8i9-j0k1-2345-fghi-678901234567',
      name: 'Chinedu Nwosu',
      className: 'SS2',
      relationship: 'father'
    }
  ],
  '550e8400-e29b-41d4-a716-446655440004': [
    {
      id: 'g7h8i9j0-k1l2-3456-ghij-789012345678',
      name: 'Kemi Adebayo',
      className: 'SS1',
      relationship: 'mother'
    },
    {
      id: 'h8i9j0k1-l2m3-4567-hijk-890123456789', 
      name: 'Segun Adebayo', 
      className: 'SS2',
      relationship: 'father'
    },
    {
      id: 'i9j0k1l2-m3n4-5678-ijkl-901234567890',
      name: 'Funmi Adebayo',
      className: 'SS3',
      relationship: 'mother'
    },
    {
      id: 'j0k1l2m3-n4o5-6789-jklm-012345678901',
      name: 'Bola Adebayo',
      className: 'SS1',
      relationship: 'mother'
    }
  ],
  '550e8400-e29b-41d4-a716-446655440005': [
    {
      id: 'k1l2m3n4-o5p6-7890-klmn-123456789012',
      name: 'Emeka Okafor',
      className: 'SS2',
      relationship: 'father'
    },
    {
      id: 'l2m3n4o5-p6q7-8901-lmno-234567890123',
      name: 'Ngozi Okafor',
      className: 'SS3', 
      relationship: 'mother'
    }
  ]
};

export const mockClasses: Record<string, SchoolClass[]> = {
  '550e8400-e29b-41d4-a716-446655440001': [
    {
      id: 'm1n2o3p4-q5r6-7890-mnop-345678901234',
      name: 'SS1',
      studentsCount: 25
    },
    {
      id: 'n2o3p4q5-r6s7-8901-nopq-456789012345',
      name: 'SS2', 
      studentsCount: 28
    },
    {
      id: 'o3p4q5r6-s7t8-9012-opqr-567890123456',
      name: 'SS3',
      studentsCount: 22
    }
  ],
  '550e8400-e29b-41d4-a716-446655440002': [
    {
      id: 'p4q5r6s7-t8u9-0123-pqrs-678901234567',
      name: 'SS1',
      studentsCount: 30
    },
    {
      id: 'q5r6s7t8-u9v0-1234-qrst-789012345678',
      name: 'SS2',
      studentsCount: 27
    },
    {
      id: 'r6s7t8u9-v0w1-2345-rstu-890123456789',
      name: 'SS3',
      studentsCount: 24
    }
  ],
  '550e8400-e29b-41d4-a716-446655440003': [
    {
      id: 's7t8u9v0-w1x2-3456-stuv-901234567890',
      name: 'SS1',
      studentsCount: 20
    },
    {
      id: 't8u9v0w1-x2y3-4567-tuvw-012345678901',
      name: 'SS2',
      studentsCount: 23
    },
    {
      id: 'u9v0w1x2-y3z4-5678-uvwx-123456789012',
      name: 'SS3',
      studentsCount: 19
    }
  ],
  '550e8400-e29b-41d4-a716-446655440004': [
    {
      id: 'v0w1x2y3-z4a5-6789-vwxy-234567890123',
      name: 'SS1',
      studentsCount: 35
    },
    {
      id: 'w1x2y3z4-a5b6-7890-wxyz-345678901234',
      name: 'SS2',
      studentsCount: 32
    },
    {
      id: 'x2y3z4a5-b6c7-8901-xyza-456789012345',
      name: 'SS3',
      studentsCount: 29
    }
  ],
  '550e8400-e29b-41d4-a716-446655440005': [
    {
      id: 'y3z4a5b6-c7d8-9012-yzab-567890123456',
      name: 'SS1',
      studentsCount: 18
    },
    {
      id: 'z4a5b6c7-d8e9-0123-zabc-678901234567',
      name: 'SS2',
      studentsCount: 21
    },
    {
      id: 'a5b6c7d8-e9f0-1234-abcd-789012345678',
      name: 'SS3',
      studentsCount: 16
    }
  ]
};

export function getMockSchools(): School[] {
  return mockSchools;
}

export function getMockWards(schoolId: string): Ward[] {
  return mockWards[schoolId] || [];
}

export function getMockClasses(schoolId: string): SchoolClass[] {
  return mockClasses[schoolId] || [];
}

export function getMockSchoolById(schoolId: string): School | undefined {
  return mockSchools.find(school => school.id === schoolId);
}
