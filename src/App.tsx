import React from 'react';
import { useStore } from './store/useStore';
import { HomeScreen } from './components/Home/HomeScreen';
import { CalibrationScreen } from './components/Home/CalibrationScreen';
import { Workspace } from './components/Workspace/Workspace';

export default function App() {
  const { appMode } = useStore();

  return (
    <div className="w-full h-screen bg-black text-white overflow-hidden font-sans select-none">
      {appMode === 'HOME' && <HomeScreen />}
      {appMode === 'CALIBRATION' && <CalibrationScreen />}
      {appMode === 'WORKSPACE' && <Workspace />}
    </div>
  );
}

