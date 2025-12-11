import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import bloodlineLogo from '../assets/bloodline_logo.svg';

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
    <footer className="bg-white text-gray-900 py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          
          {/* Brand */}
          <div className="text-center md:text-left">
            <div className="mb-4 flex justify-center md:justify-start">
              <img
                src={bloodlineLogo}
                alt="BloodLine Logo"
                className="w-auto h-12"
              />
            </div>
            <p className="text-gray-600 text-center md:text-left">
              Inspiring more people to donate and save lives every day.
            </p>
          </div>

          {/* Awareness Links */}
          <div className="text-center md:text-left">
            <h4 className="font-bold mb-4">Learn</h4>
            <ul className="space-y-2 text-gray-600">
              <li>
                <button
                  onClick={() => scrollToSection('why-donate')}
                  className="hover:text-gray-900 transition-colors cursor-pointer"
                >
                  Why Donate?
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="hover:text-gray-900 transition-colors cursor-pointer"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('who-you-help')}
                  className="hover:text-gray-900 transition-colors cursor-pointer"
                >
                  Who You Help
                </button>
              </li>
            </ul>
          </div>

          {/* FAQ & Resources */}
          <div className="text-center md:text-left">
            <h4 className="font-bold mb-4">Resources</h4>
            <ul className="space-y-2 text-gray-600">
              <li>
                <button
                  onClick={() => scrollToSection('faqs')}
                  className="hover:text-gray-900 transition-colors cursor-pointer"
                >
                  FAQs
                </button>
              </li>
              <li>
                <button className="hover:text-gray-900 transition-colors cursor-pointer">
                  Eligibility Requirements
                </button>
              </li>
              <li>
                <button className="hover:text-gray-900 transition-colors cursor-pointer">
                  Blood Compatibility Chart
                </button>
              </li>
            </ul>
          </div>


        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 pt-8 text-center text-gray-600">
          <p>&copy; 2025 BloodLine. All rights reserved. Developed for CT071-3-3-DDAC at APU.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;