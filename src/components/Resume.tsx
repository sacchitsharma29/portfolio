import React from 'react';
import { Download, FileText, Award, Star } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { getExternalUrl } from '../utils/externalLinks';
import { usePortfolioData } from '../context/PortfolioContext';

const Resume: React.FC = () => {
  const [ref, isVisible] = useScrollAnimation(0.1);
  const { data: portfolioData } = usePortfolioData();
  const certifications = portfolioData.certifications.map((cert) => ({
    ...cert,
    certificateUrl: getExternalUrl(cert.certificateUrl)
  }));

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
                onClick={downloadResume}
                className="group inline-flex items-center space-x-3 rounded-full bg-gradient-to-r from-sky-500 via-cyan-500 to-violet-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-sky-500/20 transition-all duration-300 hover:scale-105 hover:from-sky-400 hover:to-violet-500 hover:shadow-sky-500/30"
              >
                <Download size={24} className="group-hover:animate-bounce" />
                <span>Download Resume</span>
              </button>
            </div>
          </div>
        </div>
        <div className="h-12" />
        {/* Certifications Section */}
        <div id="certifications" className="max-w-5xl mx-auto mt-16 scroll-mt-24">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/20 hover:border-blue-500/50 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/10">
            <h3 className="text-4xl font-extrabold text-white mb-8 text-center tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Certifications</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {certifications.map((cert, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col overflow-hidden rounded-2xl border border-gray-600 bg-gray-700/50 transition-all duration-300 ${cert.certificateUrl ? 'cursor-pointer hover:border-blue-400 hover:bg-blue-900/30' : 'cursor-default opacity-95'}`}
                  onClick={() => cert.certificateUrl && window.open(cert.certificateUrl, '_blank')}
                  tabIndex={cert.certificateUrl ? 0 : -1}
                  role={cert.certificateUrl ? 'button' : undefined}
                  aria-label={cert.certificateUrl ? `Open certificate: ${cert.title}` : undefined}
                  onKeyDown={e => {
                    if (cert.certificateUrl && (e.key === 'Enter' || e.key === ' ')) {
                      window.open(cert.certificateUrl, '_blank');
                    }
                  }}
                >
                  <div className="flex h-36 items-center justify-center border-b border-white/10 bg-slate-950/50 p-4">
                    {cert.imageUrl ? (
                      <img src={cert.imageUrl} alt={cert.title} className="w-full h-auto object-contain max-h-32" />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500">
                        <Award className="h-10 w-10 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="text-lg font-semibold text-white break-words leading-tight" title={cert.title}>{cert.title}</h4>
                    <p className="text-sm text-gray-300 break-words" title={cert.issuer}>{cert.issuer}</p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="text-xs text-blue-300">{cert.year}</span>
                      {cert.credentialId && (
                        <div className="text-right text-xs text-gray-400">Credential ID: {cert.credentialId}</div>
                      )}
                    </div>
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