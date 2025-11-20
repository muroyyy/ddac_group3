import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Droplet, 
  Heart, 
  Shield, 
  Zap, 
  Users, 
  Activity,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-red-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 rounded-full text-red-600 text-sm font-medium mb-6">
                <Heart className="w-4 h-4" />
                Saving Lives Through Technology
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Connect Donors & Save Lives in
                <span className="text-red-600"> Real-Time</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                BloodLine is a cloud-based blood bank management system that bridges the gap between donors, patients, and hospitals during critical emergencies.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => navigate('/register')}
                  className="px-8 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-lg flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  Start Saving Lives
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => {
                    const element = document.getElementById('features');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-8 py-4 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-lg border-2 border-gray-300 cursor-pointer"
                >
                  Learn More
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-8 shadow-2xl">
                <div className="bg-white rounded-xl p-6 mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <Droplet className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Current Status</div>
                      <div className="text-lg font-bold text-gray-900">System Online</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">1,234</div>
                      <div className="text-sm text-gray-600">Active Donors</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">156</div>
                      <div className="text-sm text-gray-600">Pending Requests</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-red-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">2,847</div>
              <div className="text-red-100 text-sm md:text-base">Total Users</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">1,234</div>
              <div className="text-red-100 text-sm md:text-base">Active Donors</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">98%</div>
              <div className="text-red-100 text-sm md:text-base">Match Success Rate</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">24/7</div>
              <div className="text-red-100 text-sm md:text-base">System Availability</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose BloodLine?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform leverages cutting-edge cloud technology to ensure blood availability when it matters most.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Zap className="w-7 h-7 text-red-600" />, title: 'Real-Time Matching', desc: 'Instantly connect donors with patients in need through our cloud-powered platform.' },
              { icon: <Shield className="w-7 h-7 text-red-600" />, title: 'Secure & Compliant', desc: 'Your data is protected with enterprise-grade security and HIPAA compliance.' },
              { icon: <Activity className="w-7 h-7 text-red-600" />, title: 'Live Inventory', desc: 'Track blood stock levels in real-time across all connected hospitals.' },
              { icon: <Users className="w-7 h-7 text-red-600" />, title: 'Multi-Role Access', desc: 'Seamless experience for donors, patients, hospitals, and administrators.' }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="w-14 h-14 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple steps to make a life-saving difference
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Register</h3>
              <p className="text-gray-600">Create your account and complete your profile with blood type and location.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Get Matched</h3>
              <p className="text-gray-600">Our system automatically matches donors with patients based on compatibility.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Save Lives</h3>
              <p className="text-gray-600">Receive notifications and coordinate with hospitals to donate blood.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-red-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Built for Everyone in the Healthcare Ecosystem
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Whether you're a donor wanting to help, a patient in need, or a hospital managing inventory, BloodLine has you covered.
              </p>
              <div className="space-y-4">
                {[
                  'Connect with verified donors instantly',
                  'Track donation history and impact',
                  'Receive urgent blood shortage alerts',
                  'Access 24/7 from anywhere',
                  'Automated matching system',
                  'Comprehensive reporting'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">User Roles</h3>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="font-bold text-green-900 mb-1">🩸 Donors</div>
                  <p className="text-sm text-green-700">Register, donate, track history, receive urgent alerts</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="font-bold text-blue-900 mb-1">🧍 Patients</div>
                  <p className="text-sm text-blue-700">Request blood, track status, get notifications</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="font-bold text-purple-900 mb-1">🏥 Hospitals</div>
                  <p className="text-sm text-purple-700">Manage inventory, approve requests, generate reports</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="font-bold text-gray-900 mb-1">⚙️ Admins</div>
                  <p className="text-sm text-gray-700">System oversight, user management, analytics</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact/CTA Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-red-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-red-100 mb-8">
            Join thousands of donors, patients, and healthcare providers using BloodLine to save lives every day.
          </p>
          <button 
            onClick={() => navigate('/register')}
            className="px-8 py-4 bg-white text-red-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg shadow-xl inline-flex items-center gap-2 cursor-pointer"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;