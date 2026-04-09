'use client';

import { FC, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FaUserGraduate, FaChalkboardTeacher } from 'react-icons/fa';
import Header from '@/core/console/Header';
import Spinner from '@/core/partials/Spinner';
import EmptyState from '@/core/partials/EmptyState';
import Breadcrumb from '@/core/partials/Breadcrumb';
import ProtectedRoute from '@/core/auth/components/ProtectedRoute';
import { SchoolsApiClient, School } from '@/core/services/schoolsApi';
import { StudentsApiClient, Student } from '@/core/services/studentsApi';

const SchoolViewPage: FC = () => {
  const params = useParams();
  const schoolId = params.schoolId as string;

  const [school, setSchool] = useState<School | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (schoolId) {
      const fetchSchoolDetails = async () => {
        try {
          setLoading(true);
          setError(undefined);

          // Fetch school details
          const schoolResponse = await SchoolsApiClient.getSchool(schoolId);
          setSchool(schoolResponse.data);

          // Fetch students for this school
          setStudentsLoading(true);
          const studentsResponse = await StudentsApiClient.getStudents({
            school_id: schoolId,
            limit: 50 // Get first 50 students
          });
          setStudents(studentsResponse.data.students);

        } catch (err: unknown) {
          console.error('Failed to fetch school details:', err);
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch school details';
          setError(errorMessage);
        } finally {
          setLoading(false);
          setStudentsLoading(false);
        }
      };

      fetchSchoolDetails();
    }
  }, [schoolId]);

  return (
    <ProtectedRoute>
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
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-[#ed3135] text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : school && (
            <>
              <Breadcrumb items={[{ label: 'Schools', href: '/schools' }, { label: school.name }]} />

              <div className="mt-8 mb-8">
                <h1 className="text-4xl font-extrabold text-[#333] tracking-tight">{school.name}</h1>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">School Code</h3>
                    <p className="text-lg font-semibold text-gray-900">{school.code}</p>
                  </div>
                  {school.address && (
                    <div className="bg-white p-4 rounded-lg shadow">
                      <h3 className="text-sm font-medium text-gray-500">Address</h3>
                      <p className="text-lg font-semibold text-gray-900">{school.address}</p>
                    </div>
                  )}
                  {school.phone && (
                    <div className="bg-white p-4 rounded-lg shadow">
                      <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                      <p className="text-lg font-semibold text-gray-900">{school.phone}</p>
                    </div>
                  )}
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${
                      school.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {school.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-12">
                {/* Students Section */}
                <section>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
                      <FaUserGraduate className="text-[#ed3135] text-lg" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-[#333]">Students</h2>
                      <p className="text-sm text-gray-500 mt-1">Students enrolled in this school</p>
                    </div>
                  </div>
                  
                  {studentsLoading ? (
                    <div className="flex justify-center py-20">
                      <Spinner />
                    </div>
                  ) : students.length > 0 ? (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Student List ({students.length} students)
                        </h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Student
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Student Number
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Age
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {students.slice(0, 10).map((student) => (
                              <tr key={student.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                        <span className="text-sm font-medium text-blue-800">
                                          {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">
                                        {student.full_name}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        Born: {new Date(student.date_of_birth).toLocaleDateString()}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {student.student_number}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {student.age} years
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    student.status === 'active' 
                                      ? 'bg-green-100 text-green-800' 
                                      : student.status === 'transferred'
                                      ? 'bg-blue-100 text-blue-800'
                                      : student.status === 'graduated'
                                      ? 'bg-purple-100 text-purple-800'
                                      : student.status === 'withdrawn'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {student.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {students.length > 10 && (
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                          <p className="text-sm text-gray-600">
                            Showing first 10 of {students.length} students.{' '}
                            <a 
                              href="/students" 
                              className="text-[#ed3135] hover:text-red-700 font-medium"
                            >
                              View all students
                            </a>
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <EmptyState 
                      icon={<FaUserGraduate size={36} className="text-[#ed3135]" />}
                      title="No Students Found"
                      message="No students are enrolled in this school yet."
                    />
                  )}
                </section>

                {/* Quick Actions Section */}
                <section>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
                      <FaChalkboardTeacher className="text-[#ed3135] text-lg" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-[#333]">Quick Actions</h2>
                      <p className="text-sm text-gray-500 mt-1">Common tasks for this school</p>
                    </div>
                  </div>
                  
                  <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Students</h3>
                      <p className="text-sm text-gray-600 mb-4">View, add, and manage student information</p>
                      <button 
                        onClick={() => window.location.href = '/students'}
                        className="px-4 py-2 bg-[#ed3135] text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                      >
                        Go to Students
                      </button>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Academic Management</h3>
                      <p className="text-sm text-gray-600 mb-4">Manage grades, attendance, and assessments</p>
                      <button 
                        className="px-4 py-2 bg-gray-300 text-gray-600 rounded-md cursor-not-allowed text-sm"
                        disabled
                      >
                        Coming Soon
                      </button>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Reports</h3>
                      <p className="text-sm text-gray-600 mb-4">Generate academic and administrative reports</p>
                      <button 
                        className="px-4 py-2 bg-gray-300 text-gray-600 rounded-md cursor-not-allowed text-sm"
                        disabled
                      >
                        Coming Soon
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default SchoolViewPage;
