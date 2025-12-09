
import React, { useState, useMemo } from 'react';
import { ArrowLeft, ArrowUpCircle, MapPin, ChevronRight, DoorOpen, Coffee } from 'lucide-react';
import { POI, LocationPoint, RouteData, RouteStep } from '../types';

interface CameraARProps {
  destination: POI;
  userLocation: LocationPoint;
  onBack: () => void;
}

const CameraAR: React.FC<CameraARProps> = ({ destination, userLocation, onBack }) => {
  const [stepIndex, setStepIndex] = useState(0);

  // --- SHARED ROUTING LOGIC ---
  const getBuildingFromX = (x: number) => {
    if (x < 130) return 'West Wing';
    if (x > 270) return 'East Wing';
    return 'Main Bldg';
  };

  const routeData: RouteData = useMemo(() => {
    const steps: RouteStep[] = [];
    const elevators = {
      'West Wing': { x: 70, y: 200 },
      'Main Bldg': { x: 200, y: 200 },
      'East Wing': { x: 330, y: 200 }
    };

    const startBuilding = getBuildingFromX(userLocation.x);
    const endBuilding = getBuildingFromX(destination.location.x);
    const CONNECTOR_FLOOR = 1;

    // Same Building Logic
    if (startBuilding === endBuilding) {
       if (userLocation.floor === destination.floor) {
         steps.push({ instruction: `Walk straight to ${destination.name}`, distance: 30, action: 'straight' });
       } else {
         steps.push({ instruction: `Walk to ${startBuilding} Elevator`, distance: 20, action: 'straight' });
         steps.push({ instruction: `Take elevator to Level ${destination.floor}`, distance: 0, action: 'elevator' });
         steps.push({ instruction: `Walk to ${destination.name}`, distance: 20, action: 'straight' });
       }
    } 
    // Multi Building Logic
    else {
        // 1. To Connector
        if (userLocation.floor !== CONNECTOR_FLOOR) {
            steps.push({ instruction: `Walk to ${startBuilding} Elevator`, distance: 30, action: 'straight' });
            steps.push({ instruction: `Take elevator to Level ${CONNECTOR_FLOOR}`, distance: 0, action: 'elevator' });
        } else {
             steps.push({ instruction: `Walk to main corridor`, distance: 10, action: 'straight' });
        }

        // 2. Across Bridge
        const endElv = elevators[endBuilding as keyof typeof elevators];
        const startElv = elevators[startBuilding as keyof typeof elevators];
        const direction = endElv.x > startElv.x ? 'East' : 'West';
        steps.push({ instruction: `Walk ${direction} across bridge towards ${endBuilding}`, distance: 100, action: 'straight' });

        // 3. To Final Floor
        if (destination.floor !== CONNECTOR_FLOOR) {
            steps.push({ instruction: `Take ${endBuilding} elevator to Level ${destination.floor}`, distance: 0, action: 'elevator' });
        }

        // 4. Arrive
        steps.push({ instruction: `Arrive at ${destination.name}`, distance: 20, action: 'arrive' });
    }
    
    if (steps[steps.length - 1].action !== 'arrive') {
        steps.push({ instruction: 'You have arrived', distance: 0, action: 'arrive' });
    }

    return {
      destination,
      totalDistance: 200,
      estimatedTime: 5,
      steps,
      path: []
    };
  }, [destination, userLocation]);

  const currentStep = routeData.steps[stepIndex];
  
  // --- DYNAMIC BACKGROUND SELECTION ---
  const getBackgroundImage = () => {
    // 1. Elevator Steps
    if (currentStep.action === 'elevator') {
        // Use a realistic elevator door image
        return 'url("https://images.unsplash.com/photo-1555617766-c94804975da3?q=80&w=2000&auto=format&fit=crop")'; 
    }

    // 2. Arrival (Destination)
    if (currentStep.action === 'arrive') {
        // A. Bathroom (Specific Image)
        if (destination.type === 'service' && (destination.id.includes('WC') || destination.name.toLowerCase().includes('restroom'))) {
            return 'url("https://images.unsplash.com/photo-1594912765873-1941e2c9439c?q=80&w=2000&auto=format&fit=crop")'; 
        }
        // B. Coffee / Cafeteria
        if (destination.id.includes('COFFEE') || destination.id === 'CAFETERIA') {
             return 'url("https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2000&auto=format&fit=crop")'; 
        }
        // C. Generic Door/Corridor (We will overlay a sign here)
        return 'url("https://images.unsplash.com/photo-1516549655169-df83a0833860?q=80&w=2000&auto=format&fit=crop")';
    }

    // 3. Bridge
    if (currentStep.instruction.toLowerCase().includes('bridge')) {
        return 'url("https://images.unsplash.com/photo-1632053002928-19e4a3a60644?q=80&w=2000&auto=format&fit=crop")';
    }

    // 4. Default Corridor
    return 'url("https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2000&auto=format&fit=crop")';
  };

  const handleNext = () => {
    if (stepIndex < routeData.steps.length - 1) {
        setStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (stepIndex > 0) {
        setStepIndex(prev => prev - 1);
    }
  };

  const isRestroom = destination.id.includes('WC');

  return (
    <div className="relative h-full w-full bg-gray-900 overflow-hidden font-sans">
      {/* 1. Dynamic Background Layer */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out transform scale-105"
        style={{ backgroundImage: getBackgroundImage() }}
      >
        {/* Gradients for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80"></div>
        {/* Additional darken for arrival to make signs pop */}
        {currentStep.action === 'arrive' && <div className="absolute inset-0 bg-black/20"></div>}
      </div>

      {/* 2. Header HUD */}
      <div className="absolute top-0 left-0 right-0 p-4 pt-6 text-white z-20">
          <div className="flex items-start">
              <button 
               onClick={onBack}
               className="mr-4 p-2 bg-black/40 backdrop-blur rounded-full hover:bg-white/20 transition-colors border border-white/10"
              >
                  <ArrowLeft size={24} />
              </button>
              <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                      <div className="bg-green-500/90 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">Live AR</div>
                      <span className="text-xs font-medium text-gray-300">Accuracy: High</span>
                  </div>
                  <h2 className="text-xl font-bold flex items-center drop-shadow-md">
                      {currentStep.distance > 0 ? (
                        <span className="mr-2 text-3xl font-mono">{currentStep.distance}m</span>
                      ) : (
                        <span className="mr-2 text-xl">Here</span>
                      )}
                      <span className="text-sm font-normal opacity-80">to next step</span>
                  </h2>
              </div>
          </div>
      </div>

      {/* 3. Central AR Overlay Elements */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 perspective-3d">
          
          {/* A. Straight / Walk Arrow */}
          {currentStep.action === 'straight' && (
             <div className="animate-bounce flex flex-col items-center opacity-90 mt-20">
                 <div className="bg-usz-blue/90 backdrop-blur-md text-white px-6 py-3 rounded-2xl shadow-2xl border border-white/20 mb-2">
                    <span className="font-bold text-lg">Go Straight</span>
                 </div>
                 {/* 3D Arrow CSS shape */}
                 <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[30px] border-t-usz-blue filter drop-shadow-lg"></div>
                 {/* Floor Path Effect */}
                 <div className="w-16 h-64 bg-gradient-to-b from-usz-blue/50 to-transparent transform rotate-x-60 blur-md -mt-4"></div>
             </div>
          )}

          {/* B. Elevator Interaction */}
          {currentStep.action === 'elevator' && (
              <div className="flex flex-col items-center justify-center pointer-events-auto">
                 <div className="bg-black/60 backdrop-blur-md p-6 rounded-3xl border border-white/20 text-center animate-in zoom-in-95 duration-300 max-w-[80%]">
                     <div className="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30 animate-pulse">
                        <ArrowUpCircle size={32} className="text-white" />
                     </div>
                     <h3 className="text-xl font-bold text-white mb-2">Take Elevator</h3>
                     <p className="text-blue-100 mb-6">
                         Go to <span className="text-2xl font-bold text-white">Level {destination.floor}</span>
                     </p>
                     <button 
                       onClick={handleNext}
                       className="w-full bg-white text-usz-blue px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform active:scale-95 shadow-xl"
                     >
                        Enter Elevator
                     </button>
                 </div>
              </div>
          )}

          {/* C. Destination Arrived (Virtual Signage) */}
          {currentStep.action === 'arrive' && (
              <div className="relative w-full h-full flex items-center justify-center">
                  
                  {/* Virtual Sign attached to 'wall' */}
                  {/* We position this slightly offset to look like it's on a door/wall */}
                  {!isRestroom && (
                      <div className="absolute top-[30%] right-[15%] transform rotate-y-[-10deg] animate-in fade-in zoom-in duration-700">
                          <div className="bg-white/95 backdrop-blur-sm border-l-4 border-usz-blue p-4 rounded-r-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)] min-w-[160px] max-w-[200px]">
                                <div className="flex items-center border-b border-gray-200 pb-2 mb-2">
                                    <div className="bg-usz-blue text-white text-xs font-bold px-1.5 py-0.5 rounded mr-2">
                                        {destination.floor === 0 ? 'GF' : `L${destination.floor}`}
                                    </div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">USZ</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 leading-tight">
                                    {destination.name}
                                </h3>
                                {destination.type === 'medical' && (
                                    <p className="text-xs text-gray-500 mt-1">Check-in Required</p>
                                )}
                          </div>
                      </div>
                  )}

                  {/* Pin Drop Animation */}
                  <div className="flex flex-col items-center mt-20 animate-bounce">
                      <MapPin size={64} className="text-red-500 fill-red-500 drop-shadow-2xl mb-2" />
                      <div className="bg-white text-gray-900 px-6 py-3 rounded-full shadow-xl text-center border-2 border-red-500 flex items-center space-x-2">
                          {isRestroom ? <DoorOpen size={20} /> : <MapPin size={20} className="text-red-500" />}
                          <span className="font-bold text-lg">You have arrived</span>
                      </div>
                  </div>
              </div>
          )}

      </div>

      {/* 4. Footer Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-30">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center justify-between">
              
              <div className="flex-1 mr-4">
                  <p className="text-xs text-blue-200 uppercase font-bold tracking-wider mb-1">Step {stepIndex + 1} of {routeData.steps.length}</p>
                  <p className="text-white font-medium text-lg leading-tight line-clamp-2">
                      {currentStep.instruction}
                  </p>
              </div>

              <div className="flex space-x-2 shrink-0">
                  <button 
                    onClick={handlePrev}
                    disabled={stepIndex === 0}
                    className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white disabled:opacity-30 hover:bg-white/20 transition-all border border-white/5"
                  >
                      <ArrowLeft size={20} />
                  </button>
                  
                  {currentStep.action !== 'elevator' && (
                    <button 
                        onClick={handleNext}
                        disabled={stepIndex >= routeData.steps.length - 1}
                        className="h-12 px-6 rounded-full bg-usz-blue text-white font-bold flex items-center space-x-2 shadow-lg hover:bg-blue-600 transition-all disabled:opacity-50 disabled:grayscale"
                    >
                        <span>{stepIndex === routeData.steps.length - 1 ? 'Done' : 'Next'}</span>
                        <ChevronRight size={18} />
                    </button>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};

export default CameraAR;
