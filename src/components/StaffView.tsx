import React, { useState } from 'react';
import { 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  MapPin, 
  User, 
  CheckCircle2, 
  Sparkles,
  ChevronRight,
  Eye,
  CalendarDays,
  ClipboardList,
  Bell,
  ArrowRight,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { CleaningStaff, TaskRecord, AttendanceRecord, CleaningZone } from '../types';
import { ZONES } from '../data/initialData';
import { MyPerformanceModal } from './MyPerformanceModal';

interface StaffViewProps {
  staffList: CleaningStaff[];
  selectedStaffId: string;
  onSelectStaffId: (id: string) => void;
  tasks: TaskRecord[];
  attendanceRecords: AttendanceRecord[];
  onOpenTaskModal: () => void;
  onOpenAttendanceModal: () => void;
  onOpenIssueModal: () => void;
  onEditTask: (task: TaskRecord) => void;
}

export const StaffView: React.FC<StaffViewProps> = ({
  staffList,
  selectedStaffId,
  onSelectStaffId,
  tasks,
  attendanceRecords,
  onOpenTaskModal,
  onOpenAttendanceModal,
  onOpenIssueModal,
  onEditTask
}) => {
  const [isMyPerformanceOpen, setIsMyPerformanceOpen] = useState(false);
  const currentStaff = staffList.find(s => s.id === selectedStaffId) || staffList[0];
  const todayStr = new Date().toISOString().split('T')[0];

  // Tasks assigned by supervisor that are waiting to be done
  const assignedPendingTasks = tasks.filter(
    t => t.staffId === selectedStaffId && t.status !== 'completed' && t.assignedBy
  );

  // Today's tasks by this staff
  const staffTodayTasks = tasks.filter(
    t => t.staffId === selectedStaffId && t.date === todayStr
  );

  const completedCount = staffTodayTasks.filter(t => t.status === 'completed').length;

  // Staff today attendance
  const staffAttendance = attendanceRecords.find(
    a => a.staffId === selectedStaffId && a.date === todayStr
  );

  return (
    <div className="space-y-6">
      
      {/* Staff Identity Card */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 rounded-3xl p-5 sm:p-6 text-white shadow-lg shadow-emerald-900/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={currentStaff.avatar}
                alt={currentStaff.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-emerald-300/60 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 border-2 border-emerald-800 rounded-full flex items-center justify-center text-[10px] text-emerald-950 font-bold">
                ✓
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-emerald-200 font-semibold bg-emerald-900/40 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  พนักงานทำความสะอาด
                </span>
                <span className="text-xs text-emerald-200">
                  รหัส {currentStaff.id}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mt-1 text-white">
                {currentStaff.name} ({currentStaff.nickname})
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-100 mt-1">
                <span>โทร: {currentStaff.phone}</span>
                <span>•</span>
                <span>พื้นที่รับผิดชอบ: {currentStaff.assignedZones.map(z => ZONES.find(x => x.id === z)?.name).filter(Boolean).join(', ') || 'รอหัวหน้างานกำหนด'}</span>
              </div>
            </div>
          </div>

          {/* Switch Staff & Attendance Status */}
          <div className="flex flex-col sm:items-end gap-2 bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/15">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-emerald-100">สถานะเข้างานวันนี้:</span>
              {staffAttendance ? (
                <span className="bg-emerald-400 text-emerald-950 font-bold px-2.5 py-0.5 rounded-full text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>เข้างานแล้ว {staffAttendance.clockInTime} น.</span>
                </span>
              ) : (
                <span className="bg-amber-400 text-amber-950 font-bold px-2 py-0.5 rounded-full text-xs">
                  ยังไม่ได้ลงเวลาเข้างาน
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsMyPerformanceOpen(true)}
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border border-white/25 cursor-pointer shadow-2xs"
              >
                <BarChart3 className="w-3.5 h-3.5 text-emerald-200" />
                <span>สรุปผลงานของฉัน</span>
              </button>

              <div className="flex items-center gap-1">
                <label className="text-xs text-emerald-200">เปลี่ยนพนักงาน:</label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => onSelectStaffId(e.target.value)}
                  className="bg-emerald-900/80 text-white text-xs px-2.5 py-1 rounded-lg border border-emerald-400/30 focus:outline-hidden"
                >
                  {staffList.map(s => (
                    <option key={s.id} value={s.id} className="bg-gray-800 text-white">
                      {s.nickname} - {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats banner */}
        <div className="mt-5 pt-4 border-t border-emerald-600/50 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-emerald-900/40 py-2 rounded-xl border border-emerald-500/20">
            <div className="text-lg sm:text-xl font-extrabold text-white">{staffTodayTasks.length}</div>
            <div className="text-emerald-200 text-[11px]">งานที่บันทึกวันนี้</div>
          </div>
          <div className="bg-emerald-900/40 py-2 rounded-xl border border-emerald-500/20">
            <div className="text-lg sm:text-xl font-extrabold text-emerald-300">{completedCount}</div>
            <div className="text-emerald-200 text-[11px]">เสร็จสิ้นแล้ว</div>
          </div>
          <div className="bg-emerald-900/40 py-2 rounded-xl border border-emerald-500/20">
            <div className="text-lg sm:text-xl font-extrabold text-teal-200">
              {staffTodayTasks.length > 0 ? Math.round((completedCount / staffTodayTasks.length) * 100) : 0}%
            </div>
            <div className="text-emerald-200 text-[11px]">ความสำเร็จ</div>
          </div>
        </div>
      </div>

      {/* Primary Action Buttons (Big Touch Friendly Cards) */}
      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>เมนูการปฏิบัติงานด่วน (Quick Actions)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Action 1: Record Cleaning Task */}
          <button
            onClick={onOpenTaskModal}
            className="flex items-center sm:flex-col sm:items-start text-left p-4 sm:p-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white shadow-md shadow-emerald-600/20 transition-all group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mr-4 sm:mr-0 sm:mb-3 group-hover:scale-105 transition-transform">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-base leading-tight">บันทึกงานทำความสะอาด</div>
              <p className="text-xs text-emerald-100 mt-1">เช็คลิสต์ประจำแฟลต ถ่ายรูปผลงาน</p>
            </div>
            <ChevronRight className="w-5 h-5 text-emerald-200 sm:hidden" />
          </button>

          {/* Action 2: Attendance Clock In/Out */}
          <button
            onClick={onOpenAttendanceModal}
            className="flex items-center sm:flex-col sm:items-start text-left p-4 sm:p-5 rounded-2xl bg-white hover:bg-gray-50 active:scale-98 border border-gray-200 shadow-xs hover:border-emerald-300 transition-all group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mr-4 sm:mr-0 sm:mb-3 group-hover:scale-105 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-base text-gray-900 leading-tight">ลงเวลาเข้า-ออกงาน</div>
              <p className="text-xs text-gray-500 mt-1">
                {staffAttendance ? `เข้างานแล้ว (${staffAttendance.clockInTime} น.)` : 'บันทึกเวลาเริ่ม-จบการทำงาน'}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 sm:hidden" />
          </button>

          {/* Action 3: Report Issues */}
          <button
            onClick={onOpenIssueModal}
            className="flex items-center sm:flex-col sm:items-start text-left p-4 sm:p-5 rounded-2xl bg-white hover:bg-rose-50/40 active:scale-98 border border-gray-200 shadow-xs hover:border-rose-300 transition-all group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mr-4 sm:mr-0 sm:mb-3 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-base text-gray-900 leading-tight">แจ้งซ่อม / ปัญหา</div>
              <p className="text-xs text-gray-500 mt-1">หลอดไฟดับ น้ำรั่ว ท่อตัน หรือคราบหนัก</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 sm:hidden" />
          </button>

          {/* Action 4: My Performance Summary */}
          <button
            onClick={() => setIsMyPerformanceOpen(true)}
            className="flex items-center sm:flex-col sm:items-start text-left p-4 sm:p-5 rounded-2xl bg-white hover:bg-teal-50/50 active:scale-98 border border-gray-200 shadow-xs hover:border-teal-300 transition-all group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mr-4 sm:mr-0 sm:mb-3 group-hover:scale-105 transition-transform">
              <BarChart3 className="w-6 h-6 text-teal-600" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-base text-gray-900 leading-tight">สรุปผลงานของฉัน</div>
              <p className="text-xs text-gray-500 mt-1">แผนภูมิงานส่วนตัว สถิติ และคะแนนดาว</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 sm:hidden" />
          </button>

        </div>
      </div>

      {/* Assigned Tasks from Supervisor (Waiting to be done) */}
      {assignedPendingTasks.length > 0 && (
        <div className="bg-gradient-to-r from-teal-500/15 via-emerald-500/10 to-teal-500/15 border-2 border-teal-300 rounded-3xl p-5 sm:p-6 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
                <Bell className="w-4 h-4 animate-bounce" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 leading-tight">
                  งานที่ได้รับมอบหมายจากหัวหน้างาน
                </h3>
                <p className="text-xs text-teal-800">
                  รอคุณดำเนินการ {assignedPendingTasks.length} รายการ
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {assignedPendingTasks.map(task => {
              const zoneConfig = ZONES.find(z => z.id === task.zone);
              return (
                <div
                  key={task.id}
                  className="bg-white p-4 rounded-2xl border border-teal-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-teal-400 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900 text-sm">
                        {task.areaDetail}
                      </span>
                      {task.priority === 'urgent' && (
                        <span className="text-[10px] font-bold bg-rose-600 text-white px-2 py-0.5 rounded-full animate-pulse">
                          🔴 ด่วนที่สุด / VIP
                        </span>
                      )}
                      {task.priority === 'high' && (
                        <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full">
                          🟡 ด่วน
                        </span>
                      )}
                      <span className="text-[10px] bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-full font-semibold">
                        โดย {task.assignedBy}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>โซน: {zoneConfig?.name}</span>
                      <span>•</span>
                      <span>กำหนดเวลา: {task.startTime} - {task.endTime} น.</span>
                      <span>•</span>
                      <span>เช็คลิสต์: {task.checklist.length} ข้อ</span>
                    </div>

                    {task.notes && (
                      <div className="text-xs text-teal-900 bg-teal-50/60 p-2 rounded-xl border border-teal-100 italic">
                        คำสั่งหัวหน้างาน: "{task.notes}"
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onEditTask(task)}
                    className="py-2.5 px-4 bg-teal-700 hover:bg-teal-800 active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 self-start sm:self-center cursor-pointer whitespace-nowrap"
                  >
                    <span>เริ่มทำ / บันทึกผลงาน</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Today's Logged Tasks */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-emerald-600" />
              <span>รายการบันทึกงานของ {currentStaff.nickname} วันนี้</span>
            </h3>
            <p className="text-xs text-gray-500">
              วันที่ {new Date().toLocaleDateString('th-TH', { dateStyle: 'long' })}
            </p>
          </div>
          <button
            onClick={onOpenTaskModal}
            className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors"
          >
            + บันทึกงานเพิ่ม
          </button>
        </div>

        {staffTodayTasks.length === 0 ? (
          <div className="text-center py-10 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <CheckSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <div className="text-sm font-semibold text-gray-700">ยังไม่มีการบันทึกงานในวันนี้</div>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              กดปุ่ม "บันทึกงานทำความสะอาด" ด้านบนเพื่อเริ่มลงรายการตรวจเช็คประจำจุด
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {staffTodayTasks.map(task => {
              const zoneConfig = ZONES.find(z => z.id === task.zone);
              const doneItems = task.checklist.filter(c => c.completed).length;
              return (
                <div
                  key={task.id}
                  className="p-4 rounded-2xl border border-gray-200 hover:border-emerald-300 bg-white transition-all shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {zoneConfig?.name.slice(0, 2) || 'งาน'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-sm">
                            {task.areaDetail}
                          </span>
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            task.status === 'completed' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : task.status === 'in_progress' 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {task.status === 'completed' ? 'เสร็จสิ้น' : task.status === 'in_progress' ? 'กำลังทำ' : 'รอดำเนินการ'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            {task.startTime} - {task.endTime} น.
                          </span>
                          <span>•</span>
                          <span>โซน: {zoneConfig?.name}</span>
                          <span>•</span>
                          <span className="text-emerald-700 font-medium">
                            เช็คลิสต์ {doneItems}/{task.checklist.length} ข้อ
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {task.supervisorChecked && (
                        <span className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded-lg border border-teal-200 font-medium">
                          ✓ ตรวจแล้ว ({task.supervisorRating}★)
                        </span>
                      )}
                      {task.syncedToSheets && (
                        <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg border border-emerald-200">
                          ซิงค์ชีตแล้ว
                        </span>
                      )}
                      <button
                        onClick={() => onEditTask(task)}
                        className="text-xs text-gray-600 hover:text-emerald-700 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors font-medium"
                      >
                        ดู/แก้ไข
                      </button>
                    </div>
                  </div>

                  {/* Photos thumbnail preview if any */}
                  {(task.beforePhoto || task.afterPhoto) && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-3">
                      {task.beforePhoto && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <img src={task.beforePhoto} alt="Before" className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                          <span>รูปก่อนทำ</span>
                        </div>
                      )}
                      {task.afterPhoto && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                          <img src={task.afterPhoto} alt="After" className="w-10 h-10 rounded-lg object-cover border border-emerald-300" />
                          <span>รูปผลงานเสร็จ</span>
                        </div>
                      )}
                    </div>
                  )}

                  {task.notes && (
                    <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                      <span className="font-semibold text-gray-700">หมายเหตุ: </span>
                      {task.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Zone Standards Reference Card */}
      <div className="bg-gray-50 rounded-3xl p-5 sm:p-6 border border-gray-200">
        <h3 className="text-sm font-bold text-gray-800 mb-2">
          มาตรฐานการทำความสะอาดประจำโซน (Standard Checklist Guide)
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          เกณฑ์ข้อกำหนดที่พนักงานสามารถเปิดดูได้ทุกเวลาขณะตรวจเช็ค
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ZONES.map(z => (
            <div key={z.id} className="bg-white p-3.5 rounded-2xl border border-gray-200 text-xs shadow-2xs">
              <div className="font-bold text-gray-900 mb-1 flex items-center justify-between">
                <span>{z.name}</span>
                <span className="text-[10px] text-gray-400 font-normal">{z.nameEn}</span>
              </div>
              <ul className="text-gray-600 space-y-1 list-disc list-inside text-[11px] leading-relaxed">
                {z.defaultChecklist.slice(0, 3).map((c, i) => (
                  <li key={i} className="truncate" title={c}>{c}</li>
                ))}
                {z.defaultChecklist.length > 3 && (
                  <li className="text-emerald-600 font-medium list-none pt-0.5">
                    +{z.defaultChecklist.length - 3} ข้อเพิ่มเติมในระบบ
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* My Personal Performance Modal */}
      <MyPerformanceModal
        isOpen={isMyPerformanceOpen}
        onClose={() => setIsMyPerformanceOpen(false)}
        staff={currentStaff}
        tasks={tasks}
        attendanceRecords={attendanceRecords}
      />

    </div>
  );
};
