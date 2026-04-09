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
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
      style={{
        background: `linear-gradient(135deg, ${BRAND_COLORS.secondary} 0%, ${BRAND_COLORS.primary} 100%)`
      }}
    >
      {/* 3D Background */}
      <div className="absolute inset-0 opacity-30">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <AnimatedSphere />
          <ParticleField />
          <Environment preset="night" />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      {/* Content */}
      <motion.div 
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        style={{ y }}
      >
        <motion.h1 
          className="hero-title text-5xl md:text-7xl lg:text-8xl font-bold mb-8 text-white"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          Transform
          <span className="block bg-gradient-to-r from-red-500 to-red-300 bg-clip-text text-transparent">
            Education
          </span>
          <span className="block text-4xl md:text-5xl lg:text-6xl mt-4">
            with <span style={{ color: BRAND_COLORS.primary }}>LEAP360</span>
          </span>
        </motion.h1>

        <motion.p 
          className="hero-subtitle text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          Complete school management platform for Nigerian educational institutions. 
          Streamline operations, manage students, track performance, and enhance administrative efficiency.
        </motion.p>

        <motion.div
          className="hero-buttons flex flex-col sm:flex-row gap-6 justify-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <motion.button
            onClick={onGetStarted}
            className="px-10 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold text-lg rounded-full hover:from-red-700 hover:to-red-800 transition-all shadow-2xl flex items-center justify-center group"
            whileHover={{ 
              scale: 1.05, 
              boxShadow: "0 25px 50px rgba(188, 0, 4, 0.4)",
              y: -5
            }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started Today
            <motion.div
              className="ml-3"
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <ArrowRight className="w-6 h-6" />
            </motion.div>
          </motion.button>
          
          <motion.button 
            className="px-10 py-4 bg-white/10 text-white font-bold text-lg rounded-full border-2 border-white/30 hover:bg-white/20 transition-all backdrop-blur-sm"
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            Watch Demo
          </motion.button>
        </motion.div>

        {/* Animated Stats */}
        <motion.div 
          className="hero-stats grid grid-cols-3 gap-8 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          {[
            { number: "1,000+", label: "Schools", color: "text-red-400" },
            { number: "500K+", label: "Students", color: "text-white" },
            { number: "99%", label: "Uptime", color: "text-red-300" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              whileHover={{ scale: 1.1, y: -10 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <motion.div 
                className={`text-4xl md:text-5xl font-bold ${stat.color} mb-2`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  delay: 1.2 + index * 0.2, 
                  type: "spring", 
                  stiffness: 200 
                }}
              >
                {stat.number}
              </motion.div>
              <div className="text-gray-400 text-sm md:text-base font-medium">
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
      <ProfessionalFeaturesSection />
      <ProfessionalSolutionsSection />
      <ProfessionalTestimonialsSection />
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
