import { FC } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { School } from '../types/school';
import { FaArrowRight } from 'react-icons/fa';
import { getSchoolImage } from '../data/schoolImageMapping';

interface SchoolCardProps {
  school: School;
}

const SchoolCard: FC<SchoolCardProps> = ({ school }) => {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/schools/${school.id}`);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const schoolImageUrl = getSchoolImage(school.name, school.logo);
  
  const hasValidImage = schoolImageUrl && 
    schoolImageUrl !== '/images/generic-school-logo.svg' && 
    schoolImageUrl.trim() !== '';

  return (
    <div 
      onClick={handleCardClick}
      className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between h-full cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    >
      <div>
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 relative flex-shrink-0">
            {hasValidImage ? (
              <Image
                fill
                src={schoolImageUrl}
                alt={school.name}
                className="rounded-lg object-cover border border-gray-100"
                onError={(e) => {
                  e.currentTarget.src = '/images/generic-school-logo.svg';
                }}
              />
            ) : (
              <Image
                fill
                src="/images/generic-school-logo.svg"
                alt={`${school.name} - Generic School Logo`}
                className="rounded-lg object-cover border border-gray-100"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            )}
            <div className="hidden w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200 shadow-sm">
              <span className="text-xl font-bold text-[#ed3135]">
                {getInitials(school.name)}
              </span>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-800 truncate group-hover:text-[#ed3135]">
              {school.name}
            </h3>
            
            {school.childrenCount > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {school.childrenCount} of your {school.childrenCount === 1 ? 'child is' : 'children are'} in this school
              </p>
            )}
          </div>
        </div>
        
        {school.roles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {school.roles.map(role => (
              <span 
                key={role}
                className="px-3 py-1 text-xs font-medium rounded-full bg-red-50 text-[#ed3135] border border-red-100"
              >
                {role}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-end mt-auto pt-4 border-t border-gray-100">
        <div className="flex items-center text-sm font-semibold text-[#a19c9c] group-hover:text-[#ed3135]">
          View School
          <FaArrowRight className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </div>
  );
};

export default SchoolCard;
