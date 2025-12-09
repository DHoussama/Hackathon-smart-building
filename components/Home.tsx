
import React, { useState, useMemo } from 'react';
import { Search, MapPin, Activity, Coffee, Info, Truck, Mic, Loader2, Bath, ChevronRight, Sparkles, ShoppingBag, CreditCard } from 'lucide-react';
import { POI } from '../types';
import { interpretSearchQuery } from '../services/geminiService';

interface HomeProps {
  onNavigate: (poi: POI) => void;
  POIs: POI[];
}

const Home: React.FC<HomeProps> = ({ onNavigate, POIs }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<POI | null>(null);

  const quickAccess = [
    { id: 'EMERGENCY', label: 'Emergency', icon: <Activity />, color: 'bg-red-50 text-red-600 border-red-100' },
    { id: 'WC_MAIN_0', label: 'Restrooms', icon: <Bath />, color: 'bg-blue-50 text-blue-600 border-blue-100' },
    { id: 'CAFETERIA', label: 'Cafeteria', icon: <Coffee />, color: 'bg-orange-50 text-orange-600 border-orange-100' },
    { id: 'PARKING', label: 'Parking', icon: <Truck />, color: 'bg-gray-50 text-gray-600 border-gray-200' },
  ];

  // Live filter as user types
  const filteredPOIs = useMemo(() => {
    if (!searchQuery) return [];
    const lowerQ = searchQuery.toLowerCase();
    return POIs.filter(p => 
      p.name.toLowerCase().includes(lowerQ) || 
      p.type.toLowerCase().includes(lowerQ) ||
      p.building.toLowerCase().includes(lowerQ)
    );
  }, [searchQuery, POIs]);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setAiSuggestion(null);

    // AI Logic for complex queries
    try {
      const matchedId = await interpretSearchQuery(searchQuery);
      if (matchedId) {
        // Handle generic matches mapped to specific available IDs
        let finalId = matchedId;
        if (matchedId.startsWith('WC') && !POIs.find(p => p.id === matchedId)) finalId = 'WC_MAIN_0'; 
        
        const poi = POIs.find(p => p.id === finalId);
        if (poi) {
          setAiSuggestion(poi);
        } else {
          setSearchError("We understood your request but couldn't find that specific location.");
        }
      } else {
        setSearchError("No specific department found matching your description.");
      }
    } catch (err) {
      setSearchError("Unable to connect to AI assistant.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleQuickAccess = (id: string) => {
    if (id.startsWith('WC')) {
       const wc = POIs.find(p => p.id === 'WC_MAIN_0');
       if (wc) onNavigate(wc);
       return;
    }
    const poi = POIs.find(p => p.id === id);
    if (poi) onNavigate(poi);
  };

  // Grouping for the default list
  const medicalPOIs = POIs.filter(p => p.type === 'medical');
  const servicePOIs = POIs.filter(p => p.type === 'service' && !p.id.startsWith('WC'));

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header / Search Area */}
      <div className="bg-white px-6 py-6 pb-4 shadow-sm z-20 sticky top-0">
        <div className="flex justify-between items-center mb-4">
           <h1 className="text-2xl font-bold text-usz-blue tracking-tight">USZ Wayfinder</h1>
           <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
             <span className="text-xs font-bold text-usz-blue">USZ</span>
           </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative shadow-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
                setSearchQuery(e.target.value);
                setAiSuggestion(null); // Clear old suggestion on type
                setSearchError(null);
            }}
            placeholder="Search departments, rooms, services..."
            className="w-full pl-12 pr-12 py-4 bg-gray-100 border-none rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-usz-blue focus:bg-white transition-all text-base font-medium"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          
          {isSearching ? (
             <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <Loader2 className="animate-spin text-usz-blue" size={20} />
             </div>
          ) : (
            <button type="submit" className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-usz-blue">
               {searchQuery.length > 0 ? (
                   <div className="bg-usz-blue text-white p-1.5 rounded-full shadow-sm"><ChevronRight size={16}/></div>
               ) : (
                   <Mic size={20} />
               )}
            </button>
          )}
        </form>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar">
        
        {/* Error Message */}
        {searchError && (
          <div className="mb-4 p-4 bg-red-50 rounded-xl border border-red-100 text-sm text-red-600 flex items-center animate-in slide-in-from-top-2">
            <Info size={16} className="mr-2 flex-shrink-0" />
            {searchError}
          </div>
        )}

        {/* AI Suggestion Card */}
        {aiSuggestion && (
            <div className="mb-6 animate-in slide-in-from-top-4 fade-in duration-300">
                <div className="flex items-center space-x-2 mb-2">
                    <Sparkles size={14} className="text-purple-600" />
                    <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">AI Suggestion</span>
                </div>
                <button
                    onClick={() => onNavigate(aiSuggestion)}
                    className="w-full bg-gradient-to-br from-purple-50 to-white p-4 rounded-xl border border-purple-100 shadow-md flex items-center group active:scale-[0.98] transition-all"
                >
                    <div className="bg-purple-100 p-3 rounded-lg text-purple-600 mr-4">
                        <MapPin size={24} className="fill-current" />
                    </div>
                    <div className="text-left flex-1">
                        <h3 className="font-bold text-gray-900">{aiSuggestion.name}</h3>
                        <p className="text-xs text-gray-500">Best match for "{searchQuery}"</p>
                    </div>
                    <div className="bg-purple-600 text-white p-2 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                        <ChevronRight size={16} />
                    </div>
                </button>
                <div className="my-6 border-b border-gray-200" />
            </div>
        )}

        {/* Search Results (Live Filtering) */}
        {searchQuery.length > 0 ? (
            <div className="space-y-4">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Search Results</h2>
                
                {filteredPOIs.length === 0 && !aiSuggestion && !isSearching ? (
                     <div className="text-center py-8 opacity-60">
                        <p>No direct matches found.</p>
                        <p className="text-sm mt-2">Tap the <span className="font-bold text-usz-blue">blue arrow</span> to ask AI.</p>
                     </div>
                ) : (
                    filteredPOIs.map((poi) => (
                        <POIListItem key={poi.id} poi={poi} onClick={() => onNavigate(poi)} />
                    ))
                )}
            </div>
        ) : (
            /* Default View (Quick Access + Categories) */
            <div className="space-y-8 pb-8">
                {/* Quick Access */}
                <div className="grid grid-cols-2 gap-3">
                    {quickAccess.map((item) => (
                        <button
                        key={item.id}
                        onClick={() => handleQuickAccess(item.id)}
                        className={`flex items-center p-4 rounded-2xl border transition-all active:scale-95 shadow-sm hover:shadow-md ${item.color} bg-white`}
                        >
                        <div className="mr-3">
                            {React.cloneElement(item.icon as React.ReactElement<any>, { size: 24 })}
                        </div>
                        <span className="font-semibold text-sm text-gray-800">{item.label}</span>
                        </button>
                    ))}
                </div>

                {/* Medical Departments */}
                <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                        <Activity size={18} className="mr-2 text-blue-600"/> Medical Departments
                    </h2>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        {medicalPOIs.map((poi, idx) => (
                            <div key={poi.id} className={idx !== medicalPOIs.length - 1 ? 'border-b border-gray-50' : ''}>
                                <POIListItem poi={poi} onClick={() => onNavigate(poi)} minimal />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Services */}
                <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                        <Coffee size={18} className="mr-2 text-orange-600"/> Services & Amenities
                    </h2>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        {servicePOIs.map((poi, idx) => (
                            <div key={poi.id} className={idx !== servicePOIs.length - 1 ? 'border-b border-gray-50' : ''}>
                                <POIListItem poi={poi} onClick={() => onNavigate(poi)} minimal />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

// Sub-component for list items
const POIListItem: React.FC<{ poi: POI, onClick: () => void, minimal?: boolean }> = ({ poi, onClick, minimal }) => {
    let icon = <MapPin size={20} />;
    let colorClass = "bg-gray-100 text-gray-600";

    if (poi.type === 'medical') { icon = <Activity size={20} />; colorClass = "bg-blue-50 text-blue-600"; }
    if (poi.type === 'service') { icon = <Coffee size={20} />; colorClass = "bg-orange-50 text-orange-600"; }
    if (poi.type === 'emergency') { icon = <Activity size={20} />; colorClass = "bg-red-50 text-red-600"; }
    if (poi.id.includes('GIFT')) { icon = <ShoppingBag size={20} />; colorClass = "bg-pink-50 text-pink-600"; }
    if (poi.id.includes('ATM')) { icon = <CreditCard size={20} />; colorClass = "bg-green-50 text-green-600"; }

    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center ${minimal ? 'p-4 hover:bg-gray-50' : 'p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-usz-blue'} transition-colors text-left group`}
        >
            <div className={`p-2.5 rounded-lg mr-4 transition-colors ${colorClass} ${!minimal && 'group-hover:scale-110 transition-transform'}`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 truncate">{poi.name}</h3>
                <p className="text-xs text-gray-500 truncate">{poi.building} • Level {poi.floor}</p>
            </div>
            {!minimal && (
                <div className="text-gray-300 group-hover:text-usz-blue">
                    <ChevronRight size={20} />
                </div>
            )}
        </button>
    );
}

export default Home;
