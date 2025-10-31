import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Droplet, 
  Mail, 
  ArrowLeft,
  ExternalLink,
  Clock,
  CheckCircle
} from 'lucide-react';

interface EmailData {
  email: string;
  resetToken: string;
  expiresAt: string;
}

const MockEmail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const emailData = location.state as EmailData;
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!emailData) {
      navigate('/forgot-password');
      return;
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = new Date(emailData.expiresAt).getTime();
      const difference = expiry - now;

      if (difference > 0) {
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setTimeLeft('Expired');
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [emailData, navigate]);

  if (!emailData) {
    return null;
  }

  const handleResetClick = () => {
    navigate('/reset-password', { 
      state: { 
        email: emailData.email,
        token: emailData.resetToken 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Email Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <Mail className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Mock Email Inbox</h1>
                <p className="text-blue-100 text-sm">Simulated email for assignment demo</p>
              </div>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
                <span>To: {emailData.email}</span>
                <span>From: noreply@bloodline.com</span>
              </div>
            </div>
          </div>

          {/* Email Content */}
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-16 h-16 bg-red-600 rounded-xl flex items-center justify-center">
                <Droplet className="w-9 h-9 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">BloodLine</h2>
                <p className="text-gray-600">Password Reset Request</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Reset Your Password
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  We received a request to reset your password for your BloodLine account. 
                  Click the button below to create a new password.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-red-500">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-gray-900">Time Remaining</span>
                </div>
                <p className="text-2xl font-bold text-red-600">{timeLeft}</p>
                <p className="text-sm text-gray-600 mt-1">
                  This reset link will expire in 15 minutes for security reasons.
                </p>
              </div>

              <div className="text-center py-6">
                <button
                  onClick={handleResetClick}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 font-semibold transition-all text-lg"
                >
                  <ExternalLink className="w-5 h-5" />
                  Reset My Password
                </button>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-1">Security Notice</h4>
                    <p className="text-sm text-yellow-700">
                      If you didn't request this password reset, please ignore this email. 
                      Your password will remain unchanged.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center text-sm text-gray-500 pt-6 border-t">
                <p>This is a simulated email for demonstration purposes.</p>
                <p>In production, this would be sent to your actual email address.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button 
            type="button"
            onClick={() => navigate('/forgot-password')}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to forgot password
          </button>
        </div>
      </div>
    </div>
  );
};

export default MockEmail;