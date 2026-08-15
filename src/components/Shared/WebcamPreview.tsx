import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Video } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useHandTracking } from '../../hooks/useHandTracking';

export function WebcamPreview({ fullScreen = false }: { fullScreen?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { handMode, setHandMode, cameraOn, setCameraOn, gesture } = useStore();
  
  const { isInitializing, error } = useHandTracking(videoRef);
  
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (handMode && !stream) {
      startCamera();
    } else if (!handMode && stream) {
      stopCamera();
    }
    
    return () => stopCamera();
  }, [handMode]);
  
  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720, facingMode: "user" } 
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
      setCameraOn(true);
    } catch (e) {
      console.error("Camera access denied", e);
      setCameraOn(false);
      setHandMode(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
    setCameraOn(false);
  };

  if (!handMode) return null;

  return (
    <div className={
      fullScreen 
        ? "absolute inset-0 w-full h-full z-0 overflow-hidden bg-black opacity-30" 
        : "fixed bottom-6 right-6 w-64 h-48 bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-zinc-700/50 flex flex-col pointer-events-auto transition-transform z-50"
    }>
      {!fullScreen && (
        <div className="absolute top-2 left-2 right-2 flex justify-between items-center z-10 px-2">
          <div className="flex items-center gap-2">
            {cameraOn ? (
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-red-500" />
            )}
            <span className="text-xs font-medium text-white/90 drop-shadow-md">
              {isInitializing ? 'Loading Model...' : 'Camera Active'}
            </span>
          </div>
        </div>
      )}
      
      <div className="relative w-full h-full bg-black flex items-center justify-center">
        {error && (
          <p className="text-xs text-red-400 p-4 text-center">{error}</p>
        )}
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover -scale-x-100" 
        />
        
        {/* Gesture overlay */}
        {!fullScreen && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-none">
            <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                {gesture}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
