
import React, { useState } from 'react';
import { Map, Camera, X } from 'lucide-react';
import Onboarding from './components/Onboarding';
import Home from './components/Home';
import Navigation from './components/Navigation';
import BottomNav from './components/BottomNav';
import CameraAR from './components/CameraAR';
import Chatbot from './components/Chatbot';
import Settings from './components/Settings';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { ViewState, POI, LocationPoint, Tab } from './types';

// Updated POI Database with Amenities & More Depts
const POI_DATA: POI[] = [
  // --- MAIN BUILDING (x: 140-260) ---
  { id: 'EMERGENCY', name: 'Emergency Room', type: 'emergency', building: 'Main', floor: 0, location: { x: 200, y: 80, floor: 0 } },
  { id: 'RECEPTION', name: 'Main Reception', type: 'service', building: 'Main', floor: 0, location: { x: 200, y: 280, floor: 0 } },
  { id: 'PHARMACY', name: 'Pharmacy', type: 'service', building: 'Main', floor: 0, location: { x: 240, y: 270, floor: 0 } },
  { id: 'COFFEE_KIOSK', name: 'Lobby Coffee', type: 'service', building: 'Main', floor: 0, location: { x: 180, y: 300, floor: 0 } },
  { id: 'WC_MAIN_0', name: 'Restroom (Main Lobby)', type: 'service', building: 'Main', floor: 0, location: { x: 250, y: 340, floor: 0 } },
  { id: 'GIFT_SHOP', name: 'Gift Shop', type: 'service', building: 'Main', floor: 0, location: { x: 160, y: 300, floor: 0 } },
  { id: 'ATM', name: 'ATM (Main)', type: 'service', building: 'Main', floor: 0, location: { x: 150, y: 280, floor: 0 } },
  
  { id: 'CAFETERIA', name: 'Cafeteria', type: 'service', building: 'Main', floor: 1, location: { x: 200, y: 120, floor: 1 } },
  { id: 'WC_MAIN_1', name: 'Restroom (Cafeteria)', type: 'service', building: 'Main', floor: 1, location: { x: 250, y: 150, floor: 1 } },

  { id: 'CHAPEL', name: 'Chapel', type: 'service', building: 'Main', floor: 2, location: { x: 160, y: 300, floor: 2 } },
  
  // --- WEST WING (x: <130) ---
  { id: 'RADIOLOGY', name: 'Radiology / X-Ray', type: 'medical', building: 'West Wing', floor: 1, location: { x: 70, y: 120, floor: 1 } },
  { id: 'PEDIATRICS', name: 'Pediatrics', type: 'medical', building: 'West Wing', floor: 2, location: { x: 70, y: 150, floor: 2 } },
  { id: 'NEUROLOGY', name: 'Neurology', type: 'medical', building: 'West Wing', floor: 2, location: { x: 70, y: 250, floor: 2 } },
  { id: 'DERMATOLOGY', name: 'Dermatology', type: 'medical', building: 'West Wing', floor: 2, location: { x: 70, y: 190, floor: 2 } },
  { id: 'WC_WEST_1', name: 'Restroom (West Wing)', type: 'service', building: 'West Wing', floor: 1, location: { x: 40, y: 200, floor: 1 } },
  { id: 'WC_WEST_2', name: 'Restroom (West Wing L2)', type: 'service', building: 'West Wing', floor: 2, location: { x: 40, y: 200, floor: 2 } },

  // --- EAST WING (x: >270) ---
  { id: 'LABS', name: 'Laboratory Services', type: 'medical', building: 'East Wing', floor: 1, location: { x: 330, y: 120, floor: 1 } },
  { id: 'OPHTHALMOLOGY', name: 'Ophthalmology', type: 'medical', building: 'East Wing', floor: 1, location: { x: 330, y: 160, floor: 1 } },
  { id: 'CARDIOLOGY', name: 'Cardiology', type: 'medical', building: 'East Wing', floor: 2, location: { x: 330, y: 150, floor: 2 } },
  { id: 'ONCOLOGY', name: 'Oncology Center', type: 'medical', building: 'East Wing', floor: 2, location: { x: 330, y: 250, floor: 2 } },
  { id: 'WC_EAST_2', name: 'Restroom (East Wing)', type: 'service', building: 'East Wing', floor: 2, location: { x: 360, y: 200, floor: 2 } },

  // --- TRANSPORT ---
  { id: 'PARKING', name: 'Visitor Parking', type: 'transport', building: 'Underground', floor: 0, location: { x: 280, y: 350, floor: 0 } }, 
];

// User starts at Main Entrance (Main Building, Bottom)
const USER_START_LOCATION: LocationPoint = { x: 200, y: 350, floor: 0 };

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>('onboarding');
  const [activeTab, setActiveTab] = useState<Tab>('main');
  const [hasVisitedApp, setHasVisitedApp] = useState(false); // Track if user has passed onboarding at least once
  
  // Navigation State
  const [selectedDestination, setSelectedDestination] = useState<POI | null>(null);
  const [navigationMode, setNavigationMode] = useState<'map' | 'ar' | null>(null);

  // --- ROLE SWITCHING HANDLERS ---
  
  const handleVisitorAccess = () => {
    setViewState('app');
    setHasVisitedApp(true);
  };

  const handleAdminRequest = () => {
    setViewState('admin-login');
  };

  const handleAdminLoginSuccess = () => {
    setViewState('admin-dashboard');
  };

  const handleAdminCancel = () => {
    // If user was already in the app, go back to app (Settings)
    if (hasVisitedApp) {
      setViewState('app');
    } else {
      // Otherwise go back to Onboarding
      setViewState('onboarding');
    }
  };

  const handleAdminLogout = () => {
    setViewState('app'); // Switch back to Visitor mode
    setHasVisitedApp(true);
  };

  const handleUserLogout = () => {
    setViewState('onboarding');
    setHasVisitedApp(false);
    setActiveTab('main');
    setSelectedDestination(null);
    setNavigationMode(null);
  };

  // --- APP NAVIGATION HANDLERS ---

  const handleNavigate = (poi: POI) => {
    setSelectedDestination(poi);
    setNavigationMode(null); // Reset mode to trigger selection screen
  };

  const handleBackToHome = () => {
    setSelectedDestination(null);
    setNavigationMode(null);
  };

  const handleBackToModeSelect = () => {
    setNavigationMode(null);
  };

  // --- RENDER CONTENT BASED ON STATE ---
  const renderContent = () => {
    switch (viewState) {
      case 'onboarding':
        return <Onboarding onComplete={handleVisitorAccess} onAdminLogin={handleAdminRequest} />;
      
      case 'admin-login':
        return <AdminLogin onLoginSuccess={handleAdminLoginSuccess} onCancel={handleAdminCancel} />;
      
      case 'admin-dashboard':
        return <AdminDashboard onLogout={handleAdminLogout} />;
      
      case 'app':
        return (
          <>
            <div className="flex-1 overflow-hidden relative">
              {/* MAIN TAB LOGIC */}
              {activeTab === 'main' && (
                  <>
                    {!selectedDestination ? (
                        // 1. HOME SCREEN
                        <Home onNavigate={handleNavigate} POIs={POI_DATA} />
                    ) : (
                        // 2. DESTINATION FLOW
                        <>
                          {/* MODE SELECTION SCREEN */}
                          {!navigationMode && (
                            <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
                                <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-gray-100 p-6 relative">
                                    <button 
                                      onClick={handleBackToHome}
                                      className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
                                    >
                                      <X size={20} />
                                    </button>
                                    
                                    <div className="text-center mb-8 mt-2">
                                      <h2 className="text-2xl font-bold text-gray-900 mb-1">Start Navigation</h2>
                                      <p className="text-gray-500 text-sm">To {selectedDestination.name}</p>
                                    </div>

                                    <div className="space-y-4">
                                      <button 
                                        onClick={() => setNavigationMode('map')}
                                        className="w-full flex items-center p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl hover:bg-blue-100 transition-colors group"
                                      >
                                        <div className="w-12 h-12 bg-white rounded-xl text-usz-blue flex items-center justify-center shadow-sm mr-4 group-hover:scale-110 transition-transform">
                                            <Map size={24} />
                                        </div>
                                        <div className="text-left">
                                            <span className="block font-bold text-gray-900 text-lg">2D Map</span>
                                            <span className="text-xs text-gray-500">Classic floor plan view</span>
                                        </div>
                                      </button>

                                      <button 
                                        onClick={() => setNavigationMode('ar')}
                                        className="w-full flex items-center p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl hover:bg-gray-100 transition-colors group"
                                      >
                                        <div className="w-12 h-12 bg-white rounded-xl text-gray-700 flex items-center justify-center shadow-sm mr-4 group-hover:scale-110 transition-transform">
                                            <Camera size={24} />
                                        </div>
                                        <div className="text-left">
                                            <span className="block font-bold text-gray-900 text-lg">Camera AR</span>
                                            <span className="text-xs text-gray-500">Augmented Reality overlay</span>
                                        </div>
                                      </button>
                                    </div>
                                </div>
                            </div>
                          )}

                          {/* MAP MODE */}
                          {navigationMode === 'map' && (
                              <Navigation 
                                  destination={selectedDestination} 
                                  userLocation={USER_START_LOCATION}
                                  onBack={handleBackToModeSelect} 
                              />
                          )}

                          {/* AR MODE */}
                          {navigationMode === 'ar' && (
                              <CameraAR 
                                destination={selectedDestination}
                                userLocation={USER_START_LOCATION}
                                onBack={handleBackToModeSelect}
                              />
                          )}
                        </>
                    )}
                  </>
              )}

              {/* CHATBOT TAB */}
              {activeTab === 'chatbot' && (
                  <Chatbot />
              )}

              {/* SETTINGS TAB */}
              {activeTab === 'settings' && (
                  <Settings onSwitchToAdmin={handleAdminRequest} onLogout={handleUserLogout} />
              )}
            </div>

            {/* Bottom Nav - Hidden when in active navigation flow */}
            {!(activeTab === 'main' && selectedDestination) && (
              <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
            )}
          </>
        );
    }
  };

  return (
    <div className="w-full h-screen max-w-md mx-auto bg-white shadow-2xl overflow-hidden relative font-sans text-gray-900 flex flex-col">
       {renderContent()}
    </div>
  );
};

export default App;
