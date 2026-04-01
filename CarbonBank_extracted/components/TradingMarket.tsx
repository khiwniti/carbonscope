import React, { useState } from 'react';
import { TrendingUp, Users, ArrowUpRight, ArrowDownRight, Briefcase, Award, Clock, ChevronRight, DollarSign, Filter, Search } from 'lucide-react';
import TradingBoard from './TradingBoard';

interface TradingMarketProps {
    walletBalance: number;
    carbonAssets: number;
    onTrade: (amount: number, price: number, type: 'BUY' | 'SELL') => void;
}

const BUYER_REQUESTS = [
    { id: 1, name: 'PTT Group', fullName: 'ปตท. จำกัด (มหาชน)', demand: 5000, price: 3100, logo: 'https://companieslogo.com/img/orig/PTT.BK-0e75525c.png?t=1720244493', deadline: '2d', verified: true, change: +1.2 },
    { id: 2, name: 'SCG Cement', fullName: 'ปูนซิเมนต์ไทย', demand: 2500, price: 3050, logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8f/Siam_Cement_Group_Logo.svg/1200px-Siam_Cement_Group_Logo.svg.png', deadline: '5d', verified: true, change: +0.5 },
    { id: 3, name: 'Bangchak', fullName: 'บางจาก คอร์ปอเรชั่น', demand: 1200, price: 3000, logo: 'https://seeklogo.com/images/B/bangchak-logo-1100C81F78-seeklogo.com.png', deadline: '1d', verified: true, change: 0.0 },
    { id: 4, name: 'Toyota Tsusho', fullName: 'โตโยต้า ทูโช', demand: 8000, price: 2950, logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Toyota_Tsusho_logo.svg/2560px-Toyota_Tsusho_logo.svg.png', deadline: '1w', verified: true, change: -0.2 },
];

const TradingMarket: React.FC<TradingMarketProps> = ({ walletBalance, carbonAssets, onTrade }) => {
    const [showTradingBoard, setShowTradingBoard] = useState(false);
    const MARKET_PRICE = 3000;

    const handleQuickSell = (request: typeof BUYER_REQUESTS[0]) => {
        if (navigator.vibrate) navigator.vibrate(10);
        setShowTradingBoard(true);
    };

    return (
        <div className="pb-32 px-4 pt-4 animate-fade-in space-y-6 h-full flex flex-col overflow-y-auto no-scrollbar bg-gray-50">
            {/* Header / Market Overview */}
            <header className="flex flex-col space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">ตลาดซื้อขาย</h1>
                        <p className="text-xs text-gray-500 font-medium">T-VER Carbon Market</p>
                    </div>
                    <div className="bg-gray-900 text-white px-3 py-1.5 rounded-xl flex items-center space-x-2 shadow-lg shadow-gray-200">
                         <Briefcase size={14} className="text-green-400" />
                         <span className="text-xs font-bold">{carbonAssets.toFixed(1)} kg</span>
                    </div>
                </div>

                {/* Main Ticker Card */}
                <div className="bg-[#111827] rounded-[2rem] p-6 text-white shadow-xl shadow-gray-300 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/20 rounded-full blur-[50px] -mr-10 -mt-10 group-hover:bg-green-500/30 transition duration-700"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-[40px] -ml-10 -mb-10 group-hover:bg-blue-500/30 transition duration-700"></div>
                    
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Index Price</p>
                            <h2 className="text-4xl font-bold tracking-tight">{MARKET_PRICE.toLocaleString()}</h2>
                        </div>
                        <div className="text-right">
                             <div className="flex items-center justify-end text-green-400 text-sm font-bold bg-green-900/40 px-2 py-1 rounded-lg backdrop-blur-sm border border-green-500/20">
                                <ArrowUpRight size={14} className="mr-1" /> +2.45%
                             </div>
                             <p className="text-gray-500 text-[10px] mt-1 font-medium">Last 24h</p>
                        </div>
                    </div>

                    <div className="relative z-10 mt-6 grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => setShowTradingBoard(true)}
                            className="bg-green-600 hover:bg-green-500 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-green-900/30 transition flex items-center justify-center active:scale-95"
                        >
                            <TrendingUp size={18} className="mr-2" />
                            กระดานเทรด
                        </button>
                        <div className="bg-white/5 backdrop-blur-md rounded-xl p-2 flex flex-col justify-center items-center border border-white/10">
                            <span className="text-[10px] text-gray-400 font-bold uppercase">Volume</span>
                            <span className="font-bold text-sm">42.5K Ton</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Market List */}
            <div>
                <div className="flex justify-between items-center mb-4 px-1">
                    <h3 className="font-bold text-gray-900 text-lg">รายการรับซื้อ</h3>
                    <div className="flex space-x-2">
                        <button className="p-2 bg-white rounded-full shadow-sm text-gray-400 border border-gray-100"><Search size={16} /></button>
                        <button className="p-2 bg-white rounded-full shadow-sm text-gray-400 border border-gray-100"><Filter size={16} /></button>
                    </div>
                </div>

                <div className="space-y-3">
                    {BUYER_REQUESTS.map((req) => (
                        <div key={req.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:bg-gray-50 transition duration-200" onClick={() => handleQuickSell(req)}>
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-white border border-gray-100 p-1 flex items-center justify-center overflow-hidden shadow-sm">
                                        <img src={req.logo} alt={req.name} className="w-full h-full object-contain" />
                                    </div>
                                    <div>
                                        <div className="flex items-center">
                                            <h4 className="font-bold text-gray-900 text-sm">{req.name}</h4>
                                            {req.verified && <Award size={12} className="text-blue-500 ml-1" />}
                                        </div>
                                        <p className="text-[10px] text-gray-400 font-medium">{req.fullName}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-gray-900 text-base">{req.price.toLocaleString()}</span>
                                    <div className={`text-[10px] font-bold flex items-center justify-end ${req.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {req.change > 0 ? '+' : ''}{req.change}%
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                <div className="flex space-x-4">
                                    <div>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase block">Demand</span>
                                        <span className="text-xs font-bold text-gray-700">{req.demand.toLocaleString()} <span className="text-[10px] text-gray-400 font-normal">Tons</span></span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase block">Ends In</span>
                                        <span className="text-xs font-bold text-orange-600 flex items-center">
                                            <Clock size={10} className="mr-1" /> {req.deadline}
                                        </span>
                                    </div>
                                </div>
                                <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md active:scale-95 transition">
                                    ขายทันที
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

             {/* Banner */}
             <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden mb-6">
                <div className="relative z-10 w-3/4">
                    <div className="bg-white/20 backdrop-blur w-fit px-2 py-0.5 rounded text-[10px] font-bold mb-2 border border-white/20">EVENT</div>
                    <h3 className="font-bold text-lg mb-1 leading-tight">Carbon Auction #4</h3>
                    <p className="text-indigo-100 text-xs mb-3 leading-relaxed">เปิดประมูลคาร์บอนเครดิตรอบพิเศษสำหรับเกษตรกรรายย่อย</p>
                    <button className="bg-white text-indigo-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center shadow-lg active:scale-95 transition">
                        เข้าร่วมประมูล <ChevronRight size={12} className="ml-1" />
                    </button>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-30 transform rotate-12">
                     <Award size={120} />
                </div>
             </div>

            {/* Full Screen Trading Board Modal */}
            {showTradingBoard && (
                <TradingBoard 
                    onClose={() => setShowTradingBoard(false)}
                    onTrade={(amount, price, type) => {
                        onTrade(amount, price, type);
                        setShowTradingBoard(false);
                    }}
                    currentPrice={MARKET_PRICE}
                    carbonAssets={carbonAssets}
                    walletBalance={walletBalance}
                />
            )}
        </div>
    );
};

export default TradingMarket;