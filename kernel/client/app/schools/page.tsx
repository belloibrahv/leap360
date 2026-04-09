'use client';

import { FC, useEffect, useState } from 'react';
import { FaSchool } from 'react-icons/fa';
import Header from '@/core/console/Header';
import Spinner from '@/core/partials/Spinner';
import EmptyState from '@/core/partials/EmptyState';
import Breadcrumb from '@/core/partials/Breadcrumb';
import ProtectedRoute from '@/core/auth/components/ProtectedRoute';
import { SchoolsApiClient, School } from '@/core/services/schoolsApi';

// Updated SchoolCard component to work with real API data
const SchoolCard: FC<{ school: School }> = ({ school }) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
          <FaSchool className="text-[#bc0004] text-xl" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{school.name}</h3>
          <p className="text-sm text-gray-600">Code: {school.code}</p>
        </div>
      </div>
      
      {school.address && (
        <p className="text-sm text-gray-600 mb-2">📍 {school.address}</p>
      )}
      
      {school.phone && (
        <p className="text-sm text-gray-600 mb-2">📞 {school.phone}</p>
      )}
      
      {school.email && (
        <p className="text-sm text-gray-600 mb-4">✉️ {school.email}</p>
      )}
      
      <div className="flex items-center justify-between">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          school.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {school.status}
        </span>
        
        <button 
          onClick={() => window.location.href = `/schools/${school.id}`}
          className="px-4 py-2 bg-[#bc0004] text-white rounded-md hover:bg-red-700 transition-colors text-sm"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

const SchoolsPage: FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      setLoading(true);
      setError(undefined);
      
      const response = await SchoolsApiClient.getSchools();
      setSchools(response.data.schools);
    } catch (err: any) {
      console.error('Failed to load schools:', err);
      setError(err.message || 'Failed to load schools data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
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
              <button 
                onClick={loadSchools}
                className="mt-4 px-4 py-2 bg-[#bc0004] text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : schools.length === 0 ? (
            <EmptyState 
              icon={<FaSchool size={40} className="text-[#bc0004]" />}
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
    </ProtectedRoute>
  );
};

export default SchoolsPage;
