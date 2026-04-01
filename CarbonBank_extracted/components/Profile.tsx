import React, { useState } from 'react';
import { User, Settings, CreditCard, Bell, HelpCircle, LogOut, ChevronRight, Wallet, Check, Award, History, ArrowUpRight, ArrowDownLeft, TrendingUp, QrCode, Shield, Zap } from 'lucide-react';
import { Transaction, Achievement, UserProfile } from '../types';
import TradingBoard from './TradingBoard';

interface ProfileProps {
    achievements: Achievement[];
    transactions?: Transaction[];
    walletBalance: number;
    totalCarbonAssets: number;
    onTrade: (amount: number, price: number, type: 'BUY' | 'SELL') => void;
    userProfile: UserProfile;
}

const Profile: React.FC<ProfileProps> = ({ achievements, transactions = [], walletBalance, totalCarbonAssets, onTrade, userProfile }) => {
  const [showTradingBoard, setShowTradingBoard] = useState(false);
  const [activeTab, setActiveTab] = useState<'MENU' | 'ACHIEVEMENTS' | 'HISTORY'>('MENU');
  
  // Updated Price based on BAAC Carbon Credit Launch (Feb 2024)
  const CURRENT_MARKET_PRICE = 3000; // THB per Ton

  const triggerHaptic = () => {
      if (navigator.vibrate) navigator.vibrate(10);
  };

  const handleTradeWrapper = (amount: number, price: number, type: 'BUY' | 'SELL') => {
      onTrade(amount, price, type);
      setShowTradingBoard(false);
  };

  const handleLogoutOrClose = () => {
    triggerHaptic();
    // @ts-ignore
    if (window.liff && window.liff.isInClient()) {
        // @ts-ignore
        window.liff.closeWindow();
    } else {
        window.location.reload();
    }
  };

  return (
    <div className="pb-32 px-5 pt-8 animate-fade-in space-y-6 relative h-full overflow-y-auto no-scrollbar bg-gray-50">
      
      {/* Profile Header */}
      <header className="flex flex-col items-center">
        <div className="relative mb-3 group">
            <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-green-400 to-blue-500 shadow-xl shadow-green-200/50">
                <div className="w-full h-full rounded-full border-4 border-white bg-gray-100 overflow-hidden relative">
                    {userProfile.pictureUrl ? (
                        <img src={userProfile.pictureUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 font-bold text-2xl">
                            {userProfile.displayName?.charAt(0) || 'U'}
                        </div>
                    )}
                </div>
            </div>
            <div className="absolute bottom-1 right-1 bg-blue-500 text-white p-1.5 rounded-full border-2 border-white shadow-sm">
                <Shield size={10} strokeWidth={4} />
            </div>
        </div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">{userProfile.displayName}</h1>
        <div className="flex items-center space-x-2 mt-1">
            <span className="text-xs text-gray-500 font-medium bg-gray-200/50 px-2 py-0.5 rounded-md">ID: {userProfile.userId.slice(0, 8)}...</span>
        </div>
        <div className="mt-3 flex space-x-2">
            <div className="bg-green-100/80 text-green-700 text-[10px] px-3 py-1 rounded-full font-bold border border-green-200/50 uppercase tracking-wide backdrop-blur-sm">
            {userProfile.statusMessage || 'Verified Member'}
            </div>
            <div className="bg-amber-100/80 text-amber-700 text-[10px] px-3 py-1 rounded-full font-bold border border-amber-200/50 uppercase tracking-wide flex items-center backdrop-blur-sm">
            <Award size={10} className="mr-1" /> Level 3
            </div>
        </div>
      </header>

      {/* Modern Carbon Wallet Card */}
      <div className="relative transform transition-all active:scale-[0.98] duration-200" onClick={triggerHaptic}>
        <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-800 rounded-3xl shadow-xl shadow-green-900/20 transform rotate-1 translate-y-2 opacity-30 blur-sm"></div>
        <div className="bg-[#1a1c23] rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden group border border-white/5">
           {/* Mesh Gradients */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/20 rounded-full blur-[80px] pointer-events-none mix-blend-screen"></div>
           <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full blur-[60px] pointer-events-none mix-blend-screen"></div>
           
           {/* Card Texture */}
           <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px'}}></div>

           <div className="flex justify-between items-start mb-8 relative z-10">
             <div className="flex items-center space-x-2">
                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
                    <Wallet size={18} className="text-emerald-400" />
                </div>
                <div>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400 block">Total Balance</span>
                    <span className="text-xs text-emerald-400 font-medium">Available</span>
                </div>
             </div>
             <button className="p-2 bg-white/5 hover:bg-white/10 rounded-full backdrop-blur-md border border-white/10 transition">
                <QrCode size={18} className="text-white" />
             </button>
           </div>

           <div className="relative z-10 mb-6">
             <h2 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-400">
                {walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                <span className="text-lg text-gray-500 font-normal ml-1">THB</span>
             </h2>
             <div className="flex items-center space-x-2 mt-2">
                 <div className="flex items-center space-x-1 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                     <Zap size={10} className="text-emerald-400 fill-emerald-400" />
                     <span className="text-[10px] text-emerald-400 font-bold">Carbon Assets</span>
                 </div>
                 <span className="text-sm font-medium text-gray-300">{totalCarbonAssets.toFixed(1)} kg</span>
             </div>
           </div>
           
           <div className="grid grid-cols-2 gap-3 relative z-10">
                <button 
                    onClick={() => { triggerHaptic(); setShowTradingBoard(true); }}
                    className="bg-white text-black text-xs py-3 rounded-xl font-bold transition hover:bg-gray-100 flex items-center justify-center space-x-2 shadow-lg shadow-white/5"
                >
                    <TrendingUp size={14} strokeWidth={2.5} />
                    <span>Trading</span>
                </button>
                <button 
                    onClick={() => { triggerHaptic(); setActiveTab('HISTORY'); }}
                    className="bg-white/10 hover:bg-white/15 text-white text-xs py-3 rounded-xl font-bold transition backdrop-blur border border-white/10 flex items-center justify-center space-x-2"
                >
                    <History size={14} strokeWidth={2.5} />
                    <span>History</span>
                </button>
           </div>
        </div>
      </div>

      {/* iOS-style Segmented Control */}
      <div className="bg-gray-200/50 p-1 rounded-xl flex relative">
          <div 
             className="absolute top-1 bottom-1 bg-white rounded-lg shadow-sm transition-all duration-300 ease-out"
             style={{ 
                 left: activeTab === 'MENU' ? '4px' : activeTab === 'ACHIEVEMENTS' ? '33.33%' : '66.66%',
                 width: 'calc(33.33% - 5px)' // Adjust for padding
             }}
          ></div>
          <button 
            onClick={() => { triggerHaptic(); setActiveTab('MENU'); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg relative z-10 transition-colors ${activeTab === 'MENU' ? 'text-gray-900' : 'text-gray-500'}`}
          >
            เมนู
          </button>
          <button 
            onClick={() => { triggerHaptic(); setActiveTab('ACHIEVEMENTS'); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg relative z-10 transition-colors ${activeTab === 'ACHIEVEMENTS' ? 'text-gray-900' : 'text-gray-500'}`}
          >
            เหรียญรางวัล
          </button>
          <button 
            onClick={() => { triggerHaptic(); setActiveTab('HISTORY'); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg relative z-10 transition-colors ${activeTab === 'HISTORY' ? 'text-gray-900' : 'text-gray-500'}`}
          >
            ธุรกรรม
          </button>
      </div>

      {/* Content Area */}
      <div className="min-h-[300px]">
        {activeTab === 'MENU' && (
            <div className="space-y-6 animate-slide-up">
                {/* Group 1 */}
                <div className="space-y-2">
                    <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">บัญชีของฉัน</p>
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 divide-y divide-gray-50">
                        <MenuItem icon={User} label="ข้อมูลส่วนตัว" onClick={triggerHaptic} />
                        <MenuItem icon={CreditCard} label="บัญชีธนาคาร" subLabel="ธ.ก.ส. •••• 9988" onClick={triggerHaptic} />
                        <MenuItem icon={Bell} label="การแจ้งเตือน" hasBadge onClick={triggerHaptic} />
                    </div>
                </div>

                {/* Group 2 */}
                <div className="space-y-2">
                    <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">ทั่วไป</p>
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 divide-y divide-gray-50">
                        <MenuItem icon={Settings} label="ตั้งค่าการใช้งาน" onClick={triggerHaptic} />
                        <MenuItem icon={HelpCircle} label="ช่วยเหลือและสนับสนุน" onClick={triggerHaptic} />
                    </div>
                </div>

                <button 
                    onClick={handleLogoutOrClose}
                    className="w-full bg-red-50 text-red-600 font-bold py-4 rounded-2xl border border-red-100 flex items-center justify-center space-x-2 active:bg-red-100 transition"
                >
                    <LogOut size={18} />
                    <span>ออกจากระบบ</span>
                </button>
                
                <p className="text-center text-[10px] text-gray-400 pb-4">Version 1.2.0 (Build 2402)</p>
            </div>
        )}

        {activeTab === 'ACHIEVEMENTS' && (
            <div className="space-y-3 animate-slide-up">
                {achievements.map((ach) => (
                    <div key={ach.id} className={`bg-white p-4 rounded-2xl border ${ach.unlocked ? 'border-green-200 shadow-green-100/50 shadow-md' : 'border-gray-100 opacity-60'} flex items-center space-x-4 relative overflow-hidden group transition-all duration-300`}>
                        {ach.unlocked && <div className="absolute inset-0 bg-green-50/50"></div>}
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl relative z-10 shadow-sm ${ach.unlocked ? 'bg-white' : 'bg-gray-100 grayscale'}`}>
                            {ach.icon}
                        </div>
                        <div className="flex-1 relative z-10">
                            <h3 className="font-bold text-gray-800 text-sm">{ach.title}</h3>
                            <p className="text-xs text-gray-500 mb-2 line-clamp-1">{ach.description}</p>
                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-500 ${ach.unlocked ? 'bg-green-500' : 'bg-gray-300'}`} 
                                    style={{ width: `${Math.min((ach.progress / ach.maxProgress) * 100, 100)}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-[10px] text-gray-400">{ach.progress}/{ach.maxProgress}</p>
                                {ach.unlocked && <span className="text-[10px] font-bold text-green-600 bg-white px-2 rounded-full shadow-sm">Completed</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {activeTab === 'HISTORY' && (
            <div className="space-y-3 animate-slide-up">
                 {transactions.map((tx) => (
                     <div key={tx.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center active:scale-[0.99] transition-transform">
                         <div className="flex items-center space-x-3">
                             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.type === 'DEPOSIT' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                 {tx.type === 'DEPOSIT' ? <ArrowDownLeft size={20} strokeWidth={2.5} /> : <ArrowUpRight size={20} strokeWidth={2.5} />}
                             </div>
                             <div>
                                 <p className="font-bold text-gray-900 text-sm">{tx.description}</p>
                                 <p className="text-xs text-gray-400 font-medium mt-0.5">{tx.date} • <span className={tx.status === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600'}>{tx.status}</span></p>
                             </div>
                         </div>
                         <div className="text-right">
                            <span className={`font-bold block text-sm ${tx.type === 'DEPOSIT' ? 'text-green-600' : 'text-gray-900'}`}>
                                {tx.type === 'DEPOSIT' ? '+' : '-'}{tx.amount.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium">THB</span>
                         </div>
                     </div>
                 ))}
                 {transactions.length === 0 && (
                     <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                         <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                             <History size={24} className="opacity-50" />
                         </div>
                         <p className="text-sm font-medium">ยังไม่มีรายการธุรกรรม</p>
                     </div>
                 )}
            </div>
        )}
      </div>

      {/* Trading Board Full Screen Component */}
      {showTradingBoard && (
          <TradingBoard 
            onClose={() => setShowTradingBoard(false)}
            onTrade={handleTradeWrapper}
            currentPrice={CURRENT_MARKET_PRICE}
            carbonAssets={totalCarbonAssets}
            walletBalance={walletBalance}
          />
      )}
    </div>
  );
};

interface MenuItemProps {
  icon: React.ElementType;
  label: string;
  subLabel?: string;
  hasBadge?: boolean;
  onClick?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon: Icon, label, subLabel, hasBadge, onClick }) => {
  return (
    <button 
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition active:bg-gray-100 group"
    >
       <div className="flex items-center space-x-4">
          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-600 group-hover:scale-110 transition-transform duration-300">
            <Icon size={18} strokeWidth={2.5} />
          </div>
          <div className="text-left">
            <span className="font-bold text-sm text-gray-700 block">{label}</span>
            {subLabel && <span className="text-xs text-gray-400 block font-medium mt-0.5">{subLabel}</span>}
          </div>
       </div>
       <div className="flex items-center space-x-3">
         {hasBadge && <div className="w-2 h-2 bg-red-500 rounded-full shadow-sm ring-2 ring-white animate-pulse"></div>}
         <ChevronRight size={16} className="text-gray-300" />
       </div>
    </button>
  );
};

export default Profile;