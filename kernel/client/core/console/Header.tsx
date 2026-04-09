"use client";

import { FC } from "react";
import Link from "next/link";
import { useAuth } from "@/core/hooks/useAuth";
import AppLogo from "@/core/partials/AppLogo";
import AccountMenu from "@/core/partials/AccountMenu";

const formatDisplayName = (email: string): string => {
  const [name] = email.split("@");
  // Convert 'john.doe' or 'john_doe' to 'John Doe'
  return name
    .split(/[._-]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const Header: FC = () => {
  const { user, isLoading } = useAuth();

  const displayName = user?.email ? formatDisplayName(user.email) : "";

  return (
    <header className="flex items-center justify-between h-16 px-5 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center gap-8">
        <Link href="/schools" className="hover:opacity-80 transition-opacity">
          <AppLogo textClassName="text-slate-900" />
        </Link>
        
        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            href="/schools" 
            className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Schools
          </Link>
          <Link 
            href="/students" 
            className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Students
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {isLoading ? (
          <div className="h-9 w-[120px] animate-pulse bg-gray-100 rounded-md" />
        ) : (
          <AccountMenu name={displayName} />
        )}
      </div>
    </header>
  );
};

export default Header;
