"use client";

import React, { FC, useState, useEffect } from "react";
import Header from "@/core/console/Header";
import Spinner from "@/core/partials/Spinner";
import ResultsTable from "@/core/console/ResultsTable";
import Breadcrumb from "@/core/partials/Breadcrumb";
import ProtectedRoute from "@/core/auth/components/ProtectedRoute";
import { mockResultsByStudent } from "@/core/data/resultData";
import { generateParentResultsBreadcrumb } from "@/core/utils/breadcrumbUtils";
// import { getSchools } from "@/core/services/schools"; // COMMENTED OUT - Using dummy data instead
// import { getWards } from "@/core/services/wards"; // COMMENTED OUT - Using dummy data instead
import { getMockSchoolById, getMockWards } from "@/core/data/mockSchoolData";
import { Ward } from "@/core/types/ward";

interface ResultsPageProps {
  params: Promise<{ schoolId: string }>;
}

const ResultsPage: FC<ResultsPageProps> = ({ params }) => {
  const [schoolId, setSchoolId] = useState<string>('');

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setSchoolId(resolvedParams.schoolId);
    };
    getParams();
  }, [params]);

  const [loading] = useState(false);
  const [students, setStudents] = useState<Ward[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Ward | null>(null);
  const [studentAllResults, setStudentAllResults] = useState<any[]>([]); // eslint-disable-line
  const [studentResults, setStudentResults] = useState<any[]>([]); // eslint-disable-line
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedTerm, setSelectedTerm] = useState<string>("");
  const [schoolName, setSchoolName] = useState<string>("School");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!schoolId) return;

        const mockSchool = getMockSchoolById(schoolId);
        const mockWards = getMockWards(schoolId);

        if (mockSchool) {
          setSchoolName(mockSchool.name);
        }
        
        setStudents(mockWards);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, [schoolId]);

  const handleStudentSelect = (student: Ward) => {
    setSelectedStudent(student);

    const results = mockResultsByStudent[student.id] || [];
    setStudentAllResults(results);

    if (results.length > 0) {
      const latestResult = results[results.length - 1];
      setStudentResults(latestResult.results);
      setSelectedClass(latestResult.class);
      setSelectedTerm(latestResult.term);
    } else {
      setStudentResults([]);
      setSelectedClass("");
      setSelectedTerm("");
    }
  };

  const handleFilterChange = (newClass: string, newTerm: string) => {
    setSelectedClass(newClass);
    setSelectedTerm(newTerm);

    const match = studentAllResults.find(
      (res) => res.class === newClass && res.term === newTerm
    );

    if (match) {
      setStudentResults(match.results);
    } else {
      setStudentResults([]);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />

        <main className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Hidden on mobile, shown on desktop */}
        <aside className="hidden lg:flex lg:w-80 bg-white border-r border-gray-200 shadow-sm flex-col">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-red-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center bg-red-100 rounded-lg">
                <svg className="w-5 h-5 text-[#ed3135]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">My Wards</h2>
                <p className="text-sm text-gray-600">Select a student to view results</p>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">No students found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {students.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => handleStudentSelect(student)}
                    className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                      selectedStudent?.id === student.id
                        ? "bg-red-50 border-red-200 shadow-sm ring-2 ring-red-100"
                        : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        selectedStudent?.id === student.id
                          ? "bg-red-100 text-[#ed3135]"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        <span className="text-sm font-semibold">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-medium truncate ${
                          selectedStudent?.id === student.id ? "text-red-900" : "text-gray-900"
                        }`}>
                          {student.name}
                        </h3>
                        <p className={`text-sm truncate ${
                          selectedStudent?.id === student.id ? "text-red-700" : "text-gray-500"
                        }`}>
                          {student.className} • {student.relationship}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Right Content */}
        <section className="flex-1 flex flex-col overflow-hidden">
          {/* Breadcrumb */}
          <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 shadow-sm">
            <Breadcrumb items={generateParentResultsBreadcrumb(schoolName, schoolId)} />
          </div>

          {/* Mobile Student Selector - Only shown on mobile */}
          <div className="lg:hidden bg-white border-b border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 flex items-center justify-center bg-red-100 rounded-lg">
                <svg className="w-4 h-4 text-[#ed3135]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800">Select Student</h3>
            </div>
            {students.length > 0 ? (
              <select
                value={selectedStudent?.id || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const student = students.find(s => s.id === e.target.value);
                  if (student) handleStudentSelect(student);
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Choose a student...</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} - {student.className}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-gray-500 text-sm">No students found</p>
            )}
          </div>
          
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
            {!selectedStudent ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Student</h3>
                  <p className="text-gray-500">Choose a student from the sidebar to view their academic results</p>
                </div>
              </div>
            ) : (
              <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
                {/* Student Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg sm:text-xl font-bold text-[#ed3135]">
                        {selectedStudent.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{selectedStudent.name}</h2>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                        <span className="text-sm text-gray-600">
                          <span className="font-medium">Class:</span> {selectedStudent.className}
                        </span>
                        <span className="text-sm text-gray-600">
                          <span className="font-medium">Relationship:</span> {selectedStudent.relationship}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filter Controls */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter Results</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Academic Term
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors text-sm sm:text-base"
                        value={selectedTerm}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange(selectedClass, e.target.value)}
                      >
                        <option value="">Select Term</option>
                        <option value="First Term">First Term</option>
                        <option value="Second Term">Second Term</option>
                        <option value="Third Term">Third Term</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Class Level
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors text-sm sm:text-base"
                        value={selectedClass}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange(e.target.value, selectedTerm)}
                      >
                        <option value="">Select Class</option>
                        <option value="SS1">SS1</option>
                        <option value="SS2">SS2</option>
                        <option value="SS3">SS3</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Results Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-[#ed3135]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Academic Results</h3>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">
                        {selectedTerm ? `${selectedTerm} Results` : 'Select a term to view results'}
                      </p>
                    </div>
                  </div>

                  <ResultsTable results={studentResults} />
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
    </ProtectedRoute>
  );
};

export default ResultsPage;
