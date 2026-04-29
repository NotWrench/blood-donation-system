"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Activity,
  User,
  Heart, 
  MapPin, 
  Droplet, 
  Clock, 
  ShieldCheck, 
  UserPlus, 
  Search, 
  Syringe, 
  HeartHandshake,
  Menu,
  X,
  ArrowRight,
  Mail,
  Phone,
  Plus
} from 'lucide-react';

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Navbar height
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-rose-200 selection:text-rose-900">
      
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-3' : 'bg-white/95 backdrop-blur-sm py-4 border-b border-neutral-200'}`}>
        <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection('hero')}>
            <div className="bg-red-600 text-white p-2 rounded-lg shadow-md">
              <Heart className="w-5 h-5 fill-white stroke-none" />
            </div>
            <span className="text-lg font-bold tracking-tight text-neutral-900">Life<span className="text-red-600">Drops</span></span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { label: 'Home',         id: 'hero' },
              { label: 'About',        id: 'about' },
              { label: 'Features',     id: 'features' },
              { label: 'How It Works', id: 'how-it-works' },
            ].map(({ label, id }) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
              >
                {label}
              </button>
            ))}
          </div>

          {/* Right CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-neutral-700 hover:text-red-600 transition-colors px-3 py-2"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg"
            >
              Register
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-neutral-700 p-1" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        <div className={`md:hidden absolute top-full left-0 w-full bg-white border-t border-neutral-200 shadow-lg transition-all duration-300 origin-top ${mobileMenuOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 pointer-events-none'}`}>
          <div className="flex flex-col p-6 gap-1">
            {[
              { label: 'Home',         id: 'hero' },
              { label: 'About',        id: 'about' },
              { label: 'Features',     id: 'features' },
              { label: 'How It Works', id: 'how-it-works' },
            ].map(({ label, id }) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className="text-left py-3 px-2 text-base font-medium text-neutral-700 border-b border-neutral-100 hover:text-red-600 transition-colors"
              >
                {label}
              </button>
            ))}
            <div className="pt-4 flex gap-3">
              <Link href="/login" className="flex-1 text-center border-2 border-neutral-300 text-neutral-800 py-3 rounded-lg font-medium hover:border-red-300 hover:text-red-600 transition-colors">Login</Link>
              <Link href="/register" className="flex-1 text-center bg-red-600 text-white py-3 rounded-lg font-semibold shadow-md hover:bg-red-700 transition-colors">Register</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Modern Professional */}
      <section id="hero" className="relative min-h-[80vh] flex items-center overflow-hidden pt-20">
        {/* Clean gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100"></div>
        
        {/* Minimal texture overlay */}
        <div className="absolute inset-0 opacity-[0.08] mix-blend-multiply pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='4' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '180px 180px'
        }}></div>

        <div className="container mx-auto px-6 relative z-10 py-20">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            
            {/* Status Badge - Minimal */}
            <div className="inline-flex items-center gap-2 bg-white border border-neutral-200 px-4 py-2.5 rounded-full text-neutral-700 text-xs font-semibold uppercase tracking-wider mb-8 shadow-sm animate-in fade-in slide-in-from-top-4 duration-1000">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
              </span>
              Urgent Need: O- Blood Required
            </div>

            {/* Headline - Professional and Clean */}
            <h1 className="retro-heading text-5xl md:text-6xl lg:text-6xl font-bold tracking-tight text-neutral-900 leading-[1.15] mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
              Every Second Counts.<br />
              <span className="text-red-600">Save Lives Today.</span>
            </h1>

            {/* Subheading - Clean Typography */}
            <p className="text-lg md:text-xl text-neutral-600 font-normal leading-relaxed mb-12 max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              Connect with verified blood donors and hospitals instantly. Join thousands who are making a real difference in their communities.
            </p>

            {/* CTA Buttons - Clean and Minimal */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              <Link href="/register" className="retro-button-glow bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-lg font-semibold text-base transition-all shadow-md hover:shadow-lg flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Become a Donor
              </Link>
              <Link href="/login" className="retro-button-glow bg-white hover:bg-neutral-50 border-2 border-neutral-300 text-neutral-900 px-8 py-3.5 rounded-lg font-semibold text-base transition-all shadow-sm hover:shadow-md flex items-center gap-2">
                <Search className="w-5 h-5 text-red-600" />
                Find Blood
              </Link>
            </div>

            {/* Stats - Clean and Minimal Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-red-600 mb-2">10k+</div>
                <div className="text-sm font-medium text-neutral-600">Active Donors</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-red-600 mb-2">30k+</div>
                <div className="text-sm font-medium text-neutral-600">Lives Saved</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-red-600 mb-2">500+</div>
                <div className="text-sm font-medium text-neutral-600">Hospitals</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-white relative border-t border-neutral-200">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 relative">
              <div className="aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden shadow-lg relative z-10">
                <img 
                  src="https://images.unsplash.com/photo-1536856136534-bb679c52a9aa?q=80&w=2000&auto=format&fit=crop" 
                  alt="Medical professional holding blood bag" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>
            </div>
            
            <div className="lg:w-1/2">
              <span className="inline-block px-3 py-1.5 bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider rounded-full mb-4">About LifeDrops</span>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-neutral-900 leading-tight">Every 2 seconds, someone needs blood.</h2>
              <p className="text-lg text-neutral-700 mb-6 leading-relaxed">
                LifeDrops is a modern blood donation management system designed to connect hospitals, blood banks, and verified voluntary donors seamlessly. We eliminate delays and anxiety during critical moments.
              </p>
              <p className="text-lg text-neutral-700 mb-8 leading-relaxed">
                A single donation can save up to three lives. Whether you're here to contribute or seeking help, our platform ensures a transparent, fast, and secure process powered by real-time technology.
              </p>
              
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-neutral-200">
                <div>
                  <h4 className="text-3xl font-bold text-red-600 mb-2">10k+</h4>
                  <p className="text-neutral-700 font-medium text-sm">Registered Donors</p>
                </div>
                <div>
                  <h4 className="text-3xl font-bold text-red-600 mb-2">500+</h4>
                  <p className="text-neutral-700 font-medium text-sm">Partner Hospitals</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-28 bg-neutral-50 border-t border-neutral-200">
        <div className="container mx-auto px-6 md:px-12">
          {/* Section header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block px-3 py-1.5 bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider rounded-full mb-4">Our Features</span>
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-5">Why choose LifeDrops?</h2>
            <p className="text-lg text-neutral-600 leading-relaxed">A modern platform that makes blood donation and emergency requests fast, secure, and effortless.</p>
          </div>

          {/* 6-card grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<MapPin />}
              color="rose"
              title="Location-based Search"
              description="Find available donors and blood banks near you instantly with smart radius filtering."
            />
            <FeatureCard
              icon={<Droplet />}
              color="red"
              title="Real-time Availability"
              description="Check live blood inventory at local banks to verify your needed group before making a trip."
            />
            <FeatureCard
              icon={<Clock />}
              color="orange"
              title="Emergency Requests"
              description="Broadcast urgent requests to nearby eligible donors via instant push notifications."
            />
            <FeatureCard
              icon={<ShieldCheck />}
              color="emerald"
              title="Secure & Verified"
              description="Every user is identity-verified with encrypted medical history and full HIPAA compliance."
            />
            <FeatureCard
              icon={<UserPlus />}
              color="blue"
              title="Easy Registration"
              description="Create your donor profile in under 2 minutes with your blood group and availability."
            />
            <FeatureCard
              icon={<HeartHandshake />}
              color="purple"
              title="Community Impact"
              description="Track lives you've helped save and earn badges to inspire others in your community."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-28 bg-white border-t border-neutral-200">
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="inline-block px-3 py-1.5 bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider rounded-full mb-4">The Process</span>
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-5">How it works</h2>
            <p className="text-lg text-neutral-600 leading-relaxed">A simple, transparent 4-step process — whether you're donating or urgently searching for blood.</p>
          </div>

          {/* Desktop: Horizontal connected steps */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-0 items-start">
            {[
              { number: '01', icon: <UserPlus />, color: 'rose',    title: 'Register & Verify',  tag: '< 2 min',  desc: 'Create your profile with blood group, location, and health eligibility.' },
              { number: '02', icon: <Search />,   color: 'blue',    title: 'Search or Request',  tag: 'Instant',  desc: 'Browse nearby requests or broadcast a new urgent blood requirement.' },
              { number: '03', icon: <Syringe />,  color: 'orange',  title: 'Connect & Donate',   tag: 'Secure',   desc: 'Chat with the recipient, schedule a time, and complete the donation.' },
              { number: '04', icon: <HeartHandshake />, color: 'emerald', title: 'Save a Life', tag: 'Impact', desc: 'Your donation can save up to 3 lives. Track your community impact.' },
            ].map((step, i, arr) => (
              <div key={step.number} className="relative flex items-start">
                <StepCard
                  number={step.number}
                  icon={step.icon}
                  color={step.color}
                  title={step.title}
                  tag={step.tag}
                  description={step.desc}
                />
                {/* Connector arrow between steps */}
                {i < arr.length - 1 && (
                  <div className="absolute top-12 -right-4 z-20 flex items-center">
                    <div className="w-8 border-t border-neutral-300"></div>
                    <ArrowRight className="w-4 h-4 text-neutral-400 -ml-1" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile: Vertical timeline */}
          <div className="lg:hidden relative">
            {/* Vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-neutral-300"></div>
            <div className="space-y-10 pl-20">
              {[
                { number: '01', icon: <UserPlus />,       color: 'rose',    title: 'Register & Verify',  tag: '< 2 min',  desc: 'Create your profile with blood group, location, and health eligibility.' },
                { number: '02', icon: <Search />,          color: 'blue',    title: 'Search or Request',  tag: 'Instant',  desc: 'Browse nearby requests or broadcast a new urgent blood requirement.' },
                { number: '03', icon: <Syringe />,         color: 'orange',  title: 'Connect & Donate',   tag: 'Secure',   desc: 'Chat with the recipient, schedule a time, and complete the donation.' },
                { number: '04', icon: <HeartHandshake />,  color: 'emerald', title: 'Save a Life',        tag: 'Impact', desc: 'Your donation can save up to 3 lives. Track your community impact.' },
              ].map((step) => (
                <div key={step.number} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute -left-16 top-6 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md z-10">
                    {step.number}
                  </div>
                  <StepCard
                    number={step.number}
                    icon={step.icon}
                    color={step.color}
                    title={step.title}
                    tag={step.tag}
                    description={step.desc}
                    mobile
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-red-600 relative overflow-hidden">
        <div className="container mx-auto px-6 md:px-12 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-5xl font-bold text-white mb-6">Ready to save lives?</h2>
          <p className="text-lg text-red-100 font-normal max-w-2xl mx-auto mb-10">
            Join our community of life-savers. Your donation could be the difference between life and death.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register" className="bg-white text-red-600 hover:bg-gray-50 px-8 py-3.5 rounded-lg font-semibold text-base transition-all shadow-lg hover:shadow-xl inline-block text-center">
              Join as Donor
            </Link>
            <Link href="/register" className="bg-red-700 text-white hover:bg-red-800 px-8 py-3.5 rounded-lg font-semibold text-base transition-all shadow-lg hover:shadow-xl inline-block text-center">
              Request Blood
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-400 pt-20 pb-10">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="lg:pr-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-red-600 text-white p-1.5 rounded-lg">
                  <Heart className="w-5 h-5 fill-red-600 stroke-white" />
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">LifeDrops</span>
              </div>
              <p className="text-neutral-500 mb-6 leading-relaxed">
                A modern blood donation network connecting donors, hospitals, and lives. Powered by real-time technology to save lives instantly.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-500 hover:bg-red-600 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-500 hover:bg-red-600 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-500 hover:bg-red-600 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-base font-bold text-white mb-6">Quick Links</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="#" className="hover:text-red-400 transition-colors">Home</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Find Blood</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Register as Donor</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-base font-bold text-white mb-6">Support</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="#" className="hover:text-red-400 transition-colors">FAQs</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Guidelines</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-base font-bold text-white mb-6">Contact Us</h4>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span>123 Health Ave, Medical District, NY 10001</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-red-500 shrink-0" />
                  <span>+1 (800) 123-LIFE</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-red-500 shrink-0" />
                  <span>support@lifedrops.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-neutral-500">
              © {new Date().getFullYear()} LifeDrops Management System. All rights reserved.
            </p>
            <div className="flex gap-4 text-sm font-medium">
              <span className="text-neutral-500">Made with <Heart className="w-4 h-4 inline-block text-red-500 fill-red-500 mx-1" /> for humanity</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const colorMap: Record<string, { bg: string; text: string; hoverBg: string; accent: string }> = {
  rose:    { bg: 'bg-rose-100',    text: 'text-rose-600',    hoverBg: 'group-hover:bg-rose-600',    accent: 'group-hover:border-rose-500' },
  red:     { bg: 'bg-red-100',     text: 'text-red-600',     hoverBg: 'group-hover:bg-red-600',     accent: 'group-hover:border-red-500' },
  orange:  { bg: 'bg-orange-100',  text: 'text-orange-600',  hoverBg: 'group-hover:bg-orange-500',  accent: 'group-hover:border-orange-500' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', hoverBg: 'group-hover:bg-emerald-600', accent: 'group-hover:border-emerald-500' },
  blue:    { bg: 'bg-blue-100',    text: 'text-blue-600',    hoverBg: 'group-hover:bg-blue-600',    accent: 'group-hover:border-blue-500' },
  purple:  { bg: 'bg-purple-100',  text: 'text-purple-600',  hoverBg: 'group-hover:bg-purple-600',  accent: 'group-hover:border-purple-500' },
};

function FeatureCard({ icon, title, description, color = 'rose' }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color?: string;
}) {
  const c = colorMap[color] ?? colorMap.rose;
  return (
    <div className={`relative bg-white rounded-xl p-6 border border-neutral-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group overflow-hidden`}>
      <div className="relative z-10">
        {/* Icon */}
        <div className={`w-12 h-12 ${c.bg} ${c.text} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
          {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-6 h-6' })}
        </div>
        {/* Title */}
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">{title}</h3>
        {/* Description */}
        <p className="text-neutral-600 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

const stepColorMap: Record<string, { iconBg: string; iconText: string; numBg: string; tagBg: string; tagText: string; glow: string }> = {
  rose:    { iconBg: 'bg-rose-100',    iconText: 'text-rose-600',    numBg: 'bg-rose-600',    tagBg: 'bg-rose-50',    tagText: 'text-rose-700',    glow: 'hover:shadow-rose-100' },
  blue:    { iconBg: 'bg-blue-100',    iconText: 'text-blue-600',    numBg: 'bg-blue-600',    tagBg: 'bg-blue-50',    tagText: 'text-blue-700',    glow: 'hover:shadow-blue-100' },
  orange:  { iconBg: 'bg-orange-100',  iconText: 'text-orange-600',  numBg: 'bg-orange-500',  tagBg: 'bg-orange-50',  tagText: 'text-orange-700',  glow: 'hover:shadow-orange-100' },
  emerald: { iconBg: 'bg-emerald-100', iconText: 'text-emerald-600', numBg: 'bg-emerald-600', tagBg: 'bg-emerald-50', tagText: 'text-emerald-700', glow: 'hover:shadow-emerald-100' },
};

function StepCard({
  number, icon, title, description, tag, color = 'rose', mobile = false
}: {
  number: string; icon: React.ReactNode; title: string;
  description: string; tag?: string; color?: string; mobile?: boolean;
}) {
  const c = stepColorMap[color] ?? stepColorMap.rose;
  return (
    <div className={`flex-1 bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group overflow-hidden ${
      mobile ? 'p-5' : 'p-6 mx-3'
    }`}>
      {/* Step number pill */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-8 h-8 ${c.numBg} text-white rounded-lg flex items-center justify-center text-xs font-bold shadow-sm shrink-0`}>
          {number}
        </div>
        {tag && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${c.tagBg} ${c.tagText}`}>{tag}</span>
        )}
      </div>
      {/* Icon */}
      <div className={`w-10 h-10 ${c.iconBg} ${c.iconText} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
        {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-5 h-5' })}
      </div>
      {/* Text */}
      <h3 className="text-base font-semibold text-neutral-900 mb-2">{title}</h3>
      <p className="text-neutral-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
