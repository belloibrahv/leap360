"use client";

import { FC, useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MdLockOutline, MdOutlineMail } from "react-icons/md";
import Spinner from "@/core/partials/Spinner";
import TextField from "@/core/auth/page/partials/TextField";
import SecretField from "@/core/auth/page/partials/SecretField";
import ToastContainer from "@/core/partials/ToastContainer";
import { login } from "@/core/services/api";
import { authStore } from "@/core/auth/store/authStore";
import { useToast } from "@/core/hooks/useToast";
import { ERROR_MESSAGES } from "@/core/types/errors";

interface FormErrors {
  email?: string;
  password?: string;
}

interface FormState {
  email: string;
  password: string;
}

const Login: FC = () => {
  const router = useRouter();
  const { toasts, showSuccess, showError, showWarning, removeToast } = useToast();
  
  const [formState, setFormState] = useState<FormState>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [formDisabled, setFormDisabled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

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

  const showAppropriateError = (error: any, isNetworkError = false) => {
    if (isNetworkError) {
      if (!isOnline) {
        showError("You're offline", "Please check your internet connection and try again", 8000);
      } else if (error.name === 'AbortError' || error.message.includes('timeout')) {
        showError("Request timed out", "The server is taking too long to respond. Please try again.", 6000);
      } else {
        showError("Connection failed", "Unable to connect to the server. Please check your connection.", 6000);
      }
    } else {
      const errorMessage = error.message || error.error || "Login failed";
      
      if (errorMessage.toLowerCase().includes('invalid') || errorMessage.toLowerCase().includes('credentials')) {
        showError("Invalid credentials", "Please check your email and password and try again.", 5000);
      } else if (errorMessage.toLowerCase().includes('locked') || errorMessage.toLowerCase().includes('blocked')) {
        showWarning("Account temporarily locked", "Too many failed attempts. Please try again later.", 8000);
      } else if (errorMessage.toLowerCase().includes('server') || errorMessage.toLowerCase().includes('500')) {
        showError("Server error", "We're experiencing technical difficulties. Please try again in a few minutes.", 6000);
      } else {
        showError("Login failed", errorMessage, 5000);
      }
    }
  };

  const handleInputChange = (field: keyof FormState) => (
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
      setSubmitting(true);
      setFormDisabled(true);
      setErrors({}); // Clear previous errors

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await login({
        email: formState.email,
        password: formState.password,
      });

      clearTimeout(timeoutId);

      if (response.error || !response.data?.data?.access_token) {
        showAppropriateError(response);
        return;
      }

      // Success - show success message and redirect
      showSuccess(
        "Login successful!", 
        "Welcome back! Redirecting...",
        2000
      );

      // Store credentials and redirect
      authStore.setCredentials(response.data.data.access_token, formState.email);
      
      // Small delay to show success message
      setTimeout(() => {
        router.replace("/schools");
      }, 1500);

    } catch (error: any) {
      showAppropriateError(error, true);
    } finally {
      setSubmitting(false);
      setFormDisabled(false);
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
        <div className="mb-4 text-[1.4rem] text-center font-light text-gray-500">
          Log in to continue
        </div>

      <TextField
        label="Email"
        error={errors.email}
        disabled={formDisabled}
        value={formState.email}
        onChange={handleInputChange("email")}
        placeholder="Type your email address"
        startIcon={
          <MdOutlineMail
            size={20}
            className={`flex-none ${
              formDisabled ? "text-gray-400" : "text-[#a19c9c]"
            }`}
          />
        }
      />

      <SecretField
        label="Password"
        error={errors.password}
        disabled={formDisabled}
        value={formState.password}
        onChange={handleInputChange("password")}
        placeholder="Type your password"
        startIcon={
          <MdLockOutline
            size={20}
            className={`flex-none ${
              formDisabled ? "text-gray-400" : "text-[#a19c9c]"
            }`}
          />
        }
      />

        {submitting ? (
          <div className="flex mt-2 h-11 justify-center items-center">
            <Spinner />
            <span className="ml-3 text-sm text-gray-500">Signing you in...</span>
          </div>
        ) : (
          <button
            type="submit"
            disabled={formDisabled || !isOnline}
            className={`
              mt-2 h-11 text-[0.85rem] text-white 
              bg-[#333] hover:bg-black 
              rounded-md cursor-pointer transition-all duration-350
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-2
            `}
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

export default Login;
