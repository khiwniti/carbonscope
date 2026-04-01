import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin, Plus, Layers, Locate, Navigation, Minus, Camera, X, Sprout, FileText, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import { Tree, TreeStatus, LandDeed } from '../types';
import { isPointInPolygon } from '../services/geometryService';

interface MapPlotterProps {
  trees: Tree[];
  landDeeds?: LandDeed[];
  focusedTreeId?: string | null;
  onStartPlanting: (lat: number, lng: number, deedId?: string) => void;
  onNavigateToScanner: () => void;
  onViewTreeDetail?: (tree: Tree) => void;
}

const MapPlotter: React.FC<MapPlotterProps> = ({ trees, landDeeds = [], focusedTreeId, onStartPlanting, onNavigateToScanner, onViewTreeDetail }) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polygonsRef = useRef<L.Polygon[]>([]);
  
  // Default center (Bangkok Mock)
  const [currentCenter, setCurrentCenter] = useState<[number, number]>([13.75633, 100.50177]);

  const [mode, setMode] = useState<'VIEW' | 'ADD'>('VIEW');
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);
  const [selectedDeed, setSelectedDeed] = useState<LandDeed | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Validation State for Add Mode
  const [locationStatus, setLocationStatus] = useState<'UNKNOWN' | 'VALID' | 'INVALID'>('UNKNOWN');
  const [matchedDeed, setMatchedDeed] = useState<LandDeed | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current) return;
    if (mapRef.current) return; // Already initialized

    const map = L.map(mapContainer.current, {
        zoomControl: false,
        attributionControl: false
    }).setView(currentCenter, 18);

    // Satellite Layer (Esri World Imagery)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri'
    }).addTo(map);

    mapRef.current = map;

    // Track center for "Add" mode
    map.on('move', () => {
        const center = map.getCenter();
        setCurrentCenter([center.lat, center.lng]);
    });

    map.on('moveend', () => {
        // Trigger validation when map stops moving in ADD mode
        if (modeRef.current === 'ADD') {
            validateLocation(map.getCenter());
        }
    });

    // Handle Clicks for View Mode Only
    map.on('click', (e) => {
        if (modeRef.current === 'VIEW') {
             setSelectedTree(null);
             setSelectedDeed(null);
        }
    });

    return () => {
        map.remove();
        mapRef.current = null;
    };
  }, []);

  // Handle Focused Tree ID (External Navigation)
  useEffect(() => {
    if (focusedTreeId && mapRef.current) {
        const tree = trees.find(t => t.id === focusedTreeId);
        if (tree) {
            // Slight delay to ensure map is ready if switching views
            setTimeout(() => {
                mapRef.current?.flyTo([tree.lat, tree.lng], 20, { duration: 1.5 });
                setSelectedTree(tree);
                setSelectedDeed(null);
                setMode('VIEW');
            }, 100);
        }
    }
  }, [focusedTreeId, trees]);

  // Handle Mode Changes via Ref
  const modeRef = useRef(mode);
  useEffect(() => { modeRef.current = mode; }, [mode]);

  // Validate Location Logic
  const validateLocation = (latlng: L.LatLng) => {
      if (landDeeds.length === 0) {
          setLocationStatus('UNKNOWN'); // No deeds to check against
          return;
      }

      const point = { lat: latlng.lat, lng: latlng.lng };
      let foundDeed: LandDeed | null = null;

      for (const deed of landDeeds) {
          if (deed.polygonPoints && isPointInPolygon(point, deed.polygonPoints)) {
              foundDeed = deed;
              break;
          }
      }

      if (foundDeed) {
          setMatchedDeed(foundDeed);
          setLocationStatus('VALID');
      } else {
          setMatchedDeed(null);
          setLocationStatus('INVALID');
      }
  };

  // Update Markers (Trees)
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    trees.forEach(tree => {
        const colorClass = tree.status === TreeStatus.ALIVE ? 'text-green-500' : 
                           tree.status === TreeStatus.DEAD ? 'text-red-500' : 'text-gray-400';
        
        const iconHtml = `
            <div class="flex flex-col items-center justify-center transform -translate-y-1/2 -translate-x-1/2 cursor-pointer transition-transform hover:scale-110">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" class="${colorClass} drop-shadow-md filter" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3" fill="white"></circle>
                </svg>
                ${mapRef.current!.getZoom() > 16 ? `<span class="bg-black/70 text-white text-[10px] px-2 rounded-full whitespace-nowrap mt-1 font-sans shadow-sm">${tree.species}</span>` : ''}
            </div>
        `;

        const icon = L.divIcon({
            className: 'bg-transparent',
            html: iconHtml,
            iconSize: [32, 48],
            iconAnchor: [16, 48]
        });

        const marker = L.marker([tree.lat, tree.lng], { icon }).addTo(mapRef.current!);
        
        marker.on('click', (e) => {
            if (modeRef.current === 'ADD') return; // Don't select when adding
            L.DomEvent.stopPropagation(e);
            setSelectedTree(tree);
            setSelectedDeed(null);
            mapRef.current?.panTo([tree.lat, tree.lng], { animate: true, duration: 0.5 });
        });

        markersRef.current.push(marker);
    });
  }, [trees, mode]); 

  // Update Polygons (Deeds)
  useEffect(() => {
      if (!mapRef.current) return;

      polygonsRef.current.forEach(p => p.remove());
      polygonsRef.current = [];

      landDeeds.forEach(deed => {
          if (deed.polygonPoints && deed.polygonPoints.length > 0) {
              const poly = L.polygon(deed.polygonPoints, {
                  color: '#22c55e', 
                  weight: 2,
                  fillColor: '#22c55e',
                  fillOpacity: 0.2,
                  dashArray: '5, 5'
              }).addTo(mapRef.current!);
              
              poly.on('click', (e) => {
                 if (modeRef.current === 'ADD') return;
                 L.DomEvent.stopPropagation(e);
                 setSelectedDeed(deed);
                 setSelectedTree(null);
                 mapRef.current?.panTo(poly.getBounds().getCenter(), { animate: true, duration: 0.5 });
              });

              polygonsRef.current.push(poly);
          }
      });
  }, [landDeeds]);

  // Real Geolocation
  const handleLocate = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (mapRef.current) {
            mapRef.current.flyTo([latitude, longitude], 19);
          }
          setIsLocating(false);
        },
        (error) => {
          console.error("Error locating", error);
          alert("ไม่สามารถระบุตำแหน่งได้ กรุณาเปิด GPS");
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      alert("Browser does not support geolocation");
      setIsLocating(false);
    }
  };

  const handleConfirmLocation = () => {
      onStartPlanting(currentCenter[0], currentCenter[1], matchedDeed?.id);
      setMode('VIEW');
      setMatchedDeed(null);
      setLocationStatus('UNKNOWN');
      onNavigateToScanner();
  };

  return (
    <div className="h-full flex flex-col pb-24 relative animate-fade-in bg-gray-200">
       <header className="absolute top-4 left-4 right-4 bg-white/90 backdrop-blur rounded-xl shadow-md p-3 z-[400] flex justify-between items-center pointer-events-auto">
          <div>
            <h1 className="text-sm font-bold text-gray-800">แผนที่แปลงปลูก (Satellite)</h1>
            <p className="text-[10px] text-gray-500 flex items-center">
               <MapPin size={10} className="mr-1" />
               Live GPS Tracking
            </p>
          </div>
          <div className="flex space-x-2">
            <button className="p-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200">
               <Layers size={18} />
            </button>
            <button 
                onClick={handleLocate}
                className={`p-2 rounded-lg transition-colors ${isLocating ? 'bg-blue-100 text-blue-600 animate-pulse' : 'bg-white text-gray-600 shadow-sm'}`}
            >
               <Locate size={18} />
            </button>
          </div>
       </header>

       {/* Map Container */}
       <div className="relative flex-1 w-full h-full">
         <div 
           ref={mapContainer} 
           className="w-full h-full z-0"
         />
         
         {/* Center Pin UI for Add Mode */}
         {mode === 'ADD' && (
            <div className="absolute inset-0 z-[300] pointer-events-none flex flex-col items-center justify-center pb-8">
               {/* Location Status Indicator */}
               {locationStatus === 'VALID' && (
                  <div className="mb-4 bg-green-600 text-white px-3 py-1.5 rounded-full flex items-center shadow-lg animate-bounce-small">
                      <CheckCircle2 size={14} className="mr-1.5" />
                      <span className="text-xs font-bold">ในเขตพื้นที่: {matchedDeed?.deedNumber}</span>
                  </div>
               )}
               {locationStatus === 'INVALID' && (
                  <div className="mb-4 bg-orange-500 text-white px-3 py-1.5 rounded-full flex items-center shadow-lg animate-bounce-small">
                      <AlertTriangle size={14} className="mr-1.5" />
                      <span className="text-xs font-bold">อยู่นอกเขตโฉนดของคุณ</span>
                  </div>
               )}

               {/* The Pin */}
               <div className="relative -mt-8">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-xl border-4 border-white animate-bounce-small ${
                      locationStatus === 'INVALID' ? 'bg-orange-500' : 'bg-green-500'
                  }`}>
                     <Plus size={24} className="text-white" />
                  </div>
                  {/* Pin Leg */}
                  <div className={`w-1 h-4 mx-auto rounded-b-full ${locationStatus === 'INVALID' ? 'bg-orange-600' : 'bg-green-600'}`}></div>
                  {/* Shadow */}
                  <div className="w-4 h-1 bg-black/30 rounded-full mx-auto mt-1 blur-sm"></div>
               </div>
               
               <div className="mt-4 bg-black/70 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-medium shadow-lg">
                  เลื่อนแผนที่เพื่อระบุตำแหน่ง
               </div>
            </div>
         )}
       </div>

       {/* Tree Detail Card (Bottom Sheet) */}
       {selectedTree && mode === 'VIEW' && (
           <div className="absolute bottom-28 left-4 right-4 bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-4 z-[500] animate-fade-in border border-gray-100 flex items-start space-x-4">
                <div className="w-20 h-20 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm relative group">
                    {selectedTree.imageUrl ? (
                        <img src={selectedTree.imageUrl} className="w-full h-full object-cover" alt="Tree" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-green-50">
                            <Sprout className="text-green-300" />
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold text-gray-800 truncate text-lg">{selectedTree.species}</h3>
                        </div>
                        <p className="text-xs text-gray-500 mb-2 flex items-center">
                            <Camera size={10} className="mr-1"/> 
                            สแกนเมื่อ: {selectedTree.plantedDate}
                        </p>
                    </div>
                    
                    <button 
                        onClick={() => onViewTreeDetail && onViewTreeDetail(selectedTree)}
                        className="self-start text-[10px] bg-green-600 text-white px-3 py-1.5 rounded-full font-bold flex items-center hover:bg-green-700 transition shadow-sm"
                    >
                        ดูข้อมูลเชิงลึก <ChevronRight size={12} className="ml-1" />
                    </button>
                </div>
                <button 
                    onClick={() => setSelectedTree(null)} 
                    className="p-1 -mr-2 -mt-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition absolute top-2 right-2"
                >
                    <X size={20} />
                </button>
           </div>
       )}

       {/* Land Deed Detail Card */}
       {selectedDeed && mode === 'VIEW' && (
           <div className="absolute bottom-28 left-4 right-4 bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-4 z-[500] animate-fade-in border border-green-100 flex items-start space-x-4 border-l-4 border-l-green-500">
                <div className="w-16 h-16 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="text-green-600" size={32} />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-lg">โฉนดเลขที่ {selectedDeed.deedNumber}</h3>
                    <p className="text-xs text-gray-500">เจ้าของ: {selectedDeed.ownerName}</p>
                    <div className="mt-2 flex items-center space-x-2">
                        <div className="px-2 py-1 bg-green-100 rounded text-xs font-bold text-green-800">
                            {selectedDeed.rai}-{selectedDeed.ngan}-{selectedDeed.wah} ไร่
                        </div>
                    </div>
                </div>
                <button 
                    onClick={() => setSelectedDeed(null)} 
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
                >
                    <X size={20} />
                </button>
           </div>
       )}

       {/* Confirmation Actions for ADD Mode */}
       {mode === 'ADD' && (
         <div className="absolute bottom-28 left-4 right-4 flex space-x-3 z-[500] animate-fade-in">
             <button 
                onClick={() => {
                    setMode('VIEW');
                    setLocationStatus('UNKNOWN');
                    setMatchedDeed(null);
                }}
                className="flex-1 py-4 bg-white rounded-xl text-gray-600 font-bold shadow-lg hover:bg-gray-50 transition"
             >
                ยกเลิก
             </button>
             <button 
                onClick={handleConfirmLocation}
                className={`flex-[2] py-4 rounded-xl text-white font-bold shadow-lg transition flex items-center justify-center space-x-2 ${
                    locationStatus === 'INVALID' ? 'bg-orange-500 shadow-orange-200 hover:bg-orange-600' : 'bg-green-600 shadow-green-200 hover:bg-green-700'
                }`}
             >
                <Camera size={20} />
                <span>{locationStatus === 'INVALID' ? 'ยืนยัน (นอกเขต)' : 'ยืนยันตำแหน่ง'}</span>
             </button>
         </div>
       )}

       {/* Floating Action Button (Only in VIEW mode) */}
       {mode === 'VIEW' && !selectedTree && !selectedDeed && (
        <button 
            onClick={() => {
                setMode('ADD');
                setSelectedTree(null);
                setSelectedDeed(null);
                // Trigger initial validation
                validateLocation(L.latLng(currentCenter[0], currentCenter[1]));
            }}
            className="absolute bottom-28 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full shadow-xl flex items-center justify-center transition-all z-[400] space-x-2 bg-gray-900 text-white hover:bg-black active:scale-95"
        >
            <Plus size={20} />
            <span className="font-bold">เพิ่มต้นไม้ใหม่</span>
        </button>
       )}
    </div>
  );
};

export default MapPlotter;