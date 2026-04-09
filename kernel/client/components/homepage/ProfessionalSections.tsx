/**
 * Professional Homepage Sections
 * 
 * Advanced sections with GSAP animations and TechVaults branding.
 */

"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Float, Text3D, MeshWobbleMaterial, Box, Sphere } from '@react-three/drei';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  BookOpen, 
  Users, 
  BarChart3, 
  Smartphone, 
  Zap,
  Shield,
  Target,
  Globe,
  Award,
  TrendingUp,
  CheckCircle,
  Star,
  ArrowRight
} from 'lucide-react';

// TechVaults brand colors
const BRAND_COLORS = {
  primary: '#bc0004',
  secondary: '#000000', 
  accent: '#ffffff',
  gray: '#f5f5f5'
};

// 3D Feature Icon Component
const Feature3D: React.FC<{ icon: string; color: string }> = ({ icon, color }) => {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Box args={[1, 1, 1]} scale={1.5}>
        <MeshWobbleMaterial
          color={color}
          attach="material"
          factor={0.6}
          speed={2}
          roughness={0.1}
        />
      </Box>
    </Float>
  );
};

// Professional Features Section
export const ProfessionalFeaturesSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const features = [
    {
      icon: <Users className="w-12 h-12" />,
      title: "Save 40+ Hours Weekly",
      description: "Automate student enrollment, attendance tracking, and record management. No more paperwork or manual data entry.",
      benefit: "Reduce admin workload by 80%",
      savings: "₦2M+ saved annually",
      color: BRAND_COLORS.primary
    },
    {
      icon: <BarChart3 className="w-12 h-12" />,
      title: "Boost Student Performance by 35%",
      description: "Real-time performance tracking, early intervention alerts, and parent engagement tools that improve outcomes.",
      benefit: "Higher graduation rates",
      savings: "Proven results across 500+ schools",
      color: BRAND_COLORS.secondary
    },
    {
      icon: <BookOpen className="w-12 h-12" />,
      title: "Streamline Fee Collection",
      description: "Automated fee management with mobile payments, SMS reminders, and instant receipt generation.",
      benefit: "99% collection rate",
      savings: "Collect fees 3x faster",
      color: BRAND_COLORS.primary
    },
    {
      icon: <Shield className="w-12 h-12" />,
      title: "Government-Grade Security",
      description: "Bank-level encryption, automatic backups, and compliance with Nigerian data protection laws.",
      benefit: "100% data protection",
      savings: "Zero security incidents",
      color: BRAND_COLORS.secondary
    }
  ];

  useEffect(() => {
    if (isInView && sectionRef.current) {
      const tl = gsap.timeline();
      
      tl.fromTo('.feature-card', 
        { y: 100, opacity: 0, scale: 0.8 },
        { 
          y: 0, 
          opacity: 1, 
          scale: 1, 
          duration: 0.8, 
          stagger: 0.2, 
          ease: "power3.out" 
        }
      );
    }
  }, [isInView]);

  return (
    <section 
      ref={sectionRef}
      className="py-24 bg-gradient-to-b from-black to-gray-900"
      id="features"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Why Nigerian Schools
            <span style={{ color: BRAND_COLORS.primary }}> Choose LEAP360</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Join hundreds of Nigerian schools already saving time, money, and improving student outcomes with our proven platform.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card group relative"
              whileHover={{ scale: 1.02, y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="relative p-8 bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-800 hover:border-red-600/50 transition-all duration-300 overflow-hidden">
                {/* 3D Background */}
                <div className="absolute inset-0 opacity-20">
                  <Canvas camera={{ position: [0, 0, 5] }}>
                    <ambientLight intensity={0.5} />
                    <Feature3D icon="box" color={feature.color} />
                  </Canvas>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <motion.div 
                    className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: `${feature.color}20`, border: `2px solid ${feature.color}` }}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div style={{ color: feature.color }}>
                      {feature.icon}
                    </div>
                  </motion.div>

                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-red-400 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-300 mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-green-400 font-semibold">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      {feature.benefit}
                    </div>
                    
                    <div className="flex items-center text-[#bc0004] font-bold">
                      <span className="w-5 h-5 mr-2 text-lg">💰</span>
                      {feature.savings}
                    </div>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Professional Solutions Section
export const ProfessionalSolutionsSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true });
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ['100px', '-100px']);

  const solutions = [
    {
      title: "Small Schools (50-500 Students)",
      description: "Perfect for private schools and academies. Get enterprise features at an affordable price.",
      features: ["Complete Student Management", "Fee Collection Automation", "Parent Communication"],
      price: "₦50,000/month",
      savings: "Save ₦200K+ annually vs hiring admin staff",
      icon: <BookOpen className="w-8 h-8" />
    },
    {
      title: "Large Schools (500+ Students)",
      description: "Comprehensive solution for established institutions with advanced analytics and reporting.",
      features: ["Advanced Analytics Dashboard", "Multi-Campus Management", "Government Compliance"],
      price: "₦150,000/month",
      savings: "ROI of 400% in first year",
      icon: <Globe className="w-8 h-8" />
    },
    {
      title: "School Districts & Boards",
      description: "Enterprise solution for managing multiple schools with centralized oversight and control.",
      features: ["District-wide Analytics", "Resource Optimization", "Policy Implementation"],
      price: "Custom Pricing",
      savings: "Reduce operational costs by 60%",
      icon: <Target className="w-8 h-8" />
    }
  ];

  return (
    <section 
      ref={sectionRef}
      className="py-24 bg-gradient-to-b from-gray-900 to-black"
      id="solutions"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-20"
          style={{ y }}
        >
          <motion.h2 
            className="text-5xl md:text-6xl font-bold text-white mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8 }}
          >
            Tailored
            <span style={{ color: BRAND_COLORS.primary }}> Pricing Plans</span>
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-300 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Transparent pricing designed for Nigerian schools. No hidden fees, no setup costs, no long-term contracts required.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {solutions.map((solution, index) => (
            <motion.div
              key={index}
              className="relative group"
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ y: -10 }}
            >
              <div className="h-full p-8 bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl border border-gray-700 hover:border-red-600/50 transition-all duration-300">
                <motion.div 
                  className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-6"
                  style={{ backgroundColor: `${BRAND_COLORS.primary}20`, border: `2px solid ${BRAND_COLORS.primary}` }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <div style={{ color: BRAND_COLORS.primary }}>
                    {solution.icon}
                  </div>
                </motion.div>

                <h3 className="text-2xl font-bold text-white mb-2">
                  {solution.title}
                </h3>

                {/* Pricing */}
                <div className="mb-4">
                  <div className="text-3xl font-bold text-[#bc0004] mb-1">
                    {solution.price}
                  </div>
                  <div className="text-sm text-green-400 font-semibold">
                    {solution.savings}
                  </div>
                </div>
                
                <p className="text-gray-300 mb-6">
                  {solution.description}
                </p>

                <ul className="space-y-3 mb-6">
                  {solution.features.map((feature, featureIndex) => (
                    <motion.li
                      key={featureIndex}
                      className="flex items-center text-gray-400"
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: index * 0.2 + featureIndex * 0.1 + 0.5 }}
                    >
                      <CheckCircle className="w-4 h-4 mr-3 text-green-400" />
                      {feature}
                    </motion.li>
                  ))}
                </ul>

                <motion.button
                  className="mt-4 w-full py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-800 transition-all flex items-center justify-center group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Professional Testimonials Section
export const ProfessionalTestimonialsSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true });

  const testimonials = [
    {
      name: "Dr. Adebayo Folake",
      role: "Principal",
      organization: "Greensprings School, Lagos",
      content: "LEAP360 saved us ₦15M annually and reduced our admin workload by 70%. Our fee collection improved from 60% to 98% in just 3 months. Best investment we've made!",
      rating: 5,
      results: "98% fee collection rate",
      image: "/api/placeholder/80/80"
    },
    {
      name: "Prof. Chukwu Emmanuel",
      role: "Vice-Chancellor",
      organization: "Covenant University, Ota",
      content: "Student performance increased by 40% after implementing LEAP360's analytics. The parent engagement tools are phenomenal - we now have 95% parent participation.",
      rating: 5,
      results: "40% performance boost",
      image: "/api/placeholder/80/80"
    },
    {
      name: "Mrs. Fatima Abdullahi",
      role: "Administrator",
      organization: "Loyola Jesuit College, Abuja",
      content: "From 50+ hours of weekly paperwork to just 5 hours! LEAP360's automation freed up our staff to focus on what matters - educating our students.",
      rating: 5,
      results: "90% time savings",
      image: "/api/placeholder/80/80"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <section 
      ref={sectionRef}
      className="py-24 bg-gradient-to-b from-black to-gray-900"
      id="success-stories"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Real Results from
            <span style={{ color: BRAND_COLORS.primary }}> Nigerian Schools</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            See how schools across Nigeria are saving money, time, and improving student outcomes with LEAP360.
          </p>
        </motion.div>

        <div className="relative">
          <motion.div
            key={activeIndex}
            className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-12 border border-gray-800 shadow-2xl"
            initial={{ opacity: 0, scale: 0.9, rotateY: 90 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-8">
              {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 + 0.3 }}
                >
                  <Star className="w-6 h-6 text-yellow-400 fill-current mx-1" />
                </motion.div>
              ))}
            </div>
            
            <motion.p 
              className="text-2xl text-gray-300 mb-6 italic text-center leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              "{testimonials[activeIndex].content}"
            </motion.p>

            {/* Results Badge */}
            <motion.div
              className="flex justify-center mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-full px-6 py-3 border border-green-400/30">
                <span className="text-green-400 font-bold text-lg">
                  🎯 {testimonials[activeIndex].results}
                </span>
              </div>
            </motion.div>
            
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h4 className="text-xl font-bold text-white mb-1">
                {testimonials[activeIndex].name}
              </h4>
              <p className="text-red-400 font-semibold mb-1">
                {testimonials[activeIndex].role}
              </p>
              <p className="text-gray-400">
                {testimonials[activeIndex].organization}
              </p>
            </motion.div>
          </motion.div>

          {/* Navigation dots */}
          <div className="flex justify-center space-x-3 mt-12">
            {testimonials.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  index === activeIndex ? 'bg-red-600 scale-125' : 'bg-gray-600 hover:bg-gray-500'
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Professional CTA Section
export const ProfessionalCTASection: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true });

  return (
    <section 
      ref={sectionRef}
      className="py-24 bg-gradient-to-r from-red-600 to-red-800 relative overflow-hidden"
      id="contact"
    >
      {/* 3D Background */}
      <div className="absolute inset-0 opacity-20">
        <Canvas camera={{ position: [0, 0, 10] }}>
          <ambientLight intensity={0.5} />
          <Float speed={1} rotationIntensity={0.5} floatIntensity={1}>
            <Sphere args={[2, 32, 32]} position={[-5, 0, 0]}>
              <meshBasicMaterial color="#ffffff" wireframe />
            </Sphere>
          </Float>
          <Float speed={1.5} rotationIntensity={0.3} floatIntensity={1.5}>
            <Box args={[1.5, 1.5, 1.5]} position={[5, 2, 0]}>
              <meshBasicMaterial color="#ffffff" wireframe />
            </Box>
          </Float>
        </Canvas>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2 
          className="text-5xl md:text-6xl font-bold text-white mb-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          Don't Let Your School
          <span className="block">Fall Behind!</span>
        </motion.h2>
        
        <motion.p 
          className="text-xl text-red-100 mb-8 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Join 500+ Nigerian schools already saving <span className="font-bold">₦2M+ annually</span> and 
          <span className="font-bold"> 40+ hours weekly</span> with LEAP360. 
          Start your transformation today - setup takes just 24 hours!
        </motion.p>

        {/* Urgency Elements */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 border border-white/30 mb-4">
            <span className="text-yellow-300 mr-2 animate-pulse">⚡</span>
            <span className="text-white font-bold">LIMITED TIME: 3 Months FREE for Q2 2026 signups!</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center text-white/90">
              <span className="text-green-300 mr-2">✓</span>
              <span>₦0 Setup Fee (Save ₦500K)</span>
            </div>
            <div className="flex items-center text-white/90">
              <span className="text-green-300 mr-2">✓</span>
              <span>Free Data Migration</span>
            </div>
            <div className="flex items-center text-white/90">
              <span className="text-green-300 mr-2">✓</span>
              <span>24/7 Nigerian Support</span>
            </div>
            <div className="flex items-center text-white/90">
              <span className="text-green-300 mr-2">✓</span>
              <span>30-Day Money Back Guarantee</span>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-6 justify-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <motion.button
            onClick={onGetStarted}
            className="px-12 py-4 bg-white text-red-600 font-bold text-lg rounded-full hover:bg-gray-100 transition-all shadow-2xl relative overflow-hidden group"
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10">Start FREE Trial Now - No Credit Card</span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white"
              initial={{ x: '-100%' }}
              whileHover={{ x: '0%' }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>
          
          <motion.button 
            className="px-12 py-4 bg-white/20 text-white font-bold text-lg rounded-full border-2 border-white/30 hover:bg-white/30 transition-all backdrop-blur-sm"
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            📞 Book 15-Min Demo Call
          </motion.button>
        </motion.div>

        {/* Risk Reversal */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <p className="text-red-100 text-sm">
            🛡️ <span className="font-semibold">Risk-Free Trial:</span> Cancel anytime in first 30 days for full refund
          </p>
        </motion.div>
      </div>
    </section>
  );
};