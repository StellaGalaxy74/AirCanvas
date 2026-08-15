import React from 'react';
import { useStore } from '../../store/useStore';
import { Toolbar } from '../Toolbar';
import { ControlPanel } from '../ControlPanel';
import { WebcamPreview } from '../Shared/WebcamPreview';
import { Canvas } from '../Canvas';
import { AirCursorLayer } from '../AirCursorLayer';
import { TopNav } from './TopNav';
import { Scene3D } from '../Scene3D/Scene3D';
import { ParticleCanvas } from '../Particles/ParticleCanvas';
import { VoiceHUD } from '../HUD/VoiceHUD';

export function Workspace() {
  const { workspaceMode } = useStore();

  return (
    <div className="w-full h-full flex flex-col bg-zinc-950">
      <TopNav />
      <main className="flex-1 flex overflow-hidden relative">
        <Toolbar />
        
        <div className="flex-1 relative">
          <VoiceHUD />
          {workspaceMode === '2D' && <Canvas />}
          {workspaceMode === '3D' && <Scene3D />}
          {workspaceMode === 'PARTICLES' && <ParticleCanvas />}
          
          <AirCursorLayer />
        </div>
        
        <ControlPanel />
      </main>
      <WebcamPreview />
    </div>
  );
}
