import React from 'react';
import { GraduationCap, Award, MapPin } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { portfolioData } from '../data/portfolioData';

const Education: React.FC = () => {
  const [ref, isVisible] = useScrollAnimation(0.1);

  return (
    <section id="education" className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Education
            </span>
          </h2>
        </div>

        <div className="flex justify-center">
          <div
            className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 hover:border-blue-500/50 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/10 max-w-2xl ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{
              transitionDelay: '200ms'
            }}
          >
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
                <GraduationCap size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {portfolioData.education.degree}
              </h3>
              <div className="flex items-center justify-center text-blue-400 font-medium mb-2">
                <Award size={16} className="mr-2" />
                {portfolioData.education.specialization}
              </div>
              <h4 className="text-lg text-gray-300 mb-4">
                {portfolioData.education.institution}
              </h4>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-6">
              <h5 className="text-white font-semibold mb-3">Areas of Focus:</h5>
              <p className="text-gray-300 leading-relaxed">
                {portfolioData.education.focus}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Education;