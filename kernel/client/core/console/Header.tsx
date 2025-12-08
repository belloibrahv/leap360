"use client";

import { FC, useEffect, useState } from "react";
import Link from "next/link";
import { authStore } from "@/core/auth/store/authStore";
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
  const [userInfo, setUserInfo] = useState<{ 
    displayName: string; 
    isLoading: boolean 
  }>({
    displayName: "",
    isLoading: true
  });

  useEffect(() => {
    const email = authStore.getEmail();
    
    if (!email) {
      // If no email found, redirect to login
      window.location.href = "/";
      return;
    }

    setUserInfo({
      displayName: formatDisplayName(email),
      isLoading: false
    });
  }, []);

  return (
    <header className="flex items-center justify-between h-16 px-5 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center gap-8">
        <Link href="/schools" className="hover:opacity-80 transition-opacity">
          <AppLogo />
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {userInfo.isLoading ? (
          <div className="h-9 w-[120px] animate-pulse bg-gray-100 rounded-md" />
        ) : (
          <AccountMenu name={userInfo.displayName} />
        )}
      </div>
    </header>
  );
};

export default Header;
