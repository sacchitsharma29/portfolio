import React, { useState, useEffect } from 'react';

const Preloader: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [textIndex, setTextIndex] = useState(0);
  
  const loadingTexts = [
    "Initializing...",
    "Loading portfolio...",
    "Connecting to servers...",
    "Securing connections...",
    "Ready to launch!"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete]);

  useEffect(() => {
    const textInterval = setInterval(() => {
      setTextIndex(prev => (prev + 1) % loadingTexts.length);
    }, 800);

    return () => clearInterval(textInterval);
  }, []);

  return (
    <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 animate-pulse">
            SS
          </div>
          <div className="absolute inset-0 text-6xl font-bold text-blue-400 opacity-20 animate-ping">
            SS
          </div>
        </div>
        
        <div className="mb-6">
          <div className="w-64 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        <div className="text-gray-300 font-mono text-sm">
          {loadingTexts[textIndex]}
        </div>
        
        <div className="mt-4 text-gray-500 text-xs">
          {progress}%
        </div>
      </div>
    </div>
  );
};

export default Preloader;