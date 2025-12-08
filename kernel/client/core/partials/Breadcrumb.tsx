import { FC } from 'react';
import Link from 'next/link';
import { FiChevronRight } from 'react-icons/fi';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: FC<BreadcrumbProps> = ({ items }) => (
  <nav className="flex items-center gap-2 text-sm mb-6">
    {items.map((item, index) => (
      <div key={item.label} className="flex items-center">
        {index > 0 && (
          <FiChevronRight className="mx-2 text-gray-400" size={14} />
        )}
        {item.href ? (
          <Link 
            href={item.href}
            className="text-gray-600 hover:text-[#333] transition-colors"
          >
            {item.label}
          </Link>
        ) : (
          <span className="text-[#333] font-medium">{item.label}</span>
        )}
      </div>
    ))}
  </nav>
);

export default Breadcrumb;
