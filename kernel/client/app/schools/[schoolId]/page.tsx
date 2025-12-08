'use client';

import { FC, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaUserGraduate, FaChalkboardTeacher } from 'react-icons/fa';
import Header from '@/core/console/Header';
import Spinner from '@/core/partials/Spinner';
import EmptyState from '@/core/partials/EmptyState';
import Breadcrumb from '@/core/partials/Breadcrumb';
import WardCard from '@/core/partials/WardCard';
import ClassCard from '@/core/partials/ClassCard';
import { SchoolDetails } from '@/core/types/school-details';
import { Ward } from '@/core/types/ward';
import { SchoolClass } from '@/core/types/class';
// import { getSchools } from '@/core/services/schools'; // COMMENTED OUT - Using dummy data instead
// import { getWards } from '@/core/services/wards'; // COMMENTED OUT - Using dummy data instead
// import { getClasses } from '@/core/services/classes'; // COMMENTED OUT - Using dummy data instead
import { getMockSchoolById, getMockWards, getMockClasses } from '@/core/data/mockSchoolData';
import { authStore } from '@/core/auth/store/authStore';

const SchoolViewPage: FC = () => {
  const router = useRouter();
  const params = useParams();
  const schoolId = params.schoolId as string;

  const [school, setSchool] = useState<SchoolDetails | null>(null);
  const [wards, setWards] = useState<Ward[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [wardsLoading, setWardsLoading] = useState(true);
  const [classesLoading, setClassesLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!authStore.isAuthenticated()) {
      router.replace('/');
      return;
    }

    if (schoolId) {
      const fetchSchoolDetails = async () => {
        try {
          // COMMENTED OUT - Original API calls replaced with dummy data
          // const [schoolResponse, wardsResponse, classesResponse] = await Promise.all([
          //   getSchools(),
          //   getWards(schoolId),
          //   getClasses(schoolId)
          // ]);
          // 
          // if (schoolResponse.error) {
          //   setError(schoolResponse.message || schoolResponse.error);
          // } else if (schoolResponse.data) {
          //   const school = schoolResponse.data.find(s => s.id === schoolId);
          //   
          //   if (school) {
          //     const schoolDetails: SchoolDetails = {
          //       id: school.id,
          //       name: school.name,
          //       wards: [],
          //       managedClasses: []
          //     };
          //     setSchool(schoolDetails);
          //   } else {
          //     setError('School not found.');
          //   }
          // } else {
          //   setError('Failed to fetch school data.');
          // }
          //
          // // Handle wards response
          // if (wardsResponse.data) {
          //   setWards(wardsResponse.data);
          // }
          //
          // // Handle classes response
          // if (classesResponse.data) {
          //   setClasses(classesResponse.data);
          // }

          // Using dummy data instead
          const mockSchool = getMockSchoolById(schoolId);
          const mockWards = getMockWards(schoolId);
          const mockClasses = getMockClasses(schoolId);

          if (mockSchool) {
            const schoolDetails: SchoolDetails = {
              id: mockSchool.id,
              name: mockSchool.name,
              wards: [],
              managedClasses: []
            };
            setSchool(schoolDetails);
            setWards(mockWards);
            setClasses(mockClasses);
            setError(undefined);
          } else {
            setError('School not found.');
          }
        } catch (err) { // eslint-disable-line
          setError('Failed to fetch school details.');
        } finally {
          setLoading(false);
          setWardsLoading(false);
          setClassesLoading(false);
        }
      };

      fetchSchoolDetails();
    }
  }, [schoolId, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        ) : error ? (
          <div className="text-center py-20 px-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-red-600">Error</h3>
            <p className="mt-2 text-gray-600">{error}</p>
          </div>
        ) : school && (
          <>
            <Breadcrumb items={[{ label: 'Schools', href: '/schools' }, { label: school.name }]} />

            <div className="mt-8 space-y-12">
              {/* My Wards Section */}
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
                    <FaUserGraduate className="text-[#ed3135] text-lg" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#333]">My Wards</h2>
                    <p className="text-sm text-gray-500 mt-1">Students under your care in this school</p>
                  </div>
                </div>
                
                {wardsLoading ? (
                  <div className="flex justify-center py-20">
                    <Spinner />
                  </div>
                ) : wards.length > 0 ? (
                  <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                    {wards.map(ward => (
                      <WardCard key={ward.id} ward={ward} schoolId={schoolId} />
                    ))}
                  </div>
                ) : (
                  <EmptyState 
                    icon={<FaUserGraduate size={36} className="text-[#ed3135]" />}
                    title="No Wards Found"
                    message="You do not have any wards associated with this school."
                  />
                )}
              </section>

              {/* My Classes Section */}
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
                    <FaChalkboardTeacher className="text-[#ed3135] text-lg" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#333]">My Classes</h2>
                    <p className="text-sm text-gray-500 mt-1">Classes you manage in this school</p>
                  </div>
                </div>
                
                {classesLoading ? (
                  <div className="flex justify-center py-20">
                    <Spinner />
                  </div>
                ) : classes.length > 0 ? (
                  <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {classes.map(schoolClass => (
                      <ClassCard key={schoolClass.id} schoolClass={schoolClass} teacherId="current-user" />
                    ))}
                  </div>
                ) : (
                  <EmptyState 
                    icon={<FaChalkboardTeacher size={36} className="text-[#ed3135]" />}
                    title="No Classes Found"
                    message="No classes are available in this school."
                  />
                )}
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default SchoolViewPage;
