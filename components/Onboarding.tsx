
import React from 'react';
import { ShieldCheck, MapPin, Camera, User, Lock } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
  onAdminLogin: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onAdminLogin }) => {
  return (
    <div className="flex flex-col h-full bg-white p-8 items-center justify-center text-center">
      <div className="mb-8 p-6 bg-blue-50 rounded-full">
         <ShieldCheck size={64} className="text-usz-blue" />
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to USZ</h1>
      <p className="text-gray-600 mb-10 leading-relaxed">
        Your digital guide for the University Hospital Zurich campus.
      </p>

      <div className="w-full space-y-4 mb-8">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Choose your role</h3>
        
        <button
            onClick={onComplete}
            className="w-full p-4 bg-usz-blue text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center justify-between group"
        >
            <div className="flex items-center">
                <div className="bg-white/20 p-2 rounded-lg mr-4">
                    <User size={24} />
                </div>
                <div className="text-left">
                    <span className="block text-sm opacity-90 font-medium">I am a</span>
                    <span className="text-xl">Visitor / Patient</span>
                </div>
            </div>
            <div className="bg-white/20 rounded-full p-1 group-hover:bg-white/30">
                <ShieldCheck size={20} />
            </div>
        </button>

        <button
            onClick={onAdminLogin}
            className="w-full p-4 bg-gray-50 text-gray-800 border border-gray-200 rounded-2xl font-bold text-lg hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-between group"
        >
            <div className="flex items-center">
                <div className="bg-gray-200 p-2 rounded-lg mr-4 text-gray-600">
                    <Lock size={24} />
                </div>
                <div className="text-left">
                    <span className="block text-sm text-gray-500 font-medium">I am</span>
                    <span className="text-xl">Staff / Admin</span>
                </div>
            </div>
        </button>
      </div>

      <div className="w-full p-4 bg-blue-50 rounded-xl border border-blue-100 text-left flex items-start space-x-3">
          <MapPin className="text-usz-blue mt-1 shrink-0" size={16} />
          <p className="text-xs text-blue-800">
            By continuing, you allow USZ Wayfinder to access your <span className="font-bold">Location</span> and <span className="font-bold">Camera</span> to guide you effectively.
          </p>
      </div>
      
      <p className="mt-6 text-xs text-gray-400">
        Your data is processed locally and never leaves your device.
      </p>
    </div>
  );
};

export default Onboarding;
