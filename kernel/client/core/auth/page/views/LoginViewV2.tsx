"use client";

import { FC, useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MdLockOutline, MdOutlineMail } from "react-icons/md";
import Spinner from "@/core/partials/Spinner";
import TextField from "@/core/auth/page/partials/TextField";
import SecretField from "@/core/auth/page/partials/SecretField";
import ToastContainer from "@/core/partials/ToastContainer";
import { useAuth } from "@/core/hooks/useAuth";
import { useToast } from "@/core/hooks/useToast";
import { ERROR_MESSAGES } from "@/core/types/errors";
import { LoginRequest } from "@/types/auth";

interface FormErrors {
  email?: string;
  password?: string;
}

const LoginV2: FC = () => {
  const router = useRouter();
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();
  const { toasts, showSuccess, showError, showWarning, removeToast } = useToast();
  
  const [formState, setFormState] = useState<LoginRequest>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isOnline, setIsOnline] = useState(true);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/schools");
    }
  }, [isAuthenticated, router]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Show error messages from auth store
  useEffect(() => {
    if (error) {
      showAppropriateError(error);
      clearError();
    }
  }, [error, clearError]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formState.email.trim()) {
      newErrors.email = ERROR_MESSAGES.validation.email.required;
    } else if (!emailRegex.test(formState.email)) {
      newErrors.email = ERROR_MESSAGES.validation.email.invalid;
    }

    if (!formState.password) {
      newErrors.password = ERROR_MESSAGES.validation.password.required;
    } else if (formState.password.length < 6) {
      newErrors.password = ERROR_MESSAGES.validation.password.tooShort;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showAppropriateError = (errorMessage: string) => {
    if (!isOnline) {
      showError("You're offline", "Please check your internet connection and try again", 8000);
      return;
    }

    const lowerError = errorMessage.toLowerCase();
    
    if (lowerError.includes('invalid') || lowerError.includes('credentials')) {
      showError("Invalid credentials", "Please check your email and password and try again.", 5000);
    } else if (lowerError.includes('locked') || lowerError.includes('blocked')) {
      showWarning("Account temporarily locked", "Too many failed attempts. Please try again later.", 8000);
    } else if (lowerError.includes('server') || lowerError.includes('500')) {
      showError("Server error", "We're experiencing technical difficulties. Please try again in a few minutes.", 6000);
    } else if (lowerError.includes('network') || lowerError.includes('connection')) {
      showError("Connection failed", "Unable to connect to the server. Please check your connection.", 6000);
    } else {
      showError("Login failed", errorMessage, 5000);
    }
  };

  const handleInputChange = (field: keyof LoginRequest) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormState((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Check online status first
    if (!isOnline) {
      showError(
        "You're offline", 
        "Please check your internet connection and try again",
        8000
      );
      return;
    }

    if (!validateForm()) return;

    try {
      setErrors({}); // Clear previous errors

      await login(formState);

      // Success - show success message and redirect
      showSuccess(
        "Login successful!", 
        "Welcome back! Redirecting...",
        2000
      );

      // Small delay to show success message
      setTimeout(() => {
        router.replace("/schools");
      }, 1500);

    } catch (error: any) {
      // Error is handled by the useAuth hook and useEffect above
      console.error('Login error:', error);
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      
      {/* Offline indicator */}
      {!isOnline && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-yellow-700">You're currently offline</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-3">
        <div className="mb-6 text-lg text-center font-medium text-gray-700">
          Sign in to your dashboard
        </div>

        <TextField
          label="Email"
          error={errors.email}
          disabled={isLoading}
          value={formState.email}
          onChange={handleInputChange("email")}
          placeholder="Type your email address"
          startIcon={
            <MdOutlineMail
              size={20}
              className={`flex-none ${
                isLoading ? "text-gray-400" : "text-[#a19c9c]"
              }`}
            />
          }
        />

        <SecretField
          label="Password"
          error={errors.password}
          disabled={isLoading}
          value={formState.password}
          onChange={handleInputChange("password")}
          placeholder="Type your password"
          startIcon={
            <MdLockOutline
              size={20}
              className={`flex-none ${
                isLoading ? "text-gray-400" : "text-[#a19c9c]"
              }`}
            />
          }
        />

        {isLoading ? (
          <div className="flex mt-2 h-12 justify-center items-center">
            <Spinner />
            <span className="ml-3 text-sm text-gray-600">Signing you in...</span>
          </div>
        ) : (
          <button
            type="submit"
            disabled={isLoading || !isOnline}
            className={`
              mt-2 h-12 text-sm font-semibold text-white 
              bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800
              rounded-lg cursor-pointer transition-all duration-300
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-2
              shadow-lg hover:shadow-xl
            `}
            style={{
              background: !isOnline ? '#6b7280' : undefined
            }}
            aria-label="Sign in to your account"
          >
            {!isOnline ? (
              <>
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Offline
              </>
            ) : (
              "Sign In"
            )}
          </button>
        )}
      </form>
    </>
  );
};

export default LoginV2;