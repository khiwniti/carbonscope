import React, { useState, useEffect, useRef } from 'react';
import { Camera, Check, FileText, Map as MapIcon, Loader2, Sprout, ScanLine, Maximize, MapPin, AlertCircle, ArrowRight, Sliders } from 'lucide-react';
import L from 'leaflet';
import { analyzeLandDeed, DeedAnalysisResult } from '../services/geminiService';
import { LandDeed, Tree } from '../types';
import { isPointInPolygon } from '../services/geometryService';

interface LandDeedProcessorProps {
  trees: Tree[];
  onSave?: (deed: LandDeed, associatedTreeIds: string[]) => void;
  onSkip?: () => void;
  isFirstTime?: boolean;
}

const LandDeedProcessor: React.FC<LandDeedProcessorProps> = ({ trees, onSave, onSkip, isFirstTime = false }) => {
  const [step, setStep] = useState<number>(0); // 0: Upload, 1: Processing, 2: Result
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<DeedAnalysisResult | null>(null);
  const [matchingTreeIds, setMatchingTreeIds] = useState<string[]>([]);
  
  // Boundary Detection State
  const [scannerPhase, setScannerPhase] = useState<'SCANNING' | 'DETECTED'>('SCANNING');

  // Map Refs
  const mapPreviewRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        processImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSimulate = async () => {
      try {
          // Sample document image (using a placeholder that looks like a document)
          // Using a generic paper/document image from unsplash
          const response = await fetch('https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80');
          const blob = await response.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64 = reader.result as string;
              processImage(base64, true); // Pass true for useMock
          };
          reader.readAsDataURL(blob);
      } catch (e) {
          console.error("Simulation failed", e);
      }
  };

  const processImage = async (base64: string, useMock: boolean = false) => {
        setImage(base64);
        setStep(1);
        setScannerPhase('SCANNING');
        
        // Simulate detection delay
        setTimeout(() => setScannerPhase('DETECTED'), 1500);

        // Call Gemini Service
        const base64Data = base64.split(',')[1];
        try {
            const analysis = await analyzeLandDeed(base64Data, useMock);
            setResult(analysis);
            // Delay result showing to let the animation play out
            setTimeout(() => setStep(2), 3000);
        } catch (e) {
            console.error(e);
            setStep(0); // Reset on fail
        }
  };

  // Calculate matching trees when result is ready
  useEffect(() => {
    if (step === 2 && result && result.polygonPoints.length > 0) {
      const ids = trees.filter(t => 
        isPointInPolygon({lat: t.lat, lng: t.lng}, result.polygonPoints)
      ).map(t => t.id);
      setMatchingTreeIds(ids);
    }
  }, [step, result, trees]);

  // Initialize Map for Preview
  useEffect(() => {
    if (step === 2 && result && mapPreviewRef.current) {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }

        const centerLat = result.location?.lat || 13.7563;
        const centerLng = result.location?.lng || 100.5018;

        const map = L.map(mapPreviewRef.current, {
            center: [centerLat, centerLng],
            zoom: 16,
            zoomControl: false,
            attributionControl: false,
            dragging: false,
            touchZoom: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            boxZoom: false
        });

        // Satellite Layer
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri'
        }).addTo(map);

        // Add Polygon
        if (result.polygonPoints && result.polygonPoints.length > 0) {
             const poly = L.polygon(result.polygonPoints, {
                color: '#22c55e',
                weight: 3,
                fillColor: '#22c55e',
                fillOpacity: 0.3,
                dashArray: '5, 5'
             }).addTo(map);
             
             // Add corner markers
             result.polygonPoints.forEach(p => {
                 L.circleMarker(p, {
                     radius: 3,
                     fillColor: '#fff',
                     color: '#22c55e',
                     weight: 2,
                     opacity: 1,
                     fillOpacity: 1
                 }).addTo(map);
             });

             try {
                map.fitBounds(poly.getBounds(), { padding: [30, 30] });
             } catch (e) {
                 console.log("Bounds error", e);
             }
        } else {
             // Fallback marker if no polygon
             L.marker([centerLat, centerLng]).addTo(map);
        }

        mapInstanceRef.current = map;
    }

    return () => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }
    };
  }, [step, result]);

  const handleSave = () => {
    if (result && image && onSave) {
      const newDeed: LandDeed = {
        id: Date.now().toString(),
        ownerName: result.ownerName,
        deedNumber: result.deedNumber,
        rai: result.rai,
        ngan: result.ngan,
        wah: result.wah,
        imageUrl: image,
        processed: true,
        polygonPoints: result.polygonPoints
      };
      // Pass both the new deed and the IDs of trees that are inside it
      onSave(newDeed, matchingTreeIds);
    }
  };

  return (
    <div className={`pb-28 px-4 pt-4 animate-fade-in space-y-6 h-full flex flex-col ${isFirstTime ? 'bg-white' : ''}`}>
       <header className={`${isFirstTime ? 'mt-8 text-center px-6' : ''}`}>
          {isFirstTime && (
              <div className="text-green-600 text-xs font-bold uppercase tracking-widest mb-2 animate-pulse">
                Step 1: Asset Registration
              </div>
          )}
          <h1 className="text-2xl font-bold text-gray-800">
            {isFirstTime ? 'เริ่มต้นลงทะเบียนโฉนดที่ดิน' : 'จัดการโฉนดที่ดิน'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isFirstTime 
                ? 'เพื่อเริ่มสะสมคาร์บอนเครดิต กรุณายืนยันสิทธิ์ในพื้นที่ปลูกป่าของคุณ' 
                : 'AI Boundary Detection & Geo-Plotting'}
          </p>
        </header>

      {step === 0 && (
        <div className="flex-1 flex flex-col relative">
            <div className="border-2 border-dashed border-green-200 rounded-3xl p-8 flex flex-col items-center justify-center bg-green-50/50 space-y-6 flex-1 hover:bg-green-50 transition cursor-pointer group relative overflow-hidden">
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-sm relative z-10 group-hover:scale-110 transition duration-500">
                    <ScanLine className="text-green-600" size={56} />
                </div>
                <div className="text-center relative z-10">
                    <h3 className="text-xl font-bold text-gray-800">สแกนเอกสารสิทธิ์</h3>
                    <p className="text-sm text-gray-500 mt-2 max-w-[240px] mx-auto leading-relaxed">
                        วางโฉนดในกรอบ AI จะทำการอ่านเลขที่และพิกัดแปลงอัตโนมัติ
                    </p>
                </div>
                <label className="w-full max-w-xs mt-4 relative z-10">
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                    <div className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-green-200 hover:bg-green-700 active:scale-95 transition transform">
                        <Camera size={24} />
                        <span>ถ่ายภาพโฉนด</span>
                    </div>
                </label>
            </div>
            
            {isFirstTime && onSkip && (
                <button 
                    onClick={onSkip}
                    className="mt-6 text-gray-400 font-medium text-sm flex items-center justify-center hover:text-gray-600 py-4"
                >
                    ข้ามขั้นตอนนี้ไปก่อน <ArrowRight size={14} className="ml-1" />
                </button>
            )}

            {/* Simulation Button */}
            <button 
                onClick={handleSimulate}
                className="mt-2 text-green-600 font-medium text-sm flex items-center justify-center hover:text-green-700 py-2"
            >
                <Sliders size={14} className="mr-1" /> ทดลองใช้รูปตัวอย่าง (Simulate)
            </button>
        </div>
      )}

      {step === 1 && image && (
        <div className="flex-1 flex flex-col items-center justify-center relative rounded-2xl overflow-hidden bg-gray-900 shadow-2xl border border-gray-800">
          {/* Image Layer */}
          <img src={image} alt="Processing" className="w-full h-full object-contain opacity-60" />
          
          {/* Boundary Detection Layer */}
          <div className="absolute inset-0 pointer-events-none">
              {scannerPhase === 'SCANNING' ? (
                  // Scanning Grid Animation
                  <div className="absolute inset-0">
                      <div className="scan-line"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                         <div className="w-64 h-80 border-2 border-white/30 rounded-lg relative">
                             <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-lg"></div>
                             <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-lg"></div>
                             <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-lg"></div>
                             <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-lg"></div>
                         </div>
                      </div>
                  </div>
              ) : (
                  // Detected Corners SVG Overlay
                  <svg className="absolute inset-0 w-full h-full animate-fade-in" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <polygon 
                         points="10,10 90,12 88,92 12,88" 
                         fill="rgba(34, 197, 94, 0.2)" 
                         stroke="#22c55e" 
                         strokeWidth="1"
                         className="animate-pulse"
                      />
                      <circle cx="10" cy="10" r="1.5" fill="#22c55e" />
                      <circle cx="90" cy="12" r="1.5" fill="#22c55e" />
                      <circle cx="88" cy="92" r="1.5" fill="#22c55e" />
                      <circle cx="12" cy="88" r="1.5" fill="#22c55e" />
                  </svg>
              )}
          </div>

          <div className="absolute bottom-10 left-0 right-0 text-center">
             <div className="inline-flex items-center bg-black/80 backdrop-blur-md px-6 py-3 rounded-full space-x-3 border border-green-500/30 shadow-lg">
                <Loader2 className="text-green-400 animate-spin" size={20} />
                <span className="text-green-400 font-mono text-sm tracking-wider font-bold">
                    {scannerPhase === 'SCANNING' ? 'DETECTING BOUNDARIES...' : 'EXTRACTING COORDINATES...'}
                </span>
             </div>
          </div>
        </div>
      )}

      {step === 2 && result && (
        <div className="space-y-6 animate-fade-in overflow-y-auto pb-safe">
          {/* Result Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-green-600 to-green-700 text-white flex items-center justify-between">
              <h3 className="font-bold flex items-center">
                <Maximize size={18} className="mr-2" />
                Document Analyzed
              </h3>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold backdrop-blur">
                  Gemini 3 Pro
              </span>
            </div>
            
            <div className="p-5">
               <div className="flex justify-between items-start mb-4">
                   <div>
                       <p className="text-xs text-gray-500 mb-1">เลขที่โฉนด</p>
                       <p className="text-xl font-bold text-gray-800">{result.deedNumber}</p>
                   </div>
                   <div className="text-right">
                       <p className="text-xs text-gray-500 mb-1">เจ้าของกรรมสิทธิ์</p>
                       <p className="text-lg font-bold text-gray-800">{result.ownerName}</p>
                   </div>
               </div>

               <div className="bg-gray-50 p-4 rounded-xl flex justify-between items-center border border-gray-100 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">ขนาดพื้นที่ตามเอกสาร</p>
                    <div className="flex items-baseline space-x-2">
                      <span className="font-bold text-2xl text-green-700">{result.rai}-{result.ngan}-{result.wah}</span>
                      <span className="text-xs text-gray-500 font-medium">(ไร่-งาน-วา)</span>
                    </div>
                  </div>
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <FileText className="text-green-600" size={24} />
                  </div>
               </div>
               
               {result.location ? (
                   <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-center space-x-3">
                       <MapPin size={20} className="text-blue-600" />
                       <div>
                           <p className="text-xs font-bold text-blue-800">Coordinates Extracted</p>
                           <p className="text-[10px] text-blue-600 font-mono">
                               {result.location.lat.toFixed(5)}, {result.location.lng.toFixed(5)}
                           </p>
                       </div>
                   </div>
               ) : (
                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 flex items-center space-x-3">
                       <AlertCircle size={20} className="text-orange-600" />
                       <div>
                           <p className="text-xs font-bold text-orange-800">No GPS Found</p>
                           <p className="text-[10px] text-orange-600">
                               Using estimated location based on district.
                           </p>
                       </div>
                   </div>
               )}
            </div>
          </div>

          {/* Map Preview */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700 flex items-center justify-between px-1">
                <span className="flex items-center"><MapIcon size={16} className="mr-2"/> พิกัดแปลง (Geo-Plotting)</span>
            </h4>
            <div className="relative w-full h-64 bg-gray-200 rounded-xl overflow-hidden border border-gray-300 shadow-inner group">
              <div ref={mapPreviewRef} className="w-full h-full z-0"></div>
              <div className="absolute bottom-2 right-2 text-[10px] text-white/70 bg-black/50 px-2 py-0.5 rounded pointer-events-none z-[400]">
                  Satellite Preview
              </div>
            </div>
          </div>
          
          {/* Tree Match Info */}
          {matchingTreeIds.length > 0 && (
            <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center space-x-3 shadow-sm animate-slide-up">
               <div className="bg-green-100 p-2 rounded-full">
                  <Sprout className="text-green-600" size={20} />
               </div>
               <div>
                  <p className="font-bold text-green-800 text-sm">ค้นพบต้นไม้ในพิกัด {matchingTreeIds.length} ต้น</p>
                  <p className="text-xs text-green-600">ระบบจะทำการเชื่อมโยงข้อมูลอัตโนมัติ</p>
               </div>
            </div>
          )}

          <div className="flex space-x-3">
              <button 
                onClick={() => { setStep(0); setResult(null); setImage(null); }}
                className="flex-1 bg-white text-gray-600 border border-gray-200 py-4 rounded-xl font-bold shadow-sm hover:bg-gray-50 transition"
              >
                ถ่ายใหม่
              </button>
              <button 
                onClick={handleSave}
                className="flex-[2] bg-green-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 active:scale-95 transition flex items-center justify-center space-x-2 text-lg"
              >
                <Check size={24} />
                <span>ยืนยันข้อมูล</span>
              </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandDeedProcessor;