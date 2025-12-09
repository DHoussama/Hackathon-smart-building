
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LocationPoint, POI } from '../types';

interface MapCanvasProps {
  currentFloor: number;
  userLocation: LocationPoint | null;
  routePath: LocationPoint[];
  destination: POI | null;
  isElevatorHighlight?: boolean;
}

const MapCanvas: React.FC<MapCanvasProps> = ({ currentFloor, userLocation, routePath, destination, isElevatorHighlight }) => {
  
  // -- MAP GEOMETRY & ASSETS --

  // Static Building Shells (The footprints remain roughly same, interiors change)
  const shells = [
    { path: "M 30 80 H 110 V 320 H 30 Z", name: "West Wing", x: 70, y: 60 },
    { path: "M 140 40 H 260 V 360 H 140 Z", name: "Main Bldg", x: 200, y: 30 },
    { path: "M 290 80 H 370 V 320 H 290 Z", name: "East Wing", x: 330, y: 60 },
  ];

  // Amenities that appear on specific floors
  const amenities = useMemo(() => {
    const list = [];
    
    // Restrooms (WC) - Available on all floors
    list.push({ type: 'wc', x: 40, y: 200, floor: [0, 1, 2] }); // West
    list.push({ type: 'wc', x: 360, y: 200, floor: [0, 1, 2] }); // East
    list.push({ type: 'wc', x: 250, y: 340, floor: [0] }); // Main Lobby WC
    list.push({ type: 'wc', x: 250, y: 150, floor: [1, 2] }); // Main Upper WCs

    // Coffee
    list.push({ type: 'coffee', x: 180, y: 300, floor: [0] }); // Lobby Kiosk
    list.push({ type: 'coffee', x: 200, y: 120, floor: [1] }); // Cafeteria

    return list.filter(a => a.floor.includes(currentFloor));
  }, [currentFloor]);

  // Decorative Elements (Plants, Furniture, Medical Equipment)
  const decor = useMemo(() => {
    const items: any[] = [];
    if (currentFloor === 0) {
        // Plants Entry
        items.push({ type: 'plant', x: 180, y: 350 });
        items.push({ type: 'plant', x: 220, y: 350 });
        items.push({ type: 'plant', x: 190, y: 320 });
        items.push({ type: 'plant', x: 210, y: 320 });

        // Waiting Area Chairs (West Lobby)
        for(let x=45; x<95; x+=12) {
            items.push({ type: 'chair', x, y: 260 });
            items.push({ type: 'chair', x, y: 275 });
        }
        // Waiting Area Chairs (East Lobby)
        for(let x=305; x<355; x+=12) {
             items.push({ type: 'chair', x, y: 260 });
             items.push({ type: 'chair', x, y: 275 });
        }

        // Info Desk Sign
        items.push({ type: 'sign', label: 'INFO', x: 200, y: 280, color: '#3b82f6' });
        
        // Parking Sign (Near exit/underground access)
        items.push({ type: 'parking', x: 280, y: 350 });
    }

    if (currentFloor === 1) {
        // Cafeteria Tables
        for(let x=160; x<240; x+=20) {
            for(let y=90; y<140; y+=20) {
                if (Math.random() > 0.3) items.push({ type: 'table', x, y });
            }
        }
        // Vending Machines
        items.push({ type: 'vending', x: 125, y: 190 });
        items.push({ type: 'vending', x: 275, y: 190 });
    }

    if (currentFloor === 2) {
        // Nurse Stations
        items.push({ type: 'nurse', x: 70, y: 200 }); 
        items.push({ type: 'nurse', x: 330, y: 200 });
        
        // Department Labels (Minimal text on floor)
        items.push({ type: 'deptLabel', label: 'Pediatrics', x: 70, y: 130 });
        items.push({ type: 'deptLabel', label: 'Neurology', x: 70, y: 270 });
        items.push({ type: 'deptLabel', label: 'Cardiology', x: 330, y: 130 });
        items.push({ type: 'deptLabel', label: 'Oncology', x: 330, y: 270 });

        // Patient Beds inside rooms
        [100, 140, 180, 220, 260].forEach(y => {
            items.push({ type: 'bed', x: 42, y: y + 8 });
            items.push({ type: 'bed', x: 82, y: y + 8 });
            items.push({ type: 'bed', x: 302, y: y + 8 });
            items.push({ type: 'bed', x: 342, y: y + 8 });
        });
    }

    // Common items
    shells.forEach(s => {
        // Stairs icon (fake location for visual)
        if (currentFloor > 0) items.push({ type: 'stairs', x: s.x + 20, y: s.y + 20 });
    });

    return items;
  }, [currentFloor, shells]);

  // Floor Specific Details (Walls, Rooms, Furniture)
  const floorDetails = useMemo(() => {
    switch(currentFloor) {
      case 0: // Ground Floor
        return (
          <g className="floor-0-details">
            <path d="M 190 360 L 200 350 L 210 360" fill="none" stroke="#cbd5e1" strokeWidth="2" />
            <text x="200" y="375" textAnchor="middle" className="text-[8px] fill-gray-400 uppercase font-bold">Main Entrance</text>
            <rect x="180" y="280" width="40" height="20" rx="4" fill="#e2e8f0" />
            <path d="M 140 120 H 260" stroke="#fecaca" strokeWidth="2" strokeDasharray="4 2" />
            <rect x="150" y="50" width="100" height="60" fill="#fef2f2" rx="4" />
            <text x="200" y="85" textAnchor="middle" className="text-[8px] fill-red-300 font-bold rotate-0">EMERGENCY</text>
            <rect x="230" y="260" width="25" height="40" fill="#f0fdf4" stroke="#dcfce7" />
            <rect x="40" y="250" width="60" height="60" fill="#f8fafc" stroke="#e2e8f0" />
          </g>
        );
      case 1: // Bridge Level
        return (
          <g className="floor-1-details">
            <path d="M 110 200 H 140" stroke="#94a3b8" strokeWidth="12" />
            <path d="M 260 200 H 290" stroke="#94a3b8" strokeWidth="12" />
            <path d="M 110 196 H 140 M 110 204 H 140" stroke="white" strokeWidth="1" />
            <path d="M 260 196 H 290 M 260 204 H 290" stroke="white" strokeWidth="1" />
            <rect x="150" y="80" width="100" height="80" fill="#fff7ed" rx="8" />
            <rect x="40" y="90" width="60" height="80" fill="#eff6ff" stroke="#dbeafe" />
            <path d="M 50 100 H 90 M 50 120 H 90 M 50 140 H 90" stroke="#bfdbfe" strokeWidth="1" />
            <rect x="300" y="90" width="60" height="80" fill="#f0fdfa" stroke="#ccfbf1" />
          </g>
        );
      case 2: // Wards
        return (
          <g className="floor-2-details">
            <path d="M 70 90 V 310" stroke="#f1f5f9" strokeWidth="12" />
            <path d="M 200 50 V 350" stroke="#f1f5f9" strokeWidth="12" />
            <path d="M 330 90 V 310" stroke="#f1f5f9" strokeWidth="12" />
            {[100, 140, 180, 220, 260].map(y => (
               <g key={`rooms-west-${y}`}>
                 <rect x="35" y={y} width="30" height="25" fill="white" stroke="#e2e8f0" strokeWidth="0.5" />
                 <rect x="75" y={y} width="30" height="25" fill="white" stroke="#e2e8f0" strokeWidth="0.5" />
               </g>
            ))}
             {[100, 140, 180, 220, 260].map(y => (
               <g key={`rooms-east-${y}`}>
                 <rect x="295" y={y} width="30" height="25" fill="white" stroke="#e2e8f0" strokeWidth="0.5" />
                 <rect x="335" y={y} width="30" height="25" fill="white" stroke="#e2e8f0" strokeWidth="0.5" />
               </g>
            ))}
          </g>
        );
      default:
        return null;
    }
  }, [currentFloor]);

  const elevators = [
    { x: 70, y: 200, label: 'W' },
    { x: 200, y: 200, label: 'M' },
    { x: 330, y: 200, label: 'E' },
  ];

  const currentFloorPath = useMemo(() => {
    return routePath.filter(p => p.floor === currentFloor);
  }, [routePath, currentFloor]);

  const routeD = useMemo(() => {
    if (currentFloorPath.length < 2) return ""; 
    return `M ${currentFloorPath.map(p => `${p.x} ${p.y}`).join(' L ')}`;
  }, [currentFloorPath]);

  const activeElevator = useMemo(() => {
    return elevators.find(e => 
      routePath.some(p => 
        p.floor === currentFloor && Math.abs(p.x - e.x) < 15 && Math.abs(p.y - e.y) < 15
      )
    );
  }, [routePath, currentFloor, elevators]);

  return (
    <div className="relative w-full h-full bg-[#F3F4F6] overflow-hidden rounded-xl shadow-inner border border-gray-200">
      <AnimatePresence mode="wait">
        <motion.div 
            key={currentFloor}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="w-full h-full"
        >
            <svg viewBox="0 0 400 400" className="w-full h-full">
                {/* Grid */}
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
                </pattern>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Buildings */}
                {shells.map((b, i) => (
                    <g key={i}>
                        <path d={b.path} fill="rgba(0,0,0,0.05)" transform="translate(4,4)" />
                        <path d={b.path} fill="white" stroke="#cbd5e1" strokeWidth="2" />
                        {currentFloor === 0 && (
                          <text x={b.x} y={b.y} textAnchor="middle" className="text-[10px] font-bold fill-gray-400 uppercase tracking-widest opacity-50">
                            {b.name}
                          </text>
                        )}
                    </g>
                ))}

                {/* Floor Details */}
                {floorDetails}

                {/* Decor Items */}
                {decor.map((item, idx) => (
                    <g key={`decor-${idx}`} transform={`translate(${item.x}, ${item.y})`}>
                        {item.type === 'plant' && (
                            <g>
                                <circle r="5" fill="#dcfce7" stroke="#86efac" strokeWidth="0.5"/>
                                <circle r="2.5" fill="#22c55e" />
                            </g>
                        )}
                        {item.type === 'chair' && (
                            <rect x="-3" y="-3" width="6" height="6" rx="2" fill="#cbd5e1" />
                        )}
                        {item.type === 'table' && (
                            <circle r="4" fill="#fdba74" opacity="0.6" />
                        )}
                        {item.type === 'vending' && (
                            <g>
                                <rect x="-4" y="-8" width="8" height="16" fill="#1e293b" />
                                <rect x="-2" y="-6" width="4" height="8" fill="#3b82f6" />
                                <rect x="-2" y="4" width="4" height="2" fill="white" />
                            </g>
                        )}
                        {item.type === 'bed' && (
                            <g>
                                <rect x="-6" y="-8" width="12" height="16" rx="2" fill="#bfdbfe" stroke="#60a5fa" strokeWidth="0.5" />
                                <rect x="-6" y="-8" width="12" height="4" fill="white" rx="1" />
                            </g>
                        )}
                        {item.type === 'nurse' && (
                             <g>
                                 <circle r="8" fill="#fecaca" stroke="#f87171" strokeWidth="1" />
                                 <text y="3" textAnchor="middle" className="text-[8px] font-bold fill-red-600">+</text>
                             </g>
                        )}
                        {item.type === 'stairs' && (
                             <g opacity="0.4">
                                 <rect x="-5" y="-5" width="10" height="10" fill="none" stroke="#94a3b8" />
                                 <path d="M -5 -2 H 5 M -5 2 H 5" stroke="#94a3b8" strokeWidth="0.5" />
                             </g>
                        )}
                        {item.type === 'sign' && (
                             <text y="3" textAnchor="middle" className="text-[6px] font-bold fill-blue-500">{item.label}</text>
                        )}
                        {item.type === 'parking' && (
                             <g>
                                <rect x="-8" y="-8" width="16" height="16" rx="4" fill="#2563eb" />
                                <text y="4" textAnchor="middle" className="text-[10px] font-bold fill-white">P</text>
                             </g>
                        )}
                        {item.type === 'deptLabel' && (
                             <text y="0" textAnchor="middle" className="text-[7px] font-bold fill-gray-500 uppercase tracking-tight">{item.label}</text>
                        )}
                    </g>
                ))}

                {/* Amenities */}
                {amenities.map((item, idx) => (
                  <g key={`am-${idx}`} transform={`translate(${item.x}, ${item.y})`}>
                     <circle r="6" fill={item.type === 'wc' ? '#dbeafe' : '#ffedd5'} stroke="white" strokeWidth="1" />
                     {item.type === 'wc' ? (
                       <text y="2.5" textAnchor="middle" className="text-[6px] font-bold fill-blue-500">WC</text>
                     ) : (
                       <text y="2.5" textAnchor="middle" className="text-[6px] font-bold fill-orange-500">☕</text>
                     )}
                  </g>
                ))}

                {/* Elevators */}
                {elevators.map((elv, i) => {
                    const isActive = activeElevator && activeElevator.x === elv.x;
                    return (
                        <g key={`elv-${i}`} transform={`translate(${elv.x}, ${elv.y})`}>
                             <rect x="-10" y="-10" width="20" height="20" rx="4" fill={isActive ? "#3b82f6" : "#f1f5f9"} stroke={isActive ? "white" : "#cbd5e1"} strokeWidth="1.5" />
                             <path d="M -4 -3 L 4 -3 M -4 3 L 4 3" stroke={isActive ? "white" : "#94a3b8"} strokeWidth="2" strokeLinecap="round" />
                             {isActive && isElevatorHighlight && (
                                <circle r="18" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 2" opacity="0.6">
                                    <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="4s" repeatCount="indefinite" />
                                </circle>
                             )}
                        </g>
                    );
                })}

                {/* Route Line */}
                {routeD && (
                  <>
                    <path d={routeD} fill="none" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
                    <motion.path
                        d={routeD}
                        fill="none"
                        stroke={isElevatorHighlight ? "#60a5fa" : "#28A745"} 
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="0 1"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </>
                )}

                {/* Start User */}
                {userLocation && userLocation.floor === currentFloor && (
                    <g transform={`translate(${userLocation.x}, ${userLocation.y})`}>
                        <circle r="6" fill="#005596" stroke="white" strokeWidth="2" className="drop-shadow-md" />
                        <circle r="16" fill="#005596" fillOpacity="0.2">
                            <animate attributeName="r" values="6;20;6" dur="2s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
                        </circle>
                    </g>
                )}

                {/* Destination */}
                {destination && destination.floor === currentFloor && (
                    <g transform={`translate(${destination.location.x}, ${destination.location.y})`}>
                        <motion.g
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5, type: 'spring' }}
                        >
                            <path d="M -10 -24 L 10 -24 L 0 0 Z" fill="#E3000F" />
                            <circle cx="0" cy="-24" r="10" fill="#E3000F" />
                            <circle cx="0" cy="-24" r="3" fill="white" />
                            <rect x="-30" y="-42" width="60" height="14" rx="4" fill="white" fillOpacity="0.9" stroke="#E3000F" strokeWidth="0.5" />
                            <text y="-33" textAnchor="middle" className="text-[8px] font-bold fill-gray-900">
                                {destination.name.split(' ')[0]}
                            </text>
                        </motion.g>
                    </g>
                )}
            </svg>
        </motion.div>
      </AnimatePresence>
      
      {/* Floor Badge */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-white/90 backdrop-blur pl-3 pr-4 py-1.5 rounded-full shadow-sm border border-gray-200 flex items-center space-x-2">
           <div className="w-6 h-6 rounded-full bg-usz-blue text-white flex items-center justify-center text-xs font-bold">
             {currentFloor}
           </div>
           <span className="text-xs font-bold text-gray-600 uppercase">
             {currentFloor === 0 ? 'Ground' : `Level ${currentFloor}`}
           </span>
        </div>
      </div>
    </div>
  );
};

export default MapCanvas;
