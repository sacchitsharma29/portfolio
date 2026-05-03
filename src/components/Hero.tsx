import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, Download, Rocket, Mail, Github, Linkedin, Instagram, Twitter } from 'lucide-react';
import { useTypewriter } from '../hooks/useScrollAnimation';
import { getExternalUrl } from '../utils/externalLinks';
import { usePortfolioData } from '../context/PortfolioContext';

const Hero: React.FC = () => {
  const { data: portfolioData } = usePortfolioData();
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const roles = portfolioData.personal.roles.length > 0 ? portfolioData.personal.roles : [''];
  const activeRole = roles[currentRoleIndex % roles.length];
  const { displayText, isComplete, reset } = useTypewriter(activeRole, 100);

  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => {
        setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
        reset();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isComplete, reset, roles.length]);

  // Memoize floating code elements positions and delays
  const floatingElements = useMemo(() => {
    return Array.from({ length: 20 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${8 + Math.random() * 4}s`, // slower: 8-12s
      text: ['docker run', 'kubectl apply', 'git push', 'npm install', 'python app.py'][Math.floor(Math.random() * 5)]
    }));
  }, []);

  const socialLinks = [
    { icon: Github, url: portfolioData.social.github, label: 'GitHub' },
    { icon: Linkedin, url: portfolioData.social.linkedin, label: 'LinkedIn' },
    { icon: Instagram, url: portfolioData.social.instagram, label: 'Instagram' },
    { icon: Twitter, url: portfolioData.social.twitter, label: 'Twitter' }
  ].filter((link) => getExternalUrl(link.url));

  const downloadResume = () => {
    const fileUrl = portfolioData.personal.resumeFileDataUrl;
    if (!fileUrl) {
      window.alert('Resume is not uploaded yet. Please check back soon.');
      return;
    }

    const anchor = document.createElement('a');
    anchor.href = fileUrl;
    anchor.download = portfolioData.personal.resumeFileName || 'resume.pdf';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <section id="hero" className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5" />
          
          {/* Floating Code Elements */}
          <div className="absolute inset-0 overflow-hidden">
            {floatingElements.map((el, i) => (
              <div
                key={i}
                className="absolute text-blue-400/10 font-mono text-sm animate-pulse"
                style={{
                  left: el.left,
                  top: el.top,
                  animationDelay: el.animationDelay,
                  animationDuration: el.animationDuration
                }}
              >
                {el.text}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="hero-name text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-lg">
              <span className="block">{portfolioData.personal.name}</span>
            </h1>
            <div className="text-base sm:text-lg text-blue-300 mb-2 animate-fade-in-slow">Empowering innovation through code, automation, and AI.</div>
            <div className="text-xl sm:text-2xl lg:text-3xl text-gray-300 mb-2 h-12 flex items-center justify-center transition-opacity duration-700 opacity-100">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                {displayText}
                <span className="animate-pulse">|</span>
              </span>
            </div>
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto animate-fade-in-slow">
              {portfolioData.personal.subtitle}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button
              onClick={downloadResume}
              className="group flex items-center space-x-2 rounded-full bg-gradient-to-r from-sky-500 via-cyan-500 to-violet-600 px-8 py-3 font-semibold text-white shadow-lg shadow-sky-500/20 transition-all duration-300 hover:scale-105 hover:from-sky-400 hover:to-violet-500 hover:shadow-sky-500/30"
            >
              <Download size={20} />
              <span>Download Resume</span>
            </button>
            
            <button
              onClick={() => scrollToSection('projects')}
              className="group flex items-center space-x-2 rounded-full border-2 border-sky-500/80 px-8 py-3 font-semibold text-sky-300 transition-all duration-300 hover:scale-105 hover:bg-sky-500 hover:text-white"
            >
              <Rocket size={20} />
              <span>Explore Projects</span>
            </button>
            
            <button
              onClick={() => scrollToSection('contact')}
              className="group flex items-center space-x-2 rounded-full border-2 border-white/15 px-8 py-3 font-semibold text-slate-300 transition-all duration-300 hover:scale-105 hover:bg-white/10 hover:text-white"
            >
              <Mail size={20} />
              <span>Let's Connect</span>
            </button>
          </div>

          <div className="flex justify-center space-x-6 mb-12">
            {socialLinks.map((social, index) => {
              const Icon = social.icon;
              return (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 transition-colors duration-300 hover:scale-110 hover:text-sky-400"
                  aria-label={social.label}
                >
                  <Icon size={24} />
                </a>
              );
            })}
          </div>

          <div className="animate-bounce">
            <button
              onClick={() => scrollToSection('about')}
              className="text-gray-400 hover:text-white transition-colors duration-300"
            >
              <ChevronDown size={32} />
            </button>
          </div>
        </div>
      </section>
      <div className="h-8" />
    </>
  );
};

export default Hero;