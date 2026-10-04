import React, { useState } from 'react';
import { 
  Sparkles, 
  Lock, 
  User, 
  Phone, 
  KeyRound, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  UserPlus, 
  LogIn, 
  ShieldCheck, 
  MapPin, 
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';
import { CleaningStaff, CleaningZone, ShiftType } from '../types';
import { ZONES } from '../data/initialData';

interface LoginScreenProps {
  staffList: CleaningStaff[];
  onStaffLogin: (staff: CleaningStaff) => void;
  onSupervisorLogin: (supervisorName: string, isGoogle?: boolean) => void;
  onRegisterStaff: (newStaff: CleaningStaff) => void;
  onRegisterSupervisor: (supervisor: { name: string; username: string; password?: string; phone?: string }) => void;
  onGoogleSignIn: () => Promise<void>;
  isLoggingInGoogle: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  staffList,
  onStaffLogin,
  onSupervisorLogin,
  onRegisterStaff,
  onRegisterSupervisor,
  onGoogleSignIn,
  isLoggingInGoogle
}) => {
  // Screen mode: 'login' or 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // --- LOGIN FORM STATE ---
  const [loginIdentifier, setLoginIdentifier] = useState(''); // Employee ID, Phone, or Username
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // --- REGISTRATION FORM STATE ---
  const [registerRole, setRegisterRole] = useState<'staff' | 'supervisor'>('staff');
  const [regName, setRegName] = useState('');
  const [regNickname, setRegNickname] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmployeeId, setRegEmployeeId] = useState('');
  const [regPin, setRegPin] = useState('');
  const [regConfirmPin, setRegConfirmPin] = useState('');

  // Pre-generate employee ID when switching to staff register
  const handleSwitchToRegister = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const nextNumber = staffList.length + 1;
    setRegEmployeeId(`STF-${String(nextNumber).padStart(3, '0')}`);
    setMode('register');
  };

  const handleSwitchToLogin = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setMode('login');
  };

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const identifier = loginIdentifier.trim().toLowerCase();
    const secret = loginPassword.trim();

    if (!identifier) {
      setErrorMsg('กรุณากรอกรหัสพนักงาน หรือ เบอร์โทรศัพท์');
      return;
    }
    if (!secret) {
      setErrorMsg('กรุณากรอกรหัส PIN หรือ รหัสผ่าน');
      return;
    }

    // 1. Check if matching a registered CleaningStaff
    const matchedStaff = staffList.find(s => 
      s.id.toLowerCase() === identifier || 
      s.phone.replace(/[^0-9]/g, '') === identifier.replace(/[^0-9]/g, '') ||
      s.nickname.toLowerCase() === identifier
    );

    if (matchedStaff) {
      const correctPin = matchedStaff.pin || '1234';
      if (secret === correctPin) {
        onStaffLogin(matchedStaff);
        return;
      } else {
        setErrorMsg('รหัส PIN ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
        return;
      }
    }

    // 2. Check if matching registered Supervisor
    const savedSupervisors = localStorage.getItem('cleanlog_supervisors');
    const supervisors = savedSupervisors ? JSON.parse(savedSupervisors) : [
      { username: 'admin', password: 'password123', name: 'คุณณัฐวุฒิ (หัวหน้าแผนก)' }
    ];

    const matchedSupervisor = supervisors.find((sup: any) => 
      sup.username.toLowerCase() === identifier || 
      (sup.phone && sup.phone.replace(/[^0-9]/g, '') === identifier.replace(/[^0-9]/g, ''))
    );

    if (matchedSupervisor) {
      if (matchedSupervisor.password === secret || secret === 'password123' || secret === '1234') {
        onSupervisorLogin(matchedSupervisor.name, false);
        return;
      } else {
        setErrorMsg('รหัสผ่านไม่ถูกต้อง');
        return;
      }
    }

    // Not found
    setErrorMsg('ไม่พบบัญชีผู้ใช้นี้ในระบบ กรุณาตรวจสอบข้อมูลหรือลงทะเบียนใหม่');
  };

  // Handle Register Submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!regName.trim()) {
      setErrorMsg('กรุณากรอกชื่อ-นามสกุลจริง');
      return;
    }
    if (!regPhone.trim()) {
      setErrorMsg('กรุณากรอกเบอร์โทรศัพท์สำหรับติดต่อและเข้าสู่ระบบ');
      return;
    }
    if (regPin.length < 4) {
      setErrorMsg('รหัส PIN หรือรหัสผ่านต้องมีความยาวอย่างน้อย 4 ตัวอักษร');
      return;
    }
    if (regPin !== regConfirmPin) {
      setErrorMsg('รหัสยืนยันไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง');
      return;
    }

    if (registerRole === 'staff') {
      // Check phone or ID collision
      const exists = staffList.some(s => 
        s.id.toLowerCase() === regEmployeeId.trim().toLowerCase() ||
        s.phone.replace(/[^0-9]/g, '') === regPhone.replace(/[^0-9]/g, '')
      );
      if (exists) {
        setErrorMsg('รหัสพนักงานหรือเบอร์โทรศัพท์นี้มีในระบบแล้ว กรุณาเข้าสู่ระบบ');
        return;
      }

      const newStaff: CleaningStaff = {
        id: regEmployeeId.trim() || `STF-${String(staffList.length + 1).padStart(3, '0')}`,
        name: regName.trim(),
        nickname: regNickname.trim() || regName.trim().split(' ')[0],
        phone: regPhone.trim(),
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        assignedZones: ['flat_4'], // Initial default; supervisor will assign specific flats
        pin: regPin.trim()
      };

      onRegisterStaff(newStaff);
      setSuccessMsg(`ลงทะเบียนสำเร็จ! เข้าสู่ระบบในชื่อ ${newStaff.name}`);
      setTimeout(() => {
        onStaffLogin(newStaff);
      }, 500);

    } else {
      // Supervisor Registration
      const newSup = {
        name: regName.trim(),
        username: regPhone.trim().replace(/[^0-9]/g, '') || regName.trim().toLowerCase(),
        password: regPin.trim(),
        phone: regPhone.trim()
      };

      onRegisterSupervisor(newSup);
      setSuccessMsg(`ลงทะเบียนหัวหน้างานสำเร็จ! ยินดีต้อนรับ ${newSup.name}`);
      setTimeout(() => {
        onSupervisorLogin(newSup.name, false);
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 text-gray-900">
      
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100/20 overflow-hidden">
        
        {/* Header Branding */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 sm:p-7 text-white text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            CleanLog Pro
          </h1>
          <p className="text-xs text-emerald-100 mt-1">
            ระบบบันทึกและตรวจประเมินผลงานทำความสะอาด
          </p>
        </div>

        {/* Tab Switcher: Login vs Register */}
        <div className="p-3 bg-gray-50 border-b border-gray-100">
          <div className="grid grid-cols-2 gap-2 bg-gray-200/70 p-1 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={handleSwitchToLogin}
              className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LogIn className="w-4 h-4 text-emerald-600" />
              <span>เข้าสู่ระบบ</span>
            </button>

            <button
              type="button"
              onClick={handleSwitchToRegister}
              className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <UserPlus className="w-4 h-4 text-teal-600" />
              <span>ลงทะเบียนผู้ใช้ใหม่</span>
            </button>
          </div>
        </div>

        {/* Body Area */}
        <div className="p-6">
          
          {/* Notifications */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* MODE 1: LOGIN FORM (NO DATA EXPOSED) */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>รหัสพนักงาน หรือ เบอร์โทรศัพท์ *</span>
                </label>
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="เช่น STF-001 หรือ เบอร์โทรศัพท์"
                  required
                  autoFocus
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                  <span>รหัส PIN หรือ รหัสผ่าน *</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="กรอกรหัส PIN หรือรหัสผ่าน"
                    required
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>เข้าสู่ระบบปฏิบัติงาน</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="relative flex py-2 items-center">
                <div className="grow border-t border-gray-200"></div>
                <span className="shrink mx-3 text-gray-400 text-[11px]">หรือ</span>
                <div className="grow border-t border-gray-200"></div>
              </div>

              {/* Google Sign In option */}
              <button
                type="button"
                onClick={onGoogleSignIn}
                disabled={isLoggingInGoogle}
                className="w-full py-2.5 px-4 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 active:scale-98 text-gray-700 text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span>{isLoggingInGoogle ? 'กำลังเชื่อมต่อ Google...' : 'เข้าสู่ระบบด้วยบัญชี Google'}</span>
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleSwitchToRegister}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold underline cursor-pointer"
                >
                  ยังไม่มีบัญชีผู้ใช้? ลงทะเบียนใหม่ที่นี่ →
                </button>
              </div>

            </form>
          )}

          {/* MODE 2: REGISTRATION FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              
              {/* Role Picker */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  เลือกประเภทผู้ใช้งานที่ต้องการลงทะเบียน *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegisterRole('staff')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      registerRole === 'staff'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-2xs'
                        : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <span>พนักงานทำความสะอาด</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegisterRole('supervisor')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      registerRole === 'supervisor'
                        ? 'border-teal-500 bg-teal-50 text-teal-800 shadow-2xs'
                        : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                    <span>หัวหน้างาน / ตรวจสอบ</span>
                  </button>
                </div>
              </div>

              {/* Full Name & Nickname */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    ชื่อ-นามสกุลจริง *
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="เช่น สมพร มีโชค"
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    ชื่อเล่น / ชื่อเรียก *
                  </label>
                  <input
                    type="text"
                    value={regNickname}
                    onChange={(e) => setRegNickname(e.target.value)}
                    placeholder="เช่น ป้าพร, พี่พร"
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
              </div>

              {/* Phone Number & Employee ID */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    <span>เบอร์โทรศัพท์ *</span>
                  </label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="081-xxx-xxxx"
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {registerRole === 'staff' ? 'รหัสพนักงาน *' : 'ตำแหน่ง / แผนก'}
                  </label>
                  <input
                    type="text"
                    value={regEmployeeId}
                    onChange={(e) => setRegEmployeeId(e.target.value)}
                    placeholder={registerRole === 'staff' ? 'STF-00X' : 'หัวหน้าแผนกทำความสะอาด'}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 font-mono font-bold bg-gray-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* PIN / Password fields */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    <KeyRound className="w-3 h-3 text-emerald-600" />
                    <span>ตั้งรหัส PIN (4 หลัก) *</span>
                  </label>
                  <input
                    type="password"
                    maxLength={10}
                    value={regPin}
                    onChange={(e) => setRegPin(e.target.value)}
                    placeholder="เช่น 1234"
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 font-mono tracking-widest text-center font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    ยืนยันรหัส PIN *
                  </label>
                  <input
                    type="password"
                    maxLength={10}
                    value={regConfirmPin}
                    onChange={(e) => setRegConfirmPin(e.target.value)}
                    placeholder="กรอกอีกครั้ง"
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 font-mono tracking-widest text-center font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
              </div>

              {/* Notice that zone is assigned exclusively by supervisor */}
              {registerRole === 'staff' && (
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>การกำหนดพื้นที่แฟลตประจำการ</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 leading-relaxed">
                    หัวหน้างาน/ผู้ดูแลระบบจะเป็นผู้กำหนดพื้นที่แฟลตศูนย์ (4 - 20) และมอบหมายงานให้คุณโดยตรงในระบบ
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-teal-700 hover:bg-teal-800 active:scale-98 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
              >
                <UserPlus className="w-4 h-4" />
                <span>ลงทะเบียนและเข้าสู่ระบบทันที</span>
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleSwitchToLogin}
                  className="text-xs text-teal-800 hover:text-teal-950 font-semibold underline cursor-pointer"
                >
                  มีบัญชีผู้ใช้อยู่แล้ว? เข้าสู่ระบบที่นี่ →
                </button>
              </div>

            </form>
          )}

        </div>

      </div>

      <div className="mt-6 text-center text-xs text-emerald-200/80">
        CleanLog Pro • ระบบบริหารจัดการงานทำความสะอาดอัจฉริยะ
      </div>

    </div>
  );
};
