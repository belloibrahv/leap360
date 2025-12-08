"use client";

import { FC } from "react";

interface ResultRow {
  subject: string;
  ca: number;
  exam: number;
  total: number;
  grade: string;
  remark: string;
}

interface Props {
  results: ResultRow[];
}

const ResultsTable: FC<Props> = ({ results }) => {
  if (!results || results.length === 0) {
    return (
      <div className="mt-6 text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-gray-400 mb-2">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No Results Available</h3>
        <p className="text-gray-500">Results will appear here once they are uploaded.</p>
      </div>
    );
  }

  const getGradeColor = (grade: string) => {
    switch (grade.toUpperCase()) {
      case 'A':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'B':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'C':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'D':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'F':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRemarkColor = (remark: string) => {
    const remarkLower = remark.toLowerCase();
    if (remarkLower.includes('excellent') || remarkLower.includes('distinction')) {
      return 'text-green-600';
    } else if (remarkLower.includes('good') || remarkLower.includes('credit')) {
      return 'text-blue-600';
    } else if (remarkLower.includes('pass') || remarkLower.includes('satisfactory')) {
      return 'text-yellow-600';
    } else if (remarkLower.includes('fail') || remarkLower.includes('poor')) {
      return 'text-red-600';
    }
    return 'text-gray-600';
  };

  return (
    <div className="mt-4 sm:mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Subject
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                CA Score
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Exam Score
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Total Score
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Grade
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Remark
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.map((res: ResultRow, idx: number) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{res.subject}</div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center">
                  <span className="text-sm font-semibold text-gray-900">{res.ca}</span>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center">
                  <span className="text-sm font-semibold text-gray-900">{res.exam}</span>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center">
                  <span className="text-sm font-bold text-gray-900">{res.total}</span>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center">
                  <span className={`inline-flex px-2 sm:px-3 py-1 text-xs font-semibold rounded-full border ${getGradeColor(res.grade)}`}>
                    {res.grade}
                  </span>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <span className={`text-xs sm:text-sm font-medium ${getRemarkColor(res.remark)}`}>
                    {res.remark}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Summary Section */}
      <div className="bg-gray-50 px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
          <div className="text-xs sm:text-sm text-gray-600">
            <span className="font-medium">Total Subjects:</span> {results.length}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">
            <span className="font-medium">Average Score:</span> 
            <span className="ml-1 font-semibold text-gray-900">
              {Math.round(results.reduce((sum: number, res: ResultRow) => sum + res.total, 0) / results.length)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsTable;
