"use client";
import { useAuth } from "@/core/hooks/useAuth";
import useClickAway from "@/core/hooks/useClickAway"; 
import { useRouter } from "next/navigation";
import { toTitleCase } from "@/core/base";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { LuPower, LuLayoutDashboard } from "react-icons/lu";
import Link from "next/link";

interface AccountMenuProps { 
  name?: string;
}

const AccountMenu: FC<AccountMenuProps> = ({ name = 'User' }) => {
  const router = useRouter();
  const { logout } = useAuth();
  const anchorRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useClickAway([anchorRef, menuRef], useCallback(() => {
    setShowMenu(false);
  }, []));

  const toggleShowMenu = useCallback(() => {
    setShowMenu(prev => !prev);
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.replace('/');
    } catch (error) {
      setIsLoggingOut(false);
    }
  };

  if (!mounted) {
    return <div className="h-9 w-[120px]" />;
  }

  const displayName = name || 'User';
  const initial = displayName[0].toUpperCase();

  return (
    <div className="relative">
      <button
        ref={anchorRef}
        onClick={toggleShowMenu}
        className={`
          flex px-2 py-[0.35rem] rounded-sm relative gap-[0.4rem] items-center justify-center
          cursor-pointer leading-0 transition-colors duration-350 border-transparent
          border-1 hover:border-gray-200 hover:bg-gray-100
        `}
      >
        <span className={`
          flex w-7 h-7 rounded-full bg-[#33691f] text-white
          text-md overflow-hidden items-center justify-center
        `}>
          {initial}
        </span>
        <span className="text-[0.9rem] text-gray-700">
          {toTitleCase(displayName)}
        </span>
      </button>
      
      {showMenu && (
        <div
          ref={menuRef}
          className={`
            flex flex-col gap-1 absolute py-5 px-3 top-[3.5rem] -right-[0.3rem]
            w-[12rem] rounded-md border-[0.08rem] border-gray-200 shadow-lg bg-white z-50
          `}
        >
          <Link
            href="/schools"
            className="flex w-full px-3 py-2 cursor-pointer rounded-sm hover:bg-gray-100 items-center gap-2 text-gray-700"
          >
            <LuLayoutDashboard size={17} />
            <span className="text-sm">Dashboard</span>
          </Link>
          
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full px-3 py-2 cursor-pointer rounded-sm hover:bg-gray-100 items-center gap-2 text-[#c90000] disabled:opacity-50"
          >
            <LuPower size={17} />
            <span className="text-sm">
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default AccountMenu;
