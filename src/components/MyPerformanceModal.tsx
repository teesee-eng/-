import React, { useState, useMemo } from 'react';
import { 
  X, 
  BarChart3, 
  Star, 
  CheckCircle2, 
  Calendar, 
  Building2, 
  Camera, 
  Clock, 
  Award, 
  Download, 
  TrendingUp, 
  ShieldCheck,
  Check,
  ChevronRight
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
import { TaskRecord, AttendanceRecord, CleaningStaff } from '../types';
import { ZONES } from '../data/initialData';

interface MyPerformanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: CleaningStaff;
  tasks: TaskRecord[];
  attendanceRecords: AttendanceRecord[];
}

export const MyPerformanceModal: React.FC<MyPerformanceModalProps> = ({
  isOpen,
  onClose,
  staff,
  tasks,
  attendanceRecords
}) => {
  const [timeFilter, setTimeFilter] = useState<'all' | 'month' | 'week' | 'today'>('month');

  // Filter tasks strictly by this staff's ID
  const myAllTasks = useMemo(() => {
    return tasks.filter(t => t.staffId === staff.id);
  }, [tasks, staff.id]);

  // Date filtered tasks
  const myFilteredTasks = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    return myAllTasks.filter(t => {
      if (timeFilter === 'today') return t.date === todayStr;
      if (timeFilter === 'week') return t.date >= sevenDaysAgoStr;
      if (timeFilter === 'month') return t.date.startsWith(monthPrefix);
      return true;
    });
  }, [myAllTasks, timeFilter]);

  // Personal KPIs
  const totalTasks = myFilteredTasks.length;
  const completedTasks = myFilteredTasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = myFilteredTasks.filter(t => t.status === 'in_progress').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Rating & Quality
  const ratedTasks = myFilteredTasks.filter(t => t.supervisorRating && t.supervisorRating > 0);
  const avgRating = ratedTasks.length > 0
    ? (ratedTasks.reduce((sum, t) => sum + (t.supervisorRating || 0), 0) / ratedTasks.length).toFixed(1)
    : '-';

  // Photo evidence
  const photoTasks = myFilteredTasks.filter(t => t.beforePhoto || t.afterPhoto).length;

  // Flats cleaned
  const uniqueFlats = new Set(myFilteredTasks.map(t => t.zone));
  const flatsCoveredCount = uniqueFlats.size;

  // Chart 1: Tasks by Flat Center
  const flatChartData = useMemo(() => {
    const countMap: Record<string, number> = {};
    myFilteredTasks.forEach(t => {
      const zoneName = ZONES.find(z => z.id === t.zone)?.name || t.zone;
      const shortName = zoneName.replace('แฟลตศูนย์ ', 'แฟลต ');
      countMap[shortName] = (countMap[shortName] || 0) + 1;
    });

    return Object.entries(countMap).map(([name, count]) => ({
      name,
      จำนวนงาน: count
    })).sort((a, b) => b.จำนวนงาน - a.จำนวนงาน);
  }, [myFilteredTasks]);

  // Chart 2: Tasks by Date (Daily activity)
  const dailyChartData = useMemo(() => {
    const dateMap: Record<string, number> = {};
    myFilteredTasks.forEach(t => {
      if (!t.date) return;
      // Show format DD/MM
      const parts = t.date.split('-');
      const label = parts.length === 3 ? `${parseInt(parts[2])}/${parseInt(parts[1])}` : t.date;
      dateMap[label] = (dateMap[label] || 0) + (t.status === 'completed' ? 1 : 0);
    });

    return Object.entries(dateMap).map(([date, count]) => ({
      date,
      งานที่เสร็จ: count
    })).slice(-7); // Last 7 active days
  }, [myFilteredTasks]);

  // Export personal summary CSV
  const handleExportMyCSV = () => {
    const headers = ['รหัสงาน', 'วันที่', 'แฟลตศูนย์', 'รายละเอียดจุด', 'เวลา', 'สถานะ', 'คะแนนตรวจ', 'ผู้ตรวจ', 'หมายเหตุ'];
    const rows = myFilteredTasks.map(t => [
      t.id,
      t.date,
      `"${ZONES.find(z => z.id === t.zone)?.name || t.zone}"`,
      `"${t.areaDetail}"`,
      `"${t.startTime || ''} - ${t.endTime || ''}"`,
      t.status === 'completed' ? 'เสร็จสิ้น' : 'กำลังทำ',
      t.supervisorRating ? `${t.supervisorRating} ดาว` : 'รอตรวจ',
      `"${t.supervisorName || '-'}"`,
      `"${t.notes || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `สรุปผลงาน_${staff.nickname}_${timeFilter}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl border border-gray-100 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <img 
              src={staff.avatar} 
              alt={staff.name} 
              className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-400 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-gray-900 leading-tight">
                  สรุปผลงานของฉัน: {staff.name} ({staff.nickname})
                </h2>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                รหัสพนักงาน: <span className="font-mono font-bold text-gray-700">{staff.id}</span> • 
                แฟลตหลัก: {staff.assignedZones.map(z => ZONES.find(x => x.id === z)?.name).join(', ') || 'ตามที่ได้รับมอบหมาย'}
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

        {/* Filter Bar & Export */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 bg-gray-50 p-2.5 rounded-2xl border border-gray-200">
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 text-xs font-bold shadow-2xs">
            <button
              onClick={() => setTimeFilter('today')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeFilter === 'today' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              วันนี้
            </button>
            <button
              onClick={() => setTimeFilter('week')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeFilter === 'week' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              7 วันล่าสุด
            </button>
            <button
              onClick={() => setTimeFilter('month')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeFilter === 'month' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              เดือนนี้
            </button>
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeFilter === 'all' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ทั้งหมด
            </button>
          </div>

          <button
            onClick={handleExportMyCSV}
            className="px-3 py-1.5 bg-white hover:bg-gray-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>ดาวน์โหลด CSV สรุปผลงาน</span>
          </button>
        </div>

        {/* Personal KPI Cards */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          {/* Card 1: Completed Tasks */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 uppercase">งานที่ทำสำเร็จ</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-emerald-900">{completedTasks}</span>
              <span className="text-[11px] text-emerald-700">/ {totalTasks} งาน</span>
            </div>
            <div className="mt-2 w-full h-1.5 bg-emerald-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
            <div className="mt-1 text-[10px] text-right font-bold text-emerald-800">
              ความสำเร็จ {completionRate}%
            </div>
          </div>

          {/* Card 2: Rating */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-800 uppercase">คะแนนเฉลี่ย</span>
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-amber-900">{avgRating}</span>
              <span className="text-[11px] text-amber-700">/ 5.0</span>
            </div>
            <div className="mt-2 flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map(s => (
                <Star
                  key={s}
                  className={`w-3.5 h-3.5 ${
                    parseFloat(avgRating) >= s
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-gray-300 fill-gray-200'
                  }`}
                />
              ))}
            </div>
            <div className="mt-1 text-[10px] text-amber-700">
              {ratedTasks.length} งานได้รับการตรวจ
            </div>
          </div>

          {/* Card 3: Flats Cleaned */}
          <div className="bg-teal-50/70 border border-teal-200 rounded-2xl p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-teal-800 uppercase">แฟลตที่ทำ</span>
              <Building2 className="w-4 h-4 text-teal-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-teal-900">{flatsCoveredCount}</span>
              <span className="text-[11px] text-teal-700">อาคารแฟลต</span>
            </div>
            <p className="mt-3 text-[10px] text-teal-700 truncate">
              {Array.from(uniqueFlats).map(z => ZONES.find(x => x.id === z)?.name.replace('แฟลตศูนย์ ', 'แฟลต ')).filter(Boolean).join(', ') || 'ไม่มีข้อมูล'}
            </p>
          </div>

          {/* Card 4: Photo evidence */}
          <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-800 uppercase">รูปภาพผลงาน</span>
              <Camera className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-indigo-900">{photoTasks}</span>
              <span className="text-[11px] text-indigo-700">รายการมีรูป</span>
            </div>
            <div className="mt-3 text-[10px] text-indigo-700">
              {totalTasks > 0 ? Math.round((photoTasks / totalTasks) * 100) : 0}% ของงานทั้งหมด
            </div>
          </div>

        </div>

        {/* Charts Section */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Chart 1: Tasks by Flat Center */}
          <div className="p-4 rounded-2xl border border-gray-200 bg-white">
            <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5 mb-3">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>จำนวนงานแยกตามแฟลตศูนย์ (Flats Cleaned)</span>
            </h4>
            {flatChartData.length === 0 ? (
              <div className="h-44 flex items-center justify-center text-xs text-gray-400">
                ยังไม่มีข้อมูลงานในช่วงเวลานี้
              </div>
            ) : (
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={flatChartData} margin={{ top: 5, right: 5, left: -25, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#4B5563' }} angle={-20} textAnchor="end" />
                    <YAxis tick={{ fontSize: 10, fill: '#4B5563' }} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '0.75rem', border: '1px solid #E5E7EB', fontSize: '11px' }}
                    />
                    <Bar dataKey="จำนวนงาน" fill="#059669" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Chart 2: Daily Activity */}
          <div className="p-4 rounded-2xl border border-gray-200 bg-white">
            <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5 mb-3">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              <span>ความคืบหน้ารายวัน (งานที่ทำเสร็จล่าสุด)</span>
            </h4>
            {dailyChartData.length === 0 ? (
              <div className="h-44 flex items-center justify-center text-xs text-gray-400">
                ยังไม่มีข้อมูลงานที่เสร็จในช่วงเวลานี้
              </div>
            ) : (
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyChartData} margin={{ top: 5, right: 5, left: -25, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#4B5563' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#4B5563' }} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '0.75rem', border: '1px solid #E5E7EB', fontSize: '11px' }}
                    />
                    <Bar dataKey="งานที่เสร็จ" fill="#0D9488" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

        </div>

        {/* Supervisor Feedback & Recent Verified Tasks */}
        <div className="mt-5 border-t border-gray-100 pt-4">
          <h4 className="text-xs font-bold text-gray-900 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>ผลการตรวจประเมินล่าสุดจากหัวหน้างาน</span>
            </span>
            <span className="text-[11px] font-normal text-gray-500">
              {ratedTasks.length} รายการที่ได้รับการประเมิน
            </span>
          </h4>

          {ratedTasks.length === 0 ? (
            <div className="p-4 bg-gray-50 rounded-2xl text-center text-xs text-gray-400">
              ยังไม่มีรายการงานที่ตรวจประเมินดาวในช่วงเวลานี้
            </div>
          ) : (
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {ratedTasks.slice(0, 5).map(task => (
                <div 
                  key={task.id}
                  className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-gray-900">
                      {ZONES.find(z => z.id === task.zone)?.name} - {task.areaDetail}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      วันที่ {task.date} • ผู้ตรวจ: {task.supervisorName || 'หัวหน้างาน'}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                    <span className="font-extrabold text-amber-900 text-xs">
                      {task.supervisorRating} ดาว
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Close */}
        <div className="mt-5 pt-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};
