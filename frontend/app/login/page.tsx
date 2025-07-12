'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface Executive {
  id: string;
  name: string;
  title: string;
  description: string;
  avatar: string;
  color: string;
  pin: string;
}

const executives: Executive[] = [
  {
    id: 'alex',
    name: 'Alex Rodriguez',
    title: 'Director',
    description: 'Executive Command Center with full oversight',
    avatar: 'AR',
    color: 'from-cyan-500 to-blue-600',
    pin: '3123'
  },
  {
    id: 'vinod',
    name: 'Vinod Kumar',
    title: 'Senior Vice President',
    description: 'Compliance-focused dashboard with regulatory insights',
    avatar: 'VK',
    color: 'from-green-500 to-emerald-600',
    pin: '5678'
  },
  {
    id: 'manju',
    name: 'Manju Sharma',
    title: 'VP Risk Management',
    description: 'Risk-centric dashboard with predictive analytics',
    avatar: 'MS',
    color: 'from-purple-500 to-indigo-600',
    pin: '9012'
  }
];

export default function LoginPage() {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'selection' | 'pin' | 'loading'>('welcome');
  const [selectedExecutive, setSelectedExecutive] = useState<Executive | null>(null);
  const [ariaMessage, setAriaMessage] = useState('');
  const [isAriaAnimating, setIsAriaAnimating] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAriaAnimating(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleAriaClick = () => {
    setAriaMessage("Good evening, welcome to LATAM RegInsight. I'm ARIA, your AI Regulatory Intelligence Assistant. Please identify yourself so I can prepare your personalized dashboard.");
    setCurrentStep('selection');
  };

  const handleExecutiveSelect = (executive: Executive) => {
    setSelectedExecutive(executive);
    setAriaMessage(`Hello ${executive.name}! For security purposes, please enter your 4-digit PIN to access your personalized dashboard.`);
    setCurrentStep('pin');
    setEnteredPin('');
    setPinError('');
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExecutive) return;

    if (enteredPin === selectedExecutive.pin) {
      setAriaMessage(`Perfect! Preparing ${selectedExecutive.name}'s personalized dashboard with ${selectedExecutive.description.toLowerCase()}...`);
      setCurrentStep('loading');
      
      setTimeout(() => {
        localStorage.setItem('currentExecutive', JSON.stringify(selectedExecutive));
        
        // Route based on executive role
        if (selectedExecutive.id === 'alex') {
          // Alex Rodriguez (Director) goes to main executive dashboard
          router.push('/');
        } else if (selectedExecutive.id === 'vinod') {
          // Vinod Kumar (SVP) goes to his personalized SVP dashboard
          router.push('/svp/vinod');
        } else if (selectedExecutive.id === 'manju') {
          // Manju Sharma (VP) goes to her personalized SVP dashboard
          router.push('/svp/manju');
        } else {
          // Default fallback to main dashboard
          router.push('/');
        }
      }, 3000);
    } else {
      setPinError('Invalid PIN. Please try again.');
      setEnteredPin('');
    }
  };

  const handlePinChange = (value: string) => {
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setEnteredPin(value);
      setPinError('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mr-4">
              <span className="text-2xl font-bold text-white">C</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">LATAM RegInsight</h1>
              <p className="text-cyan-300 text-lg">Executive Dashboard</p>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {currentStep === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <motion.div
                className="relative mx-auto mb-8 cursor-pointer"
                onClick={handleAriaClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={isAriaAnimating ? {
                  y: [0, -10, 0],
                  rotate: [0, 2, -2, 0]
                } : {}}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/20">
                  <div className="w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">AR</span>
                  </div>
                </div>
                
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-purple-400"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>

              <motion.div
                animate={{
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-white/80 text-lg mb-6"
              >
                👆 Click Me
              </motion.div>

              <div className="space-y-2">
                <p className="text-cyan-300 text-lg font-semibold">
                  Secure Banking Intelligence
                </p>
                <p className="text-white/60 text-sm max-w-md mx-auto">
                  Meet ARIA, your AI Regulatory Intelligence Assistant
                </p>
              </div>
            </motion.div>
          )}

          {currentStep === 'selection' && (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-white">AR</span>
                  </div>
                  <div className="text-left">
                    <p className="text-cyan-300 font-semibold mb-2">ARIA</p>
                    <p className="text-white/90 leading-relaxed">{ariaMessage}</p>
                  </div>
                </div>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-6">
                {executives.map((executive, index) => (
                  <motion.div
                    key={executive.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-cyan-400/50 transition-all duration-300 cursor-pointer group"
                    onClick={() => handleExecutiveSelect(executive)}
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`w-16 h-16 bg-gradient-to-r ${executive.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <span className="text-xl font-bold text-white">{executive.avatar}</span>
                    </div>
                    <h3 className="text-white font-semibold text-lg mb-1">{executive.name}</h3>
                    <p className="text-cyan-300 text-sm mb-3">{executive.title}</p>
                    <p className="text-white/70 text-xs leading-relaxed">{executive.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {currentStep === 'pin' && selectedExecutive && (
            <motion.div
              key="pin"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-white">AR</span>
                  </div>
                  <div className="text-left">
                    <p className="text-cyan-300 font-semibold mb-2">ARIA</p>
                    <p className="text-white/90 leading-relaxed">{ariaMessage}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="mb-8"
              >
                <div className={`w-20 h-20 bg-gradient-to-r ${selectedExecutive.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <span className="text-2xl font-bold text-white">{selectedExecutive.avatar}</span>
                </div>
                <h3 className="text-white font-semibold text-xl mb-1">{selectedExecutive.name}</h3>
                <p className="text-cyan-300 text-sm">{selectedExecutive.title}</p>
              </motion.div>

              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                onSubmit={handlePinSubmit}
                className="max-w-sm mx-auto"
              >
                <div className="mb-6">
                  <label className="block text-white text-sm font-medium mb-4">
                    Enter your 4-digit PIN
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={enteredPin}
                      onChange={(e) => handlePinChange(e.target.value)}
                      className="w-full bg-white/10 border border-cyan-500/30 rounded-xl px-4 py-3 text-white text-center text-2xl tracking-widest placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                      placeholder="••••"
                      maxLength={4}
                      autoFocus
                    />
                    {pinError && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm mt-2 text-center"
                      >
                        {pinError}
                      </motion.p>
                    )}
                  </div>
                </div>

                <div className="flex space-x-4">
                  <motion.button
                    type="button"
                    onClick={() => setCurrentStep('selection')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-500 transition-colors"
                  >
                    Back
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={enteredPin.length !== 4}
                    whileHover={{ scale: enteredPin.length === 4 ? 1.05 : 1 }}
                    whileTap={{ scale: enteredPin.length === 4 ? 0.95 : 1 }}
                    className={`flex-1 px-6 py-3 rounded-xl transition-all ${
                      enteredPin.length === 4
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Login
                  </motion.button>
                </div>
              </motion.form>
            </motion.div>
          )}

          {currentStep === 'loading' && selectedExecutive && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
                <div className="flex items-start space-x-4">
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <span className="text-sm font-bold text-white">AR</span>
                  </motion.div>
                  <div className="text-left">
                    <p className="text-cyan-300 font-semibold mb-2">ARIA</p>
                    <p className="text-white/90 leading-relaxed">{ariaMessage}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <motion.div
                  className={`w-24 h-24 bg-gradient-to-r ${selectedExecutive.color} rounded-full flex items-center justify-center mx-auto`}
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <span className="text-2xl font-bold text-white">{selectedExecutive.avatar}</span>
                </motion.div>

                <div className="space-y-2">
                  <motion.div
                    className="h-2 bg-white/20 rounded-full overflow-hidden mx-auto max-w-xs"
                  >
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2.5, ease: "easeInOut" }}
                    />
                  </motion.div>
                  <p className="text-white/60 text-sm">Preparing your personalized dashboard...</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-16 text-white/40 text-sm"
        >
          <p>Secure Banking Intelligence Platform • {new Date().getFullYear()}</p>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
