'use client';

import { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSchool } from 'react-icons/fa';
import Header from '@/core/console/Header';
import Spinner from '@/core/partials/Spinner';
import EmptyState from '@/core/partials/EmptyState';
import Breadcrumb from '@/core/partials/Breadcrumb';
import SchoolCard from '@/core/partials/SchoolCard';
import { School } from '@/core/types/school';
// import { getSchools } from '@/core/services/schools'; // COMMENTED OUT - Using dummy data instead
import { getMockSchools } from '@/core/data/mockSchoolData';
import { authStore } from '@/core/auth/store/authStore';

const SchoolsPage: FC = () => {
  const router = useRouter();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!authStore.isAuthenticated()) {
      router.replace('/');
      return;
    }

    loadSchools();
  }, [router]);

  const loadSchools = async () => {
    // COMMENTED OUT - Original API call replaced with dummy data
    // const response = await getSchools();
    // 
    // if (response.error) {
    //   setError(response.error);
    // } else {
    //   setSchools(response.data || []);
    // }
    
    // Using dummy data instead
    try {
      const mockSchools = getMockSchools();
      setSchools(mockSchools);
      setError(undefined);
    } catch (err) {
      setError('Failed to load schools data');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Breadcrumb items={[{ label: 'Schools' }]} />

        <div className="mt-8 mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-[#333] tracking-tight">Your Associated Schools</h1>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500">
            Select a school to view details and manage your activities.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        ) : error ? (
          <div className="text-center py-20 px-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-red-600">Failed to load schools</h3>
            <p className="mt-2 text-gray-600">{error}</p>
          </div>
        ) : schools.length === 0 ? (
          <EmptyState 
            icon={<FaSchool size={40} className="text-[#ed3135]" />}
            title="No Schools Found"
            message="It looks like you're not yet associated with a school. Please contact your school's administration to be added to their portal."
          />
        ) : (
          <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {schools.map(school => (
              <SchoolCard key={school.id} school={school} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SchoolsPage;
