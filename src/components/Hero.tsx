import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, Download, Rocket, Mail, Github, Linkedin, Instagram, Twitter } from 'lucide-react';
import { useTypewriter } from '../hooks/useScrollAnimation';
import { portfolioData } from '../data/portfolioData';

const Hero: React.FC = () => {
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const { displayText, isComplete, reset } = useTypewriter(portfolioData.personal.roles[currentRoleIndex], 100);

  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => {
        setCurrentRoleIndex((prev) => (prev + 1) % portfolioData.personal.roles.length);
        reset();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isComplete, reset]);

  // Memoize floating code elements positions and delays
  const floatingElements = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
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
  ];

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
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-lg">
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
              onClick={() => window.open('/resume.pdf', '_blank')}
              className="group bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 flex items-center space-x-2"
            >
              <Download size={20} />
              <span>Download Resume</span>
            </button>
            
            <button
              onClick={() => scrollToSection('projects')}
              className="group border-2 border-blue-500 text-blue-400 px-8 py-3 rounded-full font-semibold hover:bg-blue-500 hover:text-white transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
            >
              <Rocket size={20} />
              <span>Explore Projects</span>
            </button>
            
            <button
              onClick={() => scrollToSection('contact')}
              className="group border-2 border-gray-600 text-gray-400 px-8 py-3 rounded-full font-semibold hover:bg-gray-600 hover:text-white transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
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
                  className="text-gray-400 hover:text-blue-400 transition-colors duration-300 transform hover:scale-110"
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