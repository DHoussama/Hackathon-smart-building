
import React, { useState } from 'react';
import { Upload, Map as MapIcon, CheckCircle, Loader2, LogOut, FileImage, Cpu } from 'lucide-react';
import MapCanvas from './MapCanvas';
import { LocationPoint } from '../types';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'map' | 'upload'>('map');
  const [currentFloor, setCurrentFloor] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'success'>('idle');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadStatus('uploading');
      // Simulate upload and AI processing
      setTimeout(() => setUploadStatus('processing'), 1500);
      setTimeout(() => setUploadStatus('success'), 4500);
    }
  };

  const resetUpload = () => setUploadStatus('idle');

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Admin Header */}
      <div className="bg-gray-900 text-white p-6 pb-12 rounded-b-3xl shadow-lg z-10">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <button 
                onClick={onLogout}
                className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full text-xs font-bold text-gray-300 flex items-center space-x-2 transition"
            >
                <LogOut size={14} />
                <span>Visitor Mode</span>
            </button>
        </div>
        
        <div className="flex space-x-2 bg-gray-800/50 p-1 rounded-xl backdrop-blur-sm">
            <button 
                onClick={() => setActiveTab('map')}
                className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'map' ? 'bg-usz-blue text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
            >
                View Maps
            </button>
            <button 
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'upload' ? 'bg-usz-blue text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
            >
                Map Generator
            </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 -mt-6 mx-4 mb-4 z-20 overflow-hidden flex flex-col">
        
        {/* VIEW MAP TAB */}
        {activeTab === 'map' && (
            <div className="bg-white rounded-2xl shadow-xl flex-1 border border-gray-200 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
                    <h2 className="font-bold text-gray-800 flex items-center">
                        <MapIcon size={18} className="mr-2 text-usz-blue"/>
                        Live Floor Plan
                    </h2>
                    <div className="flex space-x-1">
                        {[-1, 0, 1, 2, 3].map(f => (
                            <button
                                key={f}
                                onClick={() => setCurrentFloor(f)}
                                className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${currentFloor === f ? 'bg-usz-blue text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex-1 relative bg-gray-50">
                     <MapCanvas 
                        currentFloor={currentFloor}
                        userLocation={null}
                        routePath={[]}
                        destination={null}
                     />
                     <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur p-3 rounded-xl border border-gray-200 text-xs text-gray-500">
                        <p><strong>Admin Note:</strong> Showing structural view. POI markers are hidden in this mode.</p>
                     </div>
                </div>
            </div>
        )}

        {/* UPLOAD & GENERATE TAB */}
        {activeTab === 'upload' && (
            <div className="bg-white rounded-2xl shadow-xl flex-1 border border-gray-200 p-6 flex flex-col items-center justify-center text-center">
                
                {uploadStatus === 'idle' && (
                    <div className="w-full h-full flex flex-col items-center justify-center animate-in fade-in">
                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                            <Upload size={40} className="text-usz-blue" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Upload Floor Plan</h2>
                        <p className="text-gray-500 mb-8 max-w-xs">
                            Upload a JPG or PNG of the building blueprint. Our AI will generate the interactive map automatically.
                        </p>
                        
                        <label className="w-full cursor-pointer">
                            <div className="w-full bg-usz-blue text-white py-4 rounded-xl font-bold shadow-lg hover:bg-blue-800 transition-colors flex items-center justify-center space-x-2">
                                <FileImage size={20} />
                                <span>Choose Image</span>
                            </div>
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                        </label>
                    </div>
                )}

                {uploadStatus === 'uploading' && (
                    <div className="flex flex-col items-center animate-in fade-in">
                        <Loader2 size={48} className="text-usz-blue animate-spin mb-6" />
                        <h3 className="font-bold text-lg text-gray-900">Uploading Blueprint...</h3>
                    </div>
                )}

                {uploadStatus === 'processing' && (
                    <div className="flex flex-col items-center animate-in fade-in">
                        <div className="relative">
                            <Cpu size={48} className="text-purple-600 mb-6 animate-pulse" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping" />
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">AI Processing</h3>
                        <p className="text-sm text-gray-500 max-w-xs">Detecting walls, corridors, and rooms...</p>
                        <div className="w-48 h-2 bg-gray-100 rounded-full mt-6 overflow-hidden">
                            <div className="h-full bg-purple-500 animate-[width_3s_ease-in-out_infinite]" style={{ width: '60%' }} />
                        </div>
                    </div>
                )}

                {uploadStatus === 'success' && (
                    <div className="flex flex-col items-center animate-in zoom-in-95">
                        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-green-200 shadow-xl">
                            <CheckCircle size={48} className="text-green-600" />
                        </div>
                        <h3 className="font-bold text-xl text-gray-900 mb-2">Map Generated!</h3>
                        <p className="text-gray-500 mb-8">Floor plan has been successfully updated.</p>
                        <button 
                            onClick={resetUpload}
                            className="px-8 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
                        >
                            Upload Another
                        </button>
                    </div>
                )}

            </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
