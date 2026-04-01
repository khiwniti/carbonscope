import React from 'react';
import { Home, Map, Scan, TrendingUp, Trees } from 'lucide-react';
import { ViewState } from '../types';

interface BottomNavProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const BottomNav: React.FC<BottomNavProps> = React.memo(({ currentView, setView }) => {
  
  const handleNavClick = (view: ViewState) => {
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(5);
      setView(view);
  };

  const navItems = [
    { id: 'DASHBOARD', icon: Home, label: 'หน้าแรก' },
    { id: 'TREE_LIST', icon: Trees, label: 'ต้นไม้ของฉัน' },
    { id: 'SCANNER', icon: Scan, label: 'สแกน', isPrimary: true },
    { id: 'MAP_PLOT', icon: Map, label: 'แผนที่' },
    { id: 'TRADING_MARKET', icon: TrendingUp, label: 'ตลาด' },
  ];

  return (
    <div className="absolute bottom-0 w-full z-[100] pointer-events-none">
       {/* Background Blur Layer with refined Glassmorphism */}
       <div className="absolute bottom-0 inset-x-0 h-24 bg-white/85 backdrop-blur-xl border-t border-white/40 shadow-[0_-5px_30px_rgba(0,0,0,0.03)] pointer-events-auto"></div>

       <div className="relative flex justify-between items-end pb-safe px-6 h-24 pointer-events-auto">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          
          if (item.isPrimary) {
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id as ViewState)}
                className="relative -top-6 flex flex-col items-center justify-center group focus:outline-none"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {/* Floating Shadow */}
                <div className={`absolute top-3 w-10 h-10 rounded-full bg-green-500/30 blur-md transition-all duration-300 ${isActive ? 'scale-125 opacity-100' : 'scale-100 opacity-50'}`}></div>
                
                <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform ${
                    isActive 
                    ? 'bg-gradient-to-tr from-green-600 to-green-500 scale-110 -translate-y-1' 
                    : 'bg-green-600 group-active:scale-95'
                } border-[5px] border-white`}>
                  <Icon size={28} color="white" strokeWidth={2.5} />
                </div>
                <span className={`text-[10px] font-bold mt-1 transition-all duration-300 ${isActive ? 'text-green-600 translate-y-0 opacity-100' : 'text-gray-400 translate-y-1 opacity-0'}`}>{item.label}</span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id as ViewState)}
              className="flex flex-col items-center justify-center w-14 py-3 space-y-1 group focus:outline-none"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className={`relative transition-all duration-300 ${isActive ? '-translate-y-1' : ''}`}>
                 <Icon 
                    size={26} 
                    strokeWidth={isActive ? 2.5 : 2} 
                    className={`transition-colors duration-300 ${isActive ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-600'}`} 
                 />
                 {isActive && (
                     <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-600 rounded-full"></div>
                 )}
              </div>
              <span className={`text-[9px] font-medium transition-colors duration-300 ${isActive ? 'text-green-600' : 'text-gray-400'}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

export default BottomNav;