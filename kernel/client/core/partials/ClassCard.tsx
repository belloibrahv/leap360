"use client";

import { FC } from "react";
import { FaUsers, FaChalkboardTeacher, FaArrowRight } from "react-icons/fa";
import { SchoolClass } from "../types/class";
import { useRouter } from "next/navigation";

interface ClassCardProps {
  schoolClass: SchoolClass;
  teacherId: string;
}

const ClassCard: FC<ClassCardProps> = ({ schoolClass, teacherId }) => {
  const router = useRouter();

  const handleViewClass = () => {
    router.push(`/teachers/${teacherId}/classes/${schoolClass.id}/results`);
  };

  return (
    <div className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      {/* Header Section */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h4 className="text-xl font-bold text-[#333] truncate group-hover:text-[#ed3135] transition-colors">
            {schoolClass.name}
          </h4>
        </div>

        {/* Class Icon */}
        <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 ml-3">
          <FaChalkboardTeacher className="text-[#ed3135] text-lg" />
        </div>
      </div>

      {/* Info Section */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center bg-red-50 rounded-full">
            <FaUsers className="text-[#ed3135] text-sm" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Students</p>
            <p className="text-lg font-bold text-[#333]">{schoolClass.studentsCount}</p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-4 border-t border-gray-100">
        <button
          onClick={handleViewClass}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-[#333] hover:bg-[#ed3135] rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
        >
          View Class
          <FaArrowRight className="text-xs transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};

export default ClassCard;
