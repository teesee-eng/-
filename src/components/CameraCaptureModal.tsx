import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  X, 
  RotateCw, 
  Check, 
  RefreshCw, 
  AlertCircle, 
  Upload, 
  Sparkles,
  SwitchCamera
} from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
  title?: string;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = 'ถ่ายรูปผลงานทำความสะอาด'
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  // Stop current active media stream
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
  }, []);

  // Start media stream
  const startCamera = useCallback(async (mode: 'environment' | 'user') => {
    stopStream();
    setErrorMsg(null);
    setIsInitializing(true);
    setCapturedImage(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('เบราว์เซอร์นี้ไม่รองรับการเข้าถึงกล้องโดยตรง');
      }

      // Check available video devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      setHasMultipleCameras(videoDevices.length > 1);

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(e => console.warn('Video play warning:', e));
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      let msg = 'ไม่สามารถเปิดกล้องได้';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'กรุณาอนุญาตการเข้าถึงกล้องถ่ายรูปในเบราว์เซอร์ของคุณ';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'ไม่พบอุปกรณ์กล้องในเครื่องของคุณ';
      } else if (err.name === 'NotReadableError') {
        msg = 'กล้องกำลังถูกใช้งานโดยแอปพลิเคชันอื่น';
      } else if (err.message) {
        msg = err.message;
      }
      setErrorMsg(msg);
    } finally {
      setIsInitializing(false);
    }
  }, [stopStream]);

  // Handle open / close lifecycle
  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      stopStream();
      setCapturedImage(null);
      setErrorMsg(null);
    }

    return () => {
      stopStream();
    };
  }, [isOpen, facingMode, startCamera, stopStream]);

  // Capture snapshot from video element
  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // If user front camera, mirror image
      if (facingMode === 'user') {
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, width, height);

      // Watermark with timestamp for audit proof
      const now = new Date();
      const timeStr = `${now.toLocaleDateString('th-TH')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} น.`;
      
      // Reset transform if mirrored
      if (facingMode === 'user') {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }
      
      // Stamp
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(10, height - 35, 260, 25);
      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`CleanLog • ${timeStr}`, 20, height - 18);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
      stopStream();
    }
  };

  // Flip camera between environment and user
  const toggleCamera = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Fallback file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        onCapture(result);
        onClose();
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmCapture = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera(facingMode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-gray-900 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-800 flex flex-col max-h-[95vh]">
        
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 bg-gray-950/70 border-b border-gray-800/80 text-white">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-emerald-600 text-white">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-100">{title}</h3>
              <p className="text-[11px] text-gray-400">
                {facingMode === 'environment' ? 'กล้องหลัง (พื้นที่)' : 'กล้องหน้า'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Viewport */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[320px] max-h-[480px] overflow-hidden">
          
          {/* Error Message */}
          {errorMsg ? (
            <div className="p-6 text-center text-white max-w-sm space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-rose-300">ไม่สามารถเปิดกล้องได้</h4>
                <p className="text-xs text-gray-300 mt-1">{errorMsg}</p>
              </div>

              {/* Fallback to file picker */}
              <div className="pt-2">
                <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-md transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>เลือกรูปจากอุปกรณ์แทน</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <button
                onClick={() => startCamera(facingMode)}
                className="block mx-auto text-xs text-gray-400 hover:text-white underline pt-1"
              >
                ลองใหม่อีกครั้ง
              </button>
            </div>
          ) : capturedImage ? (
            /* Snapshot Preview */
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <img
                src={capturedImage}
                alt="Captured Snapshot"
                className="max-h-[450px] w-full object-contain"
              />
              <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                <Check className="w-3.5 h-3.5" />
                <span>ภาพที่บันทึกแล้ว</span>
              </div>
            </div>
          ) : (
            /* Live Video Stream */
            <div className="relative w-full h-full flex items-center justify-center">
              {isInitializing && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 text-white text-xs gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
                  <span>กำลังเชื่อมต่อกล้องถ่ายรูป...</span>
                </div>
              )}

              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover max-h-[460px] ${
                  facingMode === 'user' ? '-scale-x-100' : ''
                }`}
              />

              {/* Viewfinder crosshairs overlay for camera feel */}
              <div className="absolute inset-6 pointer-events-none border border-white/20 rounded-2xl flex flex-col justify-between p-3">
                <div className="flex justify-between">
                  <span className="w-4 h-4 border-t-2 border-l-2 border-emerald-400"></span>
                  <span className="w-4 h-4 border-t-2 border-r-2 border-emerald-400"></span>
                </div>
                <div className="flex justify-between">
                  <span className="w-4 h-4 border-b-2 border-l-2 border-emerald-400"></span>
                  <span className="w-4 h-4 border-b-2 border-r-2 border-emerald-400"></span>
                </div>
              </div>
            </div>
          )}

          {/* Hidden Canvas for snapshot drawing */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Bottom Control Bar */}
        <div className="p-4 sm:p-5 bg-gray-950 border-t border-gray-800 flex items-center justify-between text-white">
          
          {capturedImage ? (
            /* Actions when photo is taken */
            <div className="w-full flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={retakePhoto}
                className="flex-1 py-3 px-4 rounded-2xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                <span>ถ่ายใหม่</span>
              </button>

              <button
                type="button"
                onClick={confirmCapture}
                className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold shadow-lg shadow-emerald-900/40 transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>ใช้รูปนี้</span>
              </button>
            </div>
          ) : !errorMsg ? (
            /* Live Camera Controls */
            <div className="w-full flex items-center justify-between gap-4">
              
              {/* Choose file fallback button */}
              <label className="p-3 rounded-2xl bg-gray-800/80 hover:bg-gray-800 text-gray-300 hover:text-white text-xs cursor-pointer transition-colors flex items-center gap-1.5" title="เลือกจากอัลบั้ม">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">คลังภาพ</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Shutter Button (Center) */}
              <button
                type="button"
                onClick={takeSnapshot}
                disabled={isInitializing}
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border-4 border-white bg-emerald-600 hover:bg-emerald-500 active:scale-90 flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-transform disabled:opacity-50"
                title="กดถ่ายรูป"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white flex items-center justify-center">
                  <Camera className="w-6 h-6 text-emerald-700" />
                </div>
              </button>

              {/* Switch Camera Button (Environment vs User) */}
              <button
                type="button"
                onClick={toggleCamera}
                disabled={isInitializing}
                className="p-3 rounded-2xl bg-gray-800/80 hover:bg-gray-800 text-gray-300 hover:text-white text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                title="สลับกล้องหน้า/หลัง"
              >
                <SwitchCamera className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">สลับกล้อง</span>
              </button>

            </div>
          ) : (
            <div className="w-full flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs"
              >
                ปิด
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
