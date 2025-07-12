import React, { useEffect, useRef } from 'react';

const COLORS = [
  'rgba(99,102,241,0.25)', // blue-500
  'rgba(168,85,247,0.18)', // purple-500
  'rgba(34,197,94,0.18)',  // green-500
];

const NUM_CIRCLES = 3;
const TRAIL_LENGTH = 12;

const CursorBackground: React.FC = () => {
  const circlesRef = useRef<{ x: number; y: number }[]>(
    Array(NUM_CIRCLES).fill({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
  );
  const trailRef = useRef<{ x: number; y: number }[]>(
    Array(TRAIL_LENGTH).fill({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
  );
  const requestRef = useRef<number>();

  useEffect(() => {
    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      // Update trail
      const prev = trailRef.current[0];
      trailRef.current = [mouse, ...trailRef.current.slice(0, TRAIL_LENGTH - 1)];
      // Update circles
      for (let i = 0; i < NUM_CIRCLES; i++) {
        const t = (i + 1) / (NUM_CIRCLES + 1);
        const trailIndex = Math.floor(t * (TRAIL_LENGTH - 1));
        circlesRef.current[i] = trailRef.current[trailIndex];
      }
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
        mixBlendMode: 'lighten',
      }}
      aria-hidden
    >
      {circlesRef.current.map((pos, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: pos.x - 60,
            top: pos.y - 60,
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: COLORS[i % COLORS.length],
            filter: 'blur(32px)',
            transition: 'left 0.12s cubic-bezier(.4,0,.2,1), top 0.12s cubic-bezier(.4,0,.2,1)',
            willChange: 'left, top',
          }}
        />
      ))}
    </div>
  );
};

export default CursorBackground; 