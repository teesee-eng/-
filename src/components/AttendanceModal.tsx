import React, { useState } from 'react';
import { X, Clock, UserCheck, CheckCircle2 } from 'lucide-react';
import { CleaningStaff, AttendanceRecord } from '../types';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffList: CleaningStaff[];
  onSaveAttendance: (record: AttendanceRecord) => void;
  selectedStaffId?: string;
  todayRecords: AttendanceRecord[];
}

export const AttendanceModal: React.FC<AttendanceModalProps> = ({
  isOpen,
  onClose,
  staffList,
  onSaveAttendance,
  selectedStaffId,
  todayRecords
}) => {
  const [staffId, setStaffId] = useState(selectedStaffId || staffList[0]?.id || '');
  const [actionType, setActionType] = useState<'in' | 'out'>('in');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const todayStr = now.toISOString().split('T')[0];

  // Check if staff has clocked in today
  const existingRecord = todayRecords.find(r => r.staffId === staffId && r.date === todayStr);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const staff = staffList.find(s => s.id === staffId);
    const staffName = staff ? `${staff.name} (${staff.nickname})` : 'พนักงาน';

    if (actionType === 'in') {
      const newRecord: AttendanceRecord = {
        id: `ATT-${Date.now()}`,
        staffId,
        staffName,
        date: todayStr,
        clockInTime: timeStr,
        status: 'present',
        note: note.trim() || 'ลงเวลาเข้างานปกติ',
        syncedToSheets: false
      };
      onSaveAttendance(newRecord);
    } else {
      if (existingRecord) {
        const updatedRecord: AttendanceRecord = {
          ...existingRecord,
          clockOutTime: timeStr,
          status: 'completed',
          note: note.trim() ? `${existingRecord.note || ''} | ออก: ${note.trim()}` : existingRecord.note,
          syncedToSheets: false
        };
        onSaveAttendance(updatedRecord);
      } else {
        const record: AttendanceRecord = {
          id: `ATT-${Date.now()}`,
          staffId,
          staffName,
          date: todayStr,
          clockInTime: '-',
          clockOutTime: timeStr,
          status: 'completed',
          note: `บันทึกเวลาออกงาน: ${note.trim() || 'ปกติ'}`,
          syncedToSheets: false
        };
        onSaveAttendance(record);
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
        
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 sm:p-2.5 rounded-2xl bg-emerald-100 text-emerald-700">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900 leading-tight">
                ลงเวลาปฏิบัติงาน (Clock In/Out)
              </h2>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                บันทึกเวลาเข้า-ออกงานประจำวัน
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          {/* Action Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-gray-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setActionType('in')}
              className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer min-h-[44px] ${
                actionType === 'in'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              เข้างาน (Clock In)
            </button>
            <button
              type="button"
              onClick={() => setActionType('out')}
              className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer min-h-[44px] ${
                actionType === 'out'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ออกงาน (Clock Out)
            </button>
          </div>

          {/* Time Display */}
          <div className="text-center p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200">
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-800 font-mono tracking-wider">
              {timeStr} น.
            </div>
            <div className="text-xs text-emerald-700 mt-1 font-medium">
              วันที่ {new Date().toLocaleDateString('th-TH', { dateStyle: 'long' })}
            </div>
          </div>

          {/* Staff select */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              พนักงาน *
            </label>
            <select
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              className="w-full px-3 py-2.5 text-base sm:text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              {staffList.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.nickname})
                </option>
              ))}
            </select>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              หมายเหตุ (ถ้ามี)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="เช่น เข้างานตรงเวลา, สลับจุดตรวจ"
              className="w-full px-3 py-2.5 text-base sm:text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer min-h-[44px]"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 rounded-xl shadow-sm shadow-emerald-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{actionType === 'in' ? 'ยืนยันเข้างานทันที' : 'ยืนยันออกงานทันที'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
