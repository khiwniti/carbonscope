import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Check, Zap, RefreshCw, Image as ImageIcon, ZapOff, ChevronLeft, Sliders, AlertCircle } from 'lucide-react';
import { analyzeTreeImage, TreeAnalysisResult } from '../services/geminiService';

interface TreeScannerProps {
  onSave?: (analysis: TreeAnalysisResult, imageUrl: string) => void;
  onBack?: () => void;
}

const TreeScanner: React.FC<TreeScannerProps> = ({ onSave, onBack }) => {
  // Start in scanning mode
  const [isScanning, setIsScanning] = useState(true);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<TreeAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize Camera
  useEffect(() => {
      startCamera();
      return () => stopCamera();
  }, []);

  const startCamera = async () => {
      setCameraError(null);
      try {
          // Constraints for rear camera
          const constraints = {
              video: {
                  facingMode: 'environment',
                  width: { ideal: 1920 },
                  height: { ideal: 1080 }
              },
              audio: false
          };
          
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          streamRef.current = stream;
          
          if (videoRef.current) {
              videoRef.current.srcObject = stream;
              // Handle video play promise to avoid errors
              videoRef.current.onloadedmetadata = () => {
                  videoRef.current?.play().catch(e => console.error("Play error:", e));
              };
          }

          // Check track capabilities for flash
          const track = stream.getVideoTracks()[0];
          // @ts-ignore - torch capability not strictly typed in all TS versions
          const capabilities = track.getCapabilities ? track.getCapabilities() : {};
          // Note: We don't strictly hide the flash button based on capabilities for this UI demo, 
          // but in prod you would check `capabilities.torch`.

      } catch (err) {
          console.error("Camera Error:", err);
          setCameraError("ไม่สามารถเข้าถึงกล้องได้ กรุณาตรวจสอบสิทธิ์การใช้งาน");
      }
  };

  const stopCamera = () => {
      if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => {
              track.stop();
              // Turn off torch if it was on
              if (flashOn) {
                  // @ts-ignore
                  track.applyConstraints({ advanced: [{ torch: false }] }).catch(() => {});
              }
          });
          streamRef.current = null;
      }
  };

  const toggleFlash = async () => {
      if (!streamRef.current) return;
      const track = streamRef.current.getVideoTracks()[0];
      const newFlashState = !flashOn;
      
      try {
          // @ts-ignore
          await track.applyConstraints({ advanced: [{ torch: newFlashState }] });
          setFlashOn(newFlashState);
      } catch (e) {
          // Torch might not be supported, just toggle UI state for feedback
          setFlashOn(newFlashState); 
      }
  };

  const handleCapture = () => {
      if (videoRef.current && canvasRef.current) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          
          // Match canvas size to video resolution
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
              // Flip horizontally if front camera (not handled here as we force environment), 
              // but good practice to consider mirror logic if needed.
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              
              const imageBase64 = canvas.toDataURL('image/jpeg', 0.85);
              setCapturedImage(imageBase64);
              setIsScanning(false);
              stopCamera(); // Stop stream to save battery while analyzing
              performAIAnalysis(imageBase64);
          }
      } else {
          // Fallback to file input if camera stream failed
          fileInputRef.current?.click();
      }
  };

  const handleNativeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          processFile(file);
      }
  };

  const handleSimulate = async () => {
      setIsAnalyzing(true);
      setIsScanning(false);
      stopCamera();
      
      try {
          // Use a sample tree image
          const response = await fetch('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80');
          const blob = await response.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64 = reader.result as string;
              setCapturedImage(base64);
              performAIAnalysis(base64, true); // Pass true for useMock
          };
          reader.readAsDataURL(blob);
      } catch (e) {
          console.error("Simulation failed", e);
          setIsScanning(true);
          setIsAnalyzing(false);
          startCamera();
      }
  };

  const processFile = (file: File) => {
      setIsAnalyzing(true);
      const reader = new FileReader();
      reader.onloadend = () => {
          const base64 = reader.result as string;
          setCapturedImage(base64);
          setIsScanning(false);
          stopCamera();
          performAIAnalysis(base64);
      };
      reader.readAsDataURL(file);
  };

  const performAIAnalysis = async (imgData: string, useMock: boolean = false) => {
      setIsAnalyzing(true);
      try {
        const base64Data = imgData.split(',')[1];
        const result = await analyzeTreeImage(base64Data, useMock);
        setAnalysis(result);
      } catch (e) {
        console.error("Analysis failed", e);
        setAnalysis({
            species: "ไม่สามารถระบุได้",
            health: "ไม่ทราบ",
            confidence: 0
        });
      } finally {
        setIsAnalyzing(false);
      }
  };

  const handleConfirm = () => {
    if (onSave && analysis && capturedImage) {
        onSave(analysis, capturedImage);
    }
  };

  const handleRetake = () => {
      setCapturedImage(null);
      setAnalysis(null);
      setIsScanning(true);
      setIsAnalyzing(false);
      startCamera(); // Restart camera
  };

  return (
    <div className="h-full flex flex-col pb-20 relative bg-black font-sarabun">
      {/* Hidden Native Inputs */}
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        ref={fileInputRef} 
        onChange={handleNativeFileChange} 
        className="hidden" 
      />
      <input 
        type="file" 
        accept="image/*" 
        ref={galleryInputRef} 
        onChange={handleNativeFileChange} 
        className="hidden" 
      />
      
      {/* Hidden Canvas for Capture */}
      <canvas ref={canvasRef} className="hidden"></canvas>

      {isScanning && (
        <div className="absolute inset-0 bg-black z-50 flex flex-col animate-fade-in">
          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 z-20 pt-safe p-4 flex justify-between items-center text-white bg-gradient-to-b from-black/60 to-transparent">
             <button className="p-2 rounded-full bg-black/20 backdrop-blur" onClick={toggleFlash}>
                {flashOn ? <Zap size={24} className="text-yellow-400" /> : <ZapOff size={24} />}
             </button>
             <div className="bg-black/40 px-4 py-1.5 rounded-full text-xs font-semibold backdrop-blur border border-white/10 shadow-lg">
                AI Auto-Detect
             </div>
             <button className="p-2 rounded-full bg-black/20 backdrop-blur" onClick={() => startCamera()}>
                <RefreshCw size={24} />
             </button>
          </div>

          {/* Viewfinder Area */}
          <div className="relative flex-1 bg-gray-900 overflow-hidden flex items-center justify-center rounded-b-3xl">
             
             {cameraError ? (
                 <div className="text-center p-6 text-white max-w-xs">
                     <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="text-red-500" size={32} />
                     </div>
                     <p className="mb-4">{cameraError}</p>
                     <button onClick={() => fileInputRef.current?.click()} className="bg-white text-black px-4 py-2 rounded-lg font-bold">
                        ใช้วิธีอัปโหลดรูปแทน
                     </button>
                 </div>
             ) : (
                 <video 
                    ref={videoRef} 
                    className="w-full h-full object-cover" 
                    playsInline 
                    autoPlay 
                    muted 
                 />
             )}
             
             {/* Focus Ring Animation */}
             {!cameraError && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-64 border border-white/30 rounded-lg relative">
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-green-400"></div>
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-green-400"></div>
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-green-400"></div>
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-green-400"></div>
                        <div className="absolute -bottom-8 left-0 right-0 text-center">
                            <span className="text-[10px] text-white/80 bg-black/40 px-2 py-1 rounded">วางต้นไม้ในกรอบ</span>
                        </div>
                    </div>
                </div>
             )}
          </div>

          {/* Bottom Controls */}
          <div className="h-40 bg-black flex flex-col justify-end pb-safe">
             {/* Mode Scroller */}
             <div className="flex justify-center space-x-6 mb-4 text-sm font-medium">
                 <span className="text-yellow-400 drop-shadow-md">PHOTO</span>
                 <span className="text-gray-500">VIDEO</span>
                 <span className="text-gray-500">SCAN</span>
             </div>

             <div className="flex items-center justify-between px-8 mb-6">
                <button 
                  onClick={() => galleryInputRef.current?.click()}
                  className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-white active:scale-95 transition overflow-hidden border border-gray-700"
                >
                    <ImageIcon size={20} />
                </button>

                {/* Shutter Button */}
                <button 
                  onClick={handleCapture}
                  className="w-20 h-20 bg-white rounded-full border-4 border-gray-400 flex items-center justify-center hover:scale-105 transition active:scale-95 shadow-lg shadow-white/10"
                >
                    <div className="w-16 h-16 bg-white rounded-full border-2 border-black"></div>
                </button>

                <button 
                   onClick={handleSimulate}
                   className="w-12 h-12 rounded-full bg-gray-800/50 flex items-center justify-center text-white active:scale-95 transition"
                   title="Simulate Scan"
                >
                   <Sliders size={20} />
                </button>
             </div>
          </div>
        </div>
      )}

      {capturedImage && (
        <div className="absolute inset-0 z-50 bg-gray-50 flex flex-col pt-safe animate-fade-in">
           {/* Review Header */}
           <div className="px-4 py-3 flex items-center justify-between bg-white border-b border-gray-100 shadow-sm z-10">
              <button onClick={handleRetake} className="text-gray-500 p-2 hover:bg-gray-100 rounded-full">
                  <X size={24} />
              </button>
              <h2 className="font-bold text-gray-800">ยืนยันข้อมูล</h2>
              <div className="w-10"></div>
           </div>

           <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
               <div className="relative rounded-2xl overflow-hidden shadow-lg h-72 bg-gray-900 mx-auto w-full border border-gray-200">
                  <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                  {isAnalyzing && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                         <div className="w-12 h-12 border-4 border-green-400 border-t-transparent rounded-full animate-spin mb-3"></div>
                         <p className="font-semibold tracking-wide text-sm animate-pulse">Gemini AI Analyzing...</p>
                      </div>
                  )}
               </div>

               {!isAnalyzing && analysis && (
                 <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-5 animate-slide-up">
                   <div className="flex justify-between items-start border-b border-gray-50 pb-4">
                      <div>
                        <h3 className="text-gray-400 text-[10px] uppercase tracking-wider font-bold mb-1">ชนิดพันธุ์ (Species)</h3>
                        <p className="text-2xl font-bold text-green-700 leading-tight">{analysis.species}</p>
                      </div>
                      <div className="flex flex-col items-end">
                          <span className="text-[10px] text-gray-400 font-bold uppercase mb-1">Confidence</span>
                          <div className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-lg border border-green-200">
                            {(analysis.confidence * 100).toFixed(0)}%
                          </div>
                      </div>
                   </div>
                   
                   <div>
                      <h3 className="text-gray-400 text-[10px] uppercase tracking-wider font-bold mb-2">สุขภาพ (Health)</h3>
                      <div className="flex items-center space-x-3 bg-green-50 p-3 rounded-xl border border-green-100">
                        <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0">
                             <Check className="text-green-700" size={16} />
                        </div>
                        <span className="text-gray-800 font-medium text-sm">{analysis.health}</span>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <h3 className="text-gray-400 text-[10px] uppercase tracking-wider font-bold mb-1">เส้นรอบวง (Est.)</h3>
                        <p className="text-xl font-bold text-gray-800">45.2 <span className="text-xs font-normal text-gray-500">cm</span></p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <h3 className="text-gray-400 text-[10px] uppercase tracking-wider font-bold mb-1">คาร์บอนเครดิต</h3>
                        <p className="text-xl font-bold text-green-600">+9.5 <span className="text-xs font-normal text-gray-500">kg</span></p>
                      </div>
                   </div>
                 </div>
               )}
           </div>
           
           {/* Footer Action */}
           {analysis && !isAnalyzing && (
               <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-20">
                   <button 
                     onClick={handleConfirm}
                     className="w-full bg-green-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 active:scale-95 transition flex items-center justify-center space-x-2 text-lg"
                   >
                     <Check size={24} />
                     <span>บันทึกข้อมูล</span>
                   </button>
               </div>
           )}
        </div>
      )}
    </div>
  );
};

export default TreeScanner;
