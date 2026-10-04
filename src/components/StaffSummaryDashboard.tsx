import React, { useState, useMemo } from 'react';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  Star, 
  Building2, 
  AlertTriangle, 
  TrendingUp, 
  Camera, 
  Calendar, 
  Filter, 
  Download, 
  Printer, 
  ArrowUpRight, 
  Search,
  Check,
  ChevronRight,
  ShieldCheck,
  Award,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { TaskRecord, AttendanceRecord, CleaningStaff, IssueReport, CleaningZone } from '../types';
import { ZONES } from '../data/initialData';

interface StaffSummaryDashboardProps {
  tasks: TaskRecord[];
  attendanceRecords: AttendanceRecord[];
  staffList: CleaningStaff[];
  issues: IssueReport[];
  onSelectStaffTasks?: (staffId: string) => void;
  onOpenAssignTaskModal?: () => void;
}

export const StaffSummaryDashboard: React.FC<StaffSummaryDashboardProps> = ({
  tasks,
  attendanceRecords,
  staffList,
  issues,
  onSelectStaffTasks,
  onOpenAssignTaskModal
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Time filter: 'today' | 'week' | 'month' | 'all'
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>('all');
  const [selectedFlatFilter, setSelectedFlatFilter] = useState<string>('all');
  const [activeMetricTab, setActiveMetricTab] = useState<'tasks' | 'ratings' | 'flats'>('tasks');

  // Filter tasks based on selected range
  const filteredTasks = useMemo(() => {
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    return tasks.filter(t => {
      // Date filter
      if (timeFilter === 'today' && t.date !== todayStr) return false;
      if (timeFilter === 'week' && t.date < sevenDaysAgoStr) return false;
      if (timeFilter === 'month' && !t.date.startsWith(currentMonthPrefix)) return false;

      // Staff filter
      if (selectedStaffFilter !== 'all' && t.staffId !== selectedStaffFilter) return false;

      // Flat filter
      if (selectedFlatFilter !== 'all' && t.zone !== selectedFlatFilter) return false;

      return true;
    });
  }, [tasks, timeFilter, todayStr, selectedStaffFilter, selectedFlatFilter]);

  // Overall KPI Metrics
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(t => t.status === 'completed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Rated tasks and average score
  const ratedTasks = filteredTasks.filter(t => t.supervisorRating && t.supervisorRating > 0);
  const avgRating = ratedTasks.length > 0 
    ? (ratedTasks.reduce((acc, t) => acc + (t.supervisorRating || 0), 0) / ratedTasks.length).toFixed(1)
    : '0.0';

  // Photo verified tasks
  const photoVerifiedTasks = filteredTasks.filter(t => t.beforePhoto || t.afterPhoto).length;
  const photoRate = totalTasks > 0 ? Math.round((photoVerifiedTasks / totalTasks) * 100) : 0;

  // Active flats cleaned in this period
  const uniqueFlatsCleaned = new Set(filteredTasks.filter(t => t.status === 'completed').map(t => t.zone));
  const flatsCleanedCount = uniqueFlatsCleaned.size;

  // Attendance stats for today
  const todayAttendance = attendanceRecords.filter(a => a.date === todayStr);
  const presentCount = todayAttendance.filter(a => a.status === 'present' || a.status === 'completed').length;

  // Staff summary table aggregation
  const staffSummaries = useMemo(() => {
    return staffList.map(stf => {
      const staffTasks = filteredTasks.filter(t => t.staffId === stf.id);
      const total = staffTasks.length;
      const done = staffTasks.filter(t => t.status === 'completed').length;
      const rate = total > 0 ? Math.round((done / total) * 100) : 0;

      const rated = staffTasks.filter(t => t.supervisorRating && t.supervisorRating > 0);
      const score = rated.length > 0
        ? (rated.reduce((sum, t) => sum + (t.supervisorRating || 0), 0) / rated.length).toFixed(1)
        : '-';

      const hasAttendanceToday = attendanceRecords.find(a => a.staffId === stf.id && a.date === todayStr);

      const photosCount = staffTasks.filter(t => t.afterPhoto || t.beforePhoto).length;

      return {
        ...stf,
        totalTasks: total,
        completedTasks: done,
        completionRate: rate,
        averageRating: score,
        photosCount,
        hasAttendanceToday
      };
    }).sort((a, b) => b.completedTasks - a.completedTasks);
  }, [staffList, filteredTasks, attendanceRecords, todayStr]);

  // Flat Center (4 to 20) Status Aggregation
  const flatStatuses = useMemo(() => {
    return ZONES.map(z => {
      const flatTasks = filteredTasks.filter(t => t.zone === z.id);
      const completed = flatTasks.filter(t => t.status === 'completed');
      const inProgress = flatTasks.filter(t => t.status === 'in_progress');
      const pending = flatTasks.filter(t => t.status === 'pending');

      // Assigned staff to this flat
      const responsibleStaff = staffList.filter(s => s.assignedZones.includes(z.id));

      let status: 'completed' | 'in_progress' | 'pending' | 'none' = 'none';
      if (completed.length > 0) status = 'completed';
      else if (inProgress.length > 0) status = 'in_progress';
      else if (pending.length > 0) status = 'pending';

      const latestTask = flatTasks[flatTasks.length - 1];

      return {
        zone: z,
        status,
        totalTasks: flatTasks.length,
        completedCount: completed.length,
        responsibleStaff,
        latestTask
      };
    });
  }, [filteredTasks, staffList]);

  // Chart Data: Tasks by Staff
  const staffChartData = useMemo(() => {
    return staffSummaries.map(s => ({
      name: s.nickname || s.name.split(' ')[0],
      งานที่เสร็จ: s.completedTasks,
      งานรอดำเนินการ: s.totalTasks - s.completedTasks
    }));
  }, [staffSummaries]);

  // Chart Data: Tasks by Flat Center (Top 10 most active)
  const flatChartData = useMemo(() => {
    return flatStatuses
      .filter(f => f.totalTasks > 0)
      .map(f => ({
        name: f.zone.name.replace('แฟลตศูนย์ ', 'แฟลต '),
        งานที่ทำเสร็จ: f.completedCount,
        งานที่รอทำ: f.totalTasks - f.completedCount
      }))
      .slice(0, 10);
  }, [flatStatuses]);

  // Export Dashboard to CSV
  const handleExportSummaryCSV = () => {
    const headers = [
      'รหัสพนักงาน',
      'ชื่อ-นามสกุล',
      'ชื่อเล่น',
      'เบอร์โทรศัพท์',
      'แฟลตศูนย์ที่รับผิดชอบ',
      'งานทั้งหมด',
      'งานที่เสร็จสิ้น',
      'อัตราความสำเร็จ (%)',
      'คะแนนประเมินเฉลี่ย (เต็ม 5)',
      'สถานะเข้างานวันนี้'
    ];

    const rows = staffSummaries.map(s => [
      s.id,
      `"${s.name}"`,
      `"${s.nickname}"`,
      s.phone,
      `"${s.assignedZones.map(z => ZONES.find(x => x.id === z)?.name).filter(Boolean).join(', ')}"`,
      s.totalTasks,
      s.completedTasks,
      `${s.completionRate}%`,
      s.averageRating,
      s.hasAttendanceToday ? `เข้างานแล้ว (${s.hasAttendanceToday.clockInTime} น.)` : 'ยังไม่ลงเวลา'
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `รายงานสรุปงานพนักงาน_${timeFilter}_${todayStr}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Controls & Filter Bar */}
      <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <TrendingUp className="w-5 h-5 text-emerald-700" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900 leading-tight">
                แดชบอร์ดสรุปผลงานพนักงานทำความสะอาด
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                ภาพรวมความคืบหน้าการปฏิบัติงาน แฟลตศูนย์ 4 - 20 และการประเมินคุณภาพ
              </p>
            </div>
          </div>
        </div>

        {/* Filter Pills & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Time Range Pills */}
          <div className="flex bg-gray-100 p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setTimeFilter('today')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                timeFilter === 'today'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              วันนี้
            </button>
            <button
              onClick={() => setTimeFilter('week')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                timeFilter === 'week'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              7 วันล่าสุด
            </button>
            <button
              onClick={() => setTimeFilter('month')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                timeFilter === 'month'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              เดือนนี้
            </button>
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                timeFilter === 'all'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ทั้งหมด
            </button>
          </div>

          {/* Staff Filter Dropdown */}
          <select
            value={selectedStaffFilter}
            onChange={(e) => setSelectedStaffFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-gray-300 bg-white font-medium text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">พนักงานทุกคน ({staffList.length})</option>
            {staffList.map(s => (
              <option key={s.id} value={s.id}>
                {s.nickname} ({s.name})
              </option>
            ))}
          </select>

          {/* Flat Center Filter */}
          <select
            value={selectedFlatFilter}
            onChange={(e) => setSelectedFlatFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-gray-300 bg-white font-medium text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">ทุกแฟลตศูนย์ (4-20)</option>
            {ZONES.map(z => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>

          {/* Export CSV Button */}
          <button
            onClick={handleExportSummaryCSV}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="ดาวน์โหลดรายงานสรุปเป็น CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ส่งออกรายงาน</span>
          </button>

          {onOpenAssignTaskModal && (
            <button
              onClick={onOpenAssignTaskModal}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <span>+ มอบหมายงาน</span>
            </button>
          )}

        </div>

      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Card 1: Completed Tasks Rate */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              งานที่ทำสำเร็จ
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {completedTasks}
            </span>
            <span className="text-xs text-gray-500 font-medium">
              / {totalTasks} รายการ
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-500">อัตราความสำเร็จ</span>
              <span className="font-bold text-emerald-700">{completionRate}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Card 2: Flats Cleaned Coverage */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              ความครอบคลุมแฟลตศูนย์
            </span>
            <div className="w-9 h-9 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-teal-900">
              {flatsCleanedCount}
            </span>
            <span className="text-xs text-gray-500 font-medium">
              / {ZONES.length} อาคารแฟลต
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-500">ความครอบคลุมพื้นที่</span>
              <span className="font-bold text-teal-700">
                {Math.round((flatsCleanedCount / ZONES.length) * 100)}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.round((flatsCleanedCount / ZONES.length) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Card 3: Quality Rating Score */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              คะแนนประเมินเฉลี่ย
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">
              {avgRating}
            </span>
            <span className="text-xs text-gray-500 font-medium">
              / 5.0 ดาว
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  parseFloat(avgRating) >= star
                    ? 'text-amber-400 fill-amber-400'
                    : parseFloat(avgRating) >= star - 0.5
                    ? 'text-amber-400 fill-amber-200'
                    : 'text-gray-200 fill-gray-200'
                }`}
              />
            ))}
            <span className="text-[11px] text-gray-500 ml-1">
              ({ratedTasks.length} รายการที่ตรวจแล้ว)
            </span>
          </div>
        </div>

        {/* Card 4: Staff Attendance & Photos */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              การเข้างานและรูปถ่ายผลงาน
            </span>
            <div className="w-9 h-9 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {presentCount}
            </span>
            <span className="text-xs text-gray-500 font-medium">
              / {staffList.length} คนเข้างานวันนี้
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-gray-500">มีรูปถ่ายยืนยันงาน:</span>
            <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
              {photoVerifiedTasks} รูป ({photoRate}%)
            </span>
          </div>
        </div>

      </div>

      {/* Main Section: Staff Performance Table (Individual Breakdown) */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <span>สรุปผลการปฏิบัติงานรายบุคคล (Staff Performance Breakdown)</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              แสดงสถิติจำนวนงาน อัตราความสำเร็จ คะแนนประเมิน และแฟลตศูนย์ที่พนักงานรับผิดชอบ
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500">เรียงตาม:</span>
            <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              ผลงานที่ทำเสร็จมากที่สุด
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="p-3.5 pl-6">พนักงาน</th>
                <th className="p-3.5">แฟลตศูนย์ที่รับผิดชอบ</th>
                <th className="p-3.5 text-center">งานทั้งหมด</th>
                <th className="p-3.5 text-center">งานที่เสร็จ</th>
                <th className="p-3.5">อัตราความสำเร็จ</th>
                <th className="p-3.5 text-center">คะแนนประเมิน</th>
                <th className="p-3.5 text-center">หลักฐานภาพถ่าย</th>
                <th className="p-3.5 text-center">สถานะเข้างาน</th>
                <th className="p-3.5 pr-6 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {staffSummaries.map((staff, idx) => (
                <tr key={staff.id} className="hover:bg-gray-50/70 transition-colors">
                  
                  {/* Staff Info */}
                  <td className="p-3.5 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img 
                          src={staff.avatar} 
                          alt={staff.name} 
                          className="w-10 h-10 rounded-xl object-cover border border-emerald-200" 
                        />
                        {idx === 0 && staff.completedTasks > 0 && (
                          <span className="absolute -top-1.5 -left-1.5 bg-amber-400 text-amber-950 font-black rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-xs">
                            🥇
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm">
                          {staff.name} ({staff.nickname})
                        </div>
                        <div className="text-gray-500 font-mono text-[11px]">
                          รหัส {staff.id} • {staff.phone}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Responsible Flats */}
                  <td className="p-3.5">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {staff.assignedZones.length === 0 ? (
                        <span className="text-gray-400 italic text-[11px]">ยังไม่ได้ระบุแฟลต</span>
                      ) : (
                        staff.assignedZones.map(z => (
                          <span 
                            key={z} 
                            className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md text-[10px] font-semibold"
                          >
                            {ZONES.find(x => x.id === z)?.name || z}
                          </span>
                        ))
                      )}
                    </div>
                  </td>

                  {/* Total Tasks */}
                  <td className="p-3.5 text-center font-bold text-gray-800">
                    {staff.totalTasks}
                  </td>

                  {/* Completed Tasks */}
                  <td className="p-3.5 text-center font-extrabold text-emerald-700">
                    {staff.completedTasks}
                  </td>

                  {/* Progress Bar */}
                  <td className="p-3.5 w-44">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-gray-700">{staff.completionRate}%</span>
                        <span className="text-gray-400">{staff.completedTasks}/{staff.totalTasks} งาน</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            staff.completionRate >= 80 
                              ? 'bg-emerald-500' 
                              : staff.completionRate >= 50 
                              ? 'bg-amber-500' 
                              : 'bg-gray-300'
                          }`}
                          style={{ width: `${staff.completionRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>

                  {/* Rating */}
                  <td className="p-3.5 text-center">
                    {staff.averageRating !== '-' ? (
                      <span className="inline-flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{staff.averageRating}</span>
                      </span>
                    ) : (
                      <span className="text-gray-400 text-[11px]">-</span>
                    )}
                  </td>

                  {/* Photos */}
                  <td className="p-3.5 text-center">
                    {staff.photosCount > 0 ? (
                      <span className="inline-flex items-center gap-1 text-gray-700 font-semibold text-xs">
                        <Camera className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{staff.photosCount} รูป</span>
                      </span>
                    ) : (
                      <span className="text-gray-400 text-[11px]">ไม่มี</span>
                    )}
                  </td>

                  {/* Attendance */}
                  <td className="p-3.5 text-center whitespace-nowrap">
                    {staff.hasAttendanceToday ? (
                      <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold text-[11px]">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>เข้า {staff.hasAttendanceToday.clockInTime} น.</span>
                      </span>
                    ) : (
                      <span className="text-gray-400 text-[11px]">ยังไม่ลงเวลา</span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="p-3.5 pr-6 text-right">
                    <button
                      onClick={() => onSelectStaffTasks && onSelectStaffTasks(staff.id)}
                      className="px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                    >
                      ดูงาน →
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Visual Charts & Flat Cleanliness Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Visual Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-xs">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <span>กราฟเปรียบเทียบผลงาน (Performance Comparison)</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                ดูสถิติจำนวนงานที่ทำเสร็จแยกตามพนักงาน หรือแยกตามแฟลตศูนย์
              </p>
            </div>

            <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-bold self-start sm:self-center">
              <button
                onClick={() => setActiveMetricTab('tasks')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeMetricTab === 'tasks' ? 'bg-white text-emerald-800 shadow-xs' : 'text-gray-600'
                }`}
              >
                ตามพนักงาน
              </button>
              <button
                onClick={() => setActiveMetricTab('flats')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeMetricTab === 'flats' ? 'bg-white text-emerald-800 shadow-xs' : 'text-gray-600'
                }`}
              >
                ตามแฟลตศูนย์
              </button>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            {activeMetricTab === 'tasks' ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={staffChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#4B5563' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#4B5563' }} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="งานที่เสร็จ" fill="#059669" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="งานรอดำเนินการ" fill="#D1D5DB" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={flatChartData} margin={{ top: 10, right: 10, left: -20, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#4B5563' }} angle={-25} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11, fill: '#4B5563' }} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="งานที่ทำเสร็จ" fill="#0D9488" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="งานที่รอทำ" fill="#E2E8F0" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

        </div>

        {/* Right Column: Flat Centers Cleanliness Matrix (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-xs flex flex-col justify-between">
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-600" />
                <span>สถานะแฟลตศูนย์ (4 - 20)</span>
              </h3>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                17 อาคารแฟลต
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              สัญลักษณ์สีแสดงความคืบหน้าการเข้าทำความสะอาดของแต่ละแฟลต
            </p>

            {/* Matrix Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-72 overflow-y-auto p-1">
              {flatStatuses.map(item => {
                const isClean = item.status === 'completed';
                const isPending = item.status === 'in_progress' || item.status === 'pending';

                return (
                  <div
                    key={item.zone.id}
                    className={`p-2.5 rounded-2xl border text-center transition-all ${
                      isClean
                        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 shadow-2xs'
                        : isPending
                        ? 'bg-amber-50/70 border-amber-300 text-amber-900'
                        : 'bg-gray-50 border-gray-200 text-gray-500'
                    }`}
                  >
                    <div className="text-[11px] font-bold truncate">
                      {item.zone.name.replace('แฟลตศูนย์ ', 'แฟลต ')}
                    </div>
                    <div className="mt-1 flex items-center justify-center gap-1 text-[10px]">
                      {isClean ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>เรียบร้อย</span>
                        </span>
                      ) : isPending ? (
                        <span className="text-amber-700 font-semibold">
                          กำลังทำ
                        </span>
                      ) : (
                        <span className="text-gray-400">
                          รอดำเนินการ
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              <span>เสร็จสมบูรณ์ ({flatStatuses.filter(f => f.status === 'completed').length})</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
              <span>กำลังทำ ({flatStatuses.filter(f => f.status === 'in_progress' || f.status === 'pending').length})</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-300 inline-block"></span>
              <span>รอดำเนินการ ({flatStatuses.filter(f => f.status === 'none').length})</span>
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};
