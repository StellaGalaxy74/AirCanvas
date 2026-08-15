import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Hand, Settings, Download, Undo, Redo, Sparkles, Box, LayoutTemplate } from 'lucide-react';
import { SettingsModal } from '../SettingsModal';
import { cn } from '../../utils/cn';

export function TopNav() {
  const { undo, redo, cameraReady, handMode, setWorkspaceMode, workspaceMode } = useStore();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-4 lg:px-6 shrink-0 bg-zinc-950 z-20">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
          <Hand className="w-5 h-5 text-white" />
        </div>
        <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">AirCanvas X</h1>
        
        <div className="ml-4 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${handMode ? (cameraReady ? 'bg-emerald-500' : 'bg-yellow-500') : 'bg-zinc-600'}`} />
          <span className="text-xs font-medium text-zinc-400">
            {handMode ? (cameraReady ? 'Camera Ready' : 'Starting Camera...') : 'Camera Off'}
          </span>
        </div>
      </div>

      <div className="flex bg-zinc-900 p-1 rounded-xl">
        <button 
          onClick={() => setWorkspaceMode('2D')}
          className={cn("px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2", workspaceMode === '2D' ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white")}
        >
          <LayoutTemplate className="w-4 h-4" /> 2D
        </button>
        <button 
          onClick={() => setWorkspaceMode('3D')}
          className={cn("px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2", workspaceMode === '3D' ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white")}
        >
          <Box className="w-4 h-4" /> 3D
        </button>
        <button 
          onClick={() => setWorkspaceMode('PARTICLES')}
          className={cn("px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2", workspaceMode === 'PARTICLES' ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white")}
        >
          <Sparkles className="w-4 h-4" /> FX
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={undo} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors" title="Undo">
          <Undo className="w-4 h-4" />
        </button>
        <button onClick={redo} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors" title="Redo">
          <Redo className="w-4 h-4" />
        </button>
        
        <div className="w-px h-4 bg-zinc-800 mx-2" />

        <button onClick={() => setShowSettings(true)} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors mr-2" title="Settings">
          <Settings className="w-4 h-4" />
        </button>
        
        <button 
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
          onClick={() => {
            const svgData = document.querySelector('svg')?.outerHTML;
            if (svgData) {
              const blob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'airdraw-export.svg';
              a.click();
            }
          }}
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </header>
  );
}
