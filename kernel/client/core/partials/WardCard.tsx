import { FC } from 'react';
import { useRouter } from 'next/navigation';
import { Ward } from '../types/ward';
import { FaUserGraduate, FaArrowRight } from 'react-icons/fa';

interface WardCardProps {
  ward: Ward;
  schoolId: string;
}

const WardCard: FC<WardCardProps> = ({ ward, schoolId }) => {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/schools/${schoolId}/results`);
  };

  const getRelationshipColor = (relationship: string) => {
    switch (relationship) {
      case 'father':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'guardian':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'mother':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getRelationshipLabel = (relationship: string) => {
    switch (relationship) {
      case 'father':
        return 'Father';
      case 'guardian':
        return 'Guardian';
      case 'mother':
        return 'Mother';
      default:
        return 'Other';
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between h-full cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    >
      <div>
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200 flex-shrink-0">
            <FaUserGraduate className="text-[#ed3135] text-xl" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-800 truncate group-hover:text-[#ed3135]">
              {ward.name}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {ward.className}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getRelationshipColor(ward.relationship)}`}>
            {getRelationshipLabel(ward.relationship)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-end mt-auto pt-4 border-t border-gray-100">
        <div className="flex items-center text-sm font-semibold text-[#a19c9c] group-hover:text-[#ed3135]">
          View Results
          <FaArrowRight className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </div>
  );
};

export default WardCard;