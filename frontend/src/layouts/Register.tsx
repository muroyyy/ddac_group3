import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle,
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Check,
  Upload,
  FileText
} from 'lucide-react';
import bloodlineLogo from '../assets/bloodline_logo.svg';

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
  documents: File[];
  hospitalId: number | null;
  verificationCode: string;
  position: string;
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
    agreeToTerms: false,
    documents: [],
    hospitalId: null,
    verificationCode: '',
    position: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [hospitals, setHospitals] = useState<Array<{hospitalId: number; hospitalName: string}>>([]);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showOtherPosition, setShowOtherPosition] = useState(false);
  const [showHospitalRequest, setShowHospitalRequest] = useState(false);
  const [hospitalSearch, setHospitalSearch] = useState('');
  const [showHospitalDropdown, setShowHospitalDropdown] = useState(false);
  const [hospitalRequestForm, setHospitalRequestForm] = useState({
    hospitalName: '',
    hospitalAddress: '',
    hospitalCity: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    reason: ''
  });

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  const hospitalPositions = [
    'Nurse',
    'Lab Technician',
    'Phlebotomist',
    'Blood Bank Manager',
    'Medical Technologist',
    'Hospital Administrator',
    'Doctor',
    'Physician',
    'Other'
  ];

  const filteredHospitals = hospitals.filter(hospital =>
    hospital.hospitalName.toLowerCase().includes(hospitalSearch.toLowerCase())
  );

  const selectedHospital = hospitals.find(h => h.hospitalId === formData.hospitalId);

  const handleHospitalRequestSubmit = () => {
    // Mock submission - in real app, this would send to backend
    alert(`Hospital request submitted for: ${hospitalRequestForm.hospitalName}\n\nWe will review your request and contact you at ${hospitalRequestForm.contactEmail} within 2-3 business days.`);
    setShowHospitalRequest(false);
    setHospitalRequestForm({
      hospitalName: '',
      hospitalAddress: '',
      hospitalCity: '',
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
      reason: ''
    });
  };

  React.useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const { hospitalAPI } = await import('../api');
        const response = await hospitalAPI.getAllHospitals();
        if (response.success) {
          setHospitals(response.data);
        }
      } catch (error) {
        console.error('Error fetching hospitals:', error);
      }
    };
    fetchHospitals();
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.hospital-dropdown-container')) {
        setShowHospitalDropdown(false);
      }
    };

    if (showHospitalDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showHospitalDropdown]);

  const formatMalaysianPhone = (value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // If starts with 60, keep it; if starts with 1, add 60; otherwise add 601
    let formattedDigits = digits;
    if (digits.startsWith('60')) {
      formattedDigits = digits;
    } else if (digits.startsWith('1')) {
      formattedDigits = '60' + digits;
    } else if (digits.length > 0) {
      formattedDigits = '601' + digits;
    }
    
    // Limit to 12 digits (60 + 10 digits)
    formattedDigits = formattedDigits.substring(0, 12);
    
    // Format as +601x xxx xxxx
    if (formattedDigits.length >= 4) {
      const formatted = '+' + formattedDigits.substring(0, 2) + formattedDigits.substring(2, 4) + ' ' + 
                       formattedDigits.substring(4, 7) + ' ' + formattedDigits.substring(7, 11);
      return formatted.trim();
    } else if (formattedDigits.length > 0) {
      return '+' + formattedDigits;
    }
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    let processedValue = value;
    if (name === 'phone') {
      processedValue = formatMalaysianPhone(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : processedValue
    }));
    
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      documents: files
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
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
    } else if (!/^\+601[0-9] \d{3} \d{4}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be in format +601x xxx xxxx';
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

    if (formData.role === 'hospital') {
      if (!formData.hospitalId) {
        newErrors.hospitalId = 'Please select a hospital';
      }
      if (!formData.verificationCode.trim()) {
        newErrors.verificationCode = 'Verification code is required';
      }
      if (!formData.position.trim()) {
        newErrors.position = 'Position is required';
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
        const { authAPI } = await import('../api');
        
        // Create FormData for file upload
        const submitData = new FormData();
        submitData.append('fullName', formData.fullName);
        submitData.append('email', formData.email);
        submitData.append('phone', formData.phone);
        submitData.append('bloodType', formData.bloodType);
        submitData.append('location', formData.location);
        submitData.append('password', formData.password);
        submitData.append('role', formData.role);
        
        // Add hospital-specific fields
        if (formData.role === 'hospital') {
          submitData.append('hospitalId', formData.hospitalId?.toString() || '');
          submitData.append('verificationCode', formData.verificationCode);
          submitData.append('position', formData.position);
        }
        
        // Add documents if any
        formData.documents.forEach((file) => {
          submitData.append(`documents`, file);
        });
        
        const response = await authAPI.registerWithFiles(submitData);

        if (response.success) {
          alert('Registration successful! Please wait for admin verification.');
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
          <div className="flex items-center justify-center mb-8">
            <img 
              src={bloodlineLogo} 
              alt="BloodLine Logo" 
              className="w-auto h-16 max-w-full mx-auto"
            />
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
                      placeholder="+601x xxx xxxx"
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
                {formData.role === 'hospital' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Hospital *
                      </label>
                      <div className="relative hospital-dropdown-container">
                        <input
                          type="text"
                          value={selectedHospital ? selectedHospital.hospitalName : hospitalSearch}
                          onChange={(e) => {
                            setHospitalSearch(e.target.value);
                            setShowHospitalDropdown(true);
                            if (selectedHospital) {
                              setFormData(prev => ({...prev, hospitalId: null}));
                            }
                          }}
                          onFocus={() => setShowHospitalDropdown(true)}
                          placeholder="Search for your hospital..."
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all ${
                            errors.hospitalId ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                        {showHospitalDropdown && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {filteredHospitals.length > 0 ? (
                              filteredHospitals.map(hospital => (
                                <button
                                  key={hospital.hospitalId}
                                  type="button"
                                  onClick={() => {
                                    setFormData(prev => ({...prev, hospitalId: hospital.hospitalId}));
                                    setHospitalSearch('');
                                    setShowHospitalDropdown(false);
                                  }}
                                  className="w-full text-left px-4 py-3 hover:bg-red-50 transition-colors border-b border-gray-100 last:border-0"
                                >
                                  <div className="font-medium text-gray-900">{hospital.hospitalName}</div>
                                </button>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-gray-500 text-sm">
                                No hospitals found
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setShowHospitalRequest(true);
                                setShowHospitalDropdown(false);
                              }}
                              className="w-full text-left px-4 py-3 bg-red-50 hover:bg-red-100 transition-colors border-t-2 border-red-200 text-red-700 font-medium"
                            >
                              + Request to add a new hospital
                            </button>
                          </div>
                        )}
                      </div>
                      {errors.hospitalId && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.hospitalId}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-gray-500">
                        Can't find your hospital? Click "Request to add a new hospital" below the list
                      </p>
                    </div>

                    <div>
                      <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-2">
                        Verification Code *
                      </label>
                      <input
                        type="text"
                        id="verificationCode"
                        name="verificationCode"
                        value={formData.verificationCode}
                        onChange={handleChange}
                        placeholder="Enter code provided by your hospital"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all ${
                          errors.verificationCode ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      {errors.verificationCode && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.verificationCode}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-gray-500">
                        Contact your hospital HR to get the verification code
                      </p>
                    </div>

                    <div>
                      <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                        Position *
                      </label>
                      <select
                        id="position"
                        name="position"
                        value={showOtherPosition ? 'Other' : formData.position}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === 'Other') {
                            setShowOtherPosition(true);
                            setFormData(prev => ({...prev, position: ''}));
                          } else {
                            setShowOtherPosition(false);
                            setFormData(prev => ({...prev, position: value}));
                          }
                        }}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all cursor-pointer ${
                          errors.position ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select your position</option>
                        {hospitalPositions.map(pos => (
                          <option key={pos} value={pos}>{pos}</option>
                        ))}
                      </select>
                      {showOtherPosition && (
                        <input
                          type="text"
                          name="position"
                          value={formData.position}
                          onChange={handleChange}
                          placeholder="Enter your position"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all mt-3 ${
                            errors.position ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                      )}
                      {errors.position && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.position}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Staff ID or Employment Letter *
                      </label>
                      <p className="text-xs text-gray-500 mb-3">
                        Please upload your staff ID card or employment letter for verification
                      </p>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 transition-colors">
                        <input
                          type="file"
                          id="documents"
                          multiple
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <label htmlFor="documents" className="cursor-pointer">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-1">Click to upload documents</p>
                          <p className="text-xs text-gray-400">JPG, PNG, PDF up to 10MB each</p>
                        </label>
                      </div>
                      {formData.documents.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {formData.documents.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-700">{file.name}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="text-red-500 hover:text-red-700 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

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
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all cursor-pointer ${
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

                {(formData.role === 'donor' || formData.role === 'patient') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Verification Documents *
                    </label>
                    <p className="text-xs text-gray-500 mb-3">
                      Please upload your ID card or medical card showing your blood type for verification
                    </p>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 transition-colors">
                      <input
                        type="file"
                        id="documents"
                        multiple
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label htmlFor="documents" className="cursor-pointer">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-1">Click to upload documents</p>
                        <p className="text-xs text-gray-400">JPG, PNG, PDF up to 10MB each</p>
                      </label>
                    </div>
                    {formData.documents.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {formData.documents.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-700">{file.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
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
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 mt-1 cursor-pointer"
                    />
                    <span className="text-sm text-gray-700">
                      I agree to the{' '}
                      <button
                        type="button"
                        onClick={() => setShowTerms(true)}
                        className="text-red-600 hover:text-red-700 font-medium underline cursor-pointer"
                      >
                        Terms and Conditions
                      </button>{' '}
                      and{' '}
                      <button
                        type="button"
                        onClick={() => setShowPrivacy(true)}
                        className="text-red-600 hover:text-red-700 font-medium underline cursor-pointer"
                      >
                        Privacy Policy
                      </button>
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
                    className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-semibold cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
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
                className="text-red-600 hover:text-red-700 hover:underline font-semibold cursor-pointer"
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

      {/* Terms and Conditions Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900">Terms and Conditions</h3>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4 text-sm text-gray-700">
                <p className="text-xs text-gray-500">Last updated: January 2025</p>
                
                <h4 className="font-semibold text-base text-gray-900 mt-4">1. Acceptance of Terms</h4>
                <p>By accessing and using BloodLine, you accept and agree to be bound by the terms and provision of this agreement.</p>
                
                <h4 className="font-semibold text-base text-gray-900 mt-4">2. User Responsibilities</h4>
                <p>Users must provide accurate and truthful information during registration. Donors must ensure they meet health requirements for blood donation. Patients must provide valid medical documentation when requesting blood.</p>
                
                <h4 className="font-semibold text-base text-gray-900 mt-4">3. Blood Donation</h4>
                <p>All blood donations are voluntary and unpaid. Donors must be at least 18 years old and meet health eligibility criteria. BloodLine facilitates connections but does not directly handle blood collection or transfusion.</p>
                
                <h4 className="font-semibold text-base text-gray-900 mt-4">4. Privacy and Data Protection</h4>
                <p>We collect and process personal data in accordance with applicable data protection laws. Medical information is handled with strict confidentiality. Users have the right to access, correct, or delete their personal data.</p>
                
                <h4 className="font-semibold text-base text-gray-900 mt-4">5. Hospital Staff Verification</h4>
                <p>Hospital staff must provide valid employment verification. Verification codes are issued by authorized hospital administrators. Misrepresentation of hospital affiliation may result in account termination and legal action.</p>
                
                <h4 className="font-semibold text-base text-gray-900 mt-4">6. Limitation of Liability</h4>
                <p>BloodLine is a platform connecting donors, patients, and hospitals. We are not responsible for medical outcomes, blood quality, or transfusion procedures. All medical procedures are the responsibility of licensed healthcare facilities.</p>
                
                <h4 className="font-semibold text-base text-gray-900 mt-4">7. Account Termination</h4>
                <p>We reserve the right to suspend or terminate accounts that violate these terms. Users may delete their accounts at any time through account settings.</p>
                
                <h4 className="font-semibold text-base text-gray-900 mt-4">8. Changes to Terms</h4>
                <p>We may modify these terms at any time. Users will be notified of significant changes. Continued use of the platform constitutes acceptance of modified terms.</p>
                
                <h4 className="font-semibold text-base text-gray-900 mt-4">9. Contact Information</h4>
                <p>For questions about these terms, contact us at legal@bloodline.dev</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowTerms(false)}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900">Privacy Policy</h3>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4 text-sm text-gray-700">
                <p className="text-xs text-gray-500">Last updated: January 2025</p>
                
                <h4 className="font-semibold text-base text-gray-900 mt-4">1. Information We Collect</h4>
                <p><strong>Personal Information:</strong> Name, email, phone number, blood type, location, and medical documentation.</p>
                <p><strong>Health Information:</strong> Blood type, donation history, medical eligibility status.</p>
                <p><strong>Usage Data:</strong> Login times, feature usage, and platform interactions.</p>
                
                <h4 className="font-semibold text-base text-gray-900 mt-4">2. How We Use Your Information</h4>
                <p>We use your information to:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Facilitate blood donation requests and matching</li>
                  <li>Verify user identities and hospital affiliations</li>
                  <li>Communicate important updates and notifications</li>
                  <li>Improve platform functionality and user experience</li>
                  <li>Comply with legal and regulatory requirements</li>
                </ul>
                
                <h4 className="font-semibold text-base text-gray-900 mt-4">3. Information Sharing</h4>
                <p>We share information only with:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Authorized hospital staff for blood request processing</li>
                  <li>Donors when they respond to blood requests</li>
                  <li>Law enforcement when legally required</li>
                </ul>
                <p className="mt-2">We never sell your personal information to third parties.</p>
                
                <h4 className="font-semibold text-base text-gray-900 mt-4">4. Data Security</h4>
                <p>We implement industry-standard security measures including:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Encrypted data transmission (HTTPS/TLS)</li>
                  <li>Secure password hashing (BCrypt)</li>
                  <li>Regular security audits and updates</li>
                  <li>Access controls and authentication</li>
                  <li>AWS cloud infrastructure security</li>
                </ul>
                
                <h4 className="font-semibold text-base text-gray-900 mt-4">5. Your Rights</h4>
                <p>You have the right to:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate information</li>
                  <li>Request data deletion</li>
                  <li>Opt-out of non-essential communications</li>
                  <li>Export your data</li>
                </ul>
                
                <h4 className="font-semibold text-base text-gray-900 mt-4">6. Data Retention</h4>
                <p>We retain your data for as long as your account is active. After account deletion, we may retain certain information for legal compliance and audit purposes for up to 7 years.</p>
                
                <h4 className="font-semibold text-base text-gray-900 mt-4">7. Cookies and Tracking</h4>
                <p>We use session cookies for authentication and functionality. We do not use third-party tracking cookies for advertising.</p>
                
                <h4 className="font-semibold text-base text-gray-900 mt-4">8. Children's Privacy</h4>
                <p>BloodLine is not intended for users under 18 years of age. We do not knowingly collect information from minors.</p>
                
                <h4 className="font-semibold text-base text-gray-900 mt-4">9. Changes to Privacy Policy</h4>
                <p>We may update this policy periodically. Users will be notified of significant changes via email or platform notification.</p>
                
                <h4 className="font-semibold text-base text-gray-900 mt-4">10. Contact Us</h4>
                <p>For privacy concerns or data requests, contact us at:</p>
                <p className="mt-2">Email: privacy@bloodline.dev<br/>Address: BloodLine Data Protection Office, Kuala Lumpur, Malaysia</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowPrivacy(false)}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hospital Request Modal */}
      {showHospitalRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(255, 255, 255, 0.3)' }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900">Request New Hospital</h3>
              <p className="text-sm text-gray-600 mt-1">Fill in the details below and we'll review your request</p>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hospital Name *
                  </label>
                  <input
                    type="text"
                    value={hospitalRequestForm.hospitalName}
                    onChange={(e) => setHospitalRequestForm(prev => ({...prev, hospitalName: e.target.value}))}
                    placeholder="Enter hospital name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hospital Address *
                  </label>
                  <input
                    type="text"
                    value={hospitalRequestForm.hospitalAddress}
                    onChange={(e) => setHospitalRequestForm(prev => ({...prev, hospitalAddress: e.target.value}))}
                    placeholder="Street address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City/State *
                  </label>
                  <input
                    type="text"
                    value={hospitalRequestForm.hospitalCity}
                    onChange={(e) => setHospitalRequestForm(prev => ({...prev, hospitalCity: e.target.value}))}
                    placeholder="e.g., Kuala Lumpur, Selangor"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={hospitalRequestForm.contactPerson}
                    onChange={(e) => setHospitalRequestForm(prev => ({...prev, contactPerson: e.target.value}))}
                    placeholder="Your full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    value={hospitalRequestForm.contactEmail}
                    onChange={(e) => setHospitalRequestForm(prev => ({...prev, contactEmail: e.target.value}))}
                    placeholder="your.email@hospital.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={hospitalRequestForm.contactPhone}
                    onChange={(e) => setHospitalRequestForm(prev => ({...prev, contactPhone: e.target.value}))}
                    placeholder="+60xx xxx xxxx"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Request
                  </label>
                  <textarea
                    value={hospitalRequestForm.reason}
                    onChange={(e) => setHospitalRequestForm(prev => ({...prev, reason: e.target.value}))}
                    placeholder="Why should we add this hospital? (Optional)"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> We'll review your request within 2-3 business days and contact you at the provided email address.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowHospitalRequest(false)}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleHospitalRequestSubmit}
                disabled={!hospitalRequestForm.hospitalName || !hospitalRequestForm.hospitalAddress || !hospitalRequestForm.hospitalCity || !hospitalRequestForm.contactPerson || !hospitalRequestForm.contactEmail || !hospitalRequestForm.contactPhone}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;