import React, { useState, useEffect } from 'react';
import Preloader from './components/Preloader';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import TechStack from './components/TechStack';
import Experience from './components/Experience';
import Education from './components/Education';
import SoftSkills from './components/SoftSkills';
import Projects from './components/Projects';
import Resume from './components/Resume';
import Contact from './components/Contact';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  const handlePreloaderComplete = () => {
    setIsLoading(false);
  };

  useEffect(() => {
    // Smooth scrolling for the entire page
    document.documentElement.style.scrollBehavior = 'smooth';
    
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      {isLoading ? (
        <Preloader onComplete={handlePreloaderComplete} />
      ) : (
        <>
          <Navigation />
          <main>
            <Hero />
            <div id="about">
              <TechStack />
              <Experience />
              <Education />
              <SoftSkills />
            </div>
            <Projects />
            <Resume />
            <Contact />
          </main>
          
          {/* Footer */}
          <footer className="bg-gray-800 border-t border-gray-700 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <p className="text-gray-400">
                  © 2024 Sacchit Sharma. Built with React, TypeScript, and Tailwind CSS.
                </p>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}

export default App;