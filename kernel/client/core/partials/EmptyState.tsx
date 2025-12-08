import { FC, ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  message: string;
}

const EmptyState: FC<EmptyStateProps> = ({ icon, title, message }) => {
  return (
    <div className="text-center py-16 px-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-center mx-auto w-24 h-24 bg-gradient-to-br from-red-50 to-red-100 rounded-full mb-6 border-2 border-red-200 shadow-sm">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-[#333] mb-3">{title}</h3>
      <p className="max-w-md mx-auto text-gray-500 leading-relaxed">
        {message}
      </p>
    </div>
  );
};

export default EmptyState;
