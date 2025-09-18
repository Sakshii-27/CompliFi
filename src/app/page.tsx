"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Play, Upload, Globe, Shield, Zap, ArrowRight, CheckCircle, BarChart3, AlertTriangle, Link } from 'lucide-react';

const VigiliLandingPage = () => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [trackedAmendments, setTrackedAmendments] = useState(0);
  const [mappedIndustries, setMappedIndustries] = useState(0);
  const globeRef = useRef<HTMLDivElement>(null);
  type ParticleStyle = {
    top: string;
    left: string;
    animationDelay: string;
    animationDuration: string;
  };
  const [particles, setParticles] = useState<ParticleStyle[]>([]); // Initialize as empty array

  // Animated counters
  useEffect(() => {
    const amendmentTimer = setInterval(() => {
      setTrackedAmendments(prev => prev < 1247 ? prev + 17 : 1247);
    }, 50);
    
    const industryTimer = setInterval(() => {
      setMappedIndustries(prev => prev < 53 ? prev + 1 : 53);
    }, 100);

    return () => {
      clearInterval(amendmentTimer);
      clearInterval(industryTimer);
    };
  }, []);

  // Globe rotation animation
useEffect(() => {
    if (globeRef.current) {
        let rotation = 0;
        const animate = () => {
            rotation += 0.5;
            if (globeRef.current) {  // Additional null check
                globeRef.current.style.transform = `rotate(${rotation}deg)`;
            }
            requestAnimationFrame(animate);
        };
        animate();
    }
}, []);

  const PulsingDot = ({ delay = 0, size = "w-2 h-2" }) => (
    <div 
      className={`${size} bg-emerald-400 rounded-full animate-pulse`}
      style={{ animationDelay: `${delay}ms` }}
    />
  );

  type DataPulseProps = {
  top: string | number;   // CSS top value (e.g., "10px" or 10)
  left: string | number;  // CSS left value
  delay: number;          // delay in ms
};

const DataPulse = ({ top, left, delay }: DataPulseProps) => (
  <div
    className="absolute animate-ping"
    style={{ top, left, animationDelay: `${delay}ms` }}
  >
    <div className="w-1 h-1 bg-emerald-300 rounded-full" />
  </div>
);

  // Define animated particles for the hero section background
  useEffect(() => {
    setParticles(Array.from({ length: 18 }).map((_) => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 2000}ms`,
      animationDuration: `${2000 + Math.random() * 2000}ms` // Added duration to match your original
    })));
  }, []);

  return (
<div className="min-h-screen bg-[#000030] text-white overflow-hidden">
      {/* Animated Background Grid */}
      <div className="fixed inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((style, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-emerald-400 rounded-full animate-pulse"
              style={style}
            />
          ))}
        </div>


        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-lg flex items-center justify-center">
                <Shield className="w-7 h-7 text-black" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Vigilo
              </h1>
            </div>
            

            {/* Main Tagline */}
            <div className="space-y-4">
              <h2 className="text-6xl lg:text-7xl font-black leading-tight">
                <span className="text-white">See the</span>
                <br />
                <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-300 bg-clip-text text-transparent">
                  law
                </span>
                <br />
                <span className="text-white">before it</span>
                <br />
                <span className="text-emerald-400">sees you.</span>
              </h2>
              
              <p className="text-xl text-gray-300 max-w-lg leading-relaxed">
                AI-powered regulatory intelligence that keeps your business ahead of compliance changes before they impact your operations.
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-400">{trackedAmendments.toLocaleString()}+</div>
                <div className="text-sm text-gray-400">Tracked Amendments</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400">{mappedIndustries}+</div>
                <div className="text-sm text-gray-400">Industries Mapped</div>
              </div>
            </div>

{/* CTA Buttons */}
<div className="flex flex-col sm:flex-row gap-4">
  <button 
    onClick={() => window.location.href = '/signup'}
    className="group bg-gradient-to-r from-emerald-500 to-cyan-500 px-8 py-4 rounded-xl font-semibold flex items-center justify-center space-x-3 hover:from-emerald-400 hover:to-cyan-400 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/25"
  >
    <Upload className="w-5 h-5" />
    <span>Get Started</span>
    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
  </button>
              
  <button 
    onClick={() => setIsVideoModalOpen(true)}
    className="group border-2 border-emerald-500 px-8 py-4 rounded-xl font-semibold flex items-center justify-center space-x-3 hover:bg-emerald-500/10 transition-all duration-300"
  >
    <Play className="w-5 h-5" />
    <span>Watch Demo</span>
  </button>
</div>
          </div>
          {/* Right Content - 3D Globe */}
          <div className="relative flex justify-center">
            <div className="relative w-96 h-96">
              {/* Globe Container */}
              <div 
                ref={globeRef}
                className="absolute inset-0 rounded-full border-4 border-emerald-500/30 bg-gradient-to-br from-emerald-900/20 to-cyan-900/20 backdrop-blur-sm"
                style={{
                  background: `
                    radial-gradient(circle at 30% 30%, rgba(16, 185, 129, 0.3) 0%, transparent 50%),
                    radial-gradient(circle at 70% 70%, rgba(34, 211, 238, 0.2) 0%, transparent 50%)
                  `,
                  boxShadow: `
                    inset 0 0 50px rgba(16, 185, 129, 0.2),
                    0 0 100px rgba(16, 185, 129, 0.3)
                  `
                }}
              >
                {/* India Glow */}
                <div className="absolute top-1/3 right-1/3 w-16 h-12 bg-emerald-400 rounded-full opacity-60 blur-sm animate-pulse" />
                
                {/* Data Pulses */}
                <DataPulse top="20%" left="60%" delay={0} />
                <DataPulse top="40%" left="70%" delay={500} />
                <DataPulse top="60%" left="65%" delay={1000} />
                <DataPulse top="30%" left="45%" delay={1500} />
                <DataPulse top="50%" left="80%" delay={2000} />
              </div>

              {/* Orbital Rings */}
              <div className="absolute inset-0 rounded-full border border-emerald-400/20 animate-spin" style={{ animationDuration: '20s' }} />
              <div className="absolute inset-4 rounded-full border border-cyan-400/15 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
              
              {/* Floating Regulation Cards */}
              <div className="absolute -top-4 -left-8 bg-black/80 border border-emerald-500/30 rounded-lg p-3 backdrop-blur-sm animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>
                <div className="text-xs text-emerald-400 font-semibold">IT Act Update</div>
                <div className="text-xs text-gray-400">Data Protection</div>
              </div>
              
              <div className="absolute -bottom-4 -right-8 bg-black/80 border border-cyan-500/30 rounded-lg p-3 backdrop-blur-sm animate-bounce" style={{ animationDelay: '1s', animationDuration: '3s' }}>
                <div className="text-xs text-cyan-400 font-semibold">Export Policy</div>
                <div className="text-xs text-gray-400">Manufacturing</div>
              </div>
              
              <div className="absolute top-1/2 -left-12 bg-black/80 border border-emerald-500/30 rounded-lg p-3 backdrop-blur-sm animate-bounce" style={{ animationDelay: '2s', animationDuration: '3s' }}>
                <div className="text-xs text-emerald-400 font-semibold">SEBI Guidelines</div>
                <div className="text-xs text-gray-400">Finance</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-emerald-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-emerald-400 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-4">
              <span className="text-white">Regulatory Intelligence</span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Reimagined</span>
            </h3>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              From real-time amendment tracking to AI-powered impact analysis, we've built the future of compliance management.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-gradient-to-br from-gray-900 to-black border border-emerald-500/20 rounded-2xl p-8 hover:border-emerald-500/50 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/30 transition-colors">
                <Zap className="w-8 h-8 text-emerald-400" />
              </div>
              <h4 className="text-2xl font-bold mb-4 text-white">Real-time Tracking</h4>
              <p className="text-gray-400 mb-6">Live feed of regulatory amendments with AI-powered summaries and impact predictions for your industry.</p>
              <div className="flex items-center text-emerald-400 font-semibold">
                <span>Learn more</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group bg-gradient-to-br from-gray-900 to-black border border-cyan-500/20 rounded-2xl p-8 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-cyan-500/30 transition-colors">
                <BarChart3 className="w-8 h-8 text-cyan-400" />
              </div>
              <h4 className="text-2xl font-bold mb-4 text-white">Impact Analysis</h4>
              <p className="text-gray-400 mb-6">AI analyzes your documents and workflows to show exactly how new regulations affect your business operations.</p>
              <div className="flex items-center text-cyan-400 font-semibold">
                <span>Learn more</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group bg-gradient-to-br from-gray-900 to-black border border-emerald-500/20 rounded-2xl p-8 hover:border-emerald-500/50 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/30 transition-colors">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h4 className="text-2xl font-bold mb-4 text-white">Action Plans</h4>
              <p className="text-gray-400 mb-6">Get step-by-step mitigation playbooks with auto-drafted compliance documents and vendor communications.</p>
              <div className="flex items-center text-emerald-400 font-semibold">
                <span>Learn more</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-emerald-500/30 max-w-4xl w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <h3 className="text-2xl font-bold text-white">Vigilo Demo</h3>
              <button 
                onClick={() => setIsVideoModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="aspect-video bg-black rounded-lg flex items-center justify-center border border-emerald-500/20">
                <div className="text-center">
                  <Play className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                  <p className="text-gray-400">Demo video would play here</p>
                  <p className="text-sm text-gray-500 mt-2">30-second walkthrough of Vigilo's key features</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VigiliLandingPage;