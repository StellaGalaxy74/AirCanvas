import React, { useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';

export function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { cursor, gesture, color, handMode } = useStore();
  const particles = useRef<any[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      // Resize canvas to match display size
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }

      // Fade effect
      ctx.fillStyle = 'rgba(9, 9, 11, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add particles if drawing
      if (handMode && cursor && gesture === 'DRAWING') {
        const x = cursor.x * canvas.width;
        const y = cursor.y * canvas.height;
        for (let i = 0; i < 5; i++) {
          particles.current.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 1,
            color: color
          });
        }
      }

      // Update and draw particles
      particles.current.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;

        if (p.life <= 0) {
          particles.current.splice(i, 1);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.life * 5, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life;
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [cursor, gesture, color, handMode]);

  // Handle mouse fallback for particles
  const handleMouseMove = (e: React.MouseEvent) => {
    if (handMode) return;
    if (e.buttons !== 1) return; // Only if left clicking
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    for (let i = 0; i < 3; i++) {
      particles.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        life: 1,
        color: color
      });
    }
  };

  return (
    <div className="w-full h-full absolute inset-0 bg-zinc-950">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full touch-none"
        onMouseMove={handleMouseMove}
      />
      <div className="absolute top-4 left-4 text-xs font-mono text-zinc-500 pointer-events-none">
        <p>PARTICLE PLAYGROUND</p>
        <p className="text-zinc-600 mt-1">Use DRAW gesture to emit particles</p>
      </div>
    </div>
  );
}
