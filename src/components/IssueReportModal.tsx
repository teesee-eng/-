import React, { useState } from 'react';
import { X, AlertTriangle, Camera, MapPin, Wrench } from 'lucide-react';
import { CleaningStaff, CleaningZone, IssueReport } from '../types';
import { ZONES } from '../data/initialData';

interface IssueReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffList: CleaningStaff[];
  selectedStaffId?: string;
  onSaveIssue: (issue: IssueReport) => void;
}

export const IssueReportModal: React.FC<IssueReportModalProps> = ({
  isOpen,
  onClose,
  staffList,
  selectedStaffId,
  onSaveIssue
}) => {
  const [reporterId, setReporterId] = useState(selectedStaffId || staffList[0]?.id || '');
  const [zone, setZone] = useState<CleaningZone>('restroom');
  const [location, setLocation] = useState('');
  const [issueType, setIssueType] = useState<IssueReport['issueType']>('water_leak');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<IssueReport['urgency']>('medium');
  const [photo, setPhoto] = useState<string | undefined>(undefined);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const staff = staffList.find(s => s.id === reporterId);
    const now = new Date();

    const report: IssueReport = {
      id: `ISS-${Date.now()}`,
      date: now.toISOString().split('T')[0],
      time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      reportedBy: staff ? `${staff.name} (${staff.nickname})` : 'พนักงานทำความสะอาด',
      zone,
      location: location.trim() || 'บริเวณทั่วไป',
      issueType,
      title: title.trim(),
      description: description.trim(),
      urgency,
      photo,
      status: 'open',
      syncedToSheets: false
    };

    onSaveIssue(report);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-gray-100 max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Sticky Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 bg-white shrink-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 sm:p-2.5 rounded-2xl bg-rose-100 text-rose-700">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900 leading-tight">
                แจ้งซ่อมแซมและรายงานเหตุผิดปกติ
              </h2>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                รายงานอุปกรณ์ชำรุด ท่อน้ำรั่ว ไฟดับ หรือจุดอันตราย
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ผู้แจ้ง *
              </label>
              <select
                value={reporterId}
                onChange={(e) => setReporterId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 bg-white"
              >
                {staffList.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.nickname})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ระดับความเร่งด่วน *
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 bg-white font-medium"
              >
                <option value="low">ระดับต่ำ (ปกติ)</option>
                <option value="medium">ระดับปานกลาง (ควรแก้ไขใน 24 ชม.)</option>
                <option value="high">ระดับสูง (เร่งด่วน)</option>
                <option value="urgent">ฉุกเฉินมาก! (น้ำท่วม/ไฟช็อต/อันตราย)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                โซนพื้นที่
              </label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value as CleaningZone)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 bg-white"
              >
                {ZONES.map(z => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ประเภทปัญหา
              </label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 bg-white"
              >
                <option value="water_leak">ท่อน้ำ/ก๊อกน้ำรั่ว/สุขภัณฑ์ตัน</option>
                <option value="electrical">ระบบไฟส่องสว่าง/ปลั๊กไฟ</option>
                <option value="broken_furniture">ประตู/หน้าต่าง/โต๊ะเก้าอี้ชำรุด</option>
                <option value="heavy_stain">คราบสกปรกหนักที่ต้องขัดพิเศษ</option>
                <option value="pest">พบสัตว์/แมลงรบกวน</option>
                <option value="other">อื่นๆ</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              ตำแหน่งจุดเกิดเหตุ *
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="เช่น ห้องน้ำหญิงชั้น 2 ห้องที่ 3, ข้างตู้กดกาแฟ"
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              หัวข้อปัญหา *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น สายฉีดชำระรั่ว, กระเบื้องพื้นแตกหลุดร่อน"
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              รายละเอียดเพิ่มเติม / การแก้ไขเบื้องต้น
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="ระบุสิ่งที่พบ และมาตรการที่ทำไปแล้ว เช่น ปิดวาล์วแล้ว นำป้ายเตือนเปียกมาตั้งแล้ว"
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 bg-white"
            />
          </div>

          {/* Photo */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              ภาพถ่ายจุดชำรุด
            </label>
            {photo ? (
              <div className="relative rounded-xl overflow-hidden border border-gray-200 h-28 bg-gray-100">
                <img src={photo} alt="Issue" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhoto(undefined)}
                  className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-300 hover:border-rose-400 rounded-xl cursor-pointer bg-gray-50/50 hover:bg-rose-50/30 transition-all p-2 text-center">
                <Camera className="w-5 h-5 text-gray-400 mb-1" />
                <span className="text-xs text-gray-600">กดถ่ายภาพหรือแนบรูปถ่ายชำรุด</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            )}
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
            type="submit"
            onClick={handleSubmit}
            className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-98 rounded-xl shadow-sm shadow-rose-200 transition-all flex items-center gap-2 cursor-pointer min-h-[44px]"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>ส่งรายงานแจ้งซ่อม</span>
          </button>
        </div>

      </div>
    </div>
  );
};
