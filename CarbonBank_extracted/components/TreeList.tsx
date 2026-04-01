import React, { useState, useMemo } from 'react';
import { Search, ArrowLeft, Leaf, AlertTriangle, Check, X, Sprout, Calendar, MapPin, Filter } from 'lucide-react';
import { Tree, TreeStatus } from '../types';

interface TreeListProps {
  trees: Tree[];
  onBack: () => void;
  onSelectTree: (tree: Tree) => void;
}

const TreeList: React.FC<TreeListProps> = ({ trees, onBack, onSelectTree }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TreeStatus | 'ALL'>('ALL');

  const filteredTrees = useMemo(() => {
    return trees.filter(tree => {
      const matchesSearch = tree.species.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            tree.id.includes(searchTerm);
      const matchesStatus = statusFilter === 'ALL' || tree.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(b.plantedDate).getTime() - new Date(a.plantedDate).getTime());
  }, [trees, searchTerm, statusFilter]);

  const stats = useMemo(() => {
      const total = trees.length;
      const healthy = trees.filter(t => t.status === TreeStatus.ALIVE).length;
      const issues = trees.filter(t => t.status !== TreeStatus.ALIVE).length;
      return { total, healthy, issues };
  }, [trees]);

  const StatusBadge = ({ status }: { status: TreeStatus }) => {
      const styles = {
          [TreeStatus.ALIVE]: 'bg-green-100 text-green-700 border-green-200',
          [TreeStatus.DEAD]: 'bg-red-100 text-red-700 border-red-200',
          [TreeStatus.LOST]: 'bg-orange-100 text-orange-700 border-orange-200',
          [TreeStatus.CUT]: 'bg-gray-100 text-gray-700 border-gray-200',
      };
      
      const icons = {
          [TreeStatus.ALIVE]: Check,
          [TreeStatus.DEAD]: X,
          [TreeStatus.LOST]: AlertTriangle,
          [TreeStatus.CUT]: Sprout, // Using sprout as icon for replant/cut logic maybe
      };

      const Icon = icons[status] || AlertTriangle;

      return (
          <span className={`flex items-center space-x-1 px-2 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider ${styles[status]}`}>
              <Icon size={10} strokeWidth={3} />
              <span>{status}</span>
          </span>
      );
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col pb-20 animate-fade-in">
        {/* Header */}
        <div className="bg-white px-4 pt-safe pb-4 shadow-sm z-10 sticky top-0">
            <div className="flex items-center space-x-3 mb-4">
                <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-600 transition">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-gray-800">ทะเบียนต้นไม้ ({stats.total})</h1>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-green-50 border border-green-100 p-3 rounded-xl flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-green-600 font-bold uppercase">สมบูรณ์แข็งแรง</p>
                        <p className="text-xl font-bold text-green-800">{stats.healthy}</p>
                    </div>
                    <div className="bg-white p-2 rounded-full shadow-sm text-green-600">
                        <Check size={16} />
                    </div>
                </div>
                <div className="bg-orange-50 border border-orange-100 p-3 rounded-xl flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-orange-600 font-bold uppercase">ต้องดูแล/สูญหาย</p>
                        <p className="text-xl font-bold text-orange-800">{stats.issues}</p>
                    </div>
                    <div className="bg-white p-2 rounded-full shadow-sm text-orange-600">
                        <AlertTriangle size={16} />
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="ค้นหาชื่อพันธุ์ไม้, รหัส..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-100 border-none rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-green-500 focus:bg-white transition"
                />
            </div>

            {/* Filter Chips */}
            <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1">
                <button 
                    onClick={() => setStatusFilter('ALL')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition ${statusFilter === 'ALL' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200'}`}
                >
                    ทั้งหมด
                </button>
                <button 
                    onClick={() => setStatusFilter(TreeStatus.ALIVE)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition ${statusFilter === TreeStatus.ALIVE ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-500 border-gray-200'}`}
                >
                    ปกติ (Alive)
                </button>
                <button 
                    onClick={() => setStatusFilter(TreeStatus.DEAD)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition ${statusFilter === TreeStatus.DEAD ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-500 border-gray-200'}`}
                >
                    ตาย (Dead)
                </button>
                <button 
                    onClick={() => setStatusFilter(TreeStatus.LOST)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition ${statusFilter === TreeStatus.LOST ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-500 border-gray-200'}`}
                >
                    สูญหาย (Lost)
                </button>
            </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {filteredTrees.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <Leaf size={48} className="mb-4 opacity-20" />
                    <p className="text-sm font-medium">ไม่พบข้อมูลต้นไม้</p>
                </div>
            ) : (
                filteredTrees.map((tree) => (
                    <div 
                        key={tree.id}
                        onClick={() => onSelectTree(tree)}
                        className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md active:scale-[0.99] transition flex items-center space-x-4 cursor-pointer"
                    >
                        <div className="relative w-16 h-16 flex-shrink-0">
                            <div className="w-full h-full rounded-xl overflow-hidden bg-gray-100">
                                {tree.imageUrl ? (
                                    <img src={tree.imageUrl} className="w-full h-full object-cover" alt={tree.species} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-green-50">
                                        <Sprout className="text-green-300" size={24} />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-gray-800 text-sm truncate">{tree.species}</h3>
                                <StatusBadge status={tree.status} />
                            </div>
                            
                            <div className="flex flex-col space-y-1">
                                <p className="text-[10px] text-gray-400 flex items-center">
                                    <Calendar size={10} className="mr-1" />
                                    {new Date(tree.plantedDate).toLocaleDateString('th-TH', { year: '2-digit', month: 'short', day: 'numeric' })}
                                </p>
                                <p className="text-[10px] text-gray-400 flex items-center">
                                    <MapPin size={10} className="mr-1" />
                                    {tree.lat.toFixed(5)}, {tree.lng.toFixed(5)}
                                </p>
                            </div>
                        </div>

                        <div className="text-right flex flex-col items-end justify-center pl-2 border-l border-gray-50">
                            <span className="text-lg font-bold text-green-600 block leading-none">{tree.carbonCredit}</span>
                            <span className="text-[10px] text-gray-400 uppercase font-medium mt-1">kgCO₂</span>
                        </div>
                    </div>
                ))
            )}
            
            {/* Bottom Padding for Nav */}
            <div className="h-10"></div>
        </div>
    </div>
  );
};

export default TreeList;