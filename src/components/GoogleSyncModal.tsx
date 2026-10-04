import React, { useState } from 'react';
import { 
  X, 
  Table, 
  PlusCircle, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  FileSpreadsheet,
  Link,
  ShieldAlert
} from 'lucide-react';
import { User } from 'firebase/auth';
import { SheetConfig } from '../types';
import { createCleaningSpreadsheet, extractSpreadsheetId, testSpreadsheetAccess } from '../services/googleSheets';

interface GoogleSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogin: () => void;
  sheetConfig: SheetConfig | null;
  onSaveSheetConfig: (config: SheetConfig) => void;
  onTriggerSync: () => void;
  isSyncing: boolean;
  pendingSyncCount: number;
}

export const GoogleSyncModal: React.FC<GoogleSyncModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogin,
  sheetConfig,
  onSaveSheetConfig,
  onTriggerSync,
  isSyncing,
  pendingSyncCount
}) => {
  const [existingUrlOrId, setExistingUrlOrId] = useState('');
  const [customTitle, setCustomTitle] = useState('บันทึกงานทำความสะอาด - CleanLog');
  const [isCreating, setIsCreating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateNew = async () => {
    if (!user) {
      setErrorMsg('กรุณาลงชื่อเข้าใช้ Google ก่อนสร้างสเปรดชีต');
      return;
    }
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsCreating(true);
    try {
      const result = await createCleaningSpreadsheet(customTitle);
      const newConfig: SheetConfig = {
        spreadsheetId: result.id,
        spreadsheetUrl: result.url,
        spreadsheetTitle: customTitle,
        lastSyncedAt: new Date().toISOString(),
        autoSync: true
      };
      onSaveSheetConfig(newConfig);
      setSuccessMsg('สร้าง Google Sheet สำเร็จแล้ว และพร้อมใช้งานทันที!');
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการสร้าง Google Sheet');
    } finally {
      setIsCreating(false);
    }
  };

  const handleConnectExisting = async () => {
    if (!user) {
      setErrorMsg('กรุณาลงชื่อเข้าใช้ Google ก่อนเชื่อมต่อ');
      return;
    }
    const cleanId = extractSpreadsheetId(existingUrlOrId);
    if (!cleanId) {
      setErrorMsg('กรุณาระบุ URL หรือ Spreadsheet ID ที่ถูกต้อง');
      return;
    }
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsTesting(true);
    try {
      const metadata = await testSpreadsheetAccess(cleanId);
      const newConfig: SheetConfig = {
        spreadsheetId: metadata.spreadsheetId,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${metadata.spreadsheetId}/edit`,
        spreadsheetTitle: metadata.title,
        lastSyncedAt: sheetConfig?.lastSyncedAt,
        autoSync: true
      };
      onSaveSheetConfig(newConfig);
      setSuccessMsg(`เชื่อมต่อ Google Sheet "${metadata.title}" สำเร็จแล้ว!`);
      setExistingUrlOrId('');
    } catch (err: any) {
      setErrorMsg(err.message || 'ไม่สามารถเข้าถึง Google Sheet นี้ได้');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                เชื่อมต่อและตั้งค่า Google Sheets
              </h2>
              <p className="text-xs text-gray-500">
                จัดเก็บข้อมูลการทำงาน ตรวจเช็ค และลงเวลาไว้บน Google Drive ของคุณโดยอัตโนมัติ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Check Banner */}
        {!user ? (
          <div className="mt-5 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-amber-900">
                  ต้องเข้าสู่ระบบ Google ก่อนดำเนินการ
                </h4>
                <p className="text-xs text-amber-700 mt-1">
                  ระบบต้องการสิทธิ์เข้าถึง Google Sheets ในบัญชีของคุณเพื่อสร้างและบันทึกข้อมูล
                </p>
                <div className="mt-3">
                  <button
                    onClick={onLogin}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 shadow-xs transition-all"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                    <span>ลงชื่อเข้าใช้ด้วย Google</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-800">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>เข้าสู่ระบบในชื่อ <strong>{user.displayName || user.email}</strong></span>
            </div>
            <span className="text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
              พร้อมซิงค์
            </span>
          </div>
        )}

        {/* Alerts */}
        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Current Linked Sheet Status */}
        {sheetConfig?.spreadsheetId && (
          <div className="mt-5 p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Table className="w-5 h-5 text-emerald-600" />
                <div>
                  <h4 className="text-sm font-bold text-gray-900">
                    {sheetConfig.spreadsheetTitle}
                  </h4>
                  <p className="text-xs text-gray-500 font-mono">
                    ID: {sheetConfig.spreadsheetId}
                  </p>
                </div>
              </div>
              <a
                href={sheetConfig.spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <span>เปิดดูชีต</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="mt-4 pt-3 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="text-gray-600">
                สถานะ: <span className="font-semibold text-emerald-700">เชื่อมต่อแล้ว</span>
                {sheetConfig.lastSyncedAt && (
                  <span className="text-gray-500 ml-2">
                    (ซิงค์ล่าสุด: {new Date(sheetConfig.lastSyncedAt).toLocaleTimeString('th-TH')})
                  </span>
                )}
              </div>
              <button
                onClick={onTriggerSync}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 border border-emerald-300 text-emerald-800 rounded-lg font-medium transition-all shadow-xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'กำลังซิงค์...' : `ซิงค์ข้อมูลเดี๋ยวนี้ (${pendingSyncCount} รายการใหม่)`}</span>
              </button>
            </div>
          </div>
        )}

        {/* Options to Create or Connect */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Option 1: Create New */}
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                <PlusCircle className="w-4 h-4" />
                <span>ตัวเลือกที่ 1: สร้างชีตใหม่ใน 1 คลิก</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                สร้างสเปรดชีตพร้อมแถบข้อมูล 3 หน้า (บันทึกงาน, การลงเวลา, แจ้งซ่อม) โดยอัตโนมัติ
              </p>
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  ชื่อไฟล์ชีต
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  placeholder="เช่น บันทึกงานทำความสะอาด 2569"
                />
              </div>
            </div>
            <button
              onClick={handleCreateNew}
              disabled={isCreating || !user}
              className="mt-4 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {isCreating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <PlusCircle className="w-3.5 h-3.5" />}
              <span>{isCreating ? 'กำลังสร้างชีต...' : 'สร้าง Google Sheet ทันที'}</span>
            </button>
          </div>

          {/* Option 2: Connect Existing */}
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-teal-700 font-bold text-sm">
                <Link className="w-4 h-4" />
                <span>ตัวเลือกที่ 2: ใช้ไฟล์ชีตที่มีอยู่แล้ว</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                วางลิงก์ Google Sheets หรือ Spreadsheet ID จาก Google Drive ของคุณ
              </p>
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  URL หรือ ID สเปรดชีต
                </label>
                <input
                  type="text"
                  value={existingUrlOrId}
                  onChange={(e) => setExistingUrlOrId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 bg-white font-mono"
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                />
              </div>
            </div>
            <button
              onClick={handleConnectExisting}
              disabled={isTesting || !user || !existingUrlOrId.trim()}
              className="mt-4 w-full py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Link className="w-3.5 h-3.5" />}
              <span>{isTesting ? 'กำลังตรวจสอบ...' : 'เชื่อมต่อชีตนี้'}</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};
