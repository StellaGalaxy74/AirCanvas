import React, { useEffect, useRef, useState } from 'react';
import { useStore, Point, Gesture } from '../store/useStore';
import { recognizeShape } from '../utils/shapeRecognition';

// Simple SVGs path generator
function getSvgPathFromStroke(points: Point[]) {
  if (!points.length) return '';
  const d = points.reduce(
    (acc, point, i, arr) => {
      if (i === 0) return `M ${point.x},${point.y}`;
      return `${acc} L ${point.x},${point.y}`;
    },
    ''
  );
  return d;
}

export function AirCursorLayer() {
  const { handMode, tool, color, brushSize, addObject, workspaceMode, appMode } = useStore();
  const cursor = useStore((state) => state.cursor);
  const secondaryCursor = useStore((state) => state.secondaryCursor);
  const gesture = useStore((state) => state.gesture);
  
  const [activePath, setActivePath] = useState<Point[] | null>(null);
  const [trail, setTrail] = useState<Point[]>([]);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  
  const windowSize = useRef({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    const handleResize = () => {
      windowSize.current = { w: window.innerWidth, h: window.innerHeight };
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle gesture logic
  useEffect(() => {
    if (!handMode || !cursor || appMode !== 'WORKSPACE') return;

    const currentPos = {
      x: cursor.x * windowSize.current.w,
      y: cursor.y * windowSize.current.h
    };
    
    // Trail logic
    setTrail(prev => {
      const newTrail = [...prev, currentPos];
      if (newTrail.length > 20) newTrail.shift();
      return newTrail;
    });

    if (workspaceMode === '2D') {
      if (gesture === 'DRAWING' && tool === 'draw') {
        setActivePath((prev) => {
          if (!prev) return [currentPos];
          // Add point if moved enough
          const last = prev[prev.length - 1];
          if (Math.hypot(last.x - currentPos.x, last.y - currentPos.y) > 2) {
            return [...prev, currentPos];
          }
          return prev;
        });
      } else if (gesture !== 'DRAWING' && activePath && activePath.length > 2) {
        
        // Try AI recognition
        const shape = recognizeShape(activePath, color, brushSize, 'layer-1');
        
        if (shape && activePath.length > 15) {
          setAiSuggestion({ ...shape, id: crypto.randomUUID(), originalPoints: [...activePath] });
        } else {
          // Normal path
          const newObj = {
            id: crypto.randomUUID(),
            type: 'path' as const,
            layerId: 'layer-1',
            x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1,
            stroke: color, strokeWidth: brushSize, fill: 'transparent', opacity: 1,
            points: [...activePath]
          };
          addObject(newObj);
        }
        setActivePath(null);
      } else if (gesture !== 'DRAWING') {
        setActivePath(null);
      }
    }

  }, [cursor, gesture, handMode, tool, color, brushSize, addObject, activePath, workspaceMode, appMode]);

  // Handle AI suggestion acceptance/rejection
  useEffect(() => {
    if (aiSuggestion) {
      if (gesture === 'THUMBS_UP' || gesture === 'PINCHING') {
        addObject(aiSuggestion);
        setAiSuggestion(null);
      } else if (gesture === 'THUMBS_DOWN' || gesture === 'ERASING') {
        // Fallback to original path
        addObject({
          id: crypto.randomUUID(),
          type: 'path' as const,
          layerId: 'layer-1',
          x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1,
          stroke: color, strokeWidth: brushSize, fill: 'transparent', opacity: 1,
          points: aiSuggestion.originalPoints
        });
        setAiSuggestion(null);
      }
    }
  }, [gesture, aiSuggestion, addObject, color, brushSize]);

  // Trail fade out loop
  useEffect(() => {
    const int = setInterval(() => {
      setTrail(prev => prev.length > 0 ? prev.slice(1) : []);
    }, 50);
    return () => clearInterval(int);
  }, []);

  if (!handMode || !cursor) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
      {/* Draw the active path so user sees it in real-time (2D Mode only) */}
      {workspaceMode === '2D' && activePath && (
        <svg className="absolute inset-0 w-full h-full">
          <path
            d={getSvgPathFromStroke(activePath)}
            fill="none"
            stroke={color}
            strokeWidth={brushSize}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}

      {/* AI Suggestion Preview */}
      {aiSuggestion && (
        <div className="absolute inset-0 w-full h-full">
          <svg className="absolute inset-0 w-full h-full opacity-50">
            {aiSuggestion.type === 'circle' && (
              <circle cx={aiSuggestion.x} cy={aiSuggestion.y} r={aiSuggestion.radius} fill="none" stroke="#a855f7" strokeWidth={4} strokeDasharray="8 8" className="animate-[spin_4s_linear_infinite]" style={{ transformOrigin: `${aiSuggestion.x}px ${aiSuggestion.y}px` }} />
            )}
            {aiSuggestion.type === 'rect' && (
              <rect x={aiSuggestion.x} y={aiSuggestion.y} width={aiSuggestion.width} height={aiSuggestion.height} fill="none" stroke="#a855f7" strokeWidth={4} strokeDasharray="8 8" />
            )}
          </svg>
          <div 
            className="absolute bg-purple-900/90 text-purple-200 px-4 py-2 rounded-full border border-purple-500/50 flex items-center gap-2 backdrop-blur-sm shadow-xl"
            style={{ left: (aiSuggestion.x || 0) + 40, top: (aiSuggestion.y || 0) - 40 }}
          >
            <span className="text-xl">✨</span> 
            <div>
              <div className="font-bold text-xs uppercase tracking-wider text-purple-300">AI DETECTED</div>
              <div className="font-semibold">{aiSuggestion.type.toUpperCase()}</div>
            </div>
            <div className="flex gap-2 ml-4">
               <div className="text-xs bg-purple-800 px-2 py-1 rounded">👍 Accept</div>
               <div className="text-xs bg-zinc-800 px-2 py-1 rounded">👎 Reject</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Motion Trail */}
      {trail.map((pt, i) => (
         <div 
           key={i}
           className="absolute rounded-full pointer-events-none"
           style={{
             left: pt.x - 2,
             top: pt.y - 2,
             width: 4,
             height: 4,
             backgroundColor: color,
             opacity: (i / trail.length) * 0.5,
             boxShadow: `0 0 8px ${color}`,
           }}
         />
      ))}

      {/* Primary Cursor */}
      <div 
        className="absolute w-8 h-8 rounded-full border-2 shadow-[0_0_15px_rgba(255,255,255,0.8)] transition-all duration-100 flex items-center justify-center backdrop-blur-sm"
        style={{
          transform: `translate(${cursor.x * windowSize.current.w - 16}px, ${cursor.y * windowSize.current.h - 16}px) scale(${gesture === 'PINCHING' ? 0.7 : 1})`,
          borderColor: gesture === 'DRAWING' ? color : 'white',
          backgroundColor: gesture === 'DRAWING' ? color : gesture === 'PINCHING' ? 'rgba(59, 130, 246, 0.5)' : gesture === 'ERASING' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255,255,255,0.1)'
        }}
      >
        {gesture === 'PINCHING' && <div className="w-2 h-2 bg-white rounded-full" />}
      </div>
      
      {/* Secondary Cursor for 2 Hand Mode */}
      {secondaryCursor && (
        <div 
          className="absolute w-8 h-8 rounded-full border-2 border-dashed shadow-[0_0_15px_rgba(255,255,255,0.8)] transition-all duration-100 flex items-center justify-center backdrop-blur-sm"
          style={{
            transform: `translate(${secondaryCursor.x * windowSize.current.w - 16}px, ${secondaryCursor.y * windowSize.current.h - 16}px)`,
            borderColor: 'cyan',
            backgroundColor: 'rgba(6, 182, 212, 0.2)'
          }}
        />
      )}
      
      {/* Gesture State HUD around cursor */}
      {gesture === 'MENU' && (
         <div 
           className="absolute border border-white/20 rounded-full flex items-center justify-center animate-pulse"
           style={{
             width: 120, height: 120,
             left: cursor.x * windowSize.current.w - 60,
             top: cursor.y * windowSize.current.h - 60,
           }}
         >
           <span className="text-white text-xs font-bold tracking-widest drop-shadow-md bg-black/50 px-2 py-1 rounded">MENU</span>
         </div>
      )}
    </div>
  );
}
