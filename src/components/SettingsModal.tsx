import React from 'react';
import { X, Settings2 } from 'lucide-react';
import { useStore } from '../store/useStore';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { 
    cursorSmoothing, gestureConfidenceFrames, pinchThreshold,
    setSettings
  } = useStore();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <Settings2 className="w-5 h-5 text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold">Settings</h2>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-zinc-300">Cursor Smoothing</label>
              <span className="text-sm text-zinc-500">{cursorSmoothing.toFixed(2)}</span>
            </div>
            <p className="text-xs text-zinc-500 mb-3">
              Higher values increase tracking responsiveness, lower values make cursor movement smoother.
            </p>
            <input 
              type="range" 
              min="0.1" max="1" step="0.05"
              value={cursorSmoothing} 
              onChange={(e) => setSettings({ cursorSmoothing: Number(e.target.value) })}
              className="w-full accent-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-zinc-300">Gesture Smoothing (Frames)</label>
              <span className="text-sm text-zinc-500">{gestureConfidenceFrames}</span>
            </div>
            <p className="text-xs text-zinc-500 mb-3">
              Number of consecutive frames required to confirm a gesture change. Increases stability.
            </p>
            <input 
              type="range" 
              min="1" max="15" step="1"
              value={gestureConfidenceFrames} 
              onChange={(e) => setSettings({ gestureConfidenceFrames: Number(e.target.value) })}
              className="w-full accent-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-zinc-300">Pinch Threshold</label>
              <span className="text-sm text-zinc-500">{pinchThreshold.toFixed(3)}</span>
            </div>
            <p className="text-xs text-zinc-500 mb-3">
              Distance between thumb and index finger to trigger a pinch (Grab/Select).
            </p>
            <input 
              type="range" 
              min="0.01" max="0.15" step="0.005"
              value={pinchThreshold} 
              onChange={(e) => setSettings({ pinchThreshold: Number(e.target.value) })}
              className="w-full accent-indigo-500"
            />
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-8 bg-zinc-100 hover:bg-white text-zinc-900 font-semibold py-3 px-4 rounded-xl transition-all"
        >
          Done
        </button>
      </div>
    </div>
  );
}
