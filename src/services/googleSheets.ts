import { getAccessToken } from './firebase';
import { TaskRecord, AttendanceRecord, IssueReport, SupplyRequest } from '../types';

export interface SheetMetadata {
  spreadsheetId: string;
  title: string;
  sheets: { title: string; sheetId: number }[];
}

export function extractSpreadsheetId(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  // Check if it's already an ID (alphanumeric, dashes, underscores)
  if (!trimmed.includes('/') && trimmed.length > 20) {
    return trimmed;
  }
  // Try matching standard Google Sheets URL pattern: /spreadsheets/d/([a-zA-Z0-9-_]+)
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
}

/**
 * Creates a brand new Google Spreadsheet initialized with 4 worksheets and header rows
 */
export async function createCleaningSpreadsheet(customTitle?: string): Promise<{ id: string; url: string }> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('กรุณาลงชื่อเข้าใช้ Google เพื่อสร้าง Google Sheet');
  }

  const title = customTitle || `บันทึกงานทำความสะอาด - Cleaning Logbook (${new Date().toLocaleDateString('th-TH')})`;

  const payload = {
    properties: {
      title,
      locale: 'th_TH',
      timeZone: 'Asia/Bangkok'
    },
    sheets: [
      {
        properties: {
          title: 'บันทึกงาน',
          gridProperties: { rowCount: 100, columnCount: 12, frozenRowCount: 1 }
        }
      },
      {
        properties: {
          title: 'การลงเวลา',
          gridProperties: { rowCount: 100, columnCount: 8, frozenRowCount: 1 }
        }
      },
      {
        properties: {
          title: 'แจ้งซ่อมและปัญหา',
          gridProperties: { rowCount: 100, columnCount: 9, frozenRowCount: 1 }
        }
      },
      {
        properties: {
          title: 'เบิกอุปกรณ์',
          gridProperties: { rowCount: 100, columnCount: 7, frozenRowCount: 1 }
        }
      }
    ]
  };

  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'ไม่สามารถสร้าง Google Sheets ได้');
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl = data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Populate Header Rows
  await initializeSheetHeaders(spreadsheetId, token);

  return { id: spreadsheetId, url: spreadsheetUrl };
}

/**
 * Initializes header rows for each tab
 */
export async function initializeSheetHeaders(spreadsheetId: string, token: string) {
  const headers = [
    {
      range: 'บันทึกงาน!A1:L1',
      values: [[
        'รหัสงาน (ID)',
        'วันที่ (Date)',
        'เวลาเริ่ม (Start)',
        'เวลาเสร็จ (End)',
        'ชื่อพนักงาน (Staff)',
        'โซน (Zone)',
        'รายละเอียดพื้นที่ (Area Detail)',
        'กะทำงาน (Shift)',
        'สถานะ (Status)',
        'เช็คลิสต์ที่สำเร็จ (Completed Items)',
        'หมายเหตุ (Notes)',
        'การตรวจของหัวหน้างาน (Supervisor)'
      ]]
    },
    {
      range: 'การลงเวลา!A1:H1',
      values: [[
        'รหัส (ID)',
        'วันที่ (Date)',
        'เวลาเข้างาน (Clock In)',
        'เวลาออกงาน (Clock Out)',
        'ชื่อพนักงาน (Staff)',
        'กะทำงาน (Shift)',
        'สถานะ (Status)',
        'หมายเหตุ (Note)'
      ]]
    },
    {
      range: 'แจ้งซ่อมและปัญหา!A1:I1',
      values: [[
        'รหัสแจ้ง (ID)',
        'วันที่ (Date)',
        'เวลา (Time)',
        'สถานที่/โซน (Location/Zone)',
        'ประเภทปัญหา (Type)',
        'หัวข้อปัญหา (Title)',
        'รายละเอียด (Detail)',
        'ความเร่งด่วน (Urgency)',
        'ผู้แจ้ง (Reported By)'
      ]]
    },
    {
      range: 'เบิกอุปกรณ์!A1:G1',
      values: [[
        'รหัสใบเบิก (ID)',
        'วันที่ (Date)',
        'เวลา (Time)',
        'ผู้ขอเบิก (Requested By)',
        'รายการที่ขอเบิก (Items)',
        'สถานะ (Status)',
        'หมายเหตุ (Notes)'
      ]]
    }
  ];

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data: headers
    })
  });
}

/**
 * Appends task records into Google Sheets
 */
export async function appendTaskRecords(spreadsheetId: string, tasks: TaskRecord[]) {
  const token = await getAccessToken();
  if (!token) throw new Error('ไม่พบสิทธิ์ Google Account กรุณาเข้าสู่ระบบอีกครั้ง');
  if (tasks.length === 0) return;

  const rows = tasks.map(t => {
    const completedItems = t.checklist.filter(c => c.completed).map(c => c.item).join(', ');
    const supervisor = t.supervisorChecked 
      ? `ตรวจแล้ว โดย ${t.supervisorName || 'หัวหน้างาน'} (${t.supervisorRating || 5} ดาว)` 
      : 'ยังไม่ได้ตรวจ';

    return [
      t.id,
      t.date,
      t.startTime,
      t.endTime,
      t.staffName,
      t.zone,
      t.areaDetail,
      t.shift,
      t.status === 'completed' ? 'เสร็จสิ้น' : t.status === 'in_progress' ? 'กำลังทำ' : 'รอดำเนินการ',
      completedItems,
      t.notes || '',
      supervisor
    ];
  });

  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/บันทึกงาน!A:L:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      range: 'บันทึกงาน!A:L',
      majorDimension: 'ROWS',
      values: rows
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'ไม่สามารถบันทึกข้อมูลงานลง Google Sheets ได้');
  }

  return await res.json();
}

/**
 * Appends attendance records to Google Sheets
 */
export async function appendAttendanceRecords(spreadsheetId: string, records: AttendanceRecord[]) {
  const token = await getAccessToken();
  if (!token) throw new Error('ไม่พบสิทธิ์ Google Account กรุณาเข้าสู่ระบบอีกครั้ง');
  if (records.length === 0) return;

  const rows = records.map(r => [
    r.id,
    r.date,
    r.clockInTime,
    r.clockOutTime || '-',
    r.staffName,
    r.shift,
    r.status === 'present' ? 'ตรงเวลา' : r.status === 'late' ? 'สาย' : 'ครบกะ',
    r.note || ''
  ]);

  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/การลงเวลา!A:H:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      range: 'การลงเวลา!A:H',
      majorDimension: 'ROWS',
      values: rows
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'ไม่สามารถบันทึกการลงเวลาลง Google Sheets ได้');
  }

  return await res.json();
}

/**
 * Appends issue reports to Google Sheets
 */
export async function appendIssueReports(spreadsheetId: string, issues: IssueReport[]) {
  const token = await getAccessToken();
  if (!token) throw new Error('ไม่พบสิทธิ์ Google Account กรุณาเข้าสู่ระบบอีกครั้ง');
  if (issues.length === 0) return;

  const rows = issues.map(i => [
    i.id,
    i.date,
    i.time,
    `${i.zone} - ${i.location}`,
    i.issueType,
    i.title,
    i.description,
    i.urgency,
    i.reportedBy
  ]);

  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/แจ้งซ่อมและปัญหา!A:I:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      range: 'แจ้งซ่อมและปัญหา!A:I',
      majorDimension: 'ROWS',
      values: rows
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'ไม่สามารถบันทึกแจ้งซ่อมลง Google Sheets ได้');
  }

  return await res.json();
}

/**
 * Appends supply requests to Google Sheets
 */
export async function appendSupplyRequests(spreadsheetId: string, requests: SupplyRequest[]) {
  const token = await getAccessToken();
  if (!token) throw new Error('ไม่พบสิทธิ์ Google Account กรุณาเข้าสู่ระบบอีกครั้ง');
  if (requests.length === 0) return;

  const rows = requests.map(req => {
    const itemStr = req.items.map(i => `${i.itemName} (${i.quantity} ${i.unit})`).join(', ');
    return [
      req.id,
      req.date,
      req.time,
      req.requestedBy,
      itemStr,
      req.status,
      req.notes || ''
    ];
  });

  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/เบิกอุปกรณ์!A:G:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      range: 'เบิกอุปกรณ์!A:G',
      majorDimension: 'ROWS',
      values: rows
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'ไม่สามารถบันทึกรายการเบิกอุปกรณ์ลง Google Sheets ได้');
  }

  return await res.json();
}

/**
 * Verifies spreadsheet accessibility
 */
export async function testSpreadsheetAccess(spreadsheetId: string): Promise<SheetMetadata> {
  const token = await getAccessToken();
  if (!token) throw new Error('กรุณาลงชื่อเข้าใช้ Google Account ก่อน');

  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=spreadsheetId,properties.title,sheets.properties(title,sheetId)`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'ไม่สามารถเข้าถึงไฟล์ Google Sheets นี้ได้ กรุณาตรวจสอบสิทธิ์หรือ ID');
  }

  const data = await res.json();
  return {
    spreadsheetId: data.spreadsheetId,
    title: data.properties?.title || 'Google Sheet',
    sheets: (data.sheets || []).map((s: any) => ({
      title: s.properties?.title,
      sheetId: s.properties?.sheetId
    }))
  };
}
