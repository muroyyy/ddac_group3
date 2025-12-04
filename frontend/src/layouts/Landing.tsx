import React, { useState } from 'react';
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
import BloodTable from '../components/BloodTable';

// --- Components Helpers ---

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  return (
    <section className="relative w-full bg-gradient-to-br from-brand-600 to-brand-800 text-white pt-24 pb-32 overflow-hidden">
      {/* Abstract Background Circles */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full mix-blend-overlay blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-brand-300 rounded-full mix-blend-overlay blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: Text Content */}
        <div className="space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center space-x-2 bg-brand-500/30 px-4 py-2 rounded-full border border-brand-400/30 backdrop-blur-sm">
            <Heart className="w-5 h-5 text-brand-200 fill-brand-200" />
            <span className="text-sm font-medium tracking-wide text-brand-50">Lifesaving Impact</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight">
            One Donation <br/>
            Can Save Up To <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-100 to-white">3 Lives.</span>
          </h1>
          
          <p className="text-lg lg:text-xl text-brand-100 max-w-xl leading-relaxed">
            Every two seconds, someone needs blood. Your simple act of kindness gives accident victims, cancer patients, and premature babies a second chance at life.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-white text-brand-700 font-bold rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_15px_35px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              Become a Donor Today
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-transparent border-2 border-brand-300 text-brand-50 font-semibold rounded-xl hover:bg-brand-700/50 hover:border-brand-200 transition-all duration-300"
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Right: Stats & Imagery */}
        <div className="relative hidden lg:block">
          <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl transform rotate-2 hover:rotate-0 transition-all duration-500">
             <div className="rounded-2xl shadow-lg mb-6 bg-gradient-to-br from-brand-200 to-brand-400 h-64 flex items-center justify-center">
               <Heart className="w-24 h-24 text-white" />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-lg">
                  <div className="text-brand-600 font-bold text-3xl">12k+</div>
                  <div className="text-gray-500 text-sm font-medium uppercase tracking-wider mt-1">Active Donors</div>
                </div>
                <div className="bg-brand-900 p-4 rounded-xl shadow-lg text-white">
                  <div className="font-bold text-3xl">36k+</div>
                  <div className="text-brand-200 text-sm font-medium uppercase tracking-wider mt-1">Lives Saved</div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-brand-100 transition-all duration-300 group">
    <div className="w-14 h-14 bg-brand-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand-600 transition-colors duration-300">
      <div className="text-brand-600 group-hover:text-white transition-colors duration-300">
        {icon}
      </div>
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{desc}</p>
  </div>
);

const StepCard: React.FC<{ number: string; title: string; desc: string; icon: React.ReactNode }> = ({ number, title, desc, icon }) => (
  <div className="relative flex flex-col items-center text-center max-w-sm">
    <div className="w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-700 rounded-full flex items-center justify-center text-white shadow-lg mb-6 relative z-10">
      {icon}
      <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border-2 border-brand-600 rounded-full flex items-center justify-center text-brand-700 font-bold text-sm">
        {number}
      </div>
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{desc}</p>
  </div>
);

const EmotionalSection: React.FC = () => (
  <section className="py-20 bg-gray-50">
    <div className="container mx-auto px-6">
      <div className="text-center max-w-3xl mx-auto mb-16">
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
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-brand-500 hover:shadow-lg transition-all">
            <div className="text-brand-600 mb-4 bg-brand-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
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
        className="w-full flex items-center justify-between py-5 text-left focus:outline-none group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-semibold text-gray-800 group-hover:text-brand-700 transition-colors">{question}</span>
        {isOpen ? <ChevronUp className="w-5 h-5 text-brand-600" /> : <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-brand-600" />}
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 mb-5' : 'max-h-0 opacity-0'}`}>
        <p className="text-gray-600 leading-relaxed pr-8">{answer}</p>
      </div>
    </div>
  );
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const faqs = [
    { q: "Is donating blood safe?", a: "Yes, absolutely. We use sterile, disposable equipment for every donor. There is zero risk of contracting any disease from the donation process." },
    { q: "Does it hurt?", a: "You might feel a slight pinch when the needle is inserted, similar to a quick mosquito bite. After that, you shouldn't feel any pain during the donation." },
    { q: "How often can I donate?", a: "Whole blood can be donated every 56 days (8 weeks). Platelets can be donated more frequently, up to 24 times a year." },
    { q: "What are the requirements?", a: "Generally, you must be at least 17 years old, weigh at least 110 lbs (50 kg), and be in good general health. Some restrictions apply based on travel and medication." },
    { q: "What should I do before donating?", a: "Drink plenty of water, eat a healthy meal rich in iron, and get a good night's sleep. Avoid alcohol and fatty foods 24 hours prior." }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      
      {/* Hero */}
      <HeroSection />

      {/* Why Donate Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-brand-600 font-semibold tracking-wider uppercase text-sm">Why It Matters</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-3 mb-6">Your Blood is a Lifeline</h2>
            <p className="text-lg text-gray-600">
              There is no substitute for human blood. It cannot be manufactured. It can only come from generous donors like you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<AlertCircle className="w-7 h-7" />}
              title="Emergency Aid"
              desc="Immediate supply for trauma victims, accidents, and disasters where seconds count."
            />
             <FeatureCard 
              icon={<Activity className="w-7 h-7" />}
              title="Patient Support"
              desc="Critical for cancer treatments, complex surgeries, and organ transplants."
            />
             <FeatureCard 
              icon={<Droplet className="w-7 h-7" />}
              title="No Manufacturing"
              desc="Blood cannot be made in a lab. It is a biological gift that only humans can provide."
            />
             <FeatureCard 
              icon={<Users className="w-7 h-7" />}
              title="Community Health"
              desc="Maintaining a stable national blood supply ensures hospitals are always ready."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-brand-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">How Donating Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Becoming a hero is easier than you think. The whole process is simple, safe, and takes less than an hour.
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-start gap-12 lg:gap-24 relative">
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-10 left-0 w-full h-1 bg-brand-200 z-0 transform -translate-y-1/2 scale-x-75"></div>

            <StepCard 
              number="01"
              title="Register"
              desc="Create your donor profile and complete a quick health screening to ensure eligibility."
              icon={<Users className="w-8 h-8" />}
            />
            <StepCard 
              number="02"
              title="Get Notified"
              desc="Receive an alert when your specific blood type is critically needed in your area."
              icon={<CheckCircle2 className="w-8 h-8" />}
            />
            <StepCard 
              number="03"
              title="Save Lives"
              desc="Visit a center, relax while donating, and walk away knowing you saved up to 3 lives."
              icon={<Heart className="w-8 h-8" />}
            />
          </div>
        </div>
      </section>

      {/* Who It Helps */}
      <EmotionalSection />

      {/* FAQ & Compatibility */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16">
            
            {/* FAQ Column */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Common Questions</h2>
              <div className="space-y-2">
                {faqs.map((faq, idx) => (
                  <FaqItem key={idx} question={faq.q} answer={faq.a} />
                ))}
              </div>
            </div>

            {/* Table Column */}
            <div>
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

      {/* Final CTA */}
      <section className="py-24 bg-brand-900 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
           <div className="absolute w-full h-full bg-gradient-to-t from-brand-900 to-transparent"></div>
           <div className="w-full h-full bg-gradient-to-br from-brand-800 to-brand-900 opacity-80"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <Heart className="w-16 h-16 mx-auto mb-8 text-brand-500 fill-brand-500 animate-pulse" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            Someone out there needs you today.
          </h2>
          <p className="text-xl md:text-2xl text-brand-200 mb-10 max-w-2xl mx-auto">
            Take the first step. It costs nothing but means everything to the person receiving it.
          </p>
          <button 
            onClick={() => navigate('/register')}
            className="px-10 py-4 bg-white text-brand-900 text-lg font-bold rounded-full hover:bg-brand-50 hover:scale-105 transition-all duration-300 shadow-2xl"
          >
            Become a Donor
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
