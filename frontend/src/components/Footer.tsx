import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import bloodlineLogo from '../assets/bloodline_logo.jpg';

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();



  const scrollToSection = (sectionId: string) => {
    // If not on landing page, navigate there first
    if (location.pathname !== '/') {
      navigate('/');
      // Wait for navigation to complete, then scroll
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      // Already on landing page, just scroll
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <div className="mb-4">
              <img 
                src={bloodlineLogo} 
                alt="BloodLine Logo" 
                className="w-10 h-10 rounded-lg object-cover"
              />
            </div>
            <p className="text-gray-400">
              Connecting donors and saving lives through cloud technology.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-bold mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button 
                  onClick={() => scrollToSection('features')} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Features
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('how-it-works')} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button className="hover:text-white transition-colors cursor-pointer">
                  Pricing
                </button>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button 
                  onClick={() => scrollToSection('about')} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  About
                </button>
              </li>
              <li>
                <button className="hover:text-white transition-colors cursor-pointer">
                  Careers
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('contact')} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button className="hover:text-white transition-colors cursor-pointer">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button className="hover:text-white transition-colors cursor-pointer">
                  Terms of Service
                </button>
              </li>
              <li>
                <button className="hover:text-white transition-colors cursor-pointer">
                  HIPAA Compliance
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>&copy; 2025 BloodLine. All rights reserved. Developed for CT071-3-3-DDAC at APU.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;