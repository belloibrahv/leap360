/**
 * Professional Login Page - TechVaults Brand
 * 
 * Split layout with student/teacher imagery and modern login form.
 */

"use client";

import { FC, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, Environment } from '@react-three/drei';
import AppLogo from "@/core/partials/AppLogo";
import LoginV2 from "@/core/auth/page/views/LoginViewV2";
import { useAuth } from "@/core/hooks/useAuth";
import { useTenantBranding } from "@/core/tenant";
import { 
  ArrowLeft, 
  Info, 
  Users, 
  BookOpen, 
  Shield, 
  CheckCircle,
  GraduationCap,
  School
} from "lucide-react";

const BRAND_COLORS = {
  primary: '#bc0004',
  secondary: '#000000',
  accent: '#ffffff'
};

const LoginPage: FC = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { primaryColor } = useTenantBranding();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/schools');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left Side - Student/Teacher Imagery & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Gradient */}
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${BRAND_COLORS.secondary} 0%, ${BRAND_COLORS.primary} 100%)`
          }}
        />
        
        {/* Student/Teacher Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJlZHVjYXRpb24iIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj4KICAgICAgPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMTAiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPgogICAgICA8Y2lyY2xlIGN4PSI4MCIgY3k9IjgwIiByPSI4IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDgpIi8+CiAgICAgIDxyZWN0IHg9IjQwIiB5PSI2MCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDYpIi8+CiAgICA8L3BhdHRlcm4+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZWR1Y2F0aW9uKSIvPgo8L3N2Zz4=')] opacity-40" />
        </div>

        {/* 3D Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} />
            <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
              <mesh position={[-2, 1, 0]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial color="#ffffff" wireframe />
              </mesh>
            </Float>
            <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
              <mesh position={[2, -1, 0]}>
                <sphereGeometry args={[0.8, 16, 16]} />
                <meshBasicMaterial color="#ffffff" wireframe />
              </mesh>
            </Float>
            <Environment preset="night" />
            <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
          </Canvas>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-center px-12 py-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Logo */}
            <div className="mb-12">
              <AppLogo scale="large" textClassName="text-white" />
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Empowering
              <span className="block text-red-300">Nigerian Schools</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-12 leading-relaxed">
              Join 500+ schools transforming education with our comprehensive management platform.
            </p>

            {/* Features */}
            <div className="space-y-6">
              {[
                { icon: <Users className="w-6 h-6" />, text: "Complete Student Management" },
                { icon: <BookOpen className="w-6 h-6" />, text: "Academic Performance Tracking" },
                { icon: <Shield className="w-6 h-6" />, text: "Secure & Compliant Platform" }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-center text-white/90"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                >
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mr-4 border border-white/20">
                    {feature.icon}
                  </div>
                  <span className="text-lg font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <motion.div
              className="mt-16 grid grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {[
                { number: "500+", label: "Schools" },
                { number: "200K+", label: "Students" },
                { number: "99.9%", label: "Uptime" }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">{stat.number}</div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        {/* Back Button - Mobile */}
        <motion.button
          onClick={() => router.push('/')}
          className="lg:hidden absolute top-6 left-6 flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </motion.button>

        {/* Back Button - Desktop */}
        <motion.button
          onClick={() => router.push('/')}
          className="hidden lg:flex absolute top-6 right-6 items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Homepage
        </motion.button>

        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <AppLogo scale="medium" textClassName="text-gray-800" />
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-600">Sign in to your school dashboard</p>
            </div>

            {/* Login Form Container */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
              <LoginV2 />
              
              {/* Additional Links */}
              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm">
                  Need help?{' '}
                  <button 
                    className="font-medium hover:underline transition-colors duration-200"
                    style={{ color: BRAND_COLORS.primary }}
                  >
                    Contact Support
                  </button>
                </p>
              </div>
            </div>

            {/* Demo Credentials */}
            <motion.div
              className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <div className="flex items-start">
                <Info className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-blue-800 font-semibold mb-2 text-sm">Demo Access:</h3>
                  <p className="text-blue-700 text-xs">
                    Email: demo@leap360.com<br />
                    Password: password
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <div className="flex items-center justify-center space-x-6 text-gray-500">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-1" />
                  <span className="text-xs">Secure</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span className="text-xs">Trusted</span>
                </div>
                <div className="flex items-center">
                  <School className="w-4 h-4 mr-1" />
                  <span className="text-xs">500+ Schools</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
