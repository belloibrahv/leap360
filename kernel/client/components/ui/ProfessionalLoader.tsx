/**
 * Professional Loader Component
 * 
 * Advanced loading animation with TechVaults branding and GSAP animations.
 */

"use client";

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';

const BRAND_COLORS = {
  primary: '#bc0004',
  secondary: '#000000', 
  accent: '#ffffff'
};

export const ProfessionalLoader: React.FC<{ message?: string }> = ({ 
  message = "Loading..." 
}) => {
  const loaderRef = useRef<HTMLDivElement>(null);
  const circleRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (loaderRef.current) {
      // GSAP animation for the circles
      const tl = gsap.timeline({ repeat: -1 });
      
      circleRefs.current.forEach((circle, index) => {
        if (circle) {
          tl.to(circle, {
            scale: 1.5,
            backgroundColor: BRAND_COLORS.primary,
            duration: 0.3,
            ease: "power2.out"
          }, index * 0.1)
          .to(circle, {
            scale: 1,
            backgroundColor: BRAND_COLORS.accent,
            duration: 0.3,
            ease: "power2.in"
          }, index * 0.1 + 0.3);
        }
      });
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-gray-900">
      <div ref={loaderRef} className="text-center">
        {/* Animated Logo */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="text-4xl font-bold text-white mb-2">
            LEAP<span style={{ color: BRAND_COLORS.primary }}>360</span>
          </div>
          <div className="text-sm text-gray-400 font-medium">
            by TechVaults
          </div>
        </motion.div>

        {/* Loading Animation */}
        <div className="flex justify-center space-x-2 mb-6">
          {[0, 1, 2, 3, 4].map((index) => (
            <div
              key={index}
              ref={(el) => { circleRefs.current[index] = el; }}
              className="w-3 h-3 rounded-full bg-white"
            />
          ))}
        </div>

        {/* Loading Text */}
        <motion.p
          className="text-gray-400 text-lg"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          {message}
        </motion.p>

        {/* Progress Bar */}
        <div className="w-64 h-1 bg-gray-800 rounded-full mx-auto mt-6 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfessionalLoader;