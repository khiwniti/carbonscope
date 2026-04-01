import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Leaf, TrendingUp, AlertTriangle, Clock, ChevronRight, Users, ExternalLink, MapPin, CloudSun, Droplets, Trophy, Crown, X, ArrowUpRight, Bell, Scan, Map, Wallet, Sparkles, Sprout, Check, FileCheck, Newspaper } from 'lucide-react';
import { Tree, TreeStatus, UserProfile, ViewState } from '../types';
import { CARBON_PER_TREE_YEAR } from '../constants';

interface DashboardProps {
  trees: Tree[];
  onTreeSelect?: (tree: Tree) => void;
  userProfile?: UserProfile;
  onNavigate: (view: ViewState) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ trees, onTreeSelect, userProfile, onNavigate }) => {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [mounted, setMounted] = useState(false);
  const aliveTrees = trees.filter(t => t.status === TreeStatus.ALIVE);
  const totalCarbon = aliveTrees.length * CARBON_PER_TREE_YEAR;
  const estimatedValue = totalCarbon * 3.0; // 3000 THB/Ton = 3 THB/kg
  
  // Sort trees by date descending for "Recent Activity"
  const recentTrees = [...trees].sort((a, b) => new Date(b.plantedDate).getTime() - new Date(a.plantedDate).getTime()).slice(0, 5);
  
  // Mock data for chart
  const data = [
    { name: 'ม.ค.', carbon: 120 },
    { name: 'ก.พ.', carbon: 280 },
    { name: 'มี.ค.', carbon: 450 },
    { name: 'เม.ย.', carbon: 600 },
    { name: 'พ.ค.', carbon: totalCarbon + 50 }, 
  ];

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const handleTreeClick = (tree: Tree) => {
    if (navigator.vibrate) navigator.vibrate(10); 
    if (onTreeSelect) onTreeSelect(tree);
  };

  const scrollToNews = () => {
      document.getElementById('news-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const QuickAction = ({ icon: Icon, label, color, bg, onClick }: { icon: any, label: string, color: string, bg: string, onClick: () => void }) => (
      <button 
        onClick={onClick}
        className="flex flex-col items-center justify-center space-y-2 group w-full"
      >
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border border-gray-50/50 ${bg} group-active:scale-90 transition-all duration-300 ease-out`}>
              <Icon size={24} className={color} strokeWidth={2.5} />
          </div>
          <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 transition-colors">{label}</span>
      </button>
  );

  return (
    <div className="space-y-8 pb-32 px-5 pt-8 animate-fade-in relative bg-[#F8F9FA] min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-2 mb-1 opacity-0 animate-slide-up" style={{ animationDelay: '0.1s' }}>
             <span className="w-2 h-2 rounded-full bg-green-50 animate-pulse"></span>
             <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Ban Tha Li Project</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight leading-none opacity-0 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            สวัสดี, คุณ{userProfile?.displayName?.split(' ')[0] || 'สมชาย'}
          </h1>
        </div>
        <div className="flex space-x-3 items-center opacity-0 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <button className="relative p-2.5 bg-white rounded-full shadow-sm border border-gray-100 text-gray-500 hover:text-green-600 transition active:scale-95">
                <Bell size={20} />
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div 
                onClick={() => onNavigate('PROFILE')}
                className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-md cursor-pointer active:scale-95 transition overflow-hidden"
            >
                {userProfile?.pictureUrl ? (
                    <img src={userProfile.pictureUrl} alt="User" className="w-full h-full object-cover" />
                ) : (
                    "S"
                )}
            </div>
        </div>
      </header>

      {/* Main Asset Card */}
      <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <div 
            onClick={() => onNavigate('PROFILE')}
            className="bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#047857] rounded-[2rem] p-7 text-white shadow-2xl shadow-green-900/20 relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all"
        >
            {/* Glossy Effect */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:bg-white/15 transition duration-700"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center space-x-2 text-green-200 mb-1">
                            <Sparkles size={12} />
                            <span className="text-[10px] font-bold tracking-widest uppercase">Total Valuation</span>
                        </div>
                        <h2 className="text-4xl font-bold tracking-tighter drop-shadow-md">฿{estimatedValue.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 flex items-center space-x-1.5 shadow-lg">
                        <div className="w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
                            <TrendingUp size={10} className="text-green-900" strokeWidth={3} />
                        </div>
                        <span className="text-xs font-bold text-white">+12.5%</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-3 border border-white/5 hover:bg-black/30 transition">
                        <span className="text-[10px] text-green-200/80 uppercase font-bold block mb-1">Carbon Credit</span>
                        <div className="flex items-baseline space-x-1">
                            <span className="text-xl font-bold">{totalCarbon.toLocaleString()}</span>
                            <span className="text-xs font-medium text-green-300">kg</span>
                        </div>
                    </div>
                    <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-3 border border-white/5 hover:bg-black/30 transition">
                        <span className="text-[10px] text-green-200/80 uppercase font-bold block mb-1">Active Trees</span>
                        <div className="flex items-baseline space-x-1">
                            <span className="text-xl font-bold">{aliveTrees.length}</span>
                            <span className="text-xs font-medium text-green-300">Trees</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Quick Actions - Optimized to remove duplicates with BottomNav */}
      <div className="grid grid-cols-4 gap-4 opacity-0 animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <QuickAction 
            icon={FileCheck} 
            label="โฉนด" 
            color="text-indigo-600" 
            bg="bg-white hover:bg-indigo-50"
            onClick={() => onNavigate('MAP_PLOT')} // Map view is best for deeds
          />
          <QuickAction 
            icon={Wallet} 
            label="กระเป๋า" 
            color="text-emerald-600" 
            bg="bg-white hover:bg-emerald-50"
            onClick={() => onNavigate('PROFILE')} 
          />
          <QuickAction 
            icon={Newspaper} 
            label="ข่าวสาร" 
            color="text-blue-600" 
            bg="bg-white hover:bg-blue-50"
            onClick={scrollToNews} 
          />
          <QuickAction 
            icon={Trophy} 
            label="อันดับ" 
            color="text-orange-600" 
            bg="bg-white hover:bg-orange-50"
            onClick={() => setShowLeaderboard(true)} 
          />
      </div>

      {/* Chart Section */}
      <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.6s' }}>
        <div className="flex justify-between items-center mb-4 px-1">
            <h3 className="font-bold text-gray-800 text-lg">สถิติการเติบโต</h3>
            <button className="text-xs bg-white border border-gray-200 px-3 py-1 rounded-full text-gray-500 font-medium shadow-sm">
                รายปี ▾
            </button>
        </div>
        <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-gray-100">
            <div className="w-full h-[160px]">
            {mounted && (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                    <linearGradient id="colorCarbon" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 11, fill: '#9CA3AF', fontWeight: 500}} 
                        dy={10} 
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 11, fill: '#9CA3AF'}} 
                    />
                    <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.1)', padding: '8px 12px', fontSize: '12px' }}
                    cursor={{ stroke: '#10B981', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="carbon" 
                        stroke="#059669" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorCarbon)" 
                    />
                </AreaChart>
                </ResponsiveContainer>
            )}
            </div>
        </div>
      </div>

      {/* Recent Trees List Section */}
      <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.65s' }}>
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="font-bold text-gray-800 text-lg flex items-center">
            <Leaf size={20} className="mr-2 text-green-600" />
            ต้นไม้ล่าสุด ({aliveTrees.length}/{trees.length})
          </h3>
          <button 
             onClick={() => onNavigate('TREE_LIST')}
             className="text-xs text-green-600 font-bold bg-green-50 px-3 py-1 rounded-lg active:scale-95 transition"
          >
            ดูทั้งหมด
          </button>
        </div>
        
        <div className="space-y-3">
          {recentTrees.length === 0 ? (
             <div className="flex flex-col items-center justify-center p-8 bg-white border-2 border-dashed border-gray-100 rounded-2xl text-gray-400">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                    <Sprout size={24} />
                </div>
                <p className="text-sm font-medium">ยังไม่มีข้อมูลต้นไม้</p>
                <button onClick={() => onNavigate('SCANNER')} className="mt-3 text-xs bg-green-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition">
                    ปลูกต้นแรกเลย!
                </button>
             </div>
          ) : (
            recentTrees.map((tree) => (
              <div 
                key={tree.id} 
                onClick={() => handleTreeClick(tree)}
                className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 active:scale-[0.98] transition-all cursor-pointer group hover:shadow-md"
              >
                <div className="relative w-14 h-14 flex-shrink-0">
                   <div className="w-full h-full rounded-xl overflow-hidden bg-gray-100">
                      {tree.imageUrl ? (
                        <img src={tree.imageUrl} className="w-full h-full object-cover" alt="Tree" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-green-50 text-green-500">
                            <Leaf size={24} />
                        </div>
                      )}
                   </div>
                   {/* Status Indicator Badge */}
                   <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${
                       tree.status === TreeStatus.ALIVE ? 'bg-green-500' : 
                       tree.status === TreeStatus.DEAD ? 'bg-red-500' : 'bg-gray-400'
                   }`}>
                       {tree.status === TreeStatus.ALIVE ? <Check size={10} className="text-white" strokeWidth={4} /> : 
                        tree.status === TreeStatus.DEAD ? <X size={10} className="text-white" strokeWidth={4} /> : 
                        <AlertTriangle size={10} className="text-white" strokeWidth={4} />}
                   </div>
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <h4 className="font-bold text-gray-800 text-sm truncate">{tree.species}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            tree.status === TreeStatus.ALIVE ? 'bg-green-100 text-green-700' : 
                            tree.status === TreeStatus.DEAD ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                            {tree.status}
                        </span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Clock size={12} className="mr-1" />
                        <span>{new Date(tree.plantedDate).toLocaleDateString('th-TH', {day: 'numeric', month: 'short'})}</span>
                        <span className="mx-2">•</span>
                        <div className="flex items-center text-green-600 font-bold">
                           <TrendingUp size={12} className="mr-1" />
                           {tree.carbonCredit} kg
                        </div>
                    </div>
                </div>
                <ChevronRight size={18} className="text-gray-300 group-hover:text-green-500 transition-colors" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Community Highlights */}
      <div id="news-section" className="opacity-0 animate-slide-up" style={{ animationDelay: '0.7s' }}>
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="font-bold text-gray-800 text-lg flex items-center">
            <Users size={20} className="mr-2 text-indigo-600" />
            ข่าวสาร & กิจกรรม
          </h3>
          <button className="text-xs text-indigo-600 font-bold flex items-center bg-indigo-50 px-2 py-1 rounded-lg">
            ดูทั้งหมด <ChevronRight size={14} />
          </button>
        </div>
        
        <div className="flex overflow-x-auto space-x-4 pb-4 no-scrollbar -mx-5 px-5 snap-x">
           {/* Highlight Card 1 */}
           <div className="flex-shrink-0 w-72 bg-white rounded-2xl shadow-md shadow-gray-100 border border-gray-100 overflow-hidden snap-center group cursor-pointer active:scale-95 transition-transform duration-300">
                <div className="h-40 relative overflow-hidden">
                   <img src="https://images.unsplash.com/photo-1572097662444-09946e6a6c01?q=80&w=2670&auto=format&fit=crop" alt="News" className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                   <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg">
                      HOT
                   </div>
                   <div className="absolute bottom-3 left-3 right-3 text-white">
                      <p className="text-[10px] font-semibold text-green-300 mb-1">BAAC Project</p>
                      <h4 className="font-bold text-base leading-tight drop-shadow-md">ธ.ก.ส. รับซื้อคาร์บอนเครดิต ตันละ 3,000 บาท</h4>
                   </div>
                </div>
                <div className="p-4">
                   <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        โครงการนำร่องพื้นที่บ้านท่าลี่ จ.ขอนแก่น สร้างรายได้เสริมให้เกษตรกรอย่างยั่งยืน
                   </p>
                   <div className="mt-3 pt-3 border-t border-gray-50 flex justify-between items-center">
                       <span className="text-[10px] text-gray-400">2 ชม. ที่แล้ว</span>
                       <span className="text-[10px] font-bold text-indigo-600">อ่านเพิ่มเติม</span>
                   </div>
                </div>
           </div>

           {/* Highlight Card 2 */}
           <div className="flex-shrink-0 w-64 bg-white rounded-2xl shadow-md shadow-gray-100 border border-gray-100 overflow-hidden snap-center group cursor-pointer active:scale-95 transition-transform duration-300">
                <div className="h-32 relative overflow-hidden">
                   <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2613&auto=format&fit=crop" alt="Net Zero" className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                   <div className="absolute bottom-3 left-3 text-white">
                      <h4 className="font-bold text-sm drop-shadow-md">เป้าหมาย Net Zero 2065</h4>
                   </div>
                </div>
                <div className="p-4">
                   <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        ร่วมผลักดันไทยสู่ความเป็นกลางทางคาร์บอน
                   </p>
                </div>
           </div>
        </div>
      </div>

      {/* Leaderboard Modal */}
      {showLeaderboard && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 w-full max-w-md mx-auto left-0 right-0">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowLeaderboard(false)}></div>
              <div className="bg-white rounded-[2rem] w-full max-w-sm relative z-10 overflow-hidden shadow-2xl animate-bounce-small">
                 <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-6 text-white text-center relative overflow-hidden">
                     <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/20 rounded-full blur-3xl"></div>
                     <button onClick={() => setShowLeaderboard(false)} className="absolute top-4 right-4 text-white/80 hover:text-white p-2 bg-black/10 rounded-full backdrop-blur transition">
                         <X size={20} />
                     </button>
                     <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30 shadow-lg">
                        <Trophy size={40} className="text-white drop-shadow-md" />
                     </div>
                     <h2 className="text-2xl font-bold tracking-tight">Community Rank</h2>
                     <p className="text-yellow-50 text-xs font-medium bg-black/10 inline-block px-3 py-1 rounded-full mt-2">ประจำเดือน กุมภาพันธ์ 2567</p>
                 </div>
                 <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                     {[
                         { rank: 1, name: "ลุงแดง บ้านแดง", score: 12500, img: "https://picsum.photos/seed/u1/100" },
                         { rank: 2, name: `${userProfile?.displayName || 'คุณ'}`, score: 9800, img: userProfile?.pictureUrl },
                         { rank: 3, name: "ป้าแมว บ้านท่าลี่", score: 8400, img: "https://picsum.photos/seed/u3/100" },
                     ].map((user) => (
                         <div key={user.rank} className={`flex items-center p-3 rounded-2xl border transition-all ${user.rank === 2 ? 'bg-green-50 border-green-200 shadow-sm transform scale-[1.02]' : 'bg-white border-gray-100 hover:bg-gray-50'}`}>
                             <div className={`w-8 h-8 flex items-center justify-center font-black text-lg mr-3 ${
                                 user.rank === 1 ? 'text-yellow-500' : 
                                 user.rank === 2 ? 'text-gray-400' : 
                                 user.rank === 3 ? 'text-orange-700' : 'text-gray-400 text-sm'
                             }`}>
                                 {user.rank === 1 ? <Crown size={24} fill="currentColor" /> : `#${user.rank}`}
                             </div>
                             <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden mr-3 border-2 border-white shadow-sm flex-shrink-0">
                                 {user.img ? <img src={user.img} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold">U</div>}
                             </div>
                             <div className="flex-1 min-w-0">
                                 <h4 className={`font-bold text-sm truncate ${user.rank === 2 ? 'text-green-800' : 'text-gray-800'}`}>{user.name}</h4>
                                 <p className="text-xs text-gray-500 font-medium">{user.score.toLocaleString()} kgCO₂e</p>
                             </div>
                         </div>
                     ))}
                 </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Dashboard;