import React from 'react';
import { Users, MessageSquare, Target, Lightbulb, Zap, Heart } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { portfolioData } from '../data/portfolioData';

const SoftSkills: React.FC = () => {
  const [ref, isVisible] = useScrollAnimation(0.1);

  const skillIcons = [
    { icon: MessageSquare, skill: 'Communication' },
    { icon: Users, skill: 'Teamwork' },
    { icon: Target, skill: 'Leadership' },
    { icon: Lightbulb, skill: 'Problem Solving' },
    { icon: Zap, skill: 'Adaptability' },
    { icon: Heart, skill: 'Collaboration' }
  ];

  return (
    <section id="soft-skills" className="py-20 bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Soft Skills
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Essential interpersonal skills that drive successful collaboration and project delivery
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {skillIcons.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className={`group bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-blue-500/50 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/10 text-center cursor-default ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{
                  transitionDelay: `${index * 100}ms`
                }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full mb-4 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-300">
                  <Icon size={24} className="text-blue-400 group-hover:text-blue-300" />
                </div>
                <h3 className="text-white font-medium text-sm">
                  {item.skill}
                </h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SoftSkills;