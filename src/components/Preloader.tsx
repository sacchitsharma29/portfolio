import React, { useState, useEffect, useRef } from 'react';

const loadingTexts = [
  'Initializing...',
  'Loading portfolio...',
  'Connecting to servers...',
  'Securing connections...',
  'Ready to launch!'
];

const Preloader: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [textIndex, setTextIndex] = useState(0);
  const completionTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          completionTimeoutRef.current = window.setTimeout(onComplete, 150);
          return 100;
        }
        return prev + 5;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [onComplete]);

  useEffect(() => {
    return () => {
      if (completionTimeoutRef.current !== null) {
        window.clearTimeout(completionTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const textInterval = setInterval(() => {
      setTextIndex(prev => (prev + 1) % loadingTexts.length);
    }, 300);

    return () => clearInterval(textInterval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950">
      <div className="text-center" aria-live="polite">
        <div className="relative mb-8">
          <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-violet-400 animate-pulse">
            SS
          </div>
          <div className="absolute inset-0 text-6xl font-bold text-sky-400/20 animate-ping">
            SS
          </div>
        </div>
        
        <div className="mb-6">
          <div className="w-64 h-1 overflow-hidden rounded-full bg-white/10">
            <div 
              className="h-full bg-gradient-to-r from-sky-500 via-cyan-400 to-violet-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        <div className="font-mono text-sm text-slate-300">
          {loadingTexts[textIndex]}
        </div>
        
        <div className="mt-4 text-xs text-slate-500">
          {progress}%
        </div>
      </div>
    </div>
  );
};

export default Preloader;