import React, { useState } from 'react';
import { 
  CheckCircle, 
  CheckSquare,
  Clock, 
  AlertTriangle, 
  Users, 
  Filter, 
  ExternalLink, 
  RefreshCw, 
  Star, 
  Download, 
  Search,
  CheckCircle2,
  Calendar,
  Layers,
  FileSpreadsheet,
  Check,
  BarChart3,
  UserPlus,
  ClipboardList,
  TrendingUp,
  LayoutDashboard
} from 'lucide-react';
import { 
  TaskRecord, 
  AttendanceRecord, 
  IssueReport, 
  CleaningStaff, 
  SheetConfig, 
  CleaningZone 
} from '../types';
import { ZONES } from '../data/initialData';
import { MonthlyPerformanceChart } from './MonthlyPerformanceChart';
import { StaffSummaryDashboard } from './StaffSummaryDashboard';

interface SupervisorViewProps {
  tasks: TaskRecord[];
  attendanceRecords: AttendanceRecord[];
  issues: IssueReport[];
  staffList: CleaningStaff[];
  sheetConfig: SheetConfig | null;
  onOpenSheetModal: () => void;
  onSyncAll: () => void;
  isSyncing: boolean;
  onApproveTask: (taskId: string, rating: number, supervisorName: string) => void;
  onUpdateIssueStatus: (issueId: string, status: IssueReport['status']) => void;
  onOpenAddStaffModal: () => void;
  onOpenAssignTaskModal: () => void;
}

export const SupervisorView: React.FC<SupervisorViewProps> = ({
  tasks,
  attendanceRecords,
  issues,
  staffList,
  sheetConfig,
  onOpenSheetModal,
  onSyncAll,
  isSyncing,
  onApproveTask,
  onUpdateIssueStatus,
  onOpenAddStaffModal,
  onOpenAssignTaskModal
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'monthly' | 'attendance' | 'issues' | 'staff'>('dashboard');
  
  // Filters
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedStaff, setSelectedStaff] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Supervisor approval state
  const [supervisorName, setSupervisorName] = useState('คุณณัฐวุฒิ (หัวหน้าแผนก)');

  // Today calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => t.date === todayStr);
  const completedToday = todayTasks.filter(t => t.status === 'completed').length;
  const todayAttendance = attendanceRecords.filter(a => a.date === todayStr);
  const openIssues = issues.filter(i => i.status !== 'resolved');
  const unsyncedCount = tasks.filter(t => !t.syncedToSheets).length +
    attendanceRecords.filter(a => !a.syncedToSheets).length +
    issues.filter(i => !i.syncedToSheets).length;

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    if (selectedZone !== 'all' && t.zone !== selectedZone) return false;
    if (selectedStaff !== 'all' && t.staffId !== selectedStaff) return false;
    if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.staffName.toLowerCase().includes(q) ||
        t.areaDetail.toLowerCase().includes(q) ||
        (t.notes && t.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['รหัสงาน', 'วันที่', 'เวลาเริ่ม', 'เวลาเสร็จ', 'พนักงาน', 'โซน', 'พื้นที่', 'สถานะ', 'หมายเหตุ'];
    const rows = filteredTasks.map(t => [
      t.id,
      t.date,
      t.startTime,
      t.endTime,
      `"${t.staffName}"`,
      t.zone,
      `"${t.areaDetail}"`,
      t.status,
      `"${t.notes || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cleaning_tasks_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* KPI 1: Tasks */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">ผลงานวันนี้</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">{completedToday}</span>
            <span className="text-xs text-gray-500">/ {todayTasks.length} งาน</span>
          </div>
          <div className="mt-2 text-xs text-emerald-700 font-medium flex items-center justify-between">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>สำเร็จ {todayTasks.length > 0 ? Math.round((completedToday / todayTasks.length) * 100) : 0}%</span>
            </span>
            <button
              onClick={() => setActiveTab('monthly')}
              className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold underline cursor-pointer"
            >
              แผนภูมิรายเดือน →
            </button>
          </div>
        </div>

        {/* KPI 2: Active Staff */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">พนักงานเข้ากะ</span>
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">{todayAttendance.length}</span>
            <span className="text-xs text-gray-500">/ {staffList.length} คน</span>
          </div>
          <div className="mt-2 text-xs text-teal-700 font-medium">
            พร้อมปฏิบัติงานครบตามพื้นที่
          </div>
        </div>

        {/* KPI 3: Open Issues */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">ปัญหาค้างแก้ไข</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              openIssues.length > 0 ? 'bg-rose-100 text-rose-600' : 'bg-gray-100 text-gray-500'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">{openIssues.length}</span>
            <span className="text-xs text-gray-500">จุดแจ้งซ่อม</span>
          </div>
          <div className={`mt-2 text-xs font-medium ${openIssues.length > 0 ? 'text-rose-600' : 'text-gray-500'}`}>
            {openIssues.filter(i => i.urgency === 'urgent' || i.urgency === 'high').length} รายการเร่งด่วน
          </div>
        </div>

        {/* KPI 4: Google Sheets Status */}
        <div className="bg-emerald-50/70 p-4 sm:p-5 rounded-3xl border border-emerald-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900">Google Sheets</span>
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="mt-2 text-xs text-emerald-800">
              {sheetConfig?.spreadsheetId ? (
                <div>
                  <span className="font-semibold block truncate" title={sheetConfig.spreadsheetTitle}>
                    {sheetConfig.spreadsheetTitle}
                  </span>
                  <span className="text-[11px] text-emerald-600">
                    {unsyncedCount === 0 ? 'ข้อมูลซิงค์ตรงกันแล้ว' : `รอซิงค์ ${unsyncedCount} รายการ`}
                  </span>
                </div>
              ) : (
                <span className="text-amber-800">ยังไม่ได้เชื่อมต่อชีต</span>
              )}
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            {sheetConfig?.spreadsheetId ? (
              <button
                onClick={onSyncAll}
                disabled={isSyncing}
                className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1 shadow-2xs transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'กำลังส่งข้อมูล...' : 'ซิงค์ไปชีต'}</span>
              </button>
            ) : (
              <button
                onClick={onOpenSheetModal}
                className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1 shadow-2xs transition-all"
              >
                <span>เชื่อมต่อ Google Sheets</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Tabs */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        
        <div className="flex border-b border-gray-200 overflow-x-auto bg-gray-50/50 p-2 gap-1 text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-white text-emerald-800 shadow-xs font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>แดชบอร์ดสรุปงาน</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'tasks'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-emerald-600" />
            <span>บันทึกงาน ({tasks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('monthly')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'monthly'
                ? 'bg-white text-emerald-800 shadow-xs font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span>สรุปผลงานรายเดือน (Charts)</span>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'attendance'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Clock className="w-4 h-4 text-teal-600" />
            <span>การลงเวลา ({attendanceRecords.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('issues')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'issues'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>แจ้งซ่อม/ปัญหา ({issues.length})</span>
            {openIssues.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('staff')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'staff'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-4 h-4 text-gray-600" />
            <span>พนักงาน ({staffList.length})</span>
          </button>
        </div>

        {/* Tab 0: Staff Summary Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="p-4 sm:p-6">
            <StaffSummaryDashboard
              tasks={tasks}
              attendanceRecords={attendanceRecords}
              staffList={staffList}
              issues={issues}
              onSelectStaffTasks={(staffId) => {
                setSelectedStaff(staffId);
                setActiveTab('tasks');
              }}
              onOpenAssignTaskModal={onOpenAssignTaskModal}
            />
          </div>
        )}

        {/* Tab 1: Tasks Log */}
        {activeTab === 'tasks' && (
          <div className="p-4 sm:p-6 space-y-4">
            
            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-200 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="ค้นหาตามชื่อ, พื้นที่, หมายเหตุ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs w-48 sm:w-60 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-700"
                >
                  <option value="all">ทุกโซน</option>
                  {ZONES.map(z => (
                    <option key={z.id} value={z.id}>{z.name}</option>
                  ))}
                </select>

                <select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  className="bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-700"
                >
                  <option value="all">ทุกคน</option>
                  {staffList.map(s => (
                    <option key={s.id} value={s.id}>{s.nickname} ({s.name})</option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-700"
                >
                  <option value="all">ทุกสถานะ</option>
                  <option value="completed">เสร็จสิ้น</option>
                  <option value="in_progress">กำลังทำ</option>
                  <option value="pending">รอดำเนินการ</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenAssignTaskModal}
                  className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 active:scale-98 text-white rounded-lg font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>+ มอบหมายงาน</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 rounded-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
              </div>
            </div>

            {/* Supervisor Inspector Name for Sign-off */}
            <div className="flex items-center gap-2 text-xs bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200">
              <span className="font-semibold text-emerald-900">ชื่อผู้ตรวจงาน (Supervisor):</span>
              <input
                type="text"
                value={supervisorName}
                onChange={(e) => setSupervisorName(e.target.value)}
                className="bg-white px-2 py-1 rounded border border-emerald-300 text-xs w-60 text-gray-800"
              />
              <span className="text-gray-500 text-[11px] hidden sm:inline">
                (ชื่อนี้จะบันทึกพร้อมคะแนนดาวเมื่อกดตรวจงาน)
              </span>
            </div>

            {/* Tasks Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="p-3">วันที่ / เวลา</th>
                    <th className="p-3">พนักงาน</th>
                    <th className="p-3">โซนและพื้นที่</th>
                    <th className="p-3">เช็คลิสต์</th>
                    <th className="p-3">รูปภาพ</th>
                    <th className="p-3">สถานะ</th>
                    <th className="p-3 text-center">ตรวจรับงาน (คะแนน)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-400">
                        ไม่พบรายการงานที่ตรงกับเงื่อนไข
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map(task => {
                      const zone = ZONES.find(z => z.id === task.zone);
                      const doneCount = task.checklist.filter(c => c.completed).length;
                      return (
                        <tr key={task.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="p-3 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{task.date}</div>
                            <div className="text-gray-500 text-[11px]">{task.startTime} - {task.endTime} น.</div>
                          </td>
                          <td className="p-3 whitespace-nowrap font-medium text-gray-800">
                            {task.staffName}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-gray-900">{task.areaDetail}</span>
                              {task.priority === 'urgent' && (
                                <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.2 rounded-full">
                                  🔴 ด่วนที่สุด
                                </span>
                              )}
                              {task.priority === 'high' && (
                                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-full">
                                  🟡 ด่วน
                                </span>
                              )}
                              {task.assignedBy && (
                                <span className="text-[10px] bg-teal-50 text-teal-700 border border-teal-200 px-1.5 py-0.2 rounded font-medium">
                                  มอบหมายโดย {task.assignedBy.split(' ')[0]}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-gray-500">{zone?.name}</div>
                            {task.notes && (
                              <div className="text-[11px] text-gray-600 italic mt-0.5 line-clamp-1" title={task.notes}>
                                "{task.notes}"
                              </div>
                            )}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className="font-semibold text-emerald-700">
                              {doneCount}/{task.checklist.length}
                            </span>
                            <span className="text-gray-400 text-[11px] ml-1">ข้อ</span>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              {task.beforePhoto && (
                                <img src={task.beforePhoto} alt="B" className="w-7 h-7 rounded object-cover border border-gray-200" title="ก่อนทำ" />
                              )}
                              {task.afterPhoto && (
                                <img src={task.afterPhoto} alt="A" className="w-7 h-7 rounded object-cover border border-emerald-300" title="หลังทำเสร็จ" />
                              )}
                              {!task.beforePhoto && !task.afterPhoto && (
                                <span className="text-gray-400 text-[11px]">-</span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              task.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : task.status === 'in_progress'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {task.status === 'completed' ? 'เสร็จสิ้น' : task.status === 'in_progress' ? 'กำลังทำ' : 'รอดำเนินการ'}
                            </span>
                          </td>
                          <td className="p-3 whitespace-nowrap text-center">
                            {task.supervisorChecked ? (
                              <div className="inline-flex items-center gap-1 bg-teal-50 text-teal-800 px-2 py-1 rounded-lg border border-teal-200">
                                <span className="font-bold">{task.supervisorRating}</span>
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <span className="text-[10px] text-gray-500">โดย {task.supervisorName?.split(' ')[0]}</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-1">
                                {[5, 4, 3].map(rating => (
                                  <button
                                    key={rating}
                                    onClick={() => onApproveTask(task.id, rating, supervisorName)}
                                    title={`ให้ ${rating} ดาวและตรวจรับงาน`}
                                    className="px-2 py-1 rounded-lg bg-gray-100 hover:bg-emerald-100 hover:text-emerald-800 font-bold text-[11px] transition-colors flex items-center gap-0.5"
                                  >
                                    <span>{rating}</span>
                                    <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                                  </button>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* Tab: Monthly Performance Chart */}
        {activeTab === 'monthly' && (
          <div className="p-4 sm:p-6">
            <MonthlyPerformanceChart
              tasks={tasks}
              attendanceRecords={attendanceRecords}
              staffList={staffList}
            />
          </div>
        )}

        {/* Tab 2: Attendance Log */}
        {activeTab === 'attendance' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-sm">
                ตารางเวลาเข้า-ออกงานของพนักงานทั้งหมด
              </h3>
              <span className="text-xs text-gray-500">
                รวมทั้งหมด {attendanceRecords.length} รายการ
              </span>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="p-3">วันที่</th>
                    <th className="p-3">พนักงาน</th>
                    <th className="p-3">เวลาเข้า</th>
                    <th className="p-3">เวลาออก</th>
                    <th className="p-3">สถานะ</th>
                    <th className="p-3">หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {attendanceRecords.map(rec => (
                    <tr key={rec.id} className="hover:bg-gray-50">
                      <td className="p-3 font-medium text-gray-900">{rec.date}</td>
                      <td className="p-3 font-semibold text-gray-800">{rec.staffName}</td>
                      <td className="p-3 font-mono font-medium text-emerald-700">{rec.clockInTime} น.</td>
                      <td className="p-3 font-mono text-gray-600">{rec.clockOutTime ? `${rec.clockOutTime} น.` : '-'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          rec.status === 'present' ? 'bg-emerald-100 text-emerald-800' :
                          rec.status === 'late' ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'
                        }`}>
                          {rec.status === 'present' ? 'ตรงเวลา' : rec.status === 'late' ? 'มาสาย' : 'ครบกะ'}
                        </span>
                      </td>
                      <td className="p-3 text-gray-500">{rec.note || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Issues / Maintenance */}
        {activeTab === 'issues' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-sm">
                รายการแจ้งซ่อมและรายงานเหตุฉุกเฉิน
              </h3>
              <span className="text-xs text-rose-600 font-semibold">
                ค้างซ่อม {openIssues.length} รายการ
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {issues.map(iss => {
                const zone = ZONES.find(z => z.id === iss.zone);
                return (
                  <div 
                    key={iss.id}
                    className={`p-4 rounded-2xl border transition-all shadow-xs ${
                      iss.status === 'resolved' 
                        ? 'border-gray-200 bg-gray-50/60 opacity-70' 
                        : iss.urgency === 'urgent' 
                        ? 'border-rose-400 bg-rose-50/40' 
                        : 'border-amber-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          iss.urgency === 'urgent' ? 'bg-rose-600 text-white animate-pulse' :
                          iss.urgency === 'high' ? 'bg-rose-100 text-rose-800' :
                          iss.urgency === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {iss.urgency === 'urgent' ? 'ฉุกเฉินมาก' : iss.urgency === 'high' ? 'เร่งด่วน' : 'ปานกลาง'}
                        </span>
                        <span className="text-xs text-gray-500">{iss.date} {iss.time} น.</span>
                      </div>

                      <select
                        value={iss.status}
                        onChange={(e) => onUpdateIssueStatus(iss.id, e.target.value as any)}
                        className="text-xs font-semibold px-2 py-1 rounded-lg border border-gray-300 bg-white text-gray-800"
                      >
                        <option value="open">รอการแก้ไข</option>
                        <option value="in_review">กำลังประสานช่าง</option>
                        <option value="resolved">ซ่อมเสร็จแล้ว</option>
                      </select>
                    </div>

                    <div className="mt-2 font-bold text-gray-900 text-sm">{iss.title}</div>
                    <div className="text-xs text-gray-600 mt-1">{iss.description}</div>

                    <div className="mt-3 pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between text-[11px] text-gray-500 gap-2">
                      <div>
                        <span>จุดเกิดเหตุ: </span>
                        <span className="font-semibold text-gray-700">{zone?.name} - {iss.location}</span>
                      </div>
                      <div>ผู้แจ้ง: {iss.reportedBy}</div>
                    </div>

                    {iss.photo && (
                      <div className="mt-3">
                        <img src={iss.photo} alt="Issue photo" className="w-full h-32 object-cover rounded-xl border border-gray-200" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 5: Staff Directory */}
        {activeTab === 'staff' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">
                  รายชื่อพนักงานทำความสะอาดและพื้นที่รับผิดชอบ
                </h3>
                <p className="text-xs text-gray-500">พนักงานทั้งหมด {staffList.length} คน</p>
              </div>

              <button
                type="button"
                onClick={onOpenAddStaffModal}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-200 transition-all self-start sm:self-center cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ เพิ่มพนักงานใหม่</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {staffList.map(stf => (
                <div key={stf.id} className="p-4 rounded-2xl border border-gray-200 bg-white flex items-start gap-3">
                  <img src={stf.avatar} alt={stf.name} className="w-14 h-14 rounded-2xl object-cover border border-emerald-200" />
                  <div className="flex-1 text-xs">
                    <div className="font-bold text-gray-900 text-sm">{stf.name} ({stf.nickname})</div>
                    <div className="text-gray-500 font-mono text-[11px]">รหัส {stf.id}</div>
                    <div className="text-gray-600 mt-1">โทร: {stf.phone}</div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {stf.assignedZones.map(z => (
                        <span key={z} className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-medium border border-emerald-200">
                          {ZONES.find(x => x.id === z)?.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
