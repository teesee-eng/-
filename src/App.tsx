import { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { User } from 'firebase/auth';
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  getAccessToken 
} from './services/firebase';
import { 
  TaskRecord, 
  AttendanceRecord, 
  IssueReport, 
  SupplyRequest, 
  SupplyItem, 
  SheetConfig, 
  CleaningStaff,
  AuthSession
} from './types';
import { 
  INITIAL_TASKS, 
  INITIAL_ATTENDANCE, 
  INITIAL_ISSUES, 
  INITIAL_STAFF 
} from './data/initialData';
import { 
  appendTaskRecords, 
  appendAttendanceRecords, 
  appendIssueReports 
} from './services/googleSheets';

import { Header } from './components/Header';
import { StaffView } from './components/StaffView';
import { SupervisorView } from './components/SupervisorView';
import { TaskLoggerModal } from './components/TaskLoggerModal';
import { AttendanceModal } from './components/AttendanceModal';
import { IssueReportModal } from './components/IssueReportModal';
import { GoogleSyncModal } from './components/GoogleSyncModal';
import { ConfirmModal } from './components/ConfirmModal';
import { LoginScreen } from './components/LoginScreen';
import { AddStaffModal } from './components/AddStaffModal';
import { AssignTaskModal } from './components/AssignTaskModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MyPerformanceModal } from './components/MyPerformanceModal';

export default function App() {
  // Authentication session state
  const [authSession, setAuthSession] = useState<AuthSession | null>(() => {
    const saved = localStorage.getItem('cleanlog_auth_session');
    return saved ? JSON.parse(saved) : null;
  });

  // Google user state
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // App mode & active staff
  const [currentMode, setCurrentMode] = useState<'staff' | 'supervisor'>(() => {
    return authSession?.role === 'supervisor' ? 'supervisor' : 'staff';
  });
  const [selectedStaffId, setSelectedStaffId] = useState<string>(() => {
    return authSession?.staffId || 'STF-001';
  });

  // Persistence State
  const [tasks, setTasks] = useState<TaskRecord[]>(() => {
    const saved = localStorage.getItem('cleanlog_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('cleanlog_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [issues, setIssues] = useState<IssueReport[]>(() => {
    const saved = localStorage.getItem('cleanlog_issues');
    return saved ? JSON.parse(saved) : INITIAL_ISSUES;
  });

  const [sheetConfig, setSheetConfig] = useState<SheetConfig | null>(() => {
    const saved = localStorage.getItem('cleanlog_sheet_config');
    return saved ? JSON.parse(saved) : null;
  });

  const [staffList, setStaffList] = useState<CleaningStaff[]>(() => {
    const saved = localStorage.getItem('cleanlog_staff_list');
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskRecord | null>(null);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false);
  const [isMyPerformanceModalOpen, setIsMyPerformanceModalOpen] = useState(false);

  // Confirmation Modal (Required by Workspace skill)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    affectedCount?: number;
    affectedItemsDescription?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Save session to localStorage
  useEffect(() => {
    if (authSession) {
      localStorage.setItem('cleanlog_auth_session', JSON.stringify(authSession));
    } else {
      localStorage.removeItem('cleanlog_auth_session');
    }
  }, [authSession]);

  // Save staff list to localStorage
  useEffect(() => {
    localStorage.setItem('cleanlog_staff_list', JSON.stringify(staffList));
  }, [staffList]);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('cleanlog_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('cleanlog_attendance', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem('cleanlog_issues', JSON.stringify(issues));
  }, [issues]);

  useEffect(() => {
    if (sheetConfig) {
      localStorage.setItem('cleanlog_sheet_config', JSON.stringify(sheetConfig));
    }
  }, [sheetConfig]);

  // Auth initialization
  useEffect(() => {
    const unsubscribe = initAuth(
      (authedUser) => {
        setUser(authedUser);
      },
      () => {
        // Not signed in or token expired
      }
    );
    return () => unsubscribe();
  }, []);

  // Quick Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Staff Login Handler
  const handleStaffLogin = (staff: CleaningStaff) => {
    const session: AuthSession = {
      id: staff.id,
      name: staff.name,
      nickname: staff.nickname,
      role: 'staff',
      avatar: staff.avatar,
      staffId: staff.id
    };
    setAuthSession(session);
    setSelectedStaffId(staff.id);
    setCurrentMode('staff');
    showToast(`เข้าสู่ระบบสำเร็จ: ${staff.name} (${staff.nickname})`);
  };

  // Supervisor Login Handler
  const handleSupervisorLogin = (supervisorName: string, isGoogle = false) => {
    const session: AuthSession = {
      id: 'SUP-001',
      name: supervisorName,
      role: 'supervisor',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      isGoogleAuth: isGoogle
    };
    setAuthSession(session);
    setCurrentMode('supervisor');
    showToast(`เข้าสู่ระบบในฐานะหัวหน้างาน: ${supervisorName}`);
  };

  // Google Login & Session Generator
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        const session: AuthSession = {
          id: result.user.uid,
          name: result.user.displayName || result.user.email || 'ผู้ดูแลระบบ',
          role: 'supervisor',
          avatar: result.user.photoURL || undefined,
          email: result.user.email || undefined,
          isGoogleAuth: true
        };
        setAuthSession(session);
        setCurrentMode('supervisor');
        showToast(`ยินดีต้อนรับ ${result.user.displayName || result.user.email}`);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOutSession = async () => {
    setAuthSession(null);
    if (user) {
      await logout();
      setUser(null);
    }
    showToast('ออกจากระบบเรียบร้อย');
  };

  // Save Task Record
  const handleSaveTask = (task: TaskRecord) => {
    setTasks(prev => {
      const idx = prev.findIndex(t => t.id === task.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = task;
        return next;
      }
      return [task, ...prev];
    });

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });
    } catch (_) {}

    showToast('บันทึกงานทำความสะอาดเรียบร้อยแล้ว');
  };

  // Add New Staff Member
  const handleAddStaff = (newStaff: CleaningStaff) => {
    setStaffList(prev => [...prev, newStaff]);
    showToast(`ลงทะเบียนพนักงาน ${newStaff.name} (${newStaff.nickname}) สำเร็จแล้ว`);
  };

  // Register Supervisor Account
  const handleRegisterSupervisor = (supervisor: { name: string; username: string; password?: string; phone?: string }) => {
    const saved = localStorage.getItem('cleanlog_supervisors');
    const existing = saved ? JSON.parse(saved) : [
      { username: 'admin', password: 'password123', name: 'คุณณัฐวุฒิ (หัวหน้าแผนก)' }
    ];
    existing.push(supervisor);
    localStorage.setItem('cleanlog_supervisors', JSON.stringify(existing));
    showToast(`ลงทะเบียนหัวหน้างานสำเร็จ: ${supervisor.name}`);
  };

  // Assign Task to Staff Member
  const handleAssignTask = (task: TaskRecord) => {
    setTasks(prev => [task, ...prev]);
    showToast(`มอบหมายงานให้ ${task.staffName} สำเร็จแล้ว`);
  };

  // Save Attendance Record
  const handleSaveAttendance = (record: AttendanceRecord) => {
    setAttendanceRecords(prev => {
      const idx = prev.findIndex(a => a.id === record.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = record;
        return next;
      }
      return [record, ...prev];
    });
    showToast('ลงเวลาเรียบร้อยแล้ว');
  };

  // Save Issue Report
  const handleSaveIssue = (issue: IssueReport) => {
    setIssues(prev => [issue, ...prev]);
    showToast('ส่งรายงานแจ้งซ่อมเรียบร้อยแล้ว');
  };

  // Supervisor Approval of Task
  const handleApproveTask = (taskId: string, rating: number, supervisor: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          supervisorChecked: true,
          supervisorRating: rating,
          supervisorName: supervisor,
          syncedToSheets: false
        };
      }
      return t;
    }));
    showToast(`ตรวจรับงานสำเร็จ ให้คะแนน ${rating} ดาว`);
  };

  // Update Issue Status
  const handleUpdateIssueStatus = (issueId: string, status: IssueReport['status']) => {
    setIssues(prev => prev.map(i => {
      if (i.id === issueId) {
        return { ...i, status, syncedToSheets: false };
      }
      return i;
    }));
    showToast('อัปเดตสถานะการซ่อมแล้ว');
  };

  // Sync to Google Sheets with mandatory User Confirmation Dialog
  const executeSync = async () => {
    if (!sheetConfig?.spreadsheetId) {
      setIsSheetModalOpen(true);
      return;
    }

    const token = await getAccessToken();
    if (!token) {
      handleGoogleLogin();
      return;
    }

    setIsSyncing(true);
    try {
      const unsyncedTasks = tasks.filter(t => !t.syncedToSheets);
      const unsyncedAttendance = attendanceRecords.filter(a => !a.syncedToSheets);
      const unsyncedIssues = issues.filter(i => !i.syncedToSheets);

      if (unsyncedTasks.length > 0) {
        await appendTaskRecords(sheetConfig.spreadsheetId, unsyncedTasks);
        setTasks(prev => prev.map(t => ({ ...t, syncedToSheets: true })));
      }

      if (unsyncedAttendance.length > 0) {
        await appendAttendanceRecords(sheetConfig.spreadsheetId, unsyncedAttendance);
        setAttendanceRecords(prev => prev.map(a => ({ ...a, syncedToSheets: true })));
      }

      if (unsyncedIssues.length > 0) {
        await appendIssueReports(sheetConfig.spreadsheetId, unsyncedIssues);
        setIssues(prev => prev.map(i => ({ ...i, syncedToSheets: true })));
      }

      setSheetConfig(prev => prev ? { ...prev, lastSyncedAt: new Date().toISOString() } : null);
      showToast('ซิงค์ข้อมูลไปยัง Google Sheets สำเร็จเรียบร้อย!');
    } catch (err: any) {
      console.error(err);
      alert(`การซิงค์ข้อมูลล้มเหลว: ${err.message || 'โปรดตรวจสอบการเชื่อมต่อและสิทธิ์เข้าถึง'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Prompt Confirmation before performing Workspace mutation
  const promptSyncConfirmation = useCallback(() => {
    if (!sheetConfig?.spreadsheetId) {
      setIsSheetModalOpen(true);
      return;
    }

    const unsyncedTasks = tasks.filter(t => !t.syncedToSheets);
    const unsyncedAttendance = attendanceRecords.filter(a => !a.syncedToSheets);
    const unsyncedIssues = issues.filter(i => !i.syncedToSheets);
    const total = unsyncedTasks.length + unsyncedAttendance.length + unsyncedIssues.length;

    if (total === 0) {
      showToast('ข้อมูลทั้งหมดในระบบตรงกับ Google Sheets เรียบร้อยแล้ว');
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'ยืนยันการส่งข้อมูลไปยัง Google Sheets',
      message: `ระบบจะเขียนข้อมูลรายการงานที่บันทึกไว้ไปยังสเปรดชีต "${sheetConfig.spreadsheetTitle}" บน Google Drive ของคุณ`,
      affectedCount: total,
      affectedItemsDescription: `ประกอบด้วย: บันทึกงาน (${unsyncedTasks.length}), ลงเวลา (${unsyncedAttendance.length}), แจ้งซ่อม (${unsyncedIssues.length})`,
      onConfirm: () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        executeSync();
      }
    });
  }, [sheetConfig, tasks, attendanceRecords, issues]);

  const pendingSyncCount = tasks.filter(t => !t.syncedToSheets).length +
    attendanceRecords.filter(a => !a.syncedToSheets).length +
    issues.filter(i => !i.syncedToSheets).length;

  // If not logged in, render the login screen gate
  if (!authSession) {
    return (
      <LoginScreen
        staffList={staffList}
        onStaffLogin={handleStaffLogin}
        onSupervisorLogin={handleSupervisorLogin}
        onRegisterStaff={handleAddStaff}
        onRegisterSupervisor={handleRegisterSupervisor}
        onGoogleSignIn={handleGoogleLogin}
        isLoggingInGoogle={isLoggingIn}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans flex flex-col">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-gray-900/90 text-white px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold shadow-xl border border-gray-700/50 backdrop-blur-md animate-in slide-in-from-top duration-200">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <Header
        currentMode={currentMode}
        onModeChange={setCurrentMode}
        authSession={authSession}
        onSignOutSession={handleSignOutSession}
        user={user}
        onLoginGoogle={handleGoogleLogin}
        isLoggingIn={isLoggingIn}
        sheetConfig={sheetConfig}
        onOpenSheetModal={() => setIsSheetModalOpen(true)}
        onQuickSync={promptSyncConfirmation}
        isSyncing={isSyncing}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 md:pb-8">
        
        {/* Banner if Google Sheets not yet connected */}
        {!sheetConfig?.spreadsheetId && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                Sheets
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">
                  เชื่อมต่อ Google Sheets เพื่อซิงค์และจัดเก็บข้อมูลออนไลน์อัตโนมัติ
                </h3>
                <p className="text-xs text-gray-600">
                  ระบบบันทึกงานสามารถสร้างไฟล์ Google Spreadsheet สำหรับองค์กรของคุณใน 1 คลิก
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsSheetModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all whitespace-nowrap self-start sm:self-center"
            >
              ตั้งค่า Google Sheets
            </button>
          </div>
        )}

        {/* View Switch */}
        {currentMode === 'staff' ? (
          <StaffView
            staffList={staffList}
            selectedStaffId={selectedStaffId}
            onSelectStaffId={setSelectedStaffId}
            tasks={tasks}
            attendanceRecords={attendanceRecords}
            onOpenTaskModal={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
            onOpenAttendanceModal={() => setIsAttendanceModalOpen(true)}
            onOpenIssueModal={() => setIsIssueModalOpen(true)}
            onEditTask={(task) => {
              setEditingTask(task);
              setIsTaskModalOpen(true);
            }}
          />
        ) : (
          <SupervisorView
            tasks={tasks}
            attendanceRecords={attendanceRecords}
            issues={issues}
            staffList={staffList}
            sheetConfig={sheetConfig}
            onOpenSheetModal={() => setIsSheetModalOpen(true)}
            onSyncAll={promptSyncConfirmation}
            isSyncing={isSyncing}
            onApproveTask={handleApproveTask}
            onUpdateIssueStatus={handleUpdateIssueStatus}
            onOpenAddStaffModal={() => setIsAddStaffModalOpen(true)}
            onOpenAssignTaskModal={() => setIsAssignTaskModalOpen(true)}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-gray-200 bg-white text-center text-xs text-gray-500 mb-16 md:mb-0">
        <p>CleanLog Pro • ระบบบันทึกการทำงานและตรวจประเมินพนักงานทำความสะอาด</p>
        <p className="mt-1 text-[11px] text-gray-400">
          เชื่อมต่อกับ Google Workspace (Google Sheets & Google Drive) อย่างปลอดภัย
        </p>
      </footer>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <MobileBottomNav
        currentMode={currentMode}
        onModeChange={(mode) => {
          if (mode === 'supervisor' && authSession?.role === 'staff') {
            alert('โหมดหัวหน้างานสงวนสิทธิ์เฉพาะหัวหน้างานหรือผู้ดูแลระบบ กรุณาเข้าสู่ระบบด้วยบัญชีหัวหน้างาน');
            return;
          }
          setCurrentMode(mode);
        }}
        authSession={authSession}
        onOpenTaskModal={() => {
          setEditingTask(null);
          setIsTaskModalOpen(true);
        }}
        onOpenAttendanceModal={() => setIsAttendanceModalOpen(true)}
        onOpenIssueModal={() => setIsIssueModalOpen(true)}
        onOpenMyPerformance={() => setIsMyPerformanceModalOpen(true)}
        pendingIssueCount={issues.filter(i => i.status !== 'resolved').length}
      />

      {/* Modals */}
      <TaskLoggerModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        staffList={staffList}
        selectedStaffId={selectedStaffId}
        onSaveTask={handleSaveTask}
        editingTask={editingTask}
      />

      <AddStaffModal
        isOpen={isAddStaffModalOpen}
        onClose={() => setIsAddStaffModalOpen(false)}
        existingStaffList={staffList}
        onAddStaff={handleAddStaff}
      />

      <AssignTaskModal
        isOpen={isAssignTaskModalOpen}
        onClose={() => setIsAssignTaskModalOpen(false)}
        staffList={staffList}
        supervisorName={authSession?.name || 'คุณณัฐวุฒิ (หัวหน้าแผนก)'}
        onAssignTask={handleAssignTask}
      />

      <AttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        staffList={staffList}
        selectedStaffId={selectedStaffId}
        onSaveAttendance={handleSaveAttendance}
        todayRecords={attendanceRecords}
      />

      <IssueReportModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        staffList={staffList}
        selectedStaffId={selectedStaffId}
        onSaveIssue={handleSaveIssue}
      />

      <GoogleSyncModal
        isOpen={isSheetModalOpen}
        onClose={() => setIsSheetModalOpen(false)}
        user={user}
        onLogin={handleGoogleLogin}
        sheetConfig={sheetConfig}
        onSaveSheetConfig={(cfg) => {
          setSheetConfig(cfg);
          showToast(`เชื่อมต่อชีต "${cfg.spreadsheetTitle}" สำเร็จ`);
        }}
        onTriggerSync={promptSyncConfirmation}
        isSyncing={isSyncing}
        pendingSyncCount={pendingSyncCount}
      />

      {/* User Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        affectedCount={confirmModal.affectedCount}
        affectedItemsDescription={confirmModal.affectedItemsDescription}
        confirmLabel="ยืนยันการซิงค์"
        cancelLabel="ยกเลิก"
        isLoading={isSyncing}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

      {/* My Performance Modal (For mobile bottom nav & global trigger) */}
      <MyPerformanceModal
        isOpen={isMyPerformanceModalOpen}
        onClose={() => setIsMyPerformanceModalOpen(false)}
        staff={staffList.find(s => s.id === selectedStaffId) || staffList[0]}
        tasks={tasks}
        attendanceRecords={attendanceRecords}
      />

    </div>
  );
}
