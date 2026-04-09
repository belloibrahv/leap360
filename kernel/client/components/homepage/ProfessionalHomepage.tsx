/**
 * Professional Homepage - TechVaults Brand
 * 
 * Advanced homepage with GSAP animations, Three.js scenes, and professional UI.
 * Uses TechVaults brand colors: #bc0004 (red), #000000 (black), #ffffff (white).
 */

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float, Text3D, Environment } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/web';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAuth } from '@/core/hooks/useAuth';
import { useTenantBranding } from '@/core/tenant';
import AppLogo from '@/core/partials/AppLogo';
import { 
  ProfessionalFeaturesSection,
  ProfessionalSolutionsSection,
  ProfessionalTestimonialsSection,
  ProfessionalCTASection
} from './ProfessionalSections';
import { 
  BookOpen, 
  Users, 
  BarChart3, 
  Smartphone, 
  ArrowRight,
  Menu,
  X,
  Star,
  CheckCircle,
  ArrowUp,
  Zap,
  Shield,
  Target,
  Globe,
  Award,
  TrendingUp
} from 'lucide-react';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// TechVaults brand colors
const BRAND_COLORS = {
  primary: '#bc0004',
  secondary: '#000000', 
  accent: '#ffffff',
  gray: '#f5f5f5'
};

// 3D Scene Component
const AnimatedSphere: React.FC = () => {
  const meshRef = useRef<any>(null);
  
  useEffect(() => {
    if (meshRef.current) {
      gsap.to(meshRef.current.rotation, {
        y: Math.PI * 2,
        duration: 20,
        repeat: -1,
        ease: "none"
      });
    }
  }, []);

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1, 100, 200]} scale={2.5}>
        <MeshDistortMaterial
          color={BRAND_COLORS.primary}
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.4}
        />
      </Sphere>
    </Float>
  );
};

// Particle System Component
const ParticleField: React.FC = () => {
  const particlesRef = useRef<any>(null);
  
  useEffect(() => {
    if (particlesRef.current) {
      const particles = particlesRef.current.children;
      particles.forEach((particle: any, i: number) => {
        gsap.to(particle.position, {
          y: "+=2",
          duration: 2 + Math.random() * 2,
          repeat: -1,
          yoyo: true,
          delay: i * 0.1,
          ease: "sine.inOut"
        });
      });
    }
  }, []);

  return (
    <group ref={particlesRef}>
      {Array.from({ length: 50 }).map((_, i) => (
        <Sphere
          key={i}
          args={[0.02, 8, 8]}
          position={[
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20
          ]}
        >
          <meshBasicMaterial color={BRAND_COLORS.accent} />
        </Sphere>
      ))}
    </group>
  );
};

// Professional Navigation
const ProfessionalNavigation: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(navRef.current, 
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
      );
    }
  }, []);

  return (
    <motion.nav 
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-black/95 backdrop-blur-lg border-b border-red-600/20' 
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <AppLogo scale="medium" textClassName="text-white" />
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {['Features', 'Solutions', 'Success Stories', 'Contact'].map((item, index) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="text-white hover:text-red-500 transition-colors font-medium"
                whileHover={{ y: -2 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.5 }}
              >
                {item}
              </motion.a>
            ))}
            <motion.button
              onClick={onGetStarted}
              className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-full hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-red-500/25"
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(188, 0, 4, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
            >
              Get Started
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="md:hidden bg-black/95 backdrop-blur-lg rounded-lg mt-2 p-6 border border-red-600/20"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {['Features', 'Solutions', 'Success Stories', 'Contact'].map((item, index) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className="block py-3 text-white hover:text-red-500 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setIsOpen(false)}
                >
                  {item}
                </motion.a>
              ))}
              <motion.button
                onClick={() => { onGetStarted(); setIsOpen(false); }}
                className="block w-full mt-4 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Get Started
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

// Hero Section with 3D Scene
const ProfessionalHeroSection: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  const [titleSpring, setTitleSpring] = useSpring(() => ({
    from: { opacity: 0, transform: 'translateY(100px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: { tension: 280, friction: 60 }
  }));

  useEffect(() => {
    if (heroRef.current) {
      const tl = gsap.timeline();
      
      tl.fromTo('.hero-title', 
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: "power3.out" }
      )
      .fromTo('.hero-subtitle', 
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out" },
        "-=0.8"
      )
      .fromTo('.hero-buttons', 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
        "-=0.6"
      )
      .fromTo('.hero-stats', 
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
        "-=0.4"
      );
    }
  }, []);

  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32"
      style={{
        background: `linear-gradient(135deg, ${BRAND_COLORS.secondary} 0%, ${BRAND_COLORS.primary} 100%)`
      }}
    >
      {/* Background Image - Students and Teachers */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
        {/* Placeholder for student/teacher imagery - can be replaced with actual images */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJzdHVkZW50cyIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiPgogICAgICA8Y2lyY2xlIGN4PSIyNSIgY3k9IjI1IiByPSI4IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz4KICAgICAgPGNpcmNsZSBjeD0iNzUiIGN5PSI3NSIgcj0iNiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA4KSIvPgogICAgPC9wYXR0ZXJuPgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3N0dWRlbnRzKSIvPgo8L3N2Zz4=')] opacity-30" />
      </div>

      {/* 3D Background - Simplified */}
      <div className="absolute inset-0 opacity-20">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} />
          <AnimatedSphere />
          <Environment preset="night" />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.3} />
        </Canvas>
      </div>

      {/* Content - Simplified */}
      <motion.div 
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        style={{ y }}
      >
        <motion.h1 
          className="hero-title text-4xl md:text-6xl lg:text-7xl font-bold mb-8 text-white"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <span className="block text-2xl md:text-3xl lg:text-4xl font-normal text-gray-300 mb-4">
            School Management Platform for
          </span>
          <span className="block">Nigerian</span>
          <span className="block bg-gradient-to-r from-red-500 to-red-300 bg-clip-text text-transparent">
            Education
          </span>
        </motion.h1>

        <motion.p 
          className="hero-subtitle text-lg md:text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed font-light"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          Streamline operations, enhance student outcomes, and reduce administrative overhead 
          with Nigeria's most trusted school management platform.
        </motion.p>

        <motion.div
          className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <motion.button
            onClick={onGetStarted}
            className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold text-lg rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-lg flex items-center justify-center group"
            whileHover={{ 
              scale: 1.02, 
              y: -2
            }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Start Free Trial</span>
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </motion.button>
          
          <motion.button 
            className="px-8 py-4 bg-white/10 text-white font-semibold text-lg rounded-lg border border-white/20 hover:bg-white/20 transition-all backdrop-blur-sm flex items-center justify-center group"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <BookOpen className="w-5 h-5 mr-2" />
            <span>View Demo</span>
          </motion.button>
        </motion.div>

        {/* Simplified Stats */}
        <motion.div 
          className="hero-stats grid grid-cols-3 gap-6 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          {[
            { number: "500+", label: "Schools", icon: <Users className="w-5 h-5" />, color: "text-red-400" },
            { number: "200K+", label: "Students", icon: <BookOpen className="w-5 h-5" />, color: "text-white" },
            { number: "99.9%", label: "Uptime", icon: <Shield className="w-5 h-5" />, color: "text-green-400" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <motion.div 
                className="flex justify-center mb-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  delay: 1.2 + index * 0.2, 
                  type: "spring", 
                  stiffness: 200 
                }}
              >
                <div className={`${stat.color}`}>
                  {stat.icon}
                </div>
              </motion.div>
              <motion.div 
                className={`text-2xl md:text-3xl font-bold ${stat.color} mb-1`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  delay: 1.4 + index * 0.2, 
                  type: "spring", 
                  stiffness: 200 
                }}
              >
                {stat.number}
              </motion.div>
              <div className="text-white text-sm font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <motion.div
            className="w-1 h-3 bg-white rounded-full mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        </div>
      </motion.div>
    </section>
  );
};

// Main Professional Homepage Component
export const ProfessionalHomepage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/schools');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/schools');
    } else {
      router.push('/login');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      <ProfessionalNavigation onGetStarted={handleGetStarted} />
      <ProfessionalHeroSection onGetStarted={handleGetStarted} />
      
      {/* Trusted By Section - Separate */}
      <section className="py-16 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-400 text-sm mb-8 font-medium">Trusted by leading Nigerian schools</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                "Greensprings School",
                "Loyola Jesuit College", 
                "Corona Schools",
                "Chrisland Schools",
                "Dowen College",
                "Whitesands School",
                "Caleb International",
                "Vivian Fowler Memorial"
              ].map((school, index) => (
                <motion.div
                  key={index}
                  className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-white/20 transition-all"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="text-white/80 text-sm font-medium">{school}</div>
                  <div className="text-gray-500 text-xs mt-1">Primary & Secondary</div>
                </motion.div>
              ))}
            </div>
            
            {/* Key Trust Indicators */}
            <motion.div
              className="flex flex-wrap justify-center gap-8 mt-12 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center text-white/90 bg-white/5 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/10">
                <CheckCircle className="w-5 h-5 mr-3 text-green-400" />
                <span className="font-medium">500+ Schools Trust Us</span>
              </div>
              <div className="flex items-center text-white/90 bg-white/5 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/10">
                <Zap className="w-5 h-5 mr-3 text-yellow-400" />
                <span className="font-medium">Setup in 24 Hours</span>
              </div>
              <div className="flex items-center text-white/90 bg-white/5 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/10">
                <Shield className="w-5 h-5 mr-3 text-blue-400" />
                <span className="font-medium">Bank-Level Security</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Value Proposition Section - Clean & Educational */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Schools Choose <span className="text-[#bc0004]">LEAP360</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Comprehensive solutions designed specifically for Nigerian educational institutions
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Operational Efficiency",
                description: "Streamline administrative tasks and reduce manual processes by up to 80%",
                metrics: "40+ hours saved weekly"
              },
              {
                icon: <Award className="w-8 h-8" />,
                title: "Student Success",
                description: "Data-driven insights and analytics to improve educational outcomes",
                metrics: "35% performance improvement"
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Secure & Compliant",
                description: "Bank-level security with full compliance to Nigerian data protection laws",
                metrics: "99.9% uptime guarantee"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="text-center p-8 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/20 transition-all"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#bc0004]/10 rounded-xl mb-6 border border-[#bc0004]/20">
                  <div className="text-[#bc0004]">{item.icon}</div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-300 mb-4 leading-relaxed">{item.description}</p>
                <div className="text-[#bc0004] font-semibold text-sm">{item.metrics}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <ProfessionalFeaturesSection />
      <ProfessionalSolutionsSection />
      <ProfessionalTestimonialsSection />
      
      {/* FAQ Section - Professional */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Frequently Asked <span className="text-[#bc0004]">Questions</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Everything you need to know about implementing LEAP360
            </p>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                question: "How quickly can we implement LEAP360?",
                answer: "Implementation typically takes 24-48 hours. Our team handles data migration, system configuration, and staff training to ensure a smooth transition with minimal disruption to your operations."
              },
              {
                question: "What happens to our existing student data?",
                answer: "We provide comprehensive data migration services at no additional cost. All student records, academic history, and administrative data are securely transferred to maintain complete continuity."
              },
              {
                question: "What are the pricing and contract terms?",
                answer: "We offer transparent monthly pricing with no setup fees or long-term contracts. You can cancel anytime, and we provide a 30-day money-back guarantee for new customers."
              },
              {
                question: "Do you provide training and ongoing support?",
                answer: "Yes, we include comprehensive staff training and provide 24/7 support through our Nigerian team. Support is available in English and local languages via phone, email, and chat."
              },
              {
                question: "How do you ensure data security and compliance?",
                answer: "LEAP360 uses bank-level 256-bit encryption, automated backups, and complies with all Nigerian data protection regulations. Your school data is completely secure and private."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                  <div className="w-2 h-2 bg-[#bc0004] rounded-full mr-3"></div>
                  {faq.question}
                </h3>
                <p className="text-gray-300 leading-relaxed pl-5">{faq.answer}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-400 mb-6">Need more information?</p>
            <motion.button
              className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-800 transition-all flex items-center mx-auto"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Users className="w-5 h-5 mr-2" />
              Contact Our Team
            </motion.button>
          </motion.div>
        </div>
      </section>

      <ProfessionalCTASection onGetStarted={handleGetStarted} />
      
      {/* Professional Footer */}
      <footer className="bg-black border-t border-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center mb-6">
                <AppLogo scale="medium" textClassName="text-white" />
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Transforming Nigerian education through comprehensive school management solutions and innovative administrative technology.
              </p>
              <div className="flex space-x-4">
                {['LinkedIn', 'Twitter', 'Facebook', 'Instagram'].map((social) => (
                  <motion.a
                    key={social}
                    href="#"
                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white transition-all"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {social[0]}
                  </motion.a>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-white mb-6">Solutions</h3>
              <ul className="space-y-3 text-gray-400">
                {['School Management', 'Student Information Systems', 'Administrative Tools', 'Analytics & Reporting'].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-red-400 transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-white mb-6">Support</h3>
              <ul className="space-y-3 text-gray-400">
                {['Help Center', 'Documentation', 'API Reference', 'Contact Support'].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-red-400 transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2026 LEAP360 by TechVaults. All rights reserved. Made in Nigeria 🇳🇬
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                <a key={item} href="#" className="text-gray-400 hover:text-red-400 text-sm transition-colors">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full shadow-2xl hover:from-red-700 hover:to-red-800 transition-all z-50 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 100 }}
            whileHover={{ scale: 1.1, y: -5 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfessionalHomepage;
