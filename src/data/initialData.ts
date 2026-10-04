import { CleaningStaff, ZoneConfig, TaskRecord, AttendanceRecord, IssueReport, SupplyItem } from '../types';

const DEFAULT_FLAT_CHECKLIST = [
  'กวาดและถูทำความสะอาดโถงทางเดินส่วนกลางและบันไดทุกชั้น',
  'ทำความสะอาดราวจับบันได ประตูทางเข้า และจุดสัมผัสร่วม',
  'เก็บกวาดขยะบริเวณจุดทิ้งขยะรวมและเปลี่ยนถุงขยะใหม่',
  'ตรวจเช็คและทำความสะอาดรางระบายน้ำรอบอาคารแฟลต',
  'กวาดและทำความสะอาดลานจอดรถและพื้นที่โดยรอบแฟลต',
  'ตรวจเช็คหลอดไฟส่องสว่างส่วนกลางและความเรียบร้อยทั่วไป'
];

export const ZONES: ZoneConfig[] = [
  { id: 'flat_4', name: 'แฟลตศูนย์ 4', nameEn: 'Flat Center 4', icon: 'Building2', description: 'อาคารพักอาศัยแฟลตศูนย์ 4 พื้นที่ส่วนกลางและบริเวณรอบอาคาร', defaultChecklist: DEFAULT_FLAT_CHECKLIST },
  { id: 'flat_5', name: 'แฟลตศูนย์ 5', nameEn: 'Flat Center 5', icon: 'Building2', description: 'อาคารพักอาศัยแฟลตศูนย์ 5 พื้นที่ส่วนกลางและบริเวณรอบอาคาร', defaultChecklist: DEFAULT_FLAT_CHECKLIST },
  { id: 'flat_6', name: 'แฟลตศูนย์ 6', nameEn: 'Flat Center 6', icon: 'Building2', description: 'อาคารพักอาศัยแฟลตศูนย์ 6 พื้นที่ส่วนกลางและบริเวณรอบอาคาร', defaultChecklist: DEFAULT_FLAT_CHECKLIST },
  { id: 'flat_7', name: 'แฟลตศูนย์ 7', nameEn: 'Flat Center 7', icon: 'Building2', description: 'อาคารพักอาศัยแฟลตศูนย์ 7 พื้นที่ส่วนกลางและบริเวณรอบอาคาร', defaultChecklist: DEFAULT_FLAT_CHECKLIST },
  { id: 'flat_8', name: 'แฟลตศูนย์ 8', nameEn: 'Flat Center 8', icon: 'Building2', description: 'อาคารพักอาศัยแฟลตศูนย์ 8 พื้นที่ส่วนกลางและบริเวณรอบอาคาร', defaultChecklist: DEFAULT_FLAT_CHECKLIST },
  { id: 'flat_9', name: 'แฟลตศูนย์ 9', nameEn: 'Flat Center 9', icon: 'Building2', description: 'อาคารพักอาศัยแฟลตศูนย์ 9 พื้นที่ส่วนกลางและบริเวณรอบอาคาร', defaultChecklist: DEFAULT_FLAT_CHECKLIST },
  { id: 'flat_10', name: 'แฟลตศูนย์ 10', nameEn: 'Flat Center 10', icon: 'Building2', description: 'อาคารพักอาศัยแฟลตศูนย์ 10 พื้นที่ส่วนกลางและบริเวณรอบอาคาร', defaultChecklist: DEFAULT_FLAT_CHECKLIST },
  { id: 'flat_11', name: 'แฟลตศูนย์ 11', nameEn: 'Flat Center 11', icon: 'Building2', description: 'อาคารพักอาศัยแฟลตศูนย์ 11 พื้นที่ส่วนกลางและบริเวณรอบอาคาร', defaultChecklist: DEFAULT_FLAT_CHECKLIST },
  { id: 'flat_12', name: 'แฟลตศูนย์ 12', nameEn: 'Flat Center 12', icon: 'Building2', description: 'อาคารพักอาศัยแฟลตศูนย์ 12 พื้นที่ส่วนกลางและบริเวณรอบอาคาร', defaultChecklist: DEFAULT_FLAT_CHECKLIST },
  { id: 'flat_13', name: 'แฟลตศูนย์ 13', nameEn: 'Flat Center 13', icon: 'Building2', description: 'อาคารพักอาศัยแฟลตศูนย์ 13 พื้นที่ส่วนกลางและบริเวณรอบอาคาร', defaultChecklist: DEFAULT_FLAT_CHECKLIST },
  { id: 'flat_14', name: 'แฟลตศูนย์ 14', nameEn: 'Flat Center 14', icon: 'Building2', description: 'อาคารพักอาศัยแฟลตศูนย์ 14 พื้นที่ส่วนกลางและบริเวณรอบอาคาร', defaultChecklist: DEFAULT_FLAT_CHECKLIST },
  { id: 'flat_15', name: 'แฟลตศูนย์ 15', nameEn: 'Flat Center 15', icon: 'Building2', description: 'อาคารพักอาศัยแฟลตศูนย์ 15 พื้นที่ส่วนกลางและบริเวณรอบอาคาร', defaultChecklist: DEFAULT_FLAT_CHECKLIST },
  { id: 'flat_16', name: 'แฟลตศูนย์ 16', nameEn: 'Flat Center 16', icon: 'Building2', description: 'อาคารพักอาศัยแฟลตศูนย์ 16 พื้นที่ส่วนกลางและบริเวณรอบอาคาร', defaultChecklist: DEFAULT_FLAT_CHECKLIST },
  { id: 'flat_17', name: 'แฟลตศูนย์ 17', nameEn: 'Flat Center 17', icon: 'Building2', description: 'อาคารพักอาศัยแฟลตศูนย์ 17 พื้นที่ส่วนกลางและบริเวณรอบอาคาร', defaultChecklist: DEFAULT_FLAT_CHECKLIST },
  { id: 'flat_18', name: 'แฟลตศูนย์ 18', nameEn: 'Flat Center 18', icon: 'Building2', description: 'อาคารพักอาศัยแฟลตศูนย์ 18 พื้นที่ส่วนกลางและบริเวณรอบอาคาร', defaultChecklist: DEFAULT_FLAT_CHECKLIST },
  { id: 'flat_19', name: 'แฟลตศูนย์ 19', nameEn: 'Flat Center 19', icon: 'Building2', description: 'อาคารพักอาศัยแฟลตศูนย์ 19 พื้นที่ส่วนกลางและบริเวณรอบอาคาร', defaultChecklist: DEFAULT_FLAT_CHECKLIST },
  { id: 'flat_20', name: 'แฟลตศูนย์ 20', nameEn: 'Flat Center 20', icon: 'Building2', description: 'อาคารพักอาศัยแฟลตศูนย์ 20 พื้นที่ส่วนกลางและบริเวณรอบอาคาร', defaultChecklist: DEFAULT_FLAT_CHECKLIST }
];

export const INITIAL_STAFF: CleaningStaff[] = [
  {
    id: 'STF-001',
    name: 'สมศรี มีทรัพย์',
    nickname: 'ป้าศรี',
    phone: '081-234-5678',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    assignedZones: ['flat_4', 'flat_5', 'flat_6', 'flat_7'],
    pin: '1234'
  },
  {
    id: 'STF-002',
    name: 'มาลี รักสะอาด',
    nickname: 'พี่ลี',
    phone: '089-876-5432',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    assignedZones: ['flat_8', 'flat_9', 'flat_10', 'flat_11'],
    pin: '1234'
  },
  {
    id: 'STF-003',
    name: 'ประสิทธิ์ ขยันทำ',
    nickname: 'ช่างสิทธิ์',
    phone: '086-112-2334',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    assignedZones: ['flat_12', 'flat_13', 'flat_14', 'flat_15'],
    pin: '1234'
  },
  {
    id: 'STF-004',
    name: 'วันเพ็ญ สดใส',
    nickname: 'เพ็ญ',
    phone: '092-334-5566',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    assignedZones: ['flat_16', 'flat_17', 'flat_18', 'flat_19', 'flat_20'],
    pin: '1234'
  }
];

export const INITIAL_SUPPLIES: SupplyItem[] = [
  { id: 'SUP-01', name: 'ถุงขยะดำ 30x40 นิ้ว', unit: 'แพ็ค', category: 'equipment', stock: 24, minAlert: 10 },
  { id: 'SUP-02', name: 'ถุงขยะใส 24x28 นิ้ว', unit: 'แพ็ค', category: 'equipment', stock: 15, minAlert: 8 },
  { id: 'SUP-03', name: 'น้ำยาถูพื้นฆ่าเชื้อ (กลิ่นตะไคร้หอม)', unit: 'แกลลอน', category: 'chemical', stock: 6, minAlert: 3 },
  { id: 'SUP-04', name: 'น้ำยาล้างห้องน้ำกรดอ่อน', unit: 'แกลลอน', category: 'chemical', stock: 4, minAlert: 2 },
  { id: 'SUP-05', name: 'ไม้กวาดทางมะพร้าว ด้ามยาว', unit: 'ด้าม', category: 'equipment', stock: 8, minAlert: 3 },
  { id: 'SUP-06', name: 'ม็อบถูพื้นไมโครไฟเบอร์', unit: 'ชุด', category: 'equipment', stock: 12, minAlert: 4 },
  { id: 'SUP-07', name: 'สบู่เหลวล้างมือฆ่าเชื้อ', unit: 'แกลลอน', category: 'chemical', stock: 5, minAlert: 2 },
  { id: 'SUP-08', name: 'ถุงมือยางสีส้มกันสารเคมี', unit: 'คู่', category: 'protection', stock: 18, minAlert: 5 },
  { id: 'SUP-09', name: 'ผงซักฟอกทำความสะอาดท่อระบายน้ำ', unit: 'ถุง', category: 'chemical', stock: 10, minAlert: 3 },
  { id: 'SUP-10', name: 'สเปรย์แอลกอฮอล์ 75%', unit: 'ขวด', category: 'chemical', stock: 8, minAlert: 3 }
];

const today = new Date().toISOString().split('T')[0];

const d = new Date();
const currentYear = d.getFullYear();
const currentMonth = String(d.getMonth() + 1).padStart(2, '0');

export const INITIAL_TASKS: TaskRecord[] = [
  {
    id: `TSK-OCT-01`,
    timestamp: new Date().toISOString(),
    date: `${currentYear}-${currentMonth}-01`,
    staffId: 'STF-001',
    staffName: 'สมศรี มีทรัพย์ (ป้าศรี)',
    zone: 'flat_4',
    areaDetail: 'แฟลตศูนย์ 4 ชั้น 1-4 โถงทางเดินและบันได',
    startTime: '08:00',
    endTime: '09:30',
    checklist: [
      { item: 'กวาดและถูทำความสะอาดโถงทางเดินส่วนกลางและบันไดทุกชั้น', completed: true },
      { item: 'ทำความสะอาดราวจับบันได ประตูทางเข้า และจุดสัมผัสร่วม', completed: true },
      { item: 'เก็บกวาดขยะบริเวณจุดทิ้งขยะรวมและเปลี่ยนถุงขยะใหม่', completed: true },
      { item: 'ตรวจเช็คและทำความสะอาดรางระบายน้ำรอบอาคารแฟลต', completed: true },
      { item: 'กวาดและทำความสะอาดลานจอดรถและพื้นที่โดยรอบแฟลต', completed: true },
      { item: 'ตรวจเช็คหลอดไฟส่องสว่างส่วนกลางและความเรียบร้อยทั่วไป', completed: true }
    ],
    notes: 'ทำความสะอาดเรียบร้อยทุกชั้น เก็บถุงขยะส่งจุดพักเรียบร้อย',
    status: 'completed',
    supervisorChecked: true,
    supervisorName: 'คุณณัฐวุฒิ (หัวหน้าแผนก)',
    supervisorRating: 5,
    syncedToSheets: true
  },
  {
    id: `TSK-OCT-02`,
    timestamp: new Date().toISOString(),
    date: `${currentYear}-${currentMonth}-01`,
    staffId: 'STF-002',
    staffName: 'มาลี รักสะอาด (พี่ลี)',
    zone: 'flat_8',
    areaDetail: 'แฟลตศูนย์ 8 ทางเดินส่วนกลางและจุดทิ้งขยะ',
    startTime: '08:30',
    endTime: '10:00',
    checklist: [
      { item: 'กวาดและถูทำความสะอาดโถงทางเดินส่วนกลางและบันไดทุกชั้น', completed: true },
      { item: 'ทำความสะอาดราวจับบันได ประตูทางเข้า และจุดสัมผัสร่วม', completed: true },
      { item: 'เก็บกวาดขยะบริเวณจุดทิ้งขยะรวมและเปลี่ยนถุงขยะใหม่', completed: true },
      { item: 'ตรวจเช็คและทำความสะอาดรางระบายน้ำรอบอาคารแฟลต', completed: true },
      { item: 'กวาดและทำความสะอาดลานจอดรถและพื้นที่โดยรอบแฟลต', completed: true },
      { item: 'ตรวจเช็คหลอดไฟส่องสว่างส่วนกลางและความเรียบร้อยทั่วไป', completed: true }
    ],
    notes: 'ล้างทำความสะอาดจุดรวมขยะสะอาดเอี่ยม',
    status: 'completed',
    supervisorChecked: true,
    supervisorName: 'คุณณัฐวุฒิ (หัวหน้าแผนก)',
    supervisorRating: 5,
    syncedToSheets: true
  },
  {
    id: `TSK-OCT-03`,
    timestamp: new Date().toISOString(),
    date: today,
    staffId: 'STF-001',
    staffName: 'สมศรี มีทรัพย์ (ป้าศรี)',
    zone: 'flat_4',
    areaDetail: 'แฟลตศูนย์ 4 บันไดและโถงทางเดินชั้น 1-3',
    startTime: '08:00',
    endTime: '09:15',
    checklist: [
      { item: 'กวาดและถูทำความสะอาดโถงทางเดินส่วนกลางและบันไดทุกชั้น', completed: true },
      { item: 'ทำความสะอาดราวจับบันได ประตูทางเข้า และจุดสัมผัสร่วม', completed: true },
      { item: 'เก็บกวาดขยะบริเวณจุดทิ้งขยะรวมและเปลี่ยนถุงขยะใหม่', completed: true },
      { item: 'ตรวจเช็คและทำความสะอาดรางระบายน้ำรอบอาคารแฟลต', completed: true },
      { item: 'กวาดและทำความสะอาดลานจอดรถและพื้นที่โดยรอบแฟลต', completed: true },
      { item: 'ตรวจเช็คหลอดไฟส่องสว่างส่วนกลางและความเรียบร้อยทั่วไป', completed: true }
    ],
    notes: 'ถูพื้นด้วยน้ำยาฆ่าเชื้อกลิ่นหอมสะอาด',
    status: 'completed',
    supervisorChecked: true,
    supervisorName: 'คุณณัฐวุฒิ (หัวหน้าแผนก)',
    supervisorRating: 5,
    syncedToSheets: false
  },
  {
    id: `TSK-OCT-04`,
    timestamp: new Date().toISOString(),
    date: today,
    staffId: 'STF-003',
    staffName: 'ประสิทธิ์ ขยันทำ (ช่างสิทธิ์)',
    zone: 'flat_12',
    areaDetail: 'แฟลตศูนย์ 12 ลานจอดรถและรางระบายน้ำรอบอาคาร',
    startTime: '09:00',
    endTime: '10:30',
    checklist: [
      { item: 'กวาดและถูทำความสะอาดโถงทางเดินส่วนกลางและบันไดทุกชั้น', completed: true },
      { item: 'ทำความสะอาดราวจับบันได ประตูทางเข้า และจุดสัมผัสร่วม', completed: true },
      { item: 'เก็บกวาดขยะบริเวณจุดทิ้งขยะรวมและเปลี่ยนถุงขยะใหม่', completed: true },
      { item: 'ตรวจเช็คและทำความสะอาดรางระบายน้ำรอบอาคารแฟลต', completed: true },
      { item: 'กวาดและทำความสะอาดลานจอดรถและพื้นที่โดยรอบแฟลต', completed: false },
      { item: 'ตรวจเช็คหลอดไฟส่องสว่างส่วนกลางและความเรียบร้อยทั่วไป', completed: false }
    ],
    notes: 'กำลังตักเศษดินใบไม้ในรางระบายน้ำ',
    status: 'in_progress',
    supervisorChecked: false,
    syncedToSheets: false
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: `ATT-01`,
    staffId: 'STF-001',
    staffName: 'สมศรี มีทรัพย์ (ป้าศรี)',
    date: today,
    clockInTime: '07:00',
    status: 'present',
    note: 'เข้างานตรงเวลา ปฏิบัติงานแฟลตศูนย์ 4-7',
    syncedToSheets: false
  },
  {
    id: `ATT-02`,
    staffId: 'STF-002',
    staffName: 'มาลี รักสะอาด (พี่ลี)',
    date: today,
    clockInTime: '07:15',
    status: 'present',
    note: 'เข้างานตรงเวลา ปฏิบัติงานแฟลตศูนย์ 8-11',
    syncedToSheets: false
  },
  {
    id: `ATT-03`,
    staffId: 'STF-003',
    staffName: 'ประสิทธิ์ ขยันทำ (ช่างสิทธิ์)',
    date: today,
    clockInTime: '07:20',
    status: 'present',
    note: 'เข้างานตรงเวลา ปฏิบัติงานแฟลตศูนย์ 12-15',
    syncedToSheets: false
  }
];

export const INITIAL_ISSUES: IssueReport[] = [
  {
    id: 'ISS-001',
    date: today,
    time: '08:45',
    reportedBy: 'สมศรี มีทรัพย์ (ป้าศรี)',
    zone: 'flat_4',
    location: 'แฟลตศูนย์ 4 บันไดชั้น 2 โคมไฟส่วนกลาง',
    issueType: 'electrical',
    title: 'หลอดไฟบันไดชั้น 2 กะพริบและดับ',
    description: 'พบหลอดไฟตรงชานพักบันไดชั้น 2 ไม่ติด มืดในเวลากลางคืน แจ้งช่างเปลี่ยนหลอด',
    urgency: 'medium',
    status: 'open',
    syncedToSheets: false
  }
];
