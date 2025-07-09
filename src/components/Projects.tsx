import React, { useState } from 'react';
import { Github, ExternalLink, Code, Zap } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { portfolioData } from '../data/portfolioData';

const categoryOrder = ["DevOps", "AI-Utility", "Python", "Full Stack"];
const categoryLabels = {
  "DevOps": "DevOps Projects",
  "AI-Utility": "AI Utility Projects",
  "Python": "Python Projects",
  "Full Stack": "Full Stack Projects"
};

const Projects: React.FC = () => {
  const [ref, isVisible] = useScrollAnimation(0.1);
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});

  // Group projects by category
  const projectsByCategory = portfolioData.projects.reduce((acc, project) => {
    const cat = project.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(project);
    return acc;
  }, {} as { [key: string]: typeof portfolioData.projects });

  return (
    <section id="projects" className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Projects
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Explore my work across DevOps, AI, Python, and Full Stack development.
          </p>
        </div>

        {categoryOrder.map((cat) => (
          projectsByCategory[cat] && projectsByCategory[cat].length > 0 && (
            <div key={cat} className="mb-16">
              <h3 className="text-2xl font-bold text-blue-300 mb-8 text-left">
                {(categoryLabels as Record<string, string>)[cat] || cat}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {(expanded[cat] ? projectsByCategory[cat] : projectsByCategory[cat].slice(0, 2)).map((project, index) => (
                  <div
                    key={project.id}
                    className={`group bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-blue-500/20 hover:border-blue-500/50 shadow-md hover:shadow-xl hover:shadow-blue-500/10 mb-10 transition-all duration-500 ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
                    style={{
                      transitionDelay: `${index * 200}ms`
                    }}
                  >
                    <div className="relative overflow-hidden">
                      <img 
                        src={project.image} 
                        alt={project.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {project.title === 'Legal AI Advisor' && (
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow">Featured</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-gray-300 mb-4 leading-relaxed">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {project.techStack.map((tech, techIndex) => (
                          <span 
                            key={techIndex}
                            className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                      <div className="flex space-x-4">
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 border border-blue-400 bg-gray-800 hover:bg-blue-500 text-blue-400 hover:text-white px-4 py-2 rounded-lg transition-colors duration-300 font-semibold"
                        >
                          <Github size={16} />
                          <span className="text-sm">View Code</span>
                        </a>
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-300 font-semibold"
                        >
                          <ExternalLink size={16} />
                          <span className="text-sm">Live Demo</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {projectsByCategory[cat].length > 2 && (
                <div className="flex justify-center mt-6">
                  <button
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg"
                    onClick={() => setExpanded((prev) => ({ ...prev, [cat]: !prev[cat] }))}
                  >
                    {expanded[cat] ? 'Show Less' : 'Show More'}
                  </button>
                </div>
              )}
            </div>
          )
        ))}
      </div>
    </section>
  );
};

export default Projects;