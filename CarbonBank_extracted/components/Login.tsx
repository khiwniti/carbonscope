import React, { useState } from 'react';
import { Sprout, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLogin: (method: 'LINE' | 'GUEST') => void;
  isLoading?: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, isLoading }) => {
  const handleLineLogin = () => {
    // @ts-ignore
    if (window.liff && window.liff.id) {
       // Only try real login if LIFF has an ID (initialized)
       onLogin('LINE');
    } else {
       alert("LIFF ID is not configured in this demo.\nUsing Guest Mode automatically.");
       onLogin('GUEST');
    }
  };

  return (
    <div className="h-full w-full relative bg-gray-900 overflow-hidden flex flex-col items-center justify-end font-sarabun">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2613&auto=format&fit=crop" 
          alt="Forest Background" 
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full px-6 pb-safe mb-10 flex flex-col items-center animate-fade-in">
        
        {/* Logo Section */}
        <div className="mb-12 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl flex items-center justify-center shadow-2xl mb-6 ring-4 ring-white/5">
            <Sprout size={56} className="text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">CarbonBank</h1>
          <p className="text-green-200 text-sm font-medium tracking-widest uppercase opacity-90">ธนาคารต้นไม้แห่งชาติ</p>
          <p className="text-gray-400 text-xs mt-4 max-w-[260px] leading-relaxed">
            แพลตฟอร์มบริหารจัดการคาร์บอนเครดิตสำหรับชุมชน เพื่อโลกที่ยั่งยืน
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-4 max-w-sm">
          {/* LINE Login Button */}
          <button 
            onClick={handleLineLogin}
            disabled={isLoading}
            className="w-full bg-[#06C755] hover:bg-[#05b34c] text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-green-900/50 active:scale-95 transition-all flex items-center justify-center relative overflow-hidden group"
          >
            {/* LINE Icon SVG */}
            <svg className="w-6 h-6 mr-3 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.276 13.918c.28-.767.433-1.597.433-2.458 0-4.14-4.02-7.5-8.98-7.5S2.75 7.32 2.75 11.46c0 3.655 3.125 6.72 7.377 7.328.742.164 1.157.375 1.157.375s.262 1.48.312 1.832c0 0 .152 1.05.683.613 2.754-2.27 5.867-4.66 7.997-7.69zM12 15.65c-4.418 0-8-2.924-8-6.53 0-3.606 3.582-6.53 8-6.53 4.418 0 8 2.924 8 6.53 0 3.606-3.582 6.53-8 6.53zm-4.394-4.838h2.09c.276 0 .5.224.5.5v2.804c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-2.304h-1.59c-.276 0-.5-.224-.5-.5s.224-.5.5-.5zm4.004 0h.953c.276 0 .5.224.5.5v3.304c0 .276-.224.5-.5.5s-.5-.224-.5-.5V11.31h-.453c-.276 0-.5-.224-.5-.5s.224-.5.5-.5zm2.75 0h.963c.275 0 .462.06.603.187.16.14.25.362.25.64v2.092c0 .24-.06.43-.178.57-.12.143-.292.214-.525.214h-1.112v-3.703zm.963 2.72c.203 0 .31-.11.31-.334v-1.408c0-.214-.112-.323-.332-.323h-.44v2.066h.46zm2.365-2.72h2.203c.276 0 .5.224.5.5s-.224.5-.5.5h-1.703v.872h1.493c.276 0 .5.224.5.5s-.224.5-.5.5h-1.493v.933h1.703c.276 0 .5.224.5.5s-.224.5-.5.5h-2.203c-.276 0-.5-.224-.5-.5v-3.305c0-.276.224-.5.5-.5z"/>
            </svg>
            {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย LINE'}
          </button>

          {/* Guest Button (For Demo) */}
          <button 
            onClick={() => onLogin('GUEST')}
            disabled={isLoading}
            className="w-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center group"
          >
            ทดลองใช้งาน (Guest Mode)
            <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
            <p className="text-[10px] text-gray-500">
                โดยการเข้าสู่ระบบ คุณยอมรับ <span className="text-gray-400 underline">เงื่อนไขการใช้งาน</span> และ <span className="text-gray-400 underline">นโยบายความเป็นส่วนตัว</span>
            </p>
            <p className="text-[10px] text-gray-600 mt-2">Version 1.0.0 Beta</p>
        </div>
      </div>
    </div>
  );
};

export default Login;