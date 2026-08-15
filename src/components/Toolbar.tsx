import React from 'react';
import { 
  Hand, Pencil, Circle, Square, Triangle, 
  Star, Minus, Eraser, MousePointer2, Move, RotateCw, Trash2
} from 'lucide-react';
import { useStore, Tool } from '../store/useStore';
import { cn } from '../utils/cn';

const TOOLS: { id: Tool; icon: React.ElementType; label: string }[] = [
  { id: 'select', icon: MousePointer2, label: 'Select (Pinch)' },
  { id: 'draw', icon: Pencil, label: 'Free Draw (Index)' },
  { id: 'circle', icon: Circle, label: 'Circle' },
  { id: 'rect', icon: Square, label: 'Rectangle' },
  { id: 'triangle', icon: Triangle, label: 'Triangle' },
  { id: 'star', icon: Star, label: 'Star' },
  { id: 'line', icon: Minus, label: 'Line' },
  { id: 'eraser', icon: Eraser, label: 'Eraser (Fist)' },
];

export function Toolbar() {
  const { tool, setTool, handMode, setHandMode, deleteObject, selectedObjectId } = useStore();

  return (
    <div className="w-16 md:w-20 bg-zinc-950 border-r border-zinc-800 flex flex-col items-center py-6 gap-6 z-10 shrink-0">
      
      <button
        onClick={() => setHandMode(!handMode)}
        className={cn(
          "w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all",
          handMode ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50" : "bg-zinc-900 text-zinc-400 hover:text-white"
        )}
        title="Toggle Hand Mode"
      >
        <Hand className="w-6 h-6" />
      </button>

      <div className="w-10 h-px bg-zinc-800 my-2" />

      <div className="flex flex-col gap-2 w-full px-2 md:px-4">
        {TOOLS.map((t) => {
          const Icon = t.icon;
          const isActive = tool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              className={cn(
                "w-full aspect-square rounded-xl flex items-center justify-center transition-all group relative",
                isActive 
                  ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25" 
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              )}
              title={t.label}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              
              {/* Tooltip */}
              <div className="absolute left-full ml-4 px-2 py-1 bg-zinc-800 text-zinc-200 text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                {t.label}
              </div>
            </button>
          );
        })}
      </div>

      <div className="w-10 h-px bg-zinc-800 my-2" />
      
      <button
        onClick={() => {
          if (selectedObjectId) deleteObject(selectedObjectId);
        }}
        disabled={!selectedObjectId}
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
          selectedObjectId 
            ? "text-red-400 hover:bg-red-500/10 hover:text-red-300" 
            : "text-zinc-600 cursor-not-allowed"
        )}
        title="Delete Selected"
      >
        <Trash2 className="w-5 h-5" />
      </button>

    </div>
  );
}
