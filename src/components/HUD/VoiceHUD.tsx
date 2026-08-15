import React, { useEffect, useState } from 'react';
import { useVoiceCommands } from '../../hooks/useVoiceCommands';
import { Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function VoiceHUD() {
  const { lastCommand, listening } = useVoiceCommands();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (lastCommand) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 4000);
      return () => clearTimeout(t);
    }
  }, [lastCommand]);

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex flex-col items-center">
      <AnimatePresence>
        {visible && lastCommand && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="bg-zinc-900/90 backdrop-blur-md border border-zinc-700/50 rounded-2xl p-4 shadow-2xl flex flex-col items-center gap-2"
          >
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider">
              {listening ? <Mic className="w-4 h-4 animate-pulse" /> : <MicOff className="w-4 h-4 text-zinc-500" />}
              VOICE COMMAND
            </div>
            <p className="text-white text-lg font-medium">"{lastCommand}"</p>
            <div className="text-emerald-400 text-xs font-mono">✓ Executed</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
