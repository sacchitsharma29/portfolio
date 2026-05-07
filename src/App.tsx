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
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import { auth, isFirebaseConfigured } from './firebase';
import { usePortfolioData } from './context/PortfolioContext';

const isAdminPath = () => window.location.pathname === '/admin';

function App() {
  const { data: portfolioData } = usePortfolioData();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminRoute, setIsAdminRoute] = useState(isAdminPath());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const handlePreloaderComplete = () => {
    setIsLoading(false);
  };

  useEffect(() => {
    const handleRouteChange = () => setIsAdminRoute(isAdminPath());
    window.addEventListener('popstate', handleRouteChange);
    handleRouteChange();

    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  useEffect(() => {
    // Track Firebase auth state for admin route access (only if Firebase is configured)
    if (!isFirebaseConfigured || !auth) {
      setIsAuthenticated(false);
      return;
    }

    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isAdminRoute) {
      return;
    }

    document.documentElement.style.scrollBehavior = 'smooth';
    document.documentElement.style.scrollPaddingTop = '5rem';
    
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
      document.documentElement.style.scrollPaddingTop = '';
    };
  }, [isAdminRoute]);

  if (isAdminRoute) {
    // While auth state is initializing, show nothing
    if (isAuthenticated === null) return null;

    if (!isAuthenticated) {
      return <AdminLogin />;
    }

    return <AdminPanel onExit={() => { window.location.assign('/'); }} />;
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950 text-slate-100">
      {isLoading ? (
        <Preloader onComplete={handlePreloaderComplete} />
      ) : (
        <>
          <Navigation />
          <main className="relative z-10">
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
          <footer className="border-t border-white/10 bg-slate-950/90 py-8 backdrop-blur">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <p className="text-sm text-slate-400">
                  {portfolioData.footer.copyrightText}
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