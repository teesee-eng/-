import React from 'react';
import { 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  BarChart3, 
  LayoutDashboard, 
  ShieldCheck, 
  UserCheck, 
  Plus
} from 'lucide-react';
import { AuthSession } from '../types';

interface MobileBottomNavProps {
  currentMode: 'staff' | 'supervisor';
  onModeChange: (mode: 'staff' | 'supervisor') => void;
  authSession: AuthSession | null;
  onOpenTaskModal: () => void;
  onOpenAttendanceModal: () => void;
  onOpenIssueModal: () => void;
  onOpenMyPerformance?: () => void;
  pendingIssueCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentMode,
  onModeChange,
  authSession,
  onOpenTaskModal,
  onOpenAttendanceModal,
  onOpenIssueModal,
  onOpenMyPerformance,
  pendingIssueCount = 0
}) => {
  const isSupervisor = currentMode === 'supervisor';
  const isStaffOnly = authSession?.role === 'staff';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        
        {/* Button 1: Clock In/Out */}
        <button
          type="button"
          onClick={onOpenAttendanceModal}
          className="flex flex-col items-center justify-center flex-1 py-1.5 px-1 text-gray-600 hover:text-emerald-700 active:scale-95 transition-all cursor-pointer min-h-[48px]"
        >
          <div className="w-6 h-6 flex items-center justify-center rounded-lg text-emerald-700">
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium mt-0.5 leading-tight">ลงเวลา</span>
        </button>

        {/* Button 2: Report Issue */}
        <button
          type="button"
          onClick={onOpenIssueModal}
          className="flex flex-col items-center justify-center flex-1 py-1.5 px-1 text-gray-600 hover:text-rose-600 active:scale-95 transition-all cursor-pointer relative min-h-[48px]"
        >
          <div className="w-6 h-6 flex items-center justify-center rounded-lg text-rose-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium mt-0.5 leading-tight">แจ้งซ่อม</span>
          {pendingIssueCount > 0 && (
            <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          )}
        </button>

        {/* Center Primary Button: Fast Clean Log (+) */}
        <button
          type="button"
          onClick={onOpenTaskModal}
          className="flex flex-col items-center justify-center -mt-4 group active:scale-90 transition-transform cursor-pointer"
        >
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 border-3 border-white group-hover:scale-105 transition-transform">
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-bold text-emerald-900 mt-0.5">บันทึกงาน</span>
        </button>

        {/* Button 3: My Performance (or Supervisor Dashboard) */}
        {isSupervisor ? (
          <button
            type="button"
            onClick={() => onModeChange('staff')}
            className="flex flex-col items-center justify-center flex-1 py-1.5 px-1 text-gray-600 hover:text-teal-700 active:scale-95 transition-all cursor-pointer min-h-[48px]"
          >
            <div className="w-6 h-6 flex items-center justify-center rounded-lg text-teal-700">
              <UserCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium mt-0.5 leading-tight">หน้าพนักงาน</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onOpenMyPerformance && onOpenMyPerformance()}
            className="flex flex-col items-center justify-center flex-1 py-1.5 px-1 text-gray-600 hover:text-teal-700 active:scale-95 transition-all cursor-pointer min-h-[48px]"
          >
            <div className="w-6 h-6 flex items-center justify-center rounded-lg text-teal-700">
              <BarChart3 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium mt-0.5 leading-tight">สรุปของฉัน</span>
          </button>
        )}

        {/* Button 4: Role Switcher / Supervisor Mode */}
        {!isStaffOnly ? (
          <button
            type="button"
            onClick={() => onModeChange(isSupervisor ? 'staff' : 'supervisor')}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 active:scale-95 transition-all cursor-pointer min-h-[48px] ${
              isSupervisor ? 'text-teal-700 font-bold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="w-6 h-6 flex items-center justify-center rounded-lg">
              {isSupervisor ? <LayoutDashboard className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <span className="text-[10px] font-medium mt-0.5 leading-tight">
              {isSupervisor ? 'หัวหน้างาน' : 'หัวหน้า'}
            </span>
          </button>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 py-1.5 px-1 opacity-80 min-h-[48px]">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
              {authSession?.nickname?.charAt(0) || 'พ'}
            </div>
            <span className="text-[10px] text-gray-500 mt-0.5 truncate max-w-[45px]">
              {authSession?.nickname || 'ฉัน'}
            </span>
          </div>
        )}

      </div>
    </nav>
  );
};
