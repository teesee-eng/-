export type CleaningZone = 
  | 'flat_4' 
  | 'flat_5' 
  | 'flat_6' 
  | 'flat_7' 
  | 'flat_8' 
  | 'flat_9' 
  | 'flat_10' 
  | 'flat_11' 
  | 'flat_12' 
  | 'flat_13' 
  | 'flat_14' 
  | 'flat_15' 
  | 'flat_16' 
  | 'flat_17' 
  | 'flat_18' 
  | 'flat_19' 
  | 'flat_20'
  | string;

export interface ZoneConfig {
  id: CleaningZone;
  name: string;
  nameEn: string;
  icon: string;
  description: string;
  defaultChecklist: string[];
}

export type ShiftType = string;

export interface CleaningStaff {
  id: string;
  name: string;
  nickname: string;
  phone: string;
  avatar: string;
  assignedZones: CleaningZone[];
  pin?: string;
}

export type UserRole = 'staff' | 'supervisor' | 'admin';

export interface AuthSession {
  id: string;
  name: string;
  nickname?: string;
  role: UserRole;
  email?: string;
  avatar?: string;
  staffId?: string;
  isGoogleAuth?: boolean;
}

export interface TaskRecord {
  id: string;
  timestamp: string;
  date: string; // YYYY-MM-DD
  staffId: string;
  staffName: string;
  zone: CleaningZone;
  areaDetail: string; // e.g. "แฟลตศูนย์ 4 ชั้น 2 โถงทางเดิน"
  shift?: string;
  startTime: string;
  endTime: string;
  checklist: {
    item: string;
    completed: boolean;
  }[];
  beforePhoto?: string;
  afterPhoto?: string;
  notes?: string;
  status: 'completed' | 'in_progress' | 'pending';
  supervisorChecked: boolean;
  supervisorName?: string;
  supervisorRating?: number; // 1-5
  syncedToSheets?: boolean;
  assignedBy?: string;
  priority?: 'normal' | 'high' | 'urgent';
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  clockInTime: string;
  clockOutTime?: string;
  shift?: string;
  temperature?: string;
  note?: string;
  status: 'present' | 'late' | 'completed';
  syncedToSheets?: boolean;
}

export interface IssueReport {
  id: string;
  date: string;
  time: string;
  reportedBy: string;
  zone: CleaningZone;
  location: string;
  issueType: 'water_leak' | 'electrical' | 'broken_furniture' | 'pest' | 'heavy_stain' | 'other';
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  photo?: string;
  status: 'open' | 'in_review' | 'resolved';
  resolvedAt?: string;
  syncedToSheets?: boolean;
}

export interface SupplyItem {
  id: string;
  name: string;
  unit: string;
  category: 'chemical' | 'paper' | 'equipment' | 'protection';
  stock: number;
  minAlert: number;
  requestedQty?: number;
}

export interface SupplyRequest {
  id: string;
  date: string;
  time: string;
  requestedBy: string;
  items: {
    itemId: string;
    itemName: string;
    quantity: number;
    unit: string;
  }[];
  notes?: string;
  status: 'pending' | 'approved' | 'dispatched';
  syncedToSheets?: boolean;
}

export interface SheetConfig {
  spreadsheetId: string;
  spreadsheetUrl: string;
  spreadsheetTitle: string;
  lastSyncedAt?: string;
  autoSync: boolean;
}
