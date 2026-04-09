/**
 * Lightweight Homepage - Optimized for Nigerian Market
 * 
 * Performance-optimized homepage with Nigerian educational focus.
 */

"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/core/hooks/useAuth';
import { useTenantBranding } from '@/core/tenant';
import AppLogo from '@/core/partials/AppLogo';
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
  ArrowUp
} from 'lucide-react';

// Nigerian-focused content
const nigerianFeatures = [
  {
    icon: <BookOpen className="w-8 h-8" />,
    title: "WAEC & JAMB Preparation",
    description: "Comprehensive preparation for Nigerian examinations with past questions and practice tests.",
    benefit: "95% pass rate improvement"
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Collaborative Learning",
    description: "Connect students across Nigeria for peer learning and study groups.",
    benefit: "Better peer connections"
  },
  {
    icon: <BarChart3 className="w-8 h-8" />,
    title: "Performance Analytics",
    description: "Track student progress with detailed analytics and parent reports.",
    benefit: "Data-driven insights"
  },
  {
    icon: <Smartphone className="w-8 h-8" />,
    title: "Mobile-First Design",
    description: "Works perfectly on all devices, optimized for Nigerian internet speeds.",
    benefit: "Learn anywhere, anytime"
  }
];

const nigerianTestimonials = [
  {
    name: "Mrs. Adebayo Folake",
    role: "Principal",
    school: "Lagos State Model College",
    content: "LEAP360 has transformed how our students prepare for WAEC. Our pass rates have improved by 40% since implementation.",
    rating: 5
  },
  {
    name: "Mr. Chukwu Emmanuel",
    role: "Mathematics Teacher",
    school: "Federal Government College, Abuja",
    content: "The platform makes it easy to track student progress and identify areas where they need extra help.",
    rating: 5
  },
  {
    name: "Fatima Abdullahi",
    role: "SS3 Student",
    school: "Government Secondary School, Kano",
    content: "I love how I can practice JAMB questions on my phone. It helped me score 280 in my UTME!",
    rating: 5
  }
];

const trustedClients = [
  "Lagos State Ministry of Education",
  "Ogun State Ministry of Education", 
  "Federal Ministry of Education",
  "University of Lagos",
  "Covenant University"
];

// Lightweight Navigation
const Navigation: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { primaryColor } = useTenantBranding();

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <AppLogo scale="small" textClassName="text-white" />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Success Stories</a>
            <button
              onClick={onGetStarted}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              style={{ backgroundColor: primaryColor }}
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-slate-800 rounded-lg mt-2 p-4">
            <a href="#features" className="block py-2 text-gray-300 hover:text-white">Features</a>
            <a href="#testimonials" className="block py-2 text-gray-300 hover:text-white">Success Stories</a>
            <button
              onClick={onGetStarted}
              className="block w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
              style={{ backgroundColor: primaryColor }}
            >
              Get Started
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

// Lightweight Hero Section
const HeroSection: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  const { primaryColor } = useTenantBranding();

  return (
    <section className="pt-20 pb-16 bg-gradient-to-br from-slate-900 to-blue-900 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Transform Nigerian
            <span 
              className="block bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent"
            >
              Education Today
            </span>
          </motion.h1>

          <motion.p 
            className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Empowering Nigerian students with world-class digital learning tools. 
            Prepare for WAEC, JAMB, and beyond with our comprehensive educational platform.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <button
              onClick={onGetStarted}
              className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              style={{ backgroundColor: primaryColor }}
            >
              Start Learning Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            
            <button className="px-8 py-4 bg-white/10 text-white font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition-colors">
              Watch Demo
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div>
              <div className="text-3xl font-bold text-blue-400">50K+</div>
              <div className="text-gray-400 text-sm">Nigerian Students</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400">500+</div>
              <div className="text-gray-400 text-sm">Schools</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-400">95%</div>
              <div className="text-gray-400 text-sm">Pass Rate</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Lightweight Features Section
const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Built for Nigerian Education
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Addressing the unique challenges of Nigerian students and educators with 
            locally relevant content and features.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {nigerianFeatures.map((feature, index) => (
            <motion.div
              key={index}
              className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-xl mb-4 text-blue-600">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 mb-3">{feature.description}</p>
              <div className="flex items-center justify-center text-green-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4 mr-1" />
                {feature.benefit}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Lightweight Testimonials Section
const TestimonialsSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % nigerianTestimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const testimonial = nigerianTestimonials[activeIndex];

  return (
    <section id="testimonials" className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
          Success Stories from Nigeria
        </h2>

        <motion.div
          key={activeIndex}
          className="bg-white rounded-xl p-8 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center mb-4">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
            ))}
          </div>
          
          <p className="text-lg text-gray-700 mb-6 italic">
            &ldquo;{testimonial.content}&rdquo;
          </p>
          
          <div>
            <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
            <p className="text-gray-600">{testimonial.role}</p>
            <p className="text-sm text-gray-500">{testimonial.school}</p>
          </div>
        </motion.div>

        {/* Navigation dots */}
        <div className="flex justify-center space-x-2 mt-8">
          {nigerianTestimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === activeIndex ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Trusted by section */}
        <div className="mt-16">
          <p className="text-gray-600 mb-8">Trusted by leading Nigerian institutions:</p>
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500">
            {trustedClients.map((client, index) => (
              <div key={index} className="text-sm font-medium">
                {client}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Lightweight CTA Section
const CTASection: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  const { primaryColor } = useTenantBranding();

  return (
    <section className="py-16 bg-blue-600 text-white" style={{ backgroundColor: primaryColor }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Transform Your Education?
        </h2>
        <p className="text-xl mb-8 opacity-90">
          Join thousands of Nigerian students already succeeding with LEAP360.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onGetStarted}
            className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Start Free Trial
          </button>
          <button className="px-8 py-4 bg-white/20 text-white font-semibold rounded-lg border border-white/30 hover:bg-white/30 transition-colors">
            Contact Sales
          </button>
        </div>
      </div>
    </section>
  );
};

// Lightweight Footer
const Footer: React.FC = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <AppLogo scale="small" textClassName="text-white" />
            <p className="text-gray-400 mt-4 text-sm">
              Transforming Nigerian education through innovative technology.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">WAEC Prep</a></li>
              <li><a href="#" className="hover:text-white transition-colors">JAMB Prep</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">WhatsApp Support</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          © 2024 LEAP360. All rights reserved. Made in Nigeria 🇳🇬
        </div>
      </div>

      {/* Back to top button */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}
    </footer>
  );
};

// Main Lightweight Homepage Component
export const LightweightHomepage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/schools');
    }
  }, [isAuthenticated, router]);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/schools');
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation onGetStarted={handleGetStarted} />
      <HeroSection onGetStarted={handleGetStarted} />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection onGetStarted={handleGetStarted} />
      <Footer />
    </div>
  );
};

export default LightweightHomepage;
