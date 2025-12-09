
import React, { useState, useEffect } from 'react';
import { Shield, ArrowLeft, Lock } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onCancel: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onCancel }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (pin.length === 4) {
      if (pin === '0000') {
        onLoginSuccess();
      } else {
        setError(true);
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 500);
      }
    }
  }, [pin, onLoginSuccess]);

  const handleNumClick = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError(false);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Header */}
      <div className="p-6 pt-12">
        <button onClick={onCancel} className="p-2 bg-gray-800 rounded-full mb-6 hover:bg-gray-700 transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold mb-2">Staff Access</h1>
        <p className="text-gray-400">Enter your 4-digit security PIN to access the admin dashboard.</p>
      </div>

      {/* PIN Display */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="flex space-x-6 mb-12">
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                pin.length > i 
                  ? error ? 'bg-red-500 scale-125' : 'bg-usz-blue scale-125' 
                  : 'bg-gray-700'
              }`}
            />
          ))}
        </div>

        {error && (
            <div className="absolute top-1/2 mt-8 text-red-400 text-sm font-medium animate-bounce">
                Incorrect PIN. Please try again.
            </div>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-6 w-full max-w-xs px-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumClick(num.toString())}
              className="w-20 h-20 rounded-full bg-gray-800 text-2xl font-semibold hover:bg-gray-700 active:bg-gray-600 transition-colors flex items-center justify-center"
            >
              {num}
            </button>
          ))}
          <div className="w-20 h-20 flex items-center justify-center opacity-0"></div>
          <button
            onClick={() => handleNumClick('0')}
            className="w-20 h-20 rounded-full bg-gray-800 text-2xl font-semibold hover:bg-gray-700 active:bg-gray-600 transition-colors flex items-center justify-center"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="w-20 h-20 rounded-full bg-transparent text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors flex items-center justify-center"
          >
            Delete
          </button>
        </div>
      </div>
      
      <div className="p-6 text-center text-xs text-gray-600">
        <div className="flex justify-center items-center gap-2">
            <Shield size={12} />
            <span>Secured USZ System</span>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
