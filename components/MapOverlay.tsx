import React, { useState, useEffect } from 'react';
import { X, Navigation, Phone, Activity, Star } from 'lucide-react';
import { MOCK_HOSPITALS } from '../constants';
import { Hospital } from '../types';

interface MapOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation: { lat: number; lng: number } | null;
  ktasLevel: number;
}

const MapOverlay: React.FC<MapOverlayProps> = ({ isOpen, onClose, userLocation, ktasLevel }) => {
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [recommendedHospitals, setRecommendedHospitals] = useState<Hospital[]>([]);

  // Spec E3.3 Recommendation Algorithm
  useEffect(() => {
    let filtered = [...MOCK_HOSPITALS];
    
    // Logic: KTAS 1-2 (Severe) -> Prioritize '권역' (Regional)
    if (ktasLevel <= 2) {
      filtered.sort((a, b) => {
        if (a.category === '권역' && b.category !== '권역') return -1;
        if (a.category !== '권역' && b.category === '권역') return 1;
        return a.distance - b.distance;
      });
    } 
    // Logic: KTAS 3 (Moderate) -> Prioritize '지역' (Local Center)
    else if (ktasLevel === 3) {
      filtered.sort((a, b) => {
        if (a.category === '권역' && b.category !== '권역') return 1; // De-prioritize Regional if possible
        return a.distance - b.distance;
      });
    } 
    // Logic: KTAS 4-5 (Mild) -> Nearest available
    else {
      filtered.sort((a, b) => a.distance - b.distance);
    }

    setRecommendedHospitals(filtered);
  }, [ktasLevel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full h-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-white p-2 rounded-full shadow-lg hover:bg-slate-100"
        >
          <X className="w-6 h-6 text-slate-600" />
        </button>

        {/* Left Side: List */}
        <div className="w-full md:w-1/3 bg-slate-50 border-r border-slate-200 flex flex-col h-full z-10">
          <div className="p-4 border-b border-slate-200 bg-white">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-blue-600" />
              주변 응급의료센터 (E2/E3)
            </h2>
            <div className="mt-2 text-xs font-bold text-slate-500 flex gap-2">
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">KTAS {ktasLevel}급 기준 추천</span>
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded">GPS 수신중</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {recommendedHospitals.map((hospital, idx) => (
              <div 
                key={hospital.id}
                onClick={() => setSelectedHospital(hospital)}
                className={`p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md relative group ${
                  selectedHospital?.id === hospital.id 
                    ? 'bg-red-50 border-red-500 ring-1 ring-red-500' 
                    : 'bg-white border-slate-200 hover:border-red-300'
                }`}
              >
                {/* Rank Badge */}
                <div className="absolute -left-2 -top-2 bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-black shadow-sm flex items-center gap-1">
                   <Star className="w-3 h-3 fill-current" /> 
                   추천 {idx + 1}순위
                </div>

                <div className="flex justify-between items-start pl-4 pt-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      {hospital.name}
                    </h3>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white ${
                      hospital.category === '권역' ? 'bg-purple-600' : 
                      hospital.category === '지역' ? 'bg-blue-600' : 'bg-slate-500'
                    }`}>{hospital.category}응급의료센터</span>
                  </div>
                  <span className="text-lg font-bold text-slate-700">{hospital.distance}km</span>
                </div>
                
                <div className="mt-3 grid grid-cols-3 gap-1 text-xs text-center">
                  <div className={`p-1.5 rounded font-bold ${hospital.availableBeds.emergency > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    응급: {hospital.availableBeds.emergency}
                  </div>
                  <div className="p-1.5 rounded bg-slate-100 text-slate-600">
                    중환자: {hospital.availableBeds.icu}
                  </div>
                  <div className="p-1.5 rounded bg-slate-100 text-slate-600">
                    입원: {hospital.availableBeds.ward}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Map Visual */}
        <div className="flex-1 bg-slate-200 relative overflow-hidden">
          {/* Mock Map Background */}
          <div className="absolute inset-0 opacity-15" 
               style={{
                 backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', 
                 backgroundSize: '30px 30px'
               }} 
          ></div>
          
          {/* E2.2: Ambulance Marker (Blue) */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">
            <div className="relative">
              <div className="w-8 h-8 bg-blue-600 rounded-full border-4 border-white shadow-xl z-10 flex items-center justify-center">
                <Navigation className="w-4 h-4 text-white fill-current" />
              </div>
              <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-50 scale-150"></div>
            </div>
            <div className="mt-2 bg-blue-900/80 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm shadow-sm">
              내 구급차
            </div>
          </div>

          {/* E2.2: Hospital Markers (Red) */}
          {recommendedHospitals.map((h, i) => {
             // Mock offset positions logic (spiral-ish)
             const angle = i * (Math.PI * 2 / 5);
             const radius = 120 + (i * 40);
             const offsetX = Math.cos(angle) * radius;
             const offsetY = Math.sin(angle) * radius;
             
             return (
               <div 
                 key={h.id}
                 className="absolute top-1/2 left-1/2 transition-all duration-500 z-10"
                 style={{ transform: `translate(${offsetX}px, ${offsetY}px)` }}
                 onClick={() => setSelectedHospital(h)}
               >
                 <div className={`cursor-pointer group flex flex-col items-center`}>
                    <div className={`relative w-8 h-8 flex items-center justify-center rounded-full shadow-lg border-2 border-white transition-transform transform group-hover:scale-110 ${selectedHospital?.id === h.id ? 'bg-red-600 text-white scale-125 z-30' : 'bg-white text-red-600'}`}>
                       <span className="font-bold text-sm">{i + 1}</span>
                       {/* Marker Triangle */}
                       <div className={`absolute -bottom-1.5 w-3 h-3 rotate-45 border-b border-r ${selectedHospital?.id === h.id ? 'bg-red-600 border-red-600' : 'bg-white border-white'}`}></div>
                    </div>
                    
                    <div className={`mt-2 bg-white/95 px-3 py-1.5 rounded-lg shadow-md text-xs font-bold text-slate-800 whitespace-nowrap backdrop-blur-sm border border-slate-200 ${selectedHospital?.id === h.id ? 'block' : 'hidden group-hover:block'}`}>
                      <span className="text-red-600 mr-1">#{i + 1}</span>
                      {h.name} ({h.distance}km)
                    </div>
                 </div>
               </div>
             )
          })}

          {selectedHospital && (
             <div className="absolute bottom-6 left-6 right-6 bg-white p-4 rounded-xl shadow-xl border border-slate-200 animate-in slide-in-from-bottom-4 z-30 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    {selectedHospital.name} 
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">{selectedHospital.category}</span>
                  </h3>
                  <p className="text-slate-500 text-sm mt-0.5">
                    가용병상: 응급 <span className="text-red-600 font-bold">{selectedHospital.availableBeds.emergency}</span> / 
                    중환자 <span className="text-slate-700 font-bold">{selectedHospital.availableBeds.icu}</span>
                  </p>
                </div>
                <a href={`tel:${selectedHospital.phone}`} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-xl font-bold shadow-lg transition-transform active:scale-95">
                   <Phone className="w-5 h-5" />
                   전화 연결
                </a>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapOverlay;