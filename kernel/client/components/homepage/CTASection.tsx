/**
 * Call-to-Action Section Component
 * 
 * Final conversion section with animated elements and tenant branding.
 */

"use client";

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text3D, Center } from '@react-three/drei';
import { useTenantBranding } from '@/core/tenant';
import { Rocket, Zap, Shield, Target } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const Animated3DText: React.FC<{ text: string; color: string }> = ({ text, color }) => {
  const textRef = useRef<any>();

  useEffect(() => {
    if (textRef.current) {
      gsap.to(textRef.current.rotation, {
        y: Math.PI * 2,
        duration: 10,
        repeat: -1,
        ease: "none"
      });
    }
  }, []);

  return (
    <Center>
      <Text3D
        ref={textRef}
        font="/fonts/helvetiker_regular.typeface.json"
        size={0.5}
        height={0.1}
        curveSegments={12}
        bevelEnabled
        bevelThickness={0.02}
        bevelSize={0.02}
        bevelOffset={0}
        bevelSegments={5}
      >
        {text}
        <meshStandardMaterial color={color} />
      </Text3D>
    </Center>
  );
};

interface CTASectionProps {
  onGetStarted: () => void;
  onScheduleDemo: () => void;
}

export const CTASection: React.FC<CTASectionProps> = ({ onGetStarted, onScheduleDemo }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { primaryColor, secondaryColor, tenantName } = useTenantBranding();

  useEffect(() => {
    if (!sectionRef.current || !contentRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
      }
    });

    tl.fromTo(contentRef.current.children,
      { opacity: 0, y: 50, scale: 0.9 },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out"
      }
    );

    // Floating animation for background elements
    gsap.to(".floating-element", {
      y: -20,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut",
      stagger: 0.5
    });

  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative py-24 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div className="floating-element absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="floating-element absolute top-1/2 right-1/4 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="floating-element absolute bottom-1/4 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>

        {/* Geometric Shapes */}
        <div className="floating-element absolute top-20 right-20 w-20 h-20 border-2 border-white/20 rotate-45 animate-spin-slow"></div>
        <div className="floating-element absolute bottom-20 left-20 w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-60"></div>
        <div className="floating-element absolute top-1/2 left-10 w-12 h-12 bg-gradient-to-br from-pink-400 to-yellow-500 transform rotate-45 opacity-50"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={contentRef} className="text-center">
          {/* Badge */}
          <motion.div
            className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Rocket className="w-4 h-4 text-white mr-2" />
            <span className="text-sm font-medium text-white">Ready to Get Started?</span>
          </motion.div>

          {/* Main Heading */}
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
            Transform Your
            <span 
              className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`
              }}
            >
              Educational Journey
            </span>
            <span className="block text-4xl md:text-5xl mt-4">Today</span>
          </h2>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Join millions of learners and educators who are already experiencing 
            the future of education. Start your free trial and see the difference 
            in just 5 minutes.
          </p>

          {/* 3D Canvas */}
          <div className="h-32 mb-12">
            <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <Animated3DText text="LEAP360" color={primaryColor} />
              <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={2} />
            </Canvas>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <motion.button
              onClick={onGetStarted}
              className="group relative px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-full hover:shadow-2xl transition-all duration-300 overflow-hidden"
              style={{
                backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center">
                Start Free Trial
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </motion.button>
            
            <motion.button
              onClick={onScheduleDemo}
              className="px-10 py-5 bg-white/10 backdrop-blur-sm text-white font-bold text-lg rounded-full border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Schedule Demo
            </motion.button>
          </div>

          {/* Features List */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: <Zap className="w-8 h-8" />,
                title: "5-Minute Setup",
                description: "Get started instantly with our intuitive onboarding process"
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Enterprise Security",
                description: "Bank-level security with SOC 2 compliance and data encryption"
              },
              {
                icon: <Target className="w-8 h-8" />,
                title: "Proven Results",
                description: "85% improvement in student engagement within the first month"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="text-blue-400 mb-4">{feature.icon}</div>
                <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-300 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="border-t border-white/10 pt-12">
            <p className="text-gray-400 text-sm mb-8">Trusted by leading institutions worldwide</p>
            
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {[
                "Harvard University",
                "Stanford University", 
                "MIT",
                "Oxford University",
                "Cambridge University"
              ].map((institution, index) => (
                <motion.div
                  key={index}
                  className="text-white/60 font-medium text-sm"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 0.6 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  {institution}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Final Urgency Message */}
          <motion.div
            className="mt-12 p-6 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl border border-orange-500/30"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center justify-center">
              <Zap className="w-5 h-5 text-orange-400 mr-2" />
              <p className="text-orange-200 font-medium">
                Limited Time: Get 3 months free when you start your trial this week!
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;