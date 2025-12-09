
import React from 'react';
import { Globe, Moon, Bell, ChevronRight, HelpCircle, FileText, LogOut, Shield } from 'lucide-react';

interface SettingsProps {
  onSwitchToAdmin: () => void;
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onSwitchToAdmin, onLogout }) => {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="p-6 bg-white shadow-sm mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="px-6 space-y-6">
        {/* Language Section */}
        <section>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Preferences</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <button className="w-full flex items-center justify-between p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                        <div className="bg-blue-50 p-2 rounded-lg text-usz-blue"><Globe size={20} /></div>
                        <span className="font-semibold text-gray-800">Language</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-400">
                        <span className="text-sm text-gray-600">English</span>
                        <ChevronRight size={18} />
                    </div>
                </button>
                <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                        <div className="bg-purple-50 p-2 rounded-lg text-purple-600"><Moon size={20} /></div>
                        <span className="font-semibold text-gray-800">Dark Mode</span>
                    </div>
                    <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                        <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300"/>
                        <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                    </div>
                </button>
            </div>
        </section>

        {/* Support Section */}
        <section>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Support</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <button className="w-full flex items-center justify-between p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                        <div className="bg-orange-50 p-2 rounded-lg text-orange-600"><HelpCircle size={20} /></div>
                        <span className="font-semibold text-gray-800">Help & FAQ</span>
                    </div>
                    <ChevronRight size={18} className="text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                        <div className="bg-gray-50 p-2 rounded-lg text-gray-600"><FileText size={20} /></div>
                        <span className="font-semibold text-gray-800">Privacy Policy</span>
                    </div>
                    <ChevronRight size={18} className="text-gray-400" />
                </button>
            </div>
        </section>

        {/* Admin Section */}
        <section>
            <button 
                onClick={onSwitchToAdmin}
                className="w-full flex items-center justify-center p-4 bg-gray-800 text-white rounded-2xl shadow-lg hover:bg-gray-700 transition-colors"
            >
                <Shield size={18} className="mr-2" />
                <span className="font-bold">Staff / Admin Access</span>
            </button>
        </section>

        <button 
          onClick={onLogout}
          className="w-full p-4 mt-2 flex items-center justify-center text-red-500 font-bold bg-white rounded-2xl border border-red-100 shadow-sm active:scale-95 transition-transform"
        >
            <LogOut size={20} className="mr-2" />
            Log Out
        </button>

        <p className="text-center text-xs text-gray-400 pt-4">USZ Wayfinder v1.1.0 • Build 2024.10.25</p>
      </div>
    </div>
  );
};

export default Settings;
