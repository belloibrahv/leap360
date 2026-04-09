"use client";

import { FC } from "react";
import { MdLogout, MdPerson, MdEmail, MdBusiness, MdSecurity } from "react-icons/md";
import { useAuth } from "@/core/hooks/useAuth";
import { getRoleDisplayName } from "@/types/auth";

interface UserProfileProps {
  showLogout?: boolean;
  compact?: boolean;
}

const UserProfile: FC<UserProfileProps> = ({ 
  showLogout = true, 
  compact = false 
}) => {
  const { user, logout, isLoading } = useAuth();

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    if (confirm("Are you sure you want to log out?")) {
      await logout();
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <MdPerson className="text-blue-600" size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 truncate">
            {user.full_name}
          </div>
          <div className="text-sm text-gray-500 truncate">
            {getRoleDisplayName(user.role)}
          </div>
        </div>
        {showLogout && (
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            title="Logout"
          >
            <MdLogout size={18} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <MdPerson className="text-blue-600" size={32} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {user.full_name}
            </h2>
            <p className="text-gray-600">
              {getRoleDisplayName(user.role)}
            </p>
          </div>
        </div>
        
        {showLogout && (
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <MdLogout size={18} />
            Logout
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <MdEmail className="text-gray-400" size={20} />
          <div>
            <div className="text-sm text-gray-500">Email</div>
            <div className="text-gray-900">{user.email}</div>
          </div>
        </div>

        {user.phone && (
          <div className="flex items-center gap-3">
            <MdBusiness className="text-gray-400" size={20} />
            <div>
              <div className="text-sm text-gray-500">Phone</div>
              <div className="text-gray-900">{user.phone}</div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <MdSecurity className="text-gray-400" size={20} />
          <div>
            <div className="text-sm text-gray-500">Role</div>
            <div className="text-gray-900">{getRoleDisplayName(user.role)}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <MdBusiness className="text-gray-400" size={20} />
          <div>
            <div className="text-sm text-gray-500">Status</div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-gray-900">
                {user.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {user.last_login && (
          <div className="pt-4 border-t">
            <div className="text-sm text-gray-500">
              Last login: {new Date(user.last_login).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;