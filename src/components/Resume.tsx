import React from 'react';
import { Download, FileText, Award, Star } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { portfolioData } from '../data/portfolioData';

const Resume: React.FC = () => {
  const [ref, isVisible] = useScrollAnimation(0.1);

  return (
    <section id="resume" className="py-20 bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={`transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-blue-500/50 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-8">
                <FileText size={40} className="text-white" />
              </div>
              
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                  Resume
                </span>
              </h2>
              
              <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                Built for recruiters, designed for performance
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <Award className="text-blue-400 w-8 h-8 mx-auto mb-2" />
                  <h3 className="text-white font-semibold mb-1">Certified</h3>
                  <p className="text-gray-300 text-sm">Industry-recognized skills</p>
                </div>
                
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <Star className="text-blue-400 w-8 h-8 mx-auto mb-2" />
                  <h3 className="text-white font-semibold mb-1">Experienced</h3>
                  <p className="text-gray-300 text-sm">Real-world projects</p>
                </div>
                
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <FileText className="text-blue-400 w-8 h-8 mx-auto mb-2" />
                  <h3 className="text-white font-semibold mb-1">Detailed</h3>
                  <p className="text-gray-300 text-sm">Comprehensive overview</p>
                </div>
              </div>
              
              <button
                onClick={() => window.open('/resume.pdf', '_blank')}
                className="group inline-flex items-center space-x-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
              >
                <Download size={24} className="group-hover:animate-bounce" />
                <span>Download Resume</span>
              </button>
            </div>
          </div>
        </div>
        <div className="h-12" />
        {/* Certifications Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/20 hover:border-blue-500/50 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/10">
            <h3 className="text-4xl font-extrabold text-white mb-8 text-center tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Certifications</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {portfolioData.certifications.map((cert, idx) => (
                <div key={idx} className="bg-gray-700/50 rounded-lg p-6 text-left border border-gray-600 hover:border-blue-400 transition-all duration-300 flex items-start gap-4">
                  <Award className="text-blue-400 w-10 h-10 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold mb-1 text-lg">{cert.title}</h4>
                    <p className="text-gray-300 text-sm mb-1">{cert.issuer}</p>
                    <span className="text-blue-300 text-xs">{cert.year}</span>
                    {cert.credentialId && (
                      <div className="text-gray-400 text-xs mt-1">Credential ID: {cert.credentialId}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Resume;