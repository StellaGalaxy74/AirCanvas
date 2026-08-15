import React from 'react';
import { useStore } from '../store/useStore';
import { cn } from '../utils/cn';

const COLORS = [
  '#ffffff', '#000000', '#f87171', '#fb923c', '#fbbf24', 
  '#4ade80', '#2dd4bf', '#38bdf8', '#818cf8', '#c084fc', '#f472b6'
];

export function ControlPanel() {
  const { color, setColor, fillColor, setFillColor, brushSize, setBrushSize, opacity, setOpacity } = useStore();

  return (
    <div className="w-64 bg-zinc-950 border-l border-zinc-800 p-6 flex flex-col gap-8 z-10 shrink-0 overflow-y-auto">
      
      {/* Properties */}
      <div>
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Stroke</h3>
        
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex justify-between text-xs text-zinc-400 mb-2">
              <span>Size</span>
              <span>{brushSize}px</span>
            </div>
            <input 
              type="range" 
              min="1" max="50" 
              value={brushSize} 
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
          
          <div>
            <div className="flex justify-between text-xs text-zinc-400 mb-2">
              <span>Opacity</span>
              <span>{Math.round(opacity * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="0.1" max="1" step="0.1"
              value={opacity} 
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-zinc-800" />

      {/* Colors */}
      <div>
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Stroke Color</h3>
        <div className="flex flex-wrap gap-2">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={cn(
                "w-8 h-8 rounded-full border-2 transition-transform hover:scale-110",
                color === c ? "border-white" : "border-transparent"
              )}
              style={{ backgroundColor: c }}
            />
          ))}
          <div className="w-8 h-8 rounded-full overflow-hidden relative border-2 border-transparent">
            <input 
              type="color" 
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Fill Colors */}
      <div>
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Fill Color</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFillColor('transparent')}
            className={cn(
              "w-8 h-8 rounded-full border-2 border-zinc-700 flex items-center justify-center transition-transform hover:scale-110 relative overflow-hidden",
              fillColor === 'transparent' ? "border-white" : "border-zinc-700"
            )}
          >
            <div className="w-10 h-px bg-red-500 absolute rotate-45" />
          </button>
          {COLORS.map(c => (
            <button
              key={`fill-${c}`}
              onClick={() => setFillColor(c)}
              className={cn(
                "w-8 h-8 rounded-full border-2 transition-transform hover:scale-110",
                fillColor === c ? "border-white" : "border-transparent"
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
