import React from 'react';
import { MapPin, Calendar, User, Briefcase } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { usePortfolioData } from '../context/PortfolioContext';

const Experience: React.FC = () => {
  const [ref, isVisible] = useScrollAnimation(0.1);
  const { data: portfolioData } = usePortfolioData();

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
          <div className="absolute left-1/2 top-0 hidden h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-sky-500 via-cyan-400 to-violet-500 md:block"></div>

          {portfolioData.experience.map((exp, index) => (
            <div
              key={exp.id}
              className={`relative mb-16 flex ${index % 2 === 0 ? 'md:justify-start' : 'md:justify-end'}`}
            >
              {/* Timeline dot */}
              <div className="absolute left-1/2 top-8 z-10 hidden h-4 w-4 -translate-x-1/2 rounded-full border-4 border-slate-900 bg-gradient-to-r from-sky-500 to-violet-500 md:block"></div>

              <div
                className={`w-full rounded-xl border border-white/10 bg-slate-900/70 p-6 text-left shadow-md shadow-sky-500/5 backdrop-blur-sm transition-all duration-500 hover:border-sky-500/40 hover:shadow-xl hover:shadow-sky-500/10 md:min-h-[280px] md:w-[calc(50%-2rem)] ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{
                  transitionDelay: `${index * 300}ms`
                }}
              >
                <div className="flex items-center mb-2">
                  <Briefcase className="mr-2 text-sky-400" size={20} />
                  <span className="text-sm font-semibold text-sky-300">Experience</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">
                      {exp.position}
                    </h3>
                    <h4 className="text-lg font-medium text-sky-400">
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
                      <div className="mt-2 mr-3 h-2 w-2 flex-shrink-0 rounded-full bg-sky-400"></div>
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