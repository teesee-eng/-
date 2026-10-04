import React, { useState } from 'react';
import { 
  X, 
  ClipboardList, 
  User, 
  MapPin, 
  Calendar, 
  Clock, 
  AlertCircle, 
  Plus, 
  CheckCircle2,
  Sparkles,
  Send
} from 'lucide-react';
import { CleaningStaff, CleaningZone, TaskRecord, ShiftType } from '../types';
import { ZONES } from '../data/initialData';

interface AssignTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffList: CleaningStaff[];
  supervisorName: string;
  onAssignTask: (task: TaskRecord) => void;
}

export const AssignTaskModal: React.FC<AssignTaskModalProps> = ({
  isOpen,
  onClose,
  staffList,
  supervisorName,
  onAssignTask
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [staffId, setStaffId] = useState(staffList[0]?.id || '');
  const [zone, setZone] = useState<CleaningZone>('flat_4');
  const [areaDetail, setAreaDetail] = useState('');
  const [date, setDate] = useState(todayStr);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('10:00');
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [notes, setNotes] = useState('');
  
  // Checklist
  const [checklist, setChecklist] = useState<{ item: string; completed: boolean }[]>(() => {
    const initialZone = ZONES.find(z => z.id === 'flat_4');
    return initialZone ? initialZone.defaultChecklist.map(c => ({ item: c, completed: false })) : [];
  });
  const [newCustomItem, setNewCustomItem] = useState('');

  if (!isOpen) return null;

  const handleZoneChange = (newZone: CleaningZone) => {
    setZone(newZone);
    const zConfig = ZONES.find(z => z.id === newZone);
    if (zConfig) {
      setChecklist(zConfig.defaultChecklist.map(c => ({ item: c, completed: false })));
    }
  };

  const toggleChecklistItem = (index: number) => {
    const updated = [...checklist];
    updated[index].completed = !updated[index].completed;
    setChecklist(updated);
  };

  const addCustomItem = () => {
    if (!newCustomItem.trim()) return;
    setChecklist([...checklist, { item: newCustomItem.trim(), completed: false }]);
    setNewCustomItem('');
  };

  const removeChecklistItem = (index: number) => {
    setChecklist(checklist.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedStaff = staffList.find(s => s.id === staffId);
    const staffName = assignedStaff ? `${assignedStaff.name} (${assignedStaff.nickname})` : 'พนักงาน';

    const newTask: TaskRecord = {
      id: `TSK-ASN-${Date.now()}`,
      timestamp: new Date().toISOString(),
      date,
      staffId,
      staffName,
      zone,
      areaDetail: areaDetail.trim() || ZONES.find(z => z.id === zone)?.name || 'งานที่ได้รับมอบหมาย',
      startTime,
      endTime,
      checklist,
      notes: notes.trim(),
      status: 'pending',
      supervisorChecked: false,
      assignedBy: supervisorName || 'หัวหน้างาน',
      priority,
      syncedToSheets: false
    };

    onAssignTask(newTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-teal-100 text-teal-800 shadow-2xs">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">
                กำหนดและมอบหมายงานให้พนักงาน
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                เลือกพนักงาน กำหนดจุดพื้นที่ ข้อกำหนดการตรวจ และระดับความสำคัญ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          
          {/* Row 1: Assignee Staff & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-teal-600" />
                <span>มอบหมายให้พนักงาน *</span>
              </label>
              <select
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 font-semibold focus:outline-hidden focus:ring-2 focus:ring-teal-500 bg-white"
              >
                {staffList.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.nickname}) - รหัส {s.id}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>ระดับความสำคัญ (Priority) *</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 font-bold focus:outline-hidden focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="normal">🟢 ระดับปกติ (งานประจำวัน)</option>
                <option value="high">🟡 สำคัญ / ด่วน (ต้องเสร็จตามเวลา)</option>
                <option value="urgent">🔴 ด่วนที่สุด / VIP (แขกเข้า/ผู้บริหาร)</option>
              </select>
            </div>
          </div>

          {/* Row 2: Zone & Specific Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                <span>โซนหลัก *</span>
              </label>
              <select
                value={zone}
                onChange={(e) => handleZoneChange(e.target.value as CleaningZone)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-500 bg-white"
              >
                {ZONES.map(z => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                รายละเอียดจุดพื้นที่ที่ต้องทำความสะอาด *
              </label>
              <input
                type="text"
                value={areaDetail}
                onChange={(e) => setAreaDetail(e.target.value)}
                placeholder="เช่น แฟลตศูนย์ 4 ชั้น 1-4 โถงทางเดิน บันได และลานจอดรถ"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 bg-white"
              />
            </div>
          </div>

          {/* Row 3: Date, Target Time (No Shift) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-200">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">วันที่มอบหมาย</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-400" />
                <span>เวลาเริ่ม</span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-400" />
                <span>เสร็จภายใน</span>
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 bg-white"
              />
            </div>
          </div>

          {/* Checklist Requirements */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>ข้อกำหนดที่พนักงานต้องตรวจเช็ค ({checklist.length} รายการ)</span>
              </label>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto p-3 bg-gray-50/70 rounded-2xl border border-gray-200">
              {checklist.map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-white border border-gray-200 text-xs"
                >
                  <span className="text-gray-800">{item.item}</span>
                  <button
                    type="button"
                    onClick={() => removeChecklistItem(idx)}
                    className="p-1 text-gray-400 hover:text-rose-600 rounded transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Custom Item */}
            <div className="mt-2 flex items-center gap-2">
              <input
                type="text"
                value={newCustomItem}
                onChange={(e) => setNewCustomItem(e.target.value)}
                placeholder="+ เพิ่มข้อกำหนดพิเศษเฉพาะงานนี้..."
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomItem(); } }}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-gray-300 focus:outline-hidden focus:ring-1 focus:ring-teal-500 bg-white"
              />
              <button
                type="button"
                onClick={addCustomItem}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่ม</span>
              </button>
            </div>
          </div>

          {/* Instructions / Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              คำสั่งหรือข้อความกำชับจากหัวหน้างาน (ส่งตรงถึงพนักงาน)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="เช่น มีคณะผู้บริหารเข้าประชุมเวลา 13:00 น. ตรวจเช็คกลิ่นและกระจกหน้าห้องเป็นพิเศษ"
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 bg-white"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 active:scale-98 rounded-xl shadow-md shadow-teal-900/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>ส่งมอบหมายงาน</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
