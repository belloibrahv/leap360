/**
 * Footer Component
 * 
 * Comprehensive footer with animations, links, and tenant branding.
 */

"use client";

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { useTenantBranding } from '@/core/tenant';
import AppLogo from '@/core/partials/AppLogo';
import { 
  ExternalLink, 
  Mail, 
  ArrowUp 
} from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const footerLinks = {
  product: [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "Security", href: "#security" },
    { name: "Integrations", href: "#integrations" },
    { name: "API", href: "#api" }
  ],
  solutions: [
    { name: "K-12 Schools", href: "#k12" },
    { name: "Higher Education", href: "#higher-ed" },
    { name: "Corporate Training", href: "#corporate" },
    { name: "Online Courses", href: "#online" },
    { name: "Tutoring", href: "#tutoring" }
  ],
  resources: [
    { name: "Documentation", href: "#docs" },
    { name: "Help Center", href: "#help" },
    { name: "Blog", href: "#blog" },
    { name: "Webinars", href: "#webinars" },
    { name: "Case Studies", href: "#cases" }
  ],
  company: [
    { name: "About Us", href: "#about" },
    { name: "Careers", href: "#careers" },
    { name: "Press", href: "#press" },
    { name: "Partners", href: "#partners" },
    { name: "Contact", href: "#contact" }
  ]
};

const socialLinks = [
  {
    name: "Twitter",
    href: "#",
    icon: <ExternalLink className="w-5 h-5" />
  },
  {
    name: "LinkedIn",
    href: "#",
    icon: <ExternalLink className="w-5 h-5" />
  },
  {
    name: "GitHub",
    href: "#",
    icon: <ExternalLink className="w-5 h-5" />
  },
  {
    name: "Contact",
    href: "#",
    icon: <Mail className="w-5 h-5" />
  }
];

export const Footer: React.FC = () => {
  const footerRef = useRef<HTMLDivElement>(null);
  const { primaryColor, secondaryColor, tenantName } = useTenantBranding();

  useEffect(() => {
    if (!footerRef.current) return;

    gsap.fromTo(".footer-section",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 90%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      }
    );
  }, []);

  return (
    <footer 
      ref={footerRef}
      className="relative bg-slate-900 border-t border-white/10"
    >
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="footer-section lg:col-span-2">
            <div className="mb-6">
              <AppLogo scale="medium" />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-md">
              Transforming education through innovative technology, personalized learning experiences, 
              and seamless collaboration for the next generation of learners.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          <div className="footer-section">
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="text-white font-semibold mb-4">Solutions</h3>
            <ul className="space-y-3">
              {footerLinks.solutions.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="footer-section mt-16 pt-8 border-t border-white/10">
          <div className="max-w-md">
            <h3 className="text-white font-semibold mb-4">Stay Updated</h3>
            <p className="text-gray-400 text-sm mb-4">
              Get the latest updates on new features, educational insights, and platform improvements.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-l-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
              />
              <motion.button
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-r-lg hover:shadow-lg transition-all duration-300"
                style={{
                  backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2026 {tenantName || 'LEAP360'}. All rights reserved.
            </div>
            
            <div className="flex space-x-6 text-sm">
              <a href="#privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#cookies" className="text-gray-400 hover:text-white transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Back to Top Button */}
      <motion.button
        className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`
        }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <ArrowUp className="w-6 h-6" />
      </motion.button>
    </footer>
  );
};

export default Footer;