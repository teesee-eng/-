import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  User, 
  Phone, 
  KeyRound, 
  MapPin, 
  Clock, 
  Check, 
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import { CleaningStaff, CleaningZone, ShiftType } from '../types';
import { ZONES } from '../data/initialData';

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingStaffList: CleaningStaff[];
  onAddStaff: (newStaff: CleaningStaff) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
];

export const AddStaffModal: React.FC<AddStaffModalProps> = ({
  isOpen,
  onClose,
  existingStaffList,
  onAddStaff
}) => {
  // Generate auto ID: STF-00X
  const nextNumber = existingStaffList.length + 1;
  const defaultId = `STF-${String(nextNumber).padStart(3, '0')}`;

  const [staffId, setStaffId] = useState(defaultId);
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('1234');
  const [avatar, setAvatar] = useState(PRESET_AVATARS[0]);
  const [assignedZones, setAssignedZones] = useState<CleaningZone[]>(['flat_4', 'flat_5']);

  if (!isOpen) return null;

  const toggleZone = (zoneId: CleaningZone) => {
    if (assignedZones.includes(zoneId)) {
      if (assignedZones.length > 1) {
        setAssignedZones(assignedZones.filter(z => z !== zoneId));
      }
    } else {
      setAssignedZones([...assignedZones, zoneId]);
    }
  };

  const handleCustomAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newStaff: CleaningStaff = {
      id: staffId.trim() || defaultId,
      name: name.trim(),
      nickname: nickname.trim() || name.trim().split(' ')[0],
      phone: phone.trim() || '08x-xxx-xxxx',
      avatar,
      assignedZones,
      pin: pin.trim() || '1234'
    };

    onAddStaff(newStaff);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800 shadow-2xs">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">
                เพิ่มรายชื่อพนักงานทำความสะอาดใหม่
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                ลงทะเบียนพนักงาน กำหนดพื้นที่รับผิดชอบ และรหัส PIN เข้าใช้งาน
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
          
          {/* Avatar Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              เลือกรูปโปรไฟล์พนักงาน
            </label>
            <div className="flex items-center gap-3 flex-wrap">
              {PRESET_AVATARS.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatar(imgUrl)}
                  className={`w-12 h-12 rounded-2xl overflow-hidden border-2 transition-all p-0.5 ${
                    avatar === imgUrl ? 'border-emerald-600 scale-105 shadow-md' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img src={imgUrl} alt={`Preset ${idx}`} className="w-full h-full object-cover rounded-xl" />
                </button>
              ))}

              <label className="w-12 h-12 rounded-2xl border-2 border-dashed border-gray-300 hover:border-emerald-500 flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50 text-gray-500 hover:text-emerald-600">
                <ImageIcon className="w-4 h-4" />
                <span className="text-[9px] mt-0.5 font-bold">อัปโหลด</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCustomAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Row 1: ID, Full Name, Nickname */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                รหัสพนักงาน *
              </label>
              <input
                type="text"
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 font-mono font-bold bg-gray-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ชื่อ-นามสกุลจริง *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น สมพร มีโชค"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ชื่อเรียก / ชื่อเล่น *
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="เช่น ป้าพร, พี่พร"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>
          </div>

          {/* Row 2: Phone & PIN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>เบอร์โทรศัพท์</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="081-xxx-xxxx"
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                <span>รหัส PIN ล็อคอิน (4 หลัก)</span>
              </label>
              <input
                type="text"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="1234"
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 font-mono text-center tracking-widest font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>
          </div>

          {/* Row 3: Assigned Flat Centers Checkboxes (Designated by Supervisor) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>กำหนดพื้นที่แฟลตศูนย์ที่รับผิดชอบ (เลือกได้มากกว่า 1 แฟลต) *</span>
              </label>
              <span className="text-[11px] text-emerald-700 font-semibold">
                เลือกแล้ว {assignedZones.length} แฟลต
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 border border-gray-200 rounded-2xl bg-gray-50/50">
              {ZONES.map(z => {
                const isSelected = assignedZones.includes(z.id);
                return (
                  <button
                    key={z.id}
                    type="button"
                    onClick={() => toggleZone(z.id)}
                    className={`p-2 rounded-xl border text-xs text-left transition-all flex items-center justify-between cursor-pointer ${
                      isSelected 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold shadow-2xs' 
                        : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    <span className="truncate">{z.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
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
              className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 rounded-xl shadow-md shadow-emerald-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>บันทึกเพิ่มพนักงาน</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
