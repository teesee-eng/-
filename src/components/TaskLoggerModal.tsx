import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckSquare, 
  Camera, 
  Clock, 
  MapPin, 
  User as UserIcon, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Upload,
  RefreshCw,
  Eye,
  Video
} from 'lucide-react';
import { CleaningStaff, CleaningZone, TaskRecord, ShiftType } from '../types';
import { ZONES } from '../data/initialData';
import { CameraCaptureModal } from './CameraCaptureModal';

interface TaskLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffList: CleaningStaff[];
  selectedStaffId?: string;
  onSaveTask: (task: TaskRecord) => void;
  editingTask?: TaskRecord | null;
}

export const TaskLoggerModal: React.FC<TaskLoggerModalProps> = ({
  isOpen,
  onClose,
  staffList,
  selectedStaffId,
  onSaveTask,
  editingTask
}) => {
  const [staffId, setStaffId] = useState(selectedStaffId || staffList[0]?.id || '');
  const [zone, setZone] = useState<CleaningZone>('flat_4');
  const [areaDetail, setAreaDetail] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('08:45');
  const [checklist, setChecklist] = useState<{ item: string; completed: boolean }[]>([]);
  const [newCustomItem, setNewCustomItem] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'completed' | 'in_progress' | 'pending'>('completed');
  const [beforePhoto, setBeforePhoto] = useState<string | undefined>(undefined);
  const [afterPhoto, setAfterPhoto] = useState<string | undefined>(undefined);
  
  // Camera Modal State
  const [activeCameraTarget, setActiveCameraTarget] = useState<'before' | 'after' | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  // Sync state when editing or opening
  useEffect(() => {
    if (editingTask) {
      setStaffId(editingTask.staffId);
      setZone(editingTask.zone);
      setAreaDetail(editingTask.areaDetail);
      setDate(editingTask.date);
      setStartTime(editingTask.startTime);
      setEndTime(editingTask.endTime);
      setChecklist(editingTask.checklist);
      setNotes(editingTask.notes || '');
      setStatus(editingTask.status);
      setBeforePhoto(editingTask.beforePhoto);
      setAfterPhoto(editingTask.afterPhoto);
    } else {
      if (selectedStaffId) {
        setStaffId(selectedStaffId);
      }
      const zoneConfig = ZONES.find(z => z.id === zone);
      if (zoneConfig) {
        setChecklist(zoneConfig.defaultChecklist.map(item => ({ item, completed: true })));
      }
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMins = String(now.getMinutes()).padStart(2, '0');
      setEndTime(`${currentHours}:${currentMins}`);
      
      const startH = Math.max(0, now.getHours() - 1);
      setStartTime(`${String(startH).padStart(2, '0')}:${currentMins}`);
    }
  }, [editingTask, isOpen, selectedStaffId]);

  // Update checklist when zone changes (if not editing)
  const handleZoneChange = (newZone: CleaningZone) => {
    setZone(newZone);
    if (!editingTask) {
      const zoneConfig = ZONES.find(z => z.id === newZone);
      if (zoneConfig) {
        setChecklist(zoneConfig.defaultChecklist.map(item => ({ item, completed: true })));
      }
    }
  };

  const toggleChecklistItem = (index: number) => {
    const updated = [...checklist];
    updated[index].completed = !updated[index].completed;
    setChecklist(updated);
  };

  const addCustomChecklistItem = () => {
    if (!newCustomItem.trim()) return;
    setChecklist([...checklist, { item: newCustomItem.trim(), completed: true }]);
    setNewCustomItem('');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'before') {
          setBeforePhoto(reader.result as string);
        } else {
          setAfterPhoto(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const staff = staffList.find(s => s.id === staffId);
    const taskRecord: TaskRecord = {
      id: editingTask?.id || `TSK-${Date.now()}`,
      timestamp: new Date().toISOString(),
      date,
      staffId,
      staffName: staff ? `${staff.name} (${staff.nickname})` : 'พนักงาน',
      zone,
      areaDetail: areaDetail.trim() || ZONES.find(z => z.id === zone)?.name || 'พื้นที่ทั่วไป',
      startTime,
      endTime,
      checklist,
      notes: notes.trim(),
      status,
      beforePhoto,
      afterPhoto,
      supervisorChecked: editingTask?.supervisorChecked || false,
      supervisorName: editingTask?.supervisorName,
      supervisorRating: editingTask?.supervisorRating,
      syncedToSheets: false
    };

    onSaveTask(taskRecord);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-gray-100 max-h-[94vh] flex flex-col overflow-hidden">
        
        {/* Sticky Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 bg-white shrink-0 z-10">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-2xl bg-emerald-100 text-emerald-700">
              <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900 leading-tight">
                {editingTask ? 'แก้ไขบันทึกงานทำความสะอาด' : 'บันทึกการทำความสะอาดประจำจุด'}
              </h2>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                ระบุรายการตรวจ ถ่ายภาพยืนยัน และเวลาปฏิบัติงานจริง
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-4 flex-1">
          
          {/* Row 1: Staff & Zone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>พนักงานผู้ปฏิบัติงาน *</span>
              </label>
              <select
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {staffList.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.nickname}) - รหัส {s.id}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>โซนหลัก *</span>
              </label>
              <select
                value={zone}
                onChange={(e) => handleZoneChange(e.target.value as CleaningZone)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white font-medium"
              >
                {ZONES.map(z => (
                  <option key={z.id} value={z.id}>
                    {z.name} ({z.nameEn})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Area detail */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              รายละเอียดจุดพื้นที่ (เช่น แฟลตศูนย์ 4 ชั้น 1-4 โถงทางเดิน บันได และลานจอดรถ) *
            </label>
            <input
              type="text"
              value={areaDetail}
              onChange={(e) => setAreaDetail(e.target.value)}
              placeholder="ระบุชั้นหรือตำแหน่งชัดเจน"
              required
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>

          {/* Row 3: Date, Start & End Time, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                วันที่
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-600" />
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
                <Clock className="w-3 h-3 text-emerald-600" />
                <span>เวลาเสร็จ</span>
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                สถานะงาน
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 bg-white font-medium"
              >
                <option value="completed">เสร็จสิ้นเรียบร้อย</option>
                <option value="in_progress">กำลังดำเนินการ</option>
                <option value="pending">รอดำเนินการ</option>
              </select>
            </div>
          </div>

          {/* Checklist Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>รายการตรวจสอบงานทำความสะอาด (Checklist)</span>
              </label>
              <span className="text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                ทำแล้ว {checklist.filter(c => c.completed).length} จาก {checklist.length} รายการ
              </span>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto p-2.5 bg-gray-50/70 rounded-2xl border border-gray-200">
              {checklist.map((item, idx) => (
                <label 
                  key={idx} 
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all active:scale-[0.99] text-xs sm:text-sm select-none border ${
                    item.completed 
                      ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-medium' 
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleChecklistItem(idx)}
                    className="w-5 h-5 rounded-md text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer flex-shrink-0"
                  />
                  <span className="flex-1 leading-snug">{item.item}</span>
                </label>
              ))}
            </div>

            {/* Add custom item */}
            <div className="mt-2 flex items-center gap-2">
              <input
                type="text"
                value={newCustomItem}
                onChange={(e) => setNewCustomItem(e.target.value)}
                placeholder="+ เพิ่มรายการตรวจพิเศษสำหรับจุดนี้..."
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomChecklistItem(); } }}
                className="flex-1 px-3 py-2 text-base sm:text-xs rounded-xl border border-gray-300 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 bg-white"
              />
              <button
                type="button"
                onClick={addCustomChecklistItem}
                className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-medium flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่ม</span>
              </button>
            </div>
          </div>

          {/* Photo verification: Before & After */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            
            {/* Before Photo */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-gray-500" />
                  <span>รูปถ่ายก่อนทำความสะอาด (ถ้ามี)</span>
                </label>
                {beforePhoto && (
                  <span className="text-[11px] text-emerald-700 font-medium">✓ มีรูปแล้ว</span>
                )}
              </div>

              {beforePhoto ? (
                <div className="relative rounded-2xl overflow-hidden border border-gray-200 h-36 bg-gray-100 group shadow-xs">
                  <img src={beforePhoto} alt="Before" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewPhoto(beforePhoto)}
                      className="p-1.5 bg-white/95 hover:bg-white text-gray-900 rounded-lg text-xs font-medium flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>ขยาย</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveCameraTarget('before')}
                      className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>ถ่ายใหม่</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBeforePhoto(undefined)}
                    title="ลบรูปนี้"
                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-rose-600 text-white rounded-full text-xs transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 p-3 bg-gray-50/70 rounded-2xl border border-gray-200">
                  <label className="w-full py-2.5 px-3 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer active:scale-98">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <span>ถ่ายรูปก่อนทำ (กล้องมือถือ)</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => handlePhotoUpload(e, 'before')}
                      className="hidden"
                    />
                  </label>

                  <div className="flex gap-2">
                    <label className="flex-1 py-1.5 px-2 bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 rounded-xl text-[11px] font-medium cursor-pointer transition-colors flex items-center justify-center gap-1">
                      <Upload className="w-3 h-3 text-gray-400" />
                      <span>อัลบั้มภาพ</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload(e, 'before')}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => setActiveCameraTarget('before')}
                      className="py-1.5 px-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-[11px] font-medium transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Video className="w-3 h-3" />
                      <span>เว็บแคม</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* After Photo */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-emerald-600" />
                  <span>รูปถ่ายผลงานหลังทำเสร็จ *</span>
                </label>
                {afterPhoto && (
                  <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ✓ แนบรูปแล้ว
                  </span>
                )}
              </div>

              {afterPhoto ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-300 h-36 bg-gray-100 group shadow-xs">
                  <img src={afterPhoto} alt="After" className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                    ผลงานสำเร็จ ✓
                  </span>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewPhoto(afterPhoto)}
                      className="p-1.5 bg-white/95 hover:bg-white text-gray-900 rounded-lg text-xs font-medium flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>ขยาย</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveCameraTarget('after')}
                      className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>ถ่ายใหม่</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAfterPhoto(undefined)}
                    title="ลบรูปนี้"
                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-rose-600 text-white rounded-full text-xs transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 p-3 bg-emerald-50/50 rounded-2xl border-2 border-emerald-300">
                  <label className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm shadow-emerald-200 cursor-pointer">
                    <Camera className="w-4 h-4" />
                    <span>ถ่ายรูปผลงาน (กล้องมือถือ)</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => handlePhotoUpload(e, 'after')}
                      className="hidden"
                    />
                  </label>

                  <div className="flex gap-2">
                    <label className="flex-1 py-1.5 px-2 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-[11px] font-medium cursor-pointer transition-colors flex items-center justify-center gap-1">
                      <Upload className="w-3 h-3 text-emerald-600" />
                      <span>เลือกจากอัลบั้ม</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload(e, 'after')}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => setActiveCameraTarget('after')}
                      className="py-1.5 px-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-[11px] font-medium transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Video className="w-3 h-3 text-gray-500" />
                      <span>เว็บแคม</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              หมายเหตุเพิ่มเติม (ถ้ามี)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="ระบุข้อความ..."
              className="w-full px-3 py-2 text-base sm:text-xs rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>

        </form>

        {/* Sticky Footer Actions */}
        <div className="p-3.5 sm:p-4 border-t border-gray-100 bg-white/95 backdrop-blur-xs flex items-center justify-end gap-2.5 shrink-0 z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer min-h-[44px]"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 rounded-xl shadow-sm shadow-emerald-200 transition-all flex items-center gap-2 cursor-pointer min-h-[44px]"
          >
            <CheckSquare className="w-4 h-4" />
            <span>{editingTask ? 'บันทึกการแก้ไข' : 'บันทึกงานเสร็จสมบูรณ์'}</span>
          </button>
        </div>

      </div>

      {/* Live Camera Viewfinder Modal */}
      <CameraCaptureModal
        isOpen={activeCameraTarget !== null}
        onClose={() => setActiveCameraTarget(null)}
        onCapture={(dataUrl) => {
          if (activeCameraTarget === 'before') {
            setBeforePhoto(dataUrl);
          } else if (activeCameraTarget === 'after') {
            setAfterPhoto(dataUrl);
          }
        }}
        title={activeCameraTarget === 'before' ? 'ถ่ายภาพก่อนทำความสะอาด (Before)' : 'ถ่ายภาพผลงานหลังทำเสร็จ (After)'}
      />

      {/* Image Zoom Preview Modal */}
      {previewPhoto && (
        <div 
          onClick={() => setPreviewPhoto(null)} 
          className="fixed inset-0 z-70 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-150"
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-black rounded-2xl overflow-hidden shadow-2xl">
            <img src={previewPhoto} alt="Full preview" className="max-h-[80vh] w-auto object-contain mx-auto" />
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/90 text-white rounded-full text-xs"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
