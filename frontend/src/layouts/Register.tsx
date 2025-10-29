import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Droplet, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle,
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Check
} from 'lucide-react';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  bloodType: string;
  location: string;
  password: string;
  confirmPassword: string;
  role: 'donor' | 'patient' | 'hospital' | '';
  agreeToTerms: boolean;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    bloodType: '',
    location: '',
    password: '',
    confirmPassword: '',
    role: '',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid';
    }

    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (formData.role === 'donor' || formData.role === 'patient') {
      if (!formData.bloodType) {
        newErrors.bloodType = 'Blood type is required';
      }
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (validateStep2()) {
      setIsLoading(true);
      
      try {
        const { authAPI } = await import('../utils/apiClient');
        const response = await authAPI.register({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          bloodType: formData.bloodType,
          location: formData.location,
          password: formData.password,
          role: formData.role
        });

        if (response.success) {
          alert('Registration successful! You can now sign in.');
          navigate('/login');
        } else {
          alert(response.message || 'Registration failed');
        }
      } catch (error) {
        alert('Network error. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
              <Droplet className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">BloodLine</span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Create Account
            </h2>
            <p className="text-gray-600">
              Join BloodLine and start saving lives today
            </p>
          </div>

          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-red-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  currentStep >= 1 ? 'bg-red-600 text-white' : 'bg-gray-200'
                }`}>
                  {currentStep > 1 ? <Check className="w-5 h-5" /> : '1'}
                </div>
                <span className="font-medium hidden sm:inline">Basic Info</span>
              </div>
              <div className={`w-16 h-0.5 ${currentStep >= 2 ? 'bg-red-600' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-red-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  currentStep >= 2 ? 'bg-red-600 text-white' : 'bg-gray-200'
                }`}>
                  2
                </div>
                <span className="font-medium hidden sm:inline">Details & Security</span>
              </div>
            </div>
          </div>

          <div>
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all ${
                        errors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all ${
                        errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all ${
                        errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    I am registering as *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.role === 'donor' 
                        ? 'border-red-600 bg-red-50' 
                        : 'border-gray-300 hover:border-red-300'
                    }`}>
                      <input
                        type="radio"
                        name="role"
                        value="donor"
                        checked={formData.role === 'donor'}
                        onChange={handleChange}
                        className="w-4 h-4 text-red-600"
                      />
                      <div className="ml-3">
                        <div className="font-semibold text-gray-900">🩸 Donor</div>
                        <div className="text-xs text-gray-600">I want to donate blood</div>
                      </div>
                    </label>

                    <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.role === 'patient' 
                        ? 'border-red-600 bg-red-50' 
                        : 'border-gray-300 hover:border-red-300'
                    }`}>
                      <input
                        type="radio"
                        name="role"
                        value="patient"
                        checked={formData.role === 'patient'}
                        onChange={handleChange}
                        className="w-4 h-4 text-red-600"
                      />
                      <div className="ml-3">
                        <div className="font-semibold text-gray-900">🧍 Patient</div>
                        <div className="text-xs text-gray-600">I need blood</div>
                      </div>
                    </label>

                    <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.role === 'hospital' 
                        ? 'border-red-600 bg-red-50' 
                        : 'border-gray-300 hover:border-red-300'
                    }`}>
                      <input
                        type="radio"
                        name="role"
                        value="hospital"
                        checked={formData.role === 'hospital'}
                        onChange={handleChange}
                        className="w-4 h-4 text-red-600"
                      />
                      <div className="ml-3">
                        <div className="font-semibold text-gray-900">🏥 Hospital Staff</div>
                        <div className="text-xs text-gray-600">Blood bank management</div>
                      </div>
                    </label>
                  </div>
                  {errors.role && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.role}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 font-semibold transition-all cursor-pointer"
                >
                  Next Step
                </button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                {(formData.role === 'donor' || formData.role === 'patient') && (
                  <div>
                    <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700 mb-2">
                      Blood Type *
                    </label>
                    <select
                      id="bloodType"
                      name="bloodType"
                      value={formData.bloodType}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all ${
                        errors.bloodType ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select your blood type</option>
                      {bloodTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    {errors.bloodType && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.bloodType}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <MapPin className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all ${
                        errors.location ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Kuala Lumpur, Malaysia"
                    />
                  </div>
                  {errors.location && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.location}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all ${
                        errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.password}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    Must be 8+ characters with uppercase, lowercase, and number
                  </p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all ${
                        errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Re-enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 mt-1"
                    />
                    <span className="text-sm text-gray-700">
                      I agree to the{' '}
                      <a href="#terms" className="text-red-600 hover:text-red-700 font-medium">
                        Terms and Conditions
                      </a>{' '}
                      and{' '}
                      <a href="#privacy" className="text-red-600 hover:text-red-700 font-medium">
                        Privacy Policy
                      </a>
                    </span>
                  </label>
                  {errors.agreeToTerms && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.agreeToTerms}
                    </p>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-semibold"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-red-600 hover:text-red-700 font-semibold cursor-pointer"
              >
                Sign in
              </button>
            </p>
          </div>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;