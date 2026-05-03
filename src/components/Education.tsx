import React from 'react';
import { GraduationCap, Award } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { usePortfolioData } from '../context/PortfolioContext';

const Education: React.FC = () => {
  const [ref, isVisible] = useScrollAnimation(0.1);
  const { data: portfolioData } = usePortfolioData();
  const educationEntries = portfolioData.education;
  const hasMultipleEntries = educationEntries.length > 1;

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

        {!hasMultipleEntries ? (
          <div className="flex justify-center">
            {educationEntries.map((education) => (
              <div
                key={education.id}
                className={`max-w-2xl rounded-xl border border-gray-700 bg-gray-800/50 p-8 backdrop-blur-sm transition-all duration-500 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
                    <GraduationCap size={32} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {education.degree}
                  </h3>
                  <div className="flex items-center justify-center text-blue-400 font-medium mb-2">
                    <Award size={16} className="mr-2" />
                    {education.specialization}
                  </div>
                  <h4 className="text-lg text-gray-300 mb-4">
                    {education.institution}
                  </h4>
                </div>

                <div className="rounded-lg bg-gray-700/50 p-5">
                  <h5 className="mb-3 text-white font-semibold">Areas of Focus:</h5>
                  <p className="leading-relaxed text-gray-300">
                    {education.focus}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-1/2 top-0 hidden h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-blue-500 to-purple-500 md:block"></div>

            {educationEntries.map((education, index) => (
              <div
                key={education.id}
                className={`relative mb-10 flex ${index % 2 === 0 ? 'md:justify-start' : 'md:justify-end'}`}
              >
                <div className="absolute left-1/2 top-8 z-10 hidden h-4 w-4 -translate-x-1/2 rounded-full border-4 border-gray-900 bg-gradient-to-r from-blue-500 to-purple-500 md:block"></div>

                <div
                  className={`w-full rounded-xl border border-gray-700 bg-gray-800/50 p-8 backdrop-blur-sm transition-all duration-500 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 md:w-[calc(50%-2rem)] ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{
                    transitionDelay: `${index * 150}ms`
                  }}
                >
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
                      <GraduationCap size={32} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {education.degree}
                    </h3>
                    <div className="flex items-center justify-center text-blue-400 font-medium mb-2">
                      <Award size={16} className="mr-2" />
                      {education.specialization}
                    </div>
                    <h4 className="text-lg text-gray-300 mb-4">
                      {education.institution}
                    </h4>
                  </div>

                  <div className="rounded-lg bg-gray-700/50 p-5">
                    <h5 className="mb-3 text-white font-semibold">Areas of Focus:</h5>
                    <p className="leading-relaxed text-gray-300">
                      {education.focus}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Education;