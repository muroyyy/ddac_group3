import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Droplet,
  Activity,
  ShieldCheck,
  Users,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowRight
} from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import BloodTable from './BloodTable';
import { useAuth } from '../context/AuthContext';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 50,
    });
  }, []);

  const bloodDonationImages = [
    "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800&h=600&fit=crop&crop=center", 
    "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=800&h=600&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=800&h=600&fit=crop&crop=center"
  ];
  
  const randomImage = bloodDonationImages[Math.floor(Math.random() * bloodDonationImages.length)];
  
  return (
    <section className="relative w-full bg-gradient-to-br from-red-600 to-red-800 text-white pt-24 pb-32 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full mix-blend-overlay blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-red-300 rounded-full mix-blend-overlay blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8" data-aos="fade-right">
          <div className="inline-flex items-center space-x-2 bg-red-500/30 px-4 py-2 rounded-full border border-red-400/30 backdrop-blur-sm">
            <Heart className="w-5 h-5 text-red-200 fill-red-200" />
            <span className="text-sm font-medium tracking-wide text-red-50">Lifesaving Impact</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight">
            One Donation <br/>
            Can Save Up To <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-100 to-white">3 Lives.</span>
          </h1>

          <p className="text-lg lg:text-xl text-red-100 max-w-xl leading-relaxed">
            Every two seconds, someone needs blood. Your simple act of kindness gives accident victims, cancer patients, and premature babies a second chance at life.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-white text-red-700 font-bold rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_15px_35px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer"
            >
              Become a Donor Today
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-transparent border-2 border-red-300 text-red-50 font-semibold rounded-xl hover:bg-red-700/50 hover:border-red-200 transition-all duration-300 cursor-pointer"
            >
              Learn More
            </button>
          </div>
        </div>

        <div className="relative hidden lg:block" data-aos="fade-left" data-aos-delay="200">
          <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl transform rotate-2 hover:rotate-0 transition-all duration-500">
             <img 
               src={randomImage} 
               alt="Donor smiling" 
               className="rounded-2xl shadow-lg mb-6 opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-500 w-full h-64 object-cover"
             />
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-lg">
                  <div className="text-red-600 font-bold text-3xl">12k+</div>
                  <div className="text-gray-500 text-sm font-medium uppercase tracking-wider mt-1">Active Donors</div>
                </div>
                <div className="bg-red-900 p-4 rounded-xl shadow-lg text-white">
                  <div className="font-bold text-3xl">36k+</div>
                  <div className="text-red-200 text-sm font-medium uppercase tracking-wider mt-1">Lives Saved</div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-red-100 transition-all duration-300 group text-center md:text-left">
    <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-red-600 transition-colors duration-300 mx-auto md:mx-0">
      <div className="text-red-600 group-hover:text-white transition-colors duration-300">
        {icon}
      </div>
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{desc}</p>
  </div>
);

const StepCard: React.FC<{ number: string; title: string; desc: string; icon: React.ReactNode }> = ({ number, title, desc, icon }) => (
  <div className="relative flex flex-col items-center text-center max-w-sm mx-auto">
    <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-white shadow-lg mb-6 relative z-10">
      {icon}
      <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border-2 border-red-600 rounded-full flex items-center justify-center text-red-700 font-bold text-sm">
        {number}
      </div>
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{desc}</p>
  </div>
);

const EmotionalSection: React.FC = () => (
  <section id="who-you-help" className="py-20 bg-gray-50">
    <div className="container mx-auto px-6">
      <div className="text-center max-w-3xl mx-auto mb-16" data-aos="fade-up">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Who Your Donation Helps</h2>
        <p className="text-lg text-gray-600">
          Behind every pint of blood is a beating heart. Your generosity supports people in their most critical moments.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { icon: <Activity className="w-8 h-8" />, title: "Accident Victims", desc: "For those facing severe trauma and blood loss." },
          { icon: <Users className="w-8 h-8" />, title: "Mothers", desc: "Supporting women with complications during childbirth." },
          { icon: <ShieldCheck className="w-8 h-8" />, title: "Cancer Patients", desc: "Essential for those undergoing chemotherapy." },
          { icon: <Heart className="w-8 h-8" />, title: "Anemic Children", desc: "Lifesaving support for severe anemia cases." }
        ].map((item, idx) => (
          <div key={idx} data-aos="zoom-in" data-aos-delay={idx * 100} className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-red-500 hover:shadow-lg hover:-translate-y-2 transition-all duration-300">
            <div className="text-red-600 mb-4 bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              {item.icon}
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">{item.title}</h3>
            <p className="text-center text-gray-600 text-sm">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const FaqItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button 
        className="w-full flex items-center justify-between py-5 text-left focus:outline-none group cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-semibold text-gray-800 group-hover:text-red-700 transition-colors">{question}</span>
        {isOpen ? <ChevronUp className="w-5 h-5 text-red-600" /> : <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-red-600" />}
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 mb-5' : 'max-h-0 opacity-0'}`}>
        <p className="text-gray-600 leading-relaxed pr-8">{answer}</p>
      </div>
    </div>
  );
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      const dashboardPaths: Record<string, string> = {
        Admin: '/admin/dashboard',
        Donor: '/donor/dashboard',
        Patient: '/patient/dashboard',
        Hospital: '/hospital/dashboard'
      };

      const redirectPath = dashboardPaths[user.role];
      if (redirectPath) {
        navigate(redirectPath, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 50,
    });
  }, []);

  const faqs = [
    { q: "Is donating blood safe?", a: "Yes, absolutely. We use sterile, disposable equipment for every donor. There is zero risk of contracting any disease from the donation process." },
    { q: "Does it hurt?", a: "You might feel a slight pinch when the needle is inserted, similar to a quick mosquito bite. After that, you shouldn't feel any pain during the donation." },
    { q: "How often can I donate?", a: "Whole blood can be donated every 56 days (8 weeks). Platelets can be donated more frequently, up to 24 times a year." },
    { q: "What are the requirements?", a: "Generally, you must be at least 17 years old, weigh at least 110 lbs (50 kg), and be in good general health. Some restrictions apply based on travel and medication." },
    { q: "What should I do before donating?", a: "Drink plenty of water, eat a healthy meal rich in iron, and get a good night's sleep. Avoid alcohol and fatty foods 24 hours prior." }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <HeroSection />

      <section id="why-donate" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16" data-aos="fade-up">
            <span className="text-red-600 font-semibold tracking-wider uppercase text-sm">Why It Matters</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-3 mb-6">Your Blood is a Lifeline</h2>
            <p className="text-lg text-gray-600">
              There is no substitute for human blood. It cannot be manufactured. It can only come from generous donors like you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div data-aos="fade-up" data-aos-delay="0">
              <FeatureCard
                icon={<AlertCircle className="w-7 h-7" />}
                title="Emergency Aid"
                desc="Immediate supply for trauma victims, accidents, and disasters where seconds count."
              />
            </div>
            <div data-aos="fade-up" data-aos-delay="100">
              <FeatureCard
                icon={<Activity className="w-7 h-7" />}
                title="Patient Support"
                desc="Critical for cancer treatments, complex surgeries, and organ transplants."
              />
            </div>
            <div data-aos="fade-up" data-aos-delay="200">
              <FeatureCard
                icon={<Droplet className="w-7 h-7" />}
                title="No Manufacturing"
                desc="Blood cannot be made in a lab. It is a biological gift that only humans can provide."
              />
            </div>
            <div data-aos="fade-up" data-aos-delay="300">
              <FeatureCard
                icon={<Users className="w-7 h-7" />}
                title="Community Health"
                desc="Maintaining a stable national blood supply ensures hospitals are always ready."
              />
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 bg-red-50 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20" data-aos="fade-up">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">How Donating Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Becoming a hero is easier than you think. The whole process is simple, safe, and takes less than an hour.
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-start gap-12 lg:gap-24 relative">
            <div className="hidden md:block absolute top-10 left-0 w-full h-1 bg-red-200 z-0 transform -translate-y-1/2 scale-x-75"></div>

            <div data-aos="fade-up" data-aos-delay="0">
              <StepCard
                number="01"
                title="Register"
                desc="Create your donor profile and complete a quick health screening to ensure eligibility."
                icon={<Users className="w-8 h-8" />}
              />
            </div>
            <div data-aos="fade-up" data-aos-delay="150">
              <StepCard
                number="02"
                title="Get Notified"
                desc="Receive an alert when your specific blood type is critically needed in your area."
                icon={<CheckCircle2 className="w-8 h-8" />}
              />
            </div>
            <div data-aos="fade-up" data-aos-delay="300">
              <StepCard
                number="03"
                title="Save Lives"
                desc="Visit a center, relax while donating, and walk away knowing you saved up to 3 lives."
                icon={<Heart className="w-8 h-8" />}
              />
            </div>
          </div>
        </div>
      </section>

      <EmotionalSection />

      <section id="faqs" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16">
            <div data-aos="fade-right">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Common Questions</h2>
              <div className="space-y-2">
                {faqs.map((faq, idx) => (
                  <FaqItem key={idx} question={faq.q} answer={faq.a} />
                ))}
              </div>
            </div>

            <div data-aos="fade-left">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Compatibility Chart</h2>
                <p className="text-gray-600">
                  Find out who you can help and who can help you based on blood type matching.
                </p>
              </div>
              <BloodTable />
              <div className="mt-6 flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="mt-1 min-w-[20px]">
                  <span className="flex items-center justify-center w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full">i</span>
                </div>
                <p className="text-sm text-blue-800">
                  <strong>Did you know?</strong> Type O-Negative donors are universal donors, meaning their red blood cells can be transfused to almost any patient in need.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-red-900 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute w-full h-full bg-gradient-to-t from-red-900 to-transparent"></div>
          <img src="https://picsum.photos/1920/600?blur=4" alt="Background" className="w-full h-full object-cover opacity-20" />
        </div>

        <div className="container mx-auto px-6 relative z-10" data-aos="zoom-in">
          <Heart className="w-16 h-16 mx-auto mb-8 text-red-500 fill-red-500 animate-pulse" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            Someone out there needs you today.
          </h2>
          <p className="text-xl md:text-2xl text-red-200 mb-10 max-w-2xl mx-auto">
            Take the first step. It costs nothing but means everything to the person receiving it.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="px-10 py-4 bg-white text-red-900 text-lg font-bold rounded-full hover:bg-red-50 hover:scale-105 transition-all duration-300 shadow-2xl cursor-pointer"
          >
            Become a Donor
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;