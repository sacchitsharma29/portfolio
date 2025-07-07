import React from 'react';
import { MapPin, Calendar, User, ExternalLink, Briefcase } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { portfolioData } from '../data/portfolioData';

const Experience: React.FC = () => {
  const [ref, isVisible] = useScrollAnimation(0.1);

  return (
    <section id="experience" className="py-20 bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Experience
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Professional journey building scalable solutions and automating workflows
          </p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-blue-500 to-purple-500"></div>

          {portfolioData.experience.map((exp, index) => (
            <div
              key={exp.id}
              className={`relative mb-16 ${
                index % 2 === 0 ? 'md:pr-1/2' : 'md:pl-1/2 md:ml-8'
              } flex`}
            >
              {/* Timeline dot */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-4 border-gray-900 z-10"></div>

              <div
                className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20 hover:border-blue-500/50 shadow-md hover:shadow-xl hover:shadow-blue-500/10 text-left w-full min-h-[280px] flex flex-col justify-between transition-all duration-500 mb-10 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{
                  transitionDelay: `${index * 300}ms`
                }}
              >
                <div className="flex items-center mb-2">
                  <Briefcase className="text-blue-400 mr-2" size={20} />
                  <span className="text-blue-300 text-sm font-semibold">Experience</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">
                      {exp.position}
                    </h3>
                    <h4 className="text-lg text-blue-400 font-medium">
                      {exp.company}
                    </h4>
                  </div>
                  <div className="sm:text-right mt-2 sm:mt-0">
                    <div className="flex items-center text-gray-400 text-sm mb-1">
                      <Calendar size={16} className="mr-1" />
                      {exp.duration}
                    </div>
                    {exp.location && (
                      <div className="flex items-center text-gray-400 text-sm">
                        <MapPin size={16} className="mr-1" />
                        {exp.location}
                      </div>
                    )}
                  </div>
                </div>

                {exp.mentor && (
                  <div className="flex items-center text-gray-400 text-sm mb-3">
                    <User size={16} className="mr-1" />
                    Mentored by {exp.mentor}
                  </div>
                )}

                <p className="text-gray-300 mb-4">
                  {exp.company === 'DigitRama Marketing Services'
                    ? `${exp.description} (Remote)`
                    : exp.description}
                </p>

                <div className="space-y-2">
                  {exp.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-start">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-300 text-sm">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;