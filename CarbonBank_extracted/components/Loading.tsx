import React from 'react';
import { Sprout } from 'lucide-react';

const Loading: React.FC = () => {
    return (
      <div className="h-[100dvh] w-full max-w-md mx-auto flex flex-col items-center justify-center bg-gradient-to-br from-green-600 to-green-900 text-white relative overflow-hidden font-sarabun shadow-2xl">
         <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%">
               <pattern id="pattern-circles" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                 <circle cx="20" cy="20" r="2" fill="currentColor" />
               </pattern>
               <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-circles)" />
            </svg>
         </div>
         <div className="z-10 flex flex-col items-center animate-fade-in">
            <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl mb-6 animate-bounce">
              <Sprout size={56} className="text-green-600" />
            </div>
            <h1 className="text-3xl font-bold tracking-wider mb-2">CarbonBank</h1>
            <p className="text-green-100 text-sm tracking-widest uppercase opacity-80">ธนาคารต้นไม้แห่งชาติ</p>
         </div>
         <div className="absolute bottom-10">
            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
         </div>
      </div>
    );
};

export default Loading;