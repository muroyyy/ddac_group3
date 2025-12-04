import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import bloodlineLogo from '../assets/bloodline_logo.jpg';

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand */}
          <div>
            <div className="mb-4">
              <img
                src={bloodlineLogo}
                alt="BloodLine Logo"
                className="w-10 h-10 rounded-lg object-cover"
              />
            </div>
            <p className="text-gray-400">
              Inspiring more people to donate and save lives every day.
            </p>
          </div>

          {/* Awareness Links */}
          <div>
            <h4 className="font-bold mb-4">Learn</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button
                  onClick={() => scrollToSection('why-donate')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Why Donate?
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
                <button
                  onClick={() => scrollToSection('who-you-help')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Who You Help
                </button>
              </li>
            </ul>
          </div>

          {/* FAQ & Resources */}
          <div>
            <h4 className="font-bold mb-4">Resources</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button
                  onClick={() => scrollToSection('faqs')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  FAQs
                </button>
              </li>
              <li>
                <button className="hover:text-white transition-colors cursor-pointer">
                  Eligibility Requirements
                </button>
              </li>
              <li>
                <button className="hover:text-white transition-colors cursor-pointer">
                  Blood Compatibility Chart
                </button>
              </li>
            </ul>
          </div>

          {/* Legal */}
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