import React from 'react';
import { 
  Sparkles, 
  TableProperties, 
  UserCheck, 
  ShieldCheck, 
  ExternalLink,
  LogOut,
  CheckCircle2,
  RefreshCw,
  User as UserIcon,
  Lock
} from 'lucide-react';
import { User } from 'firebase/auth';
import { SheetConfig, AuthSession } from '../types';

interface HeaderProps {
  currentMode: 'staff' | 'supervisor';
  onModeChange: (mode: 'staff' | 'supervisor') => void;
  authSession: AuthSession | null;
  onSignOutSession: () => void;
  user: User | null;
  onLoginGoogle: () => void;
  isLoggingIn: boolean;
  sheetConfig: SheetConfig | null;
  onOpenSheetModal: () => void;
  onQuickSync: () => void;
  isSyncing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onModeChange,
  authSession,
  onSignOutSession,
  user,
  onLoginGoogle,
  isLoggingIn,
  sheetConfig,
  onOpenSheetModal,
  onQuickSync,
  isSyncing
}) => {
  const isStaffOnly = authSession?.role === 'staff';

  return (
    <header className="bg-white border-b border-emerald-100 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-3">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-200 flex-shrink-0">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-gray-900 text-sm sm:text-base tracking-tight leading-tight">
                  ระบบบันทึกงานทำความสะอาด
                </h1>
                <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  CleanLog Pro
                </span>
              </div>
              <p className="text-[11px] text-gray-500 hidden sm:block">
                ระบบจัดการตรวจเช็คพื้นที่ บันทึกงาน และซิงค์ Google Sheets
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs (Protected based on Role) */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs sm:text-sm font-medium">
            <button
              onClick={() => onModeChange('staff')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                currentMode === 'staff'
                  ? 'bg-white text-emerald-700 font-semibold shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>พนักงาน</span>
            </button>

            {isStaffOnly ? (
              <button
                onClick={() => alert('โหมดหัวหน้างานสงวนสิทธิ์เฉพาะหัวหน้างานหรือผู้ดูแลระบบ กรุณาเข้าสู่ระบบด้วยบัญชีหัวหน้างาน')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition-all opacity-70"
                title="ต้องใช้สิทธิ์หัวหน้างาน"
              >
                <Lock className="w-3.5 h-3.5 text-gray-400" />
                <span className="hidden sm:inline">หัวหน้างาน</span>
              </button>
            ) : (
              <button
                onClick={() => onModeChange('supervisor')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  currentMode === 'supervisor'
                    ? 'bg-white text-teal-800 font-semibold shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>หัวหน้างาน</span>
              </button>
            )}
          </div>

          {/* User Session & Google Sheets Controls */}
          <div className="flex items-center gap-2">
            
            {/* Google Sheets Status */}
            {user && sheetConfig?.spreadsheetId ? (
              <div className="hidden xl:flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-2.5 py-1.5 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="truncate max-w-[120px] font-medium" title={sheetConfig.spreadsheetTitle}>
                  {sheetConfig.spreadsheetTitle}
                </span>
                <a
                  href={sheetConfig.spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-emerald-700 hover:text-emerald-900"
                  title="เปิดใน Google Sheets"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : null}

            {/* Quick Sync Button */}
            {user && sheetConfig?.spreadsheetId && (
              <button
                onClick={onQuickSync}
                disabled={isSyncing}
                title="ซิงค์ข้อมูลกับ Google Sheets ทันที"
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium shadow-xs transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isSyncing ? 'กำลังซิงค์...' : 'ซิงค์ชีต'}</span>
              </button>
            )}

            {/* Sheets Settings Button (for supervisor) */}
            {!isStaffOnly && (
              <button
                onClick={onOpenSheetModal}
                className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                title="ตั้งค่า Google Sheets"
              >
                <TableProperties className="w-4 h-4 text-emerald-600" />
                <span className="hidden md:inline">จัดการชีต</span>
              </button>
            )}

            {/* Active User Session Pill */}
            {authSession && (
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                <div className="flex items-center gap-2">
                  {authSession.avatar ? (
                    <img 
                      src={authSession.avatar} 
                      alt={authSession.name} 
                      className="w-8 h-8 rounded-full object-cover border-2 border-emerald-400/80 shadow-2xs" 
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                      {authSession.name.charAt(0)}
                    </div>
                  )}

                  <div className="hidden sm:block text-left text-xs leading-tight">
                    <div className="font-bold text-gray-900 truncate max-w-[120px]">
                      {authSession.nickname || authSession.name}
                    </div>
                    <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                      authSession.role === 'staff' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-teal-100 text-teal-800'
                    }`}>
                      {authSession.role === 'staff' ? 'พนักงาน' : 'หัวหน้างาน'}
                    </span>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={onSignOutSession}
                  title="ออกจากระบบ"
                  className="flex items-center gap-1 p-1.5 sm:px-2 sm:py-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all text-xs font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline">ออกจากระบบ</span>
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </header>
  );
};
