import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, ChevronUp, ChevronDown, Navigation as NavIcon, ArrowUpCircle, Map as MapIcon } from 'lucide-react';
import MapCanvas from './MapCanvas';
import { POI, RouteData, LocationPoint, RouteStep } from '../types';

interface NavigationProps {
  destination: POI;
  userLocation: LocationPoint;
  onBack: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ destination, userLocation, onBack }) => {
  const [currentFloor, setCurrentFloor] = useState<number>(userLocation.floor);
  const [stepIndex, setStepIndex] = useState(0);

  // Helper to determine which building coordinate belongs to
  const getBuildingFromX = (x: number) => {
    if (x < 130) return 'West Wing';
    if (x > 270) return 'East Wing';
    return 'Main Bldg';
  };

  const routeData: RouteData = useMemo(() => {
    const steps: RouteStep[] = [];
    const path: LocationPoint[] = [];
    
    // Elevators
    const elevators = {
      'West Wing': { x: 70, y: 200 },
      'Main Bldg': { x: 200, y: 200 },
      'East Wing': { x: 330, y: 200 }
    };

    const startBuilding = getBuildingFromX(userLocation.x);
    const endBuilding = getBuildingFromX(destination.location.x);
    
    const CONNECTOR_FLOOR = 1; // Floor 1 is the bridge level

    // Start
    path.push(userLocation);

    // -- SAME BUILDING LOGIC --
    if (startBuilding === endBuilding) {
       if (userLocation.floor === destination.floor) {
         // Same floor, same building
         steps.push({ instruction: `Walk to ${destination.name}`, distance: 30, action: 'straight' });
         path.push({ x: userLocation.x, y: 200, floor: userLocation.floor }); // Corridor
         path.push({ x: destination.location.x, y: 200, floor: destination.floor });
         path.push(destination.location);
       } else {
         // Different floor, same building
         const elv = elevators[startBuilding as keyof typeof elevators];
         
         // To Elevator
         steps.push({ instruction: `Go to ${startBuilding} Elevator`, distance: 20, action: 'straight' });
         path.push({ x: userLocation.x, y: 200, floor: userLocation.floor });
         path.push({ ...elv, floor: userLocation.floor });

         // Ride Elevator
         steps.push({ instruction: `Take elevator to Level ${destination.floor}`, distance: 0, action: 'elevator' });
         path.push({ ...elv, floor: destination.floor });

         // To Dest
         steps.push({ instruction: `Walk to ${destination.name}`, distance: 20, action: 'straight' });
         path.push({ x: destination.location.x, y: 200, floor: destination.floor });
         path.push(destination.location);
       }
    } 
    // -- MULTI BUILDING LOGIC --
    else {
        // Strategy: Go to Connector Floor (1) -> Walk to Target Bldg -> Target Floor -> Dest
        
        // 1. Get to Connector Floor in Start Building
        const startElv = elevators[startBuilding as keyof typeof elevators];
        if (userLocation.floor !== CONNECTOR_FLOOR) {
            steps.push({ instruction: `Walk to ${startBuilding} Elevator`, distance: 30, action: 'straight' });
            path.push({ x: userLocation.x, y: 200, floor: userLocation.floor });
            path.push({ ...startElv, floor: userLocation.floor });

            steps.push({ instruction: `Take elevator to Level ${CONNECTOR_FLOOR} (Bridge Level)`, distance: 0, action: 'elevator' });
            path.push({ ...startElv, floor: CONNECTOR_FLOOR });
        } else {
             // Already on connector floor
             steps.push({ instruction: `Walk to main corridor`, distance: 10, action: 'straight' });
             path.push({ ...startElv, floor: CONNECTOR_FLOOR });
        }

        // 2. Walk Across Bridge/Corridor to End Building Elevator
        const endElv = elevators[endBuilding as keyof typeof elevators];
        const direction = endElv.x > startElv.x ? 'East' : 'West';
        
        steps.push({ instruction: `Walk ${direction} towards ${endBuilding}`, distance: 100, action: 'straight' });
        // Add mid-way points for nicer line drawing across bridges
        path.push({ x: (startElv.x + endElv.x)/2, y: 200, floor: CONNECTOR_FLOOR }); 
        path.push({ ...endElv, floor: CONNECTOR_FLOOR });

        // 3. Take End Elevator to Destination Floor
        if (destination.floor !== CONNECTOR_FLOOR) {
            steps.push({ instruction: `Take ${endBuilding} elevator to Level ${destination.floor}`, distance: 0, action: 'elevator' });
            path.push({ ...endElv, floor: destination.floor });
        }

        // 4. Walk to Destination
        steps.push({ instruction: `Arrive at ${destination.name}`, distance: 20, action: 'arrive' });
        path.push({ x: destination.location.x, y: 200, floor: destination.floor });
        path.push(destination.location);
    }

    steps.push({ instruction: 'You have arrived', distance: 0, action: 'arrive' });

    return {
      destination,
      totalDistance: 200,
      estimatedTime: 5,
      steps,
      path
    };
  }, [destination, userLocation]);

  // Auto floor switching logic
  useEffect(() => {
    const currentStep = routeData.steps[stepIndex];
    if (!currentStep) return;

    // Rudimentary logic to switch map view to relevant floor for the current step
    // We look at the path segment associated roughly with this step
    
    // Total steps vs Total path points isn't 1:1, so we estimate.
    // If it's an elevator step, we usually wait.
    
    // Better logic: If we are at step X, what is the floor of the path point at X?
    // Since steps are fewer than path points, let's map steps to segments.
    
    if (currentStep.action === 'elevator') {
        // We are AT the elevator. Next step involves moving on new floor?
        // Let user manually switch or wait for "Next" click
    } else {
        // Try to deduce floor from instructions? 
        // Or simplified: If step index is late, show dest floor. If early, show start floor.
        // Let's use the 'path' array. We can try to find which floor dominates the current phase.
        
        // Quick Hack for prototype:
        // If we are past the first elevator step, show the floor of the path point AFTER the elevator.
        // This is complex. Let's keep it manual or simple based on index for now.
    }

  }, [stepIndex, routeData]);

  const handleNextStep = () => {
    if (stepIndex < routeData.steps.length - 1) {
        setStepIndex(prev => prev + 1);
        
        // Smart Floor Switching on "Next"
        const nextStep = routeData.steps[stepIndex + 1];
        // If we just finished an elevator step, switch the view to the new floor
        const currentStep = routeData.steps[stepIndex];
        if (currentStep.action === 'elevator') {
            // Find target floor from instruction or path
            // Look ahead in path to find the next floor
            // (Simple heuristic: if instruction says "Level X", parse it, otherwise check path)
            const match = currentStep.instruction.match(/Level (-?\d+)/);
            if (match) {
                setCurrentFloor(parseInt(match[1]));
            }
        }
    }
  };

  const handlePrevStep = () => {
    if (stepIndex > 0) {
      setStepIndex(prev => prev - 1);
    }
  };

  const currentStep = routeData.steps[stepIndex];
  const isElevatorStep = currentStep?.action === 'elevator';

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Top Header - Navigation Instructions */}
      <div className="bg-usz-blue text-white p-4 pb-6 rounded-b-3xl shadow-lg z-10 shrink-0 transition-all duration-300">
        <div className="flex items-start mb-4">
          <button onClick={onBack} className="mt-1 p-2 hover:bg-white/10 rounded-full transition" aria-label="Go Back">
            <ArrowLeft size={24} />
          </button>
          <div className="ml-3 flex-1">
            <h2 className="text-xl font-bold leading-tight">{currentStep?.instruction}</h2>
            {stepIndex < routeData.steps.length - 1 && (
                 <p className="text-sm text-blue-100 opacity-90 mt-2 flex items-center">
                    <span className="opacity-70 mr-1">Then:</span> 
                    {routeData.steps[stepIndex + 1].instruction}
                 </p>
            )}
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="flex items-center justify-between px-2">
           <div className="flex space-x-1 items-baseline">
             <span className="text-2xl font-bold">{Math.max(1, routeData.estimatedTime - stepIndex)}</span>
             <span className="text-xs opacity-80">min</span>
           </div>
           
           {/* Step Progress Bar */}
           <div className="flex-1 mx-4 h-1.5 bg-blue-800 rounded-full overflow-hidden flex">
             {routeData.steps.map((_, idx) => (
                <div 
                    key={idx}
                    className={`h-full flex-1 border-r border-blue-900 last:border-0 transition-colors duration-500 ${idx <= stepIndex ? 'bg-green-400' : 'bg-transparent'}`}
                />
             ))}
           </div>
           
           <div className="flex space-x-1 items-baseline">
             <span className="text-xs opacity-80 uppercase tracking-wider">Step {stepIndex + 1}/{routeData.steps.length}</span>
           </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative overflow-hidden bg-gray-100 p-2">
        <MapCanvas 
          currentFloor={currentFloor} 
          userLocation={stepIndex === 0 ? userLocation : null} 
          routePath={routeData.path}
          destination={destination}
          isElevatorHighlight={isElevatorStep}
        />

        {/* Elevator Interaction Overlay */}
        {isElevatorStep && (
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] flex items-center justify-center z-20 pointer-events-none">
                <div className="bg-white/95 p-6 rounded-2xl shadow-xl max-w-[85%] text-center border-2 border-usz-blue pointer-events-auto animate-in zoom-in-95 duration-200">
                    <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-usz-blue animate-bounce">
                        <ArrowUpCircle size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Elevator Required</h3>
                    <p className="text-gray-600 mb-6 text-sm">
                        Please take the elevator to 
                        <span className="font-bold text-usz-blue mx-1">
                            Level {currentStep.instruction.match(/Level (-?\d+)/)?.[1] || '?'}
                        </span> 
                         to continue.
                    </p>
                    <button 
                        onClick={handleNextStep}
                        className="w-full bg-usz-blue text-white py-3 rounded-xl font-bold shadow-lg active:scale-95 transition-transform flex items-center justify-center space-x-2"
                    >
                        <span>I have arrived at floor</span>
                    </button>
                </div>
            </div>
        )}

        {/* Floor Control Stack */}
        <div className="absolute right-4 bottom-24 bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col items-center py-2 w-12 z-10">
            <button 
              onClick={() => setCurrentFloor(p => Math.min(p + 1, 3))}
              className="p-1 hover:bg-gray-100 text-usz-blue disabled:opacity-30 transition-colors"
              disabled={currentFloor >= 3}
            >
              <ChevronUp size={24} />
            </button>
            <div className="w-8 h-8 flex items-center justify-center font-bold text-gray-800 my-1 font-mono bg-gray-50 rounded">
                {currentFloor}
            </div>
            <button 
              onClick={() => setCurrentFloor(p => Math.max(p - 1, -1))}
              className="p-1 hover:bg-gray-100 text-usz-blue disabled:opacity-30 transition-colors"
              disabled={currentFloor <= -1}
            >
              <ChevronDown size={24} />
            </button>
        </div>
      </div>

      {/* Bottom Navigation Control */}
      <div className="bg-white border-t border-gray-200 p-4 safe-area-pb shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-center">
            <div className="flex flex-col max-w-[60%]">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold flex items-center">
                <MapIcon size={10} className="mr-1" /> Destination
              </span>
              <span className="text-lg font-bold text-gray-900 truncate">{destination.name}</span>
              <span className="text-xs text-gray-500 font-medium">
                  {destination.building} • Level {destination.floor}
              </span>
            </div>
            
            <div className="flex space-x-3">
                <button 
                onClick={handlePrevStep}
                disabled={stepIndex === 0}
                className="w-12 h-12 flex items-center justify-center bg-gray-100 text-gray-600 rounded-full shadow-sm disabled:opacity-30 hover:bg-gray-200 transition-colors"
                >
                <ArrowLeft size={20} />
                </button>
                <button 
                onClick={handleNextStep}
                disabled={stepIndex >= routeData.steps.length - 1}
                className="h-12 px-6 rounded-full bg-usz-blue text-white shadow-lg active:scale-95 transition-all flex items-center justify-center space-x-2 disabled:bg-gray-300 disabled:shadow-none hover:bg-blue-800"
                >
                  <span className="font-semibold">Next</span>
                  <NavIcon className="fill-current" size={18} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Navigation;