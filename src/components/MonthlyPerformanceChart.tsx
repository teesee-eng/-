import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';
import { 
  Trophy, 
  Star, 
  CheckCircle2, 
  Calendar, 
  TrendingUp, 
  MapPin, 
  Clock,
  Layers,
  Award
} from 'lucide-react';
import { TaskRecord, AttendanceRecord, CleaningStaff } from '../types';
import { ZONES } from '../data/initialData';

interface MonthlyPerformanceChartProps {
  tasks: TaskRecord[];
  attendanceRecords: AttendanceRecord[];
  staffList: CleaningStaff[];
}

export const MonthlyPerformanceChart: React.FC<MonthlyPerformanceChartProps> = ({
  tasks,
  attendanceRecords,
  staffList
}) => {
  // Current month default in YYYY-MM format
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthKey);
  const [chartView, setChartView] = useState<'staff' | 'zone' | 'daily'>('staff');

  // Available months extracted from existing tasks and attendance
  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();
    monthSet.add(currentMonthKey);
    tasks.forEach(t => {
      if (t.date && t.date.length >= 7) {
        monthSet.add(t.date.substring(0, 7));
      }
    });
    attendanceRecords.forEach(a => {
      if (a.date && a.date.length >= 7) {
        monthSet.add(a.date.substring(0, 7));
      }
    });
    return Array.from(monthSet).sort().reverse();
  }, [tasks, attendanceRecords, currentMonthKey]);

  // Filter records by selected month
  const monthTasks = useMemo(() => {
    return tasks.filter(t => t.date && t.date.startsWith(selectedMonth));
  }, [tasks, selectedMonth]);

  const monthAttendance = useMemo(() => {
    return attendanceRecords.filter(a => a.date && a.date.startsWith(selectedMonth));
  }, [attendanceRecords, selectedMonth]);

  // Aggregate by Staff for Staff Comparison Chart
  const staffChartData = useMemo(() => {
    return staffList.map(staff => {
      const sTasks = monthTasks.filter(t => t.staffId === staff.id);
      const completed = sTasks.filter(t => t.status === 'completed').length;
      const inProgress = sTasks.filter(t => t.status === 'in_progress').length;
      
      const reviewed = sTasks.filter(t => t.supervisorChecked && t.supervisorRating);
      const avgRating = reviewed.length > 0 
        ? Number((reviewed.reduce((sum, t) => sum + (t.supervisorRating || 0), 0) / reviewed.length).toFixed(1))
        : 0;

      const sAttendance = monthAttendance.filter(a => a.staffId === staff.id);
      const totalShifts = sAttendance.length;
      const onTimeShifts = sAttendance.filter(a => a.status === 'present' || a.status === 'completed').length;
      const onTimeRate = totalShifts > 0 ? Math.round((onTimeShifts / totalShifts) * 100) : 100;

      return {
        id: staff.id,
        name: staff.nickname || staff.name.split(' ')[0],
        fullName: staff.name,
        'งานเสร็จสิ้น (งาน)': completed,
        'กำลังทำ/รอ (งาน)': inProgress,
        'คะแนนประเมิน (x10)': Math.round(avgRating * 10), // Scale for dual bar comparison
        avgRating,
        completedCount: completed,
        totalShifts,
        onTimeRate
      };
    });
  }, [staffList, monthTasks, monthAttendance]);

  // Aggregate by Zone for Zone Breakdown Chart
  const zoneChartData = useMemo(() => {
    return ZONES.map(z => {
      const zTasks = monthTasks.filter(t => t.zone === z.id);
      const completed = zTasks.filter(t => t.status === 'completed').length;
      const inProgress = zTasks.filter(t => t.status === 'in_progress').length;
      return {
        zoneName: z.name,
        nameEn: z.nameEn,
        'งานที่สำเร็จ': completed,
        'งานที่ค้างอยู่': inProgress,
        total: completed + inProgress
      };
    });
  }, [monthTasks]);

  // Aggregate by Day of Month for Trend Chart
  const dailyChartData = useMemo(() => {
    const daysInMonth = new Date(
      parseInt(selectedMonth.split('-')[0]), 
      parseInt(selectedMonth.split('-')[1]), 
      0
    ).getDate();

    const result = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = `${selectedMonth}-${String(day).padStart(2, '0')}`;
      const dTasks = monthTasks.filter(t => t.date === dayStr);
      const completed = dTasks.filter(t => t.status === 'completed').length;
      const inProgress = dTasks.filter(t => t.status === 'in_progress').length;

      // Only include days with activity or up to today
      if (dTasks.length > 0 || day <= now.getDate()) {
        result.push({
          day: `${day}`,
          dateStr: dayStr,
          'งานเสร็จสิ้น': completed,
          'กำลังดำเนินการ': inProgress,
          total: completed + inProgress
        });
      }
    }
    return result;
  }, [selectedMonth, monthTasks, now]);

  // Summary Metrics
  const totalCompletedInMonth = monthTasks.filter(t => t.status === 'completed').length;
  const reviewedTasks = monthTasks.filter(t => t.supervisorChecked && t.supervisorRating);
  const overallAvgRating = reviewedTasks.length > 0
    ? (reviewedTasks.reduce((sum, t) => sum + (t.supervisorRating || 0), 0) / reviewedTasks.length).toFixed(1)
    : '5.0';

  // Find Top Performer
  const topPerformer = useMemo(() => {
    if (staffChartData.length === 0) return null;
    const sorted = [...staffChartData].sort((a, b) => {
      if (b.completedCount !== a.completedCount) {
        return b.completedCount - a.completedCount;
      }
      return b.avgRating - a.avgRating;
    });
    const winner = sorted[0];
    const staffObj = staffList.find(s => s.id === winner.id);
    return {
      ...winner,
      avatar: staffObj?.avatar || '',
      phone: staffObj?.phone || ''
    };
  }, [staffChartData, staffList]);

  // Format Month Display in Thai
  const formatMonthThai = (ymStr: string) => {
    const [year, month] = ymStr.split('-');
    const monthNames = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const mIndex = parseInt(month, 10) - 1;
    const thaiYear = parseInt(year, 10) + 543;
    return `${monthNames[mIndex] || month} ${thaiYear}`;
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-xs space-y-6">
      
      {/* Top Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800 shadow-2xs">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
              สรุปผลงานรายเดือนของพนักงาน (Monthly Performance)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              แผนภูมิวิเคราะห์สถิติจำนวนงานที่ทำสำเร็จ คะแนนประเมิน และประสิทธิภาพรายบุคคล
            </p>
          </div>
        </div>

        {/* Month Selector & Chart Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Month Selector */}
          <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-200 text-xs">
            <Calendar className="w-3.5 h-3.5 text-gray-500 ml-1.5" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent font-semibold text-gray-800 pr-2 py-1 focus:outline-hidden cursor-pointer"
            >
              {availableMonths.map(ym => (
                <option key={ym} value={ym}>
                  {formatMonthThai(ym)}
                </option>
              ))}
            </select>
          </div>

          {/* Chart View Toggle */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs font-medium">
            <button
              onClick={() => setChartView('staff')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                chartView === 'staff'
                  ? 'bg-white text-emerald-800 font-bold shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              รายพนักงาน
            </button>
            <button
              onClick={() => setChartView('zone')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                chartView === 'zone'
                  ? 'bg-white text-emerald-800 font-bold shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              แยกตามโซน
            </button>
            <button
              onClick={() => setChartView('daily')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                chartView === 'daily'
                  ? 'bg-white text-emerald-800 font-bold shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              รายวันในเดือน
            </button>
          </div>
        </div>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Top Performer Card */}
        {topPerformer && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/60 border border-amber-200 text-xs flex items-center gap-3">
            <div className="relative">
              <img
                src={topPerformer.avatar}
                alt={topPerformer.fullName}
                className="w-12 h-12 rounded-xl object-cover border-2 border-amber-300 shadow-2xs"
              />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center text-[10px] shadow-xs">
                👑
              </span>
            </div>
            <div className="flex-1">
              <div className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-600" />
                <span>พนักงานดีเด่นประจำเดือน</span>
              </div>
              <div className="font-extrabold text-sm text-gray-900 mt-0.5">
                {topPerformer.fullName} ({topPerformer.name})
              </div>
              <div className="text-amber-900 text-[11px] mt-0.5">
                สำเร็จ <span className="font-bold">{topPerformer.completedCount} งาน</span> • เฉลี่ย {topPerformer.avgRating || 5.0}★
              </div>
            </div>
          </div>
        )}

        {/* Card 2: Total Completed */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs">
          <div className="text-emerald-700 font-semibold flex items-center justify-between">
            <span>งานที่เสร็จสิ้นทั้งเดือน</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-950">
            {totalCompletedInMonth} <span className="text-xs font-normal text-emerald-700">รายการ</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-600">
            จากทั้งหมด {monthTasks.length} รายการที่บันทึก
          </div>
        </div>

        {/* Card 3: Quality Rating */}
        <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 text-xs">
          <div className="text-teal-700 font-semibold flex items-center justify-between">
            <span>คะแนนประเมินเฉลี่ย</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-teal-950 flex items-baseline gap-1">
            <span>{overallAvgRating}</span>
            <span className="text-xs font-normal text-teal-700">/ 5.0 ดาว</span>
          </div>
          <div className="mt-1 text-[11px] text-teal-600">
            ตรวจรับแล้ว {reviewedTasks.length} จุดงาน
          </div>
        </div>

        {/* Card 4: Punctuality */}
        <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 text-xs">
          <div className="text-sky-700 font-semibold flex items-center justify-between">
            <span>การเข้างานประจำเดือน</span>
            <Clock className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-sky-950">
            {monthAttendance.length} <span className="text-xs font-normal text-sky-700">รอบกะ</span>
          </div>
          <div className="mt-1 text-[11px] text-sky-600">
            ตรงเวลา {monthAttendance.filter(a => a.status === 'present').length} ครั้ง
          </div>
        </div>

      </div>

      {/* Main Recharts Bar Chart Container */}
      <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-200">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div>
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>
                {chartView === 'staff' && 'แผนภูมิเปรียบเทียบผลงานและปริมาณงานตามรายชื่อพนักงาน'}
                {chartView === 'zone' && 'แผนภูมิจำนวนงานทำความสะอาดจำแนกตามโซนพื้นที่'}
                {chartView === 'daily' && 'แผนภูมิแนวโน้มจำนวนงานที่ทำในแต่ละวันของเดือน'}
              </span>
            </h4>
            <p className="text-[11px] text-gray-500">
              ประจำเดือน {formatMonthThai(selectedMonth)}
            </p>
          </div>

          <div className="text-xs text-gray-500 flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded bg-emerald-600"></span>
            <span>เสร็จสิ้น</span>
            <span className="inline-block w-3 h-3 rounded bg-amber-500 ml-2"></span>
            <span>กำลังทำ / รอ</span>
          </div>
        </div>

        {/* View 1: Staff Performance Bar Chart */}
        {chartView === 'staff' && (
          <div className="w-full h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={staffChartData}
                margin={{ top: 15, right: 20, left: -10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-200 text-xs space-y-1">
                          <div className="font-bold text-gray-900 border-b pb-1">
                            {data.fullName} ({label})
                          </div>
                          <div className="text-emerald-700 font-semibold flex items-center justify-between gap-4">
                            <span>งานเสร็จสิ้น:</span>
                            <span>{data['งานเสร็จสิ้น (งาน)']} งาน</span>
                          </div>
                          <div className="text-amber-700 font-semibold flex items-center justify-between gap-4">
                            <span>กำลังทำ/ค้าง:</span>
                            <span>{data['กำลังทำ/รอ (งาน)']} งาน</span>
                          </div>
                          <div className="text-teal-700 font-semibold flex items-center justify-between gap-4 pt-1 border-t">
                            <span>คะแนนเฉลี่ย:</span>
                            <span>{data.avgRating ? `${data.avgRating} ดาว` : 'ยังไม่มีคะแนน'}</span>
                          </div>
                          <div className="text-gray-600 flex items-center justify-between gap-4">
                            <span>เข้างานตรงเวลา:</span>
                            <span>{data.onTimeRate}% ({data.totalShifts} กะ)</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  wrapperStyle={{ fontSize: '12px', paddingBottom: '10px' }} 
                />
                <Bar 
                  dataKey="งานเสร็จสิ้น (งาน)" 
                  fill="#059669" 
                  radius={[6, 6, 0, 0]} 
                  maxBarSize={45} 
                />
                <Bar 
                  dataKey="กำลังทำ/รอ (งาน)" 
                  fill="#f59e0b" 
                  radius={[6, 6, 0, 0]} 
                  maxBarSize={45} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* View 2: Zone Breakdown Bar Chart */}
        {chartView === 'zone' && (
          <div className="w-full h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={zoneChartData}
                margin={{ top: 15, right: 20, left: -10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="zoneName" 
                  tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-200 text-xs space-y-1">
                          <div className="font-bold text-gray-900 border-b pb-1">
                            {label} ({data.nameEn})
                          </div>
                          <div className="text-emerald-700 font-semibold flex items-center justify-between gap-4">
                            <span>งานที่สำเร็จ:</span>
                            <span>{data['งานที่สำเร็จ']} งาน</span>
                          </div>
                          <div className="text-amber-700 font-semibold flex items-center justify-between gap-4">
                            <span>งานค้างอยู่:</span>
                            <span>{data['งานที่ค้างอยู่']} งาน</span>
                          </div>
                          <div className="text-gray-800 font-bold flex items-center justify-between gap-4 pt-1 border-t">
                            <span>รวมทั้งหมด:</span>
                            <span>{data.total} งาน</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  wrapperStyle={{ fontSize: '12px', paddingBottom: '10px' }} 
                />
                <Bar 
                  dataKey="งานที่สำเร็จ" 
                  fill="#0d9488" 
                  radius={[6, 6, 0, 0]} 
                  maxBarSize={45} 
                />
                <Bar 
                  dataKey="งานที่ค้างอยู่" 
                  fill="#f59e0b" 
                  radius={[6, 6, 0, 0]} 
                  maxBarSize={45} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* View 3: Daily Trend Bar Chart */}
        {chartView === 'daily' && (
          <div className="w-full h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dailyChartData}
                margin={{ top: 15, right: 20, left: -10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fill: '#475569', fontSize: 11 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                  label={{ value: 'วันที่ในเดือน', position: 'insideBottom', offset: -10, fontSize: 11, fill: '#64748b' }}
                />
                <YAxis 
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-200 text-xs space-y-1">
                          <div className="font-bold text-gray-900 border-b pb-1">
                            วันที่ {label} ({data.dateStr})
                          </div>
                          <div className="text-emerald-700 font-semibold flex items-center justify-between gap-4">
                            <span>งานสำเร็จ:</span>
                            <span>{data['งานเสร็จสิ้น']} งาน</span>
                          </div>
                          <div className="text-amber-700 font-semibold flex items-center justify-between gap-4">
                            <span>งานค้าง/กำลังทำ:</span>
                            <span>{data['กำลังดำเนินการ']} งาน</span>
                          </div>
                          <div className="text-gray-800 font-bold flex items-center justify-between gap-4 pt-1 border-t">
                            <span>รวมประจำวัน:</span>
                            <span>{data.total} งาน</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  wrapperStyle={{ fontSize: '12px', paddingBottom: '10px' }} 
                />
                <Bar 
                  dataKey="งานเสร็จสิ้น" 
                  fill="#059669" 
                  radius={[4, 4, 0, 0]} 
                />
                <Bar 
                  dataKey="กำลังดำเนินการ" 
                  fill="#f59e0b" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

      </div>

      {/* Staff Ranking Table Preview */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden">
        <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
          <div className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500" />
            <span>ตารางจัดอันดับผลงานพนักงานประจำเดือน {formatMonthThai(selectedMonth)}</span>
          </div>
          <span className="text-[11px] text-gray-500">
            พนักงานทั้งหมด {staffChartData.length} คน
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white text-gray-500 font-semibold border-b border-gray-100">
              <tr>
                <th className="p-3 w-12 text-center">อันดับ</th>
                <th className="p-3">พนักงาน</th>
                <th className="p-3 text-center">งานที่สำเร็จ</th>
                <th className="p-3 text-center">คะแนนเฉลี่ย</th>
                <th className="p-3 text-center">ตรงเวลา</th>
                <th className="p-3 text-center">รางวัลผลงาน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[...staffChartData]
                .sort((a, b) => b.completedCount - a.completedCount)
                .map((staff, idx) => {
                  const staffObj = staffList.find(s => s.id === staff.id);
                  return (
                    <tr key={staff.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="p-3 text-center font-bold">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          {staffObj?.avatar && (
                            <img 
                              src={staffObj.avatar} 
                              alt={staff.fullName} 
                              className="w-8 h-8 rounded-xl object-cover border border-gray-200" 
                            />
                          )}
                          <div>
                            <div className="font-bold text-gray-900">{staff.fullName} ({staff.name})</div>
                            <div className="text-[11px] text-gray-500 font-mono">รหัส {staff.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-extrabold text-emerald-700 text-sm">
                          {staff.completedCount}
                        </span>
                        <span className="text-gray-400 text-[11px] ml-1">งาน</span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="inline-flex items-center gap-1 font-bold text-gray-800 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 text-[11px]">
                          <span>{staff.avgRating ? staff.avgRating : '-'}</span>
                          <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          staff.onTimeRate >= 90 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {staff.onTimeRate}%
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {idx === 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100/70 px-2.5 py-1 rounded-full">
                            ⭐ ดีเด่นประจำเดือน
                          </span>
                        ) : idx === 1 ? (
                          <span className="text-[11px] font-medium text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                            ดีเยี่ยม
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-500">
                            มาตรฐานดี
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
