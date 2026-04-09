/**
 * Login Page
 * 
 * Dedicated login page with modern design and animations.
 */

"use client";

import { FC, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import AppLogo from "@/core/partials/AppLogo";
import LoginV2 from "@/core/auth/page/views/LoginViewV2";
import { useAuth } from "@/core/hooks/useAuth";
import { useTenantBranding } from "@/core/tenant";
import { ArrowLeft, Info } from "lucide-react";

const LoginPage: FC = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { primaryColor, secondaryColor } = useTenantBranding();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/schools');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-800 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
      </div>

      {/* Back to Homepage */}
      <motion.button
        onClick={() => router.push('/')}
        className="absolute top-6 left-6 flex items-center text-white/70 hover:text-white transition-colors duration-200"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Homepage
      </motion.button>

      {/* Login Form */}
      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <AppLogo scale="medium" textClassName="text-white" />
            <h1 className="text-2xl font-bold text-white mt-4 mb-2">Welcome Back</h1>
            <p className="text-gray-300">Access your school management dashboard</p>
          </div>

          {/* Login Form */}
          <LoginV2 />

          {/* Additional Links */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <button 
                className="text-red-400 hover:text-red-300 transition-colors duration-200 font-medium"
                style={{ color: primaryColor }}
              >
                Sign up for free
              </button>
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <motion.div
          className="mt-6 bg-red-500/20 backdrop-blur-sm rounded-xl p-4 border border-red-500/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <div className="flex items-start">
            <Info className="w-4 h-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-red-200 font-semibold mb-2 text-sm">Demo Credentials:</h3>
              <p className="text-red-100 text-xs">
                Email: demo@leap360.com<br />
                Password: password
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
