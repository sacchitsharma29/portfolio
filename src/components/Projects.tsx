import React, { useEffect, useState } from 'react';
import { Github, ExternalLink } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { getExternalUrl } from '../utils/externalLinks';
import { usePortfolioData } from '../context/PortfolioContext';

const categoryLabels: Record<string, string> = {
  DevOps: 'DevOps Projects',
  'AI-Utility': 'AI Utility Projects',
  Python: 'Python Projects',
  'Full Stack': 'Full Stack Projects'
};

const Projects: React.FC = () => {
  const [ref, isVisible] = useScrollAnimation(0.1);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { data: portfolioData } = usePortfolioData();

  const projectsByCategory = portfolioData.projects.reduce((acc, project) => {
    const cat = project.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(project);
    return acc;
  }, {} as Record<string, typeof portfolioData.projects>);

  const usedCategories = Array.from(new Set(portfolioData.projects.map((project) => (project.category || 'Other').trim()).filter(Boolean)));
  const configuredCategories = (portfolioData.projectSections || []).map((section) => section.trim()).filter(Boolean);
  const categoryOrder = [
    ...configuredCategories,
    ...usedCategories.filter((category) => !configuredCategories.includes(category))
  ];

  const availableCategories = categoryOrder.filter((cat) => (projectsByCategory[cat] || []).length > 0);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setSelectedCategory(detail === null ? null : String(detail));
      // scroll into view handled by caller
    };

    window.addEventListener('projectCategorySelect', handler as EventListener);
    return () => window.removeEventListener('projectCategorySelect', handler as EventListener);
  }, []);

  return (
    <section id="projects" className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Projects</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">Explore my work across DevOps, AI, Python, and Full Stack development.</p>
        </div>

        <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium border transition ${
              selectedCategory === null
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-slate-700 text-white border-white/10 hover:bg-slate-600'
            }`}
          >
            All Projects
          </button>
          {availableCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium border transition ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-slate-700 text-white border-white/10 hover:bg-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {categoryOrder.map((cat) => {
          if (selectedCategory && selectedCategory !== cat) return null;
          const group = projectsByCategory[cat];
          if (!group || group.length === 0) return null;

          return (
            <div key={cat} className="mb-16">
              <h3 className="text-2xl font-bold text-blue-300 mb-8 text-left">{categoryLabels[cat] || cat}</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-2">
                {(expanded[cat] ? group : group.slice(0, 2)).map((project, index) => (
                  <div
                    key={project.id}
                    className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-blue-500/20 bg-gray-800/50 shadow-md backdrop-blur-sm transition-all duration-500 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                    style={{ transitionDelay: `${index * 150}ms` }}
                  >
                    <div className="flex flex-1 flex-col p-3">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{project.title}</h3>
                        {project.title === 'Legal AI Advisor' && (
                          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow">Featured</div>
                        )}
                      </div>
                      <p className="mb-4 text-sm leading-relaxed text-gray-300">{project.description}</p>
                      <div className="mb-4 flex flex-wrap gap-2">
                        {project.techStack.map((tech, techIndex) => (
                          <span key={techIndex} className="rounded-full border border-blue-500/30 bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-2.5 py-1 text-xs text-blue-300">{tech}</span>
                        ))}
                      </div>
                      <div className="mt-auto flex flex-wrap gap-3">
                        {getExternalUrl(project.githubUrl) && (
                          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 rounded-lg border border-blue-400 bg-gray-800 px-3 py-2 font-semibold text-blue-400 transition-colors duration-300 hover:bg-blue-500 hover:text-white">
                            <Github size={16} />
                            <span className="text-xs">View Code</span>
                          </a>
                        )}
                        {getExternalUrl(project.liveUrl) && (
                          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-2 font-semibold text-white transition-all duration-300 hover:from-blue-600 hover:to-purple-700">
                            <ExternalLink size={16} />
                            <span className="text-xs">Live Demo</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {group.length > 2 && (
                <div className="flex justify-center mt-6">
                  <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg" onClick={() => setExpanded((prev) => ({ ...prev, [cat]: !prev[cat] }))}>
                    {expanded[cat] ? 'Show Less' : 'Show More'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Projects;
