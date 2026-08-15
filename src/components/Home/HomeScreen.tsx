import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { MonitorPlay, MousePointer2 } from 'lucide-react';

export function HomeScreen() {
  const { setAppMode, setHandMode } = useStore();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-black text-white">
      {/* Background Particles Mock */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="z-10 flex flex-col items-center text-center max-w-2xl px-6"
      >
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 bg-gradient-to-br from-white via-white to-zinc-500 bg-clip-text text-transparent">
          AirCanvas X
        </h1>
        <p className="text-xl md:text-2xl text-zinc-400 mb-12 font-medium">
          Create beyond the boundaries of the screen.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
          <button 
            onClick={() => {
              setHandMode(true);
              setAppMode('CALIBRATION');
            }}
            className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-lg transition-all hover:scale-105 flex items-center justify-center gap-3 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity" />
            <MonitorPlay className="w-6 h-6" />
            ENTER CREATIVE SPACE
          </button>
          
          <button 
            onClick={() => {
              setHandMode(false);
              setAppMode('WORKSPACE');
            }}
            className="px-8 py-4 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white rounded-full font-semibold text-lg transition-all hover:scale-105 flex items-center justify-center gap-3"
          >
            <MousePointer2 className="w-5 h-5 text-zinc-400" />
            Mouse Mode
          </button>
        </div>
        
        <div className="mt-16 flex gap-8 text-sm font-medium text-zinc-500">
          <button className="hover:text-white transition-colors">Tutorial</button>
          <button className="hover:text-white transition-colors">Explore Demo</button>
        </div>
      </motion.div>
    </div>
  );
}
