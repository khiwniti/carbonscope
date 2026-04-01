import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Clock, Activity, DollarSign, BarChart3, Briefcase } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TradingBoardProps {
    onClose: () => void;
    onTrade: (amount: number, price: number, type: 'BUY' | 'SELL') => void;
    currentPrice: number;
    carbonAssets: number;
    walletBalance: number;
}

const MOCK_CHART_DATA = [
    { time: '09:00', price: 2450 },
    { time: '10:00', price: 2480 },
    { time: '11:00', price: 2465 },
    { time: '12:00', price: 2490 },
    { time: '13:00', price: 2510 },
    { time: '14:00', price: 2505 },
    { time: '15:00', price: 2525 },
    { time: '16:00', price: 2500 },
];

const MOCK_ORDERS = [
    { price: 2515, amount: 500, type: 'SELL' },
    { price: 2510, amount: 1200, type: 'SELL' },
    { price: 2505, amount: 800, type: 'SELL' },
    { price: 2500, amount: 2000, type: 'BUY' },
    { price: 2495, amount: 1500, type: 'BUY' },
    { price: 2490, amount: 600, type: 'BUY' },
];

const TradingBoard: React.FC<TradingBoardProps> = ({ onClose, onTrade, currentPrice, carbonAssets, walletBalance }) => {
    const [activeTab, setActiveTab] = useState<'BUY' | 'SELL'>('SELL');
    const [amount, setAmount] = useState<string>('');
    const [isAnimating, setIsAnimating] = useState(false);

    // Initial enter animation
    useEffect(() => {
        setIsAnimating(true);
    }, []);

    const totalValue = (parseFloat(amount || '0') * currentPrice) / 1000; // Price per Ton -> per Kg

    const handleExecute = () => {
        const val = parseFloat(amount);
        if (!val || val <= 0) return;
        
        onTrade(val, currentPrice, activeTab);
        setAmount('');
    };

    const percentageChange = +2.45;

    return (
        <div className={`fixed inset-0 z-50 bg-gray-50 flex flex-col transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'} w-full max-w-md mx-auto left-0 right-0 shadow-2xl overflow-hidden font-sarabun`}>
            {/* Header */}
            <div className="bg-gray-900 text-white pb-6 pt-safe">
                <div className="px-4 py-4 flex items-center justify-between">
                    <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex flex-col items-center">
                        <h1 className="font-bold text-lg tracking-wide">T-VER Market</h1>
                        <span className="text-[10px] text-green-400 flex items-center bg-green-900/50 px-2 rounded-full">
                            <Activity size={10} className="mr-1 animate-pulse" /> Live
                        </span>
                    </div>
                    <div className="w-10"></div>
                </div>

                {/* Market Ticker */}
                <div className="px-6 mt-2">
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">ราคาปัจจุบัน (Last Price)</p>
                    <div className="flex items-end space-x-3 mt-1">
                        <h2 className="text-4xl font-bold text-white">{currentPrice.toLocaleString()}</h2>
                        <span className="text-lg text-gray-400 font-medium mb-1">THB/Ton</span>
                        <div className={`flex items-center mb-2 px-2 py-0.5 rounded text-xs font-bold ${percentageChange >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {percentageChange >= 0 ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                            {percentageChange}%
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-safe bg-gray-50">
                {/* Chart Section */}
                <div className="h-64 bg-gray-900 w-full relative -mt-1 rounded-b-3xl shadow-xl overflow-hidden z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={MOCK_CHART_DATA} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#22c55e' }}
                            />
                            <Area type="monotone" dataKey="price" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
                        </AreaChart>
                    </ResponsiveContainer>
                    {/* Timeframe Selectors */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                        {['1H', '1D', '1W', '1M', '1Y'].map((tf, i) => (
                            <button key={tf} className={`text-[10px] font-bold px-3 py-1 rounded-full ${i === 1 ? 'bg-white/20 text-white' : 'text-gray-500'}`}>
                                {tf}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Trading Stats Grid */}
                <div className="grid grid-cols-3 gap-4 px-4 mt-6">
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 text-center">
                        <p className="text-[10px] text-gray-400 uppercase">Volume (24h)</p>
                        <p className="font-bold text-gray-800">42.5K</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 text-center">
                        <p className="text-[10px] text-gray-400 uppercase">High</p>
                        <p className="font-bold text-green-600">2,525</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 text-center">
                        <p className="text-[10px] text-gray-400 uppercase">Low</p>
                        <p className="font-bold text-red-500">2,450</p>
                    </div>
                </div>

                {/* Order Book & Trade Panel */}
                <div className="px-4 mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 pb-24">
                    
                    {/* Trade Controller */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="flex border-b border-gray-100">
                            <button 
                                onClick={() => setActiveTab('BUY')}
                                className={`flex-1 py-3 font-bold text-sm transition-colors ${activeTab === 'BUY' ? 'bg-green-50 text-green-600 border-b-2 border-green-500' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                ซื้อ (Buy)
                            </button>
                            <button 
                                onClick={() => setActiveTab('SELL')}
                                className={`flex-1 py-3 font-bold text-sm transition-colors ${activeTab === 'SELL' ? 'bg-red-50 text-red-500 border-b-2 border-red-500' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                ขาย (Sell)
                            </button>
                        </div>
                        
                        <div className="p-5 space-y-4">
                             <div className="flex justify-between text-xs text-gray-500">
                                <span>{activeTab === 'BUY' ? 'เงินในกระเป๋า' : 'สินทรัพย์ที่มี'}</span>
                                <span className="font-bold text-gray-800">
                                    {activeTab === 'BUY' ? `${walletBalance.toLocaleString()} ฿` : `${carbonAssets.toLocaleString()} kg`}
                                </span>
                             </div>

                             <div className="relative">
                                 <label className="text-[10px] text-gray-400 absolute top-2 left-3">จำนวน (kg)</label>
                                 <input 
                                    type="number" 
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-gray-50 rounded-xl px-3 pt-6 pb-2 text-xl font-bold text-gray-800 border-2 border-transparent focus:border-gray-200 focus:outline-none transition"
                                    placeholder="0.00"
                                 />
                                 <button 
                                    onClick={() => setAmount(activeTab === 'BUY' ? Math.floor(walletBalance / (currentPrice/1000)).toString() : carbonAssets.toString())}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-white border border-gray-200 px-2 py-1 rounded shadow-sm text-gray-500 font-bold"
                                 >
                                    MAX
                                 </button>
                             </div>

                             <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                                 <span className="text-xs text-gray-500">ยอดรวมประมาณการ</span>
                                 <span className="font-bold text-lg text-gray-800">{totalValue.toLocaleString()} <span className="text-xs font-normal text-gray-400">THB</span></span>
                             </div>

                             <button 
                                onClick={handleExecute}
                                disabled={!amount || parseFloat(amount) <= 0 || (activeTab === 'SELL' && parseFloat(amount) > carbonAssets) || (activeTab === 'BUY' && totalValue > walletBalance)}
                                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition active:scale-95 flex items-center justify-center space-x-2 ${
                                    activeTab === 'BUY' 
                                    ? 'bg-green-600 shadow-green-200 hover:bg-green-700 disabled:bg-green-300' 
                                    : 'bg-red-500 shadow-red-200 hover:bg-red-600 disabled:bg-red-300'
                                }`}
                             >
                                {activeTab === 'BUY' ? <Briefcase size={20} /> : <DollarSign size={20} />}
                                <span>{activeTab === 'BUY' ? 'ยืนยันคำสั่งซื้อ' : 'ยืนยันคำสั่งขาย'}</span>
                             </button>
                        </div>
                    </div>

                    {/* Order Book */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                        <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center">
                            <BarChart3 size={16} className="mr-2 text-gray-400" />
                            Order Book (ล่าสุด)
                        </h3>
                        <div className="space-y-2">
                            <div className="grid grid-cols-3 text-[10px] text-gray-400 font-bold uppercase border-b border-gray-100 pb-2">
                                <span>ราคา (THB)</span>
                                <span className="text-center">ปริมาณ (Kg)</span>
                                <span className="text-right">เวลา</span>
                            </div>
                            {MOCK_ORDERS.map((order, idx) => (
                                <div key={idx} className="grid grid-cols-3 text-xs items-center py-1">
                                    <span className={`font-bold ${order.type === 'BUY' ? 'text-green-600' : 'text-red-500'}`}>
                                        {order.price.toLocaleString()}
                                    </span>
                                    <span className="text-center text-gray-600">{order.amount.toLocaleString()}</span>
                                    <span className="text-right text-gray-400 text-[10px]">
                                        {new Date(Date.now() - idx * 1000 * 60 * 5).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default TradingBoard;