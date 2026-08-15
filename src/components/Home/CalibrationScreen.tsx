import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { WebcamPreview } from '../Shared/WebcamPreview';
import { motion } from 'framer-motion';

export function CalibrationScreen() {
  const { setAppMode, cameraReady, gesture } = useStore();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!cameraReady) return;
    
    // Auto advance steps based on gesture for demo purposes
    if (step === 0) {
      setTimeout(() => setStep(1), 2000);
    } else if (step === 1 && gesture === 'DRAWING') {
      setTimeout(() => setStep(2), 1500);
    } else if (step === 2 && gesture === 'ERASING') {
      setTimeout(() => setStep(3), 1500);
    } else if (step === 3 && gesture === 'PINCHING') {
      setTimeout(() => setStep(4), 1500);
    } else if (step === 4) {
      setTimeout(() => setAppMode('WORKSPACE'), 2000);
    }
  }, [cameraReady, gesture, step, setAppMode]);

  const steps = [
    { title: "HAND DETECTED", instruction: "Show your hand." },
    { title: "CALIBRATING CURSOR", instruction: "Move your index finger to the four corners. (DRAW gesture)" },
    { title: "CALIBRATING ERASE", instruction: "Make a fist." },
    { title: "CALIBRATING GRAB", instruction: "Pinch your fingers." },
    { title: "READY", instruction: "Your creative space is ready." }
  ];

  return (
    <div className="w-full h-full flex items-center justify-center bg-black relative">
      <WebcamPreview fullScreen={true} />
      
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
        <motion.div 
          key={step}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black/80 backdrop-blur-xl border border-white/10 p-10 rounded-3xl text-center shadow-2xl max-w-md w-full"
        >
          <div className="mb-8 font-mono text-xs tracking-[0.3em] text-indigo-400">
            {cameraReady ? 'CALIBRATING...' : 'WAITING FOR CAMERA...'}
          </div>
          
          <div className="flex justify-center gap-3 mb-8">
            {[0,1,2,3].map(i => (
              <div 
                key={i} 
                className={`w-3 h-3 rounded-full transition-all duration-500 ${step > i ? 'bg-indigo-500' : step === i ? 'bg-white scale-125' : 'bg-white/20'}`}
              />
            ))}
          </div>

          <h2 className="text-2xl font-bold mb-4">{steps[Math.min(step, 4)].title}</h2>
          <p className="text-zinc-400">{steps[Math.min(step, 4)].instruction}</p>
          
          {cameraReady && step < 4 && (
             <div className="mt-8 px-4 py-2 bg-white/5 rounded-full inline-block border border-white/10">
               <span className="text-xs font-mono text-emerald-400">Current: {gesture}</span>
             </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
