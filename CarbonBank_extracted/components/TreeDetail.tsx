import React, { useState } from 'react';
import { ArrowLeft, Activity, Droplets, Thermometer, Wind, Sprout, Ruler, CircleDashed, FileCheck, Share2, Award, Info, Trash2, Edit3, Save, X, AlertCircle, ClipboardList, Calendar, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Tree, TreeStatus } from '../types';

interface TreeDetailProps {
  tree: Tree;
  onBack: () => void;
  onUpdate?: (updatedTree: Tree) => void;
  onDelete?: (treeId: string) => void;
}

// Helper to generate mock scientific data based on species name
const getScientificData = (species: string) => {
  if (species.includes('สัก') || species.includes('Teak')) {
    return {
      latin: 'Tectona grandis',
      family: 'Lamiaceae',
      sequestrationRate: 'High (1.2 ton/rai/year)',
      description: 'ไม้ต้นขนาดใหญ่ผลัดใบ แหล่งผลิตไม้เนื้อแข็งคุณภาพสูง ทนทานต่อสภาพอากาศ',
      tags: ['Hardwood', 'Economic', 'High Value']
    };
  } else if (species.includes('ยางนา') || species.includes('Yang')) {
    return {
      latin: 'Dipterocarpus alatus',
      family: 'Dipterocarpaceae',
      sequestrationRate: 'Very High (1.5 ton/rai/year)',
      description: 'ไม้ยืนต้นขนาดใหญ่ ไม่ผลัดใบ ช่วยรักษาความชุ่มชื้นในดินได้ดีเยี่ยม',
      tags: ['Conservation', 'Large Canopy', 'Native']
    };
  } else {
    return {
      latin: 'Plantae incertae sedis',
      family: 'Unknown',
      sequestrationRate: 'Moderate (0.9 ton/rai/year)',
      description: 'พรรณไม้ท้องถิ่น ช่วยเพิ่มพื้นที่สีเขียวและดูดซับคาร์บอน',
      tags: ['Native', 'Green']
    };
  }
};

const TreeDetail: React.FC<TreeDetailProps> = ({ tree, onBack, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  
  // Mock History State (In a real app, this would come from the DB)
  const [timeline, setTimeline] = useState([
    { date: tree.plantedDate, title: 'ลงทะเบียนปลูก (Planted)', type: 'INIT', note: 'เริ่มเข้าร่วมโครงการ' },
    { date: new Date(new Date(tree.plantedDate).getTime() + 86400000 * 30).toISOString().split('T')[0], title: 'ตรวจสอบสภาพ (Inspection)', type: 'CHECK', note: 'ต้นไม้แข็งแรงดี' }
  ].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

  // Status Update Form
  const [statusUpdateForm, setStatusUpdateForm] = useState({
      condition: 'NORMAL' as 'NORMAL' | 'ISSUE' | 'CRITICAL',
      note: ''
  });

  // Edit Form State
  const [editForm, setEditForm] = useState({
    species: tree.species,
    height: tree.height,
    circumference: tree.circumference,
    status: tree.status
  });

  const sciData = getScientificData(tree.species);
  const ageInMonths = Math.floor((new Date().getTime() - new Date(tree.plantedDate).getTime()) / (1000 * 60 * 60 * 24 * 30));

  const handleSave = () => {
    if (onUpdate) {
      onUpdate({
        ...tree,
        species: editForm.species,
        height: Number(editForm.height),
        circumference: Number(editForm.circumference),
        status: editForm.status
      });
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(tree.id);
      onBack();
    }
  };

  const handleAddStatusUpdate = () => {
      const today = new Date().toISOString().split('T')[0];
      let newTitle = 'อัปเดตทั่วไป (Update)';
      let newStatus = tree.status;

      if (statusUpdateForm.condition === 'NORMAL') {
          newTitle = 'ดูแลรักษา (Maintenance)';
          newStatus = TreeStatus.ALIVE;
      } else if (statusUpdateForm.condition === 'ISSUE') {
          newTitle = 'แจ้งปัญหา (Report Issue)';
          newStatus = TreeStatus.ALIVE; // Still alive but has issues
      } else if (statusUpdateForm.condition === 'CRITICAL') {
          newTitle = 'รายงานต้นไม้ตาย (Report Death)';
          newStatus = TreeStatus.DEAD;
      }

      // Add to timeline
      const newEvent = {
          date: today,
          title: newTitle,
          type: statusUpdateForm.condition,
          note: statusUpdateForm.note || '-'
      };
      
      setTimeline([newEvent, ...timeline]);
      
      // Update parent status if changed
      if (newStatus !== tree.status && onUpdate) {
          onUpdate({ ...tree, status: newStatus });
          setEditForm(prev => ({ ...prev, status: newStatus }));
      }

      setShowStatusModal(false);
      setStatusUpdateForm({ condition: 'NORMAL', note: '' });
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col pb-20 animate-fade-in relative overflow-y-auto no-scrollbar">
      {/* Header Image */}
      <div className="relative h-72 w-full flex-shrink-0">
        <img 
          src={tree.imageUrl || 'https://picsum.photos/800/600'} 
          alt={tree.species} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-black/30"></div>
        
        {/* Navbar */}
        <div className="absolute top-0 left-0 right-0 pt-safe p-4 flex justify-between items-center text-white z-10">
          <button onClick={onBack} className="p-2 bg-black/20 backdrop-blur-md rounded-full hover:bg-black/40 transition">
            <ArrowLeft size={24} />
          </button>
          <div className="flex space-x-2">
            {!isEditing ? (
                <>
                    <button onClick={() => setIsEditing(true)} className="p-2 bg-black/20 backdrop-blur-md rounded-full hover:bg-black/40 transition">
                        <Edit3 size={20} />
                    </button>
                    <button onClick={() => setShowDeleteConfirm(true)} className="p-2 bg-red-500/80 backdrop-blur-md rounded-full hover:bg-red-600 transition">
                        <Trash2 size={20} />
                    </button>
                </>
            ) : (
                <>
                    <button onClick={() => setIsEditing(false)} className="p-2 bg-red-500/80 backdrop-blur-md rounded-full hover:bg-red-600 transition">
                        <X size={20} />
                    </button>
                    <button onClick={handleSave} className="p-2 bg-green-500/80 backdrop-blur-md rounded-full hover:bg-green-600 transition">
                        <Save size={20} />
                    </button>
                </>
            )}
          </div>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
           <div className="flex items-center space-x-2 mb-2">
             <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${tree.status === TreeStatus.ALIVE ? 'bg-green-500 border-green-400' : 'bg-red-500 border-red-400'}`}>
               {isEditing ? (
                 <select 
                    value={editForm.status} 
                    onChange={(e) => setEditForm({...editForm, status: e.target.value as TreeStatus})}
                    className="bg-white text-black rounded px-1"
                 >
                    {Object.values(TreeStatus).map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
               ) : tree.status}
             </span>
             <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-white/20 backdrop-blur border border-white/30">
               Code: {tree.id.slice(-6)}
             </span>
           </div>
           
           {isEditing ? (
             <input 
                type="text" 
                value={editForm.species}
                onChange={(e) => setEditForm({...editForm, species: e.target.value})}
                className="text-2xl font-bold bg-black/40 border-b border-white outline-none w-full"
             />
           ) : (
             <h1 className="text-3xl font-bold">{tree.species}</h1>
           )}
           
           <p className="text-green-200 italic font-serif text-lg opacity-90">{sciData.latin}</p>
        </div>
      </div>

      <div className="px-4 -mt-6 relative z-10 space-y-6">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
           <div className="bg-white p-3 rounded-2xl shadow-lg shadow-gray-200/50 flex flex-col items-center justify-center text-center">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mb-2">
                 <CircleDashed size={16} />
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">อายุ (Age)</p>
              <p className="text-lg font-bold text-gray-800">{ageInMonths} <span className="text-xs font-normal">เดือน</span></p>
           </div>
           <div className="bg-white p-3 rounded-2xl shadow-lg shadow-gray-200/50 flex flex-col items-center justify-center text-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-2">
                 <Ruler size={16} />
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">ความสูง</p>
              <div className="flex items-baseline justify-center">
                  {isEditing ? (
                      <input 
                        type="number" 
                        value={editForm.height}
                        onChange={(e) => setEditForm({...editForm, height: Number(e.target.value)})}
                        className="w-12 text-center border-b border-gray-300 bg-gray-50"
                      />
                  ) : (
                     <span className="text-lg font-bold text-gray-800">{tree.height}</span>
                  )}
                  <span className="text-xs font-normal ml-1">m</span>
              </div>
           </div>
           <div className="bg-white p-3 rounded-2xl shadow-lg shadow-gray-200/50 flex flex-col items-center justify-center text-center">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-2">
                 <Wind size={16} />
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">เส้นรอบวง</p>
              <div className="flex items-baseline justify-center">
                  {isEditing ? (
                      <input 
                        type="number" 
                        value={editForm.circumference}
                        onChange={(e) => setEditForm({...editForm, circumference: Number(e.target.value)})}
                        className="w-12 text-center border-b border-gray-300 bg-gray-50"
                      />
                  ) : (
                     <span className="text-lg font-bold text-green-600">{tree.circumference}</span>
                  )}
                  <span className="text-xs font-normal ml-1">cm</span>
              </div>
           </div>
        </div>

        {/* Carbon Card */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-5 text-white shadow-xl shadow-gray-200">
           <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                 <Sprout className="text-green-400" size={20} />
                 <h3 className="font-bold text-lg">Carbon Credit</h3>
              </div>
              <span className="bg-white/10 px-2 py-1 rounded text-[10px] backdrop-blur font-medium">T-VER Verified</span>
           </div>
           <div className="flex items-end justify-between">
              <div>
                 <p className="text-gray-400 text-xs mb-1">สะสมทั้งหมด (Total Accumulated)</p>
                 <h2 className="text-4xl font-bold tracking-tight">{tree.carbonCredit} <span className="text-lg font-medium text-gray-400">kgCO₂e</span></h2>
              </div>
              <div className="text-right">
                 <p className="text-green-400 font-bold text-lg">+1.2</p>
                 <p className="text-[10px] text-gray-500">rate / year</p>
              </div>
           </div>
        </div>

        {/* Info Tabs / Content */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
           <h3 className="font-bold text-gray-800 mb-3 flex items-center">
              <Info size={18} className="mr-2 text-blue-500" />
              ข้อมูลทางพฤกษศาสตร์
           </h3>
           <div className="space-y-3">
              <div className="flex">
                  <span className="text-xs text-gray-400 w-24 flex-shrink-0">ชื่อวิทยาศาสตร์</span>
                  <span className="text-xs font-medium text-gray-700 italic">{sciData.latin}</span>
              </div>
              <div className="flex">
                  <span className="text-xs text-gray-400 w-24 flex-shrink-0">วงศ์ (Family)</span>
                  <span className="text-xs font-medium text-gray-700">{sciData.family}</span>
              </div>
              <div className="flex">
                  <span className="text-xs text-gray-400 w-24 flex-shrink-0">การดูดซับ</span>
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 rounded-full">{sciData.sequestrationRate}</span>
              </div>
              <div className="pt-2 border-t border-gray-50">
                  <p className="text-xs text-gray-600 leading-relaxed">{sciData.description}</p>
              </div>
              <div className="flex gap-2 flex-wrap pt-1">
                  {sciData.tags.map(tag => (
                      <span key={tag} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-md">#{tag}</span>
                  ))}
              </div>
           </div>
        </div>

        {/* Timeline Actions */}
        <div>
           <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-gray-800 flex items-center">
                  <Calendar size={18} className="mr-2 text-purple-500" />
                  ประวัติการดูแล (Timeline)
              </h3>
              <button 
                onClick={() => setShowStatusModal(true)}
                className="text-xs bg-black text-white px-3 py-1.5 rounded-full font-bold flex items-center shadow-md active:scale-95 transition"
              >
                  <ClipboardList size={12} className="mr-1" />
                  บันทึกการดูแล
              </button>
           </div>
           
           <div className="space-y-4 pl-2">
              {timeline.map((event, idx) => (
                  <div key={idx} className="flex gap-3 relative">
                      {/* Line */}
                      {idx !== timeline.length - 1 && (
                          <div className="absolute left-[15px] top-8 bottom-[-16px] w-0.5 bg-gray-200"></div>
                      )}
                      
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm z-10 ${
                          event.type === 'INIT' ? 'bg-green-100 text-green-600' :
                          event.type === 'CHECK' ? 'bg-blue-100 text-blue-600' :
                          event.type === 'ISSUE' ? 'bg-orange-100 text-orange-600' :
                          event.type === 'CRITICAL' ? 'bg-red-100 text-red-600' : 
                          'bg-gray-100 text-gray-600'
                      }`}>
                          {event.type === 'INIT' ? <Sprout size={14} /> : 
                           event.type === 'CHECK' ? <CheckCircle2 size={14} /> :
                           event.type === 'ISSUE' ? <AlertTriangle size={14} /> :
                           event.type === 'CRITICAL' ? <X size={14} /> :
                           <Activity size={14} />}
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex-1">
                          <div className="flex justify-between items-start">
                              <h4 className="font-bold text-xs text-gray-800">{event.title}</h4>
                              <span className="text-[10px] text-gray-400">{event.date}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{event.note}</p>
                      </div>
                  </div>
              ))}
           </div>
        </div>

        <div className="h-10"></div>
      </div>

      {/* Delete Confirmation Modal - Constrained width for Desktop */}
      {showDeleteConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 w-full max-w-md mx-auto left-0 right-0">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)}></div>
              <div className="bg-white rounded-3xl w-full max-w-sm relative z-10 p-6 text-center animate-bounce-small shadow-2xl">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trash2 size={32} className="text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">ยืนยันการลบ?</h3>
                  <p className="text-sm text-gray-500 mb-6">
                      ข้อมูลต้นไม้และคาร์บอนเครดิตที่สะสมจะถูกลบออกจากระบบถาวร ไม่สามารถกู้คืนได้
                  </p>
                  <div className="flex gap-3">
                      <button 
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
                      >
                        ยกเลิก
                      </button>
                      <button 
                        onClick={handleDelete}
                        className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 transition"
                      >
                        ลบข้อมูล
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Status Update Modal - Constrained width for Desktop */}
      {showStatusModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 w-full max-w-md mx-auto left-0 right-0">
               <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowStatusModal(false)}></div>
               <div className="bg-white rounded-3xl w-full max-w-sm relative z-10 overflow-hidden shadow-2xl animate-slide-up">
                   <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
                       <h3 className="font-bold">บันทึกการดูแล (Log Activity)</h3>
                       <button onClick={() => setShowStatusModal(false)}><X size={20}/></button>
                   </div>
                   <div className="p-5 space-y-4">
                       <div>
                           <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">สภาพต้นไม้</label>
                           <div className="grid grid-cols-3 gap-2">
                               <button 
                                  onClick={() => setStatusUpdateForm({...statusUpdateForm, condition: 'NORMAL'})}
                                  className={`p-3 rounded-xl border flex flex-col items-center justify-center transition ${statusUpdateForm.condition === 'NORMAL' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-gray-200 text-gray-400'}`}
                               >
                                   <CheckCircle2 size={24} className="mb-1" />
                                   <span className="text-[10px] font-bold">ปกติ</span>
                               </button>
                               <button 
                                  onClick={() => setStatusUpdateForm({...statusUpdateForm, condition: 'ISSUE'})}
                                  className={`p-3 rounded-xl border flex flex-col items-center justify-center transition ${statusUpdateForm.condition === 'ISSUE' ? 'bg-orange-50 border-orange-500 text-orange-700' : 'bg-white border-gray-200 text-gray-400'}`}
                               >
                                   <AlertTriangle size={24} className="mb-1" />
                                   <span className="text-[10px] font-bold">มีปัญหา</span>
                               </button>
                               <button 
                                  onClick={() => setStatusUpdateForm({...statusUpdateForm, condition: 'CRITICAL'})}
                                  className={`p-3 rounded-xl border flex flex-col items-center justify-center transition ${statusUpdateForm.condition === 'CRITICAL' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-gray-200 text-gray-400'}`}
                               >
                                   <X size={24} className="mb-1" />
                                   <span className="text-[10px] font-bold">ยืนต้นตาย</span>
                               </button>
                           </div>
                       </div>
                       
                       <div>
                           <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">หมายเหตุเพิ่มเติม</label>
                           <textarea 
                              value={statusUpdateForm.note}
                              onChange={(e) => setStatusUpdateForm({...statusUpdateForm, note: e.target.value})}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 h-24 resize-none"
                              placeholder="เช่น ใส่ปุ๋ย, กำจัดวัชพืช, พบรอยโรค..."
                           ></textarea>
                       </div>

                       <button 
                          onClick={handleAddStatusUpdate}
                          className="w-full bg-black text-white py-4 rounded-xl font-bold shadow-lg active:scale-95 transition"
                       >
                           บันทึกข้อมูล
                       </button>
                   </div>
               </div>
          </div>
      )}
    </div>
  );
};

export default TreeDetail;