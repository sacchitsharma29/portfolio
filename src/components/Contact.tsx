import React, { useEffect, useState } from 'react';
import emailjs from '@emailjs/browser';
import { Mail, MapPin, Send, Github, Linkedin, Instagram, Twitter } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { getExternalUrl } from '../utils/externalLinks';
import { usePortfolioData } from '../context/PortfolioContext';

const Contact: React.FC = () => {
  const [ref, isVisible] = useScrollAnimation(0.1);
  const { data: portfolioData } = usePortfolioData();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const serviceId = portfolioData.contact.emailjsServiceId?.trim();
    const templateId = portfolioData.contact.emailjsTemplateId?.trim();
    const publicKey = portfolioData.contact.emailjsPublicKey?.trim();
    const recipientEmail = portfolioData.contact.recipientEmail?.trim() || portfolioData.personal.email;

    if (!serviceId || !templateId || !publicKey || !recipientEmail) {
      setStatusType('error');
      setStatusMessage('Contact form is not configured yet. Please try again later.');
      return;
    }

    setIsSending(true);
    setStatusType(null);
    setStatusMessage(null);

    try {
      // Ensure EmailJS is initialized (some SDK versions require init)
      try {
        if (typeof emailjs.init === 'function') {
          emailjs.init(publicKey);
        }
      } catch {
        // ignore init errors
      }

      await emailjs.send(
        serviceId,
        templateId,
        {
          to_email: recipientEmail,
          from_name: formData.name,
          from_email: formData.email,
          reply_to: formData.email,
          subject: `Portfolio Contact from ${formData.name}`,
          message: formData.message
        },
        publicKey
      );

      setStatusType('success');
      setStatusMessage('Message sent successfully. I will get back to you soon.');
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      console.error('EmailJS send error', err);
      setStatusType('error');
      setStatusMessage('Failed to send message. Please try again in a moment.');
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    const publicKey = portfolioData.contact.emailjsPublicKey?.trim();
    if (publicKey && typeof emailjs.init === 'function') {
      try {
        emailjs.init(publicKey);
      } catch {
        // ignore
      }
    }
  }, [portfolioData.contact.emailjsPublicKey]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const socialLinks = [
    { icon: Github, url: portfolioData.social.github, label: 'GitHub' },
    { icon: Linkedin, url: portfolioData.social.linkedin, label: 'LinkedIn' },
    { icon: Instagram, url: portfolioData.social.instagram, label: 'Instagram' },
    { icon: Twitter, url: portfolioData.social.twitter, label: 'Twitter' }
  ].filter((link) => getExternalUrl(link.url));

  const renderIcon = (label: string) => {
    const lower = label.toLowerCase();
    if (lower.includes('email')) return <Mail size={20} className="text-white" />;
    if (lower.includes('location') || lower.includes('address') || lower.includes('place')) return <MapPin size={20} className="text-white" />;
    return <Mail size={20} className="text-white" />;
  };

  return (
    <section id="contact" className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Get In Touch
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Ready to collaborate on your next project? Let's create something amazing together
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div
            className={`transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-white placeholder-gray-400 transition-all duration-300"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-white placeholder-gray-400 transition-all duration-300"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-white placeholder-gray-400 transition-all duration-300 resize-none"
                  placeholder="Tell me about your project or say hello..."
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 flex items-center justify-center space-x-2"
              >
                <Send size={20} />
                <span>{isSending ? 'Sending...' : 'Send Message'}</span>
              </button>
              {statusMessage ? (
                <p className={`text-sm ${statusType === 'success' ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {statusMessage}
                </p>
              ) : null}
            </form>
          </div>

          {/* Contact Information */}
          <div
            className={`transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionDelay: '400ms' }}
          >
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 hover:border-blue-500/50 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/10">
              <h3 className="text-2xl font-bold text-white mb-6">
                Let's Connect
              </h3>
              
              <div className="space-y-6">
                {Array.isArray(portfolioData.contactInfo) && portfolioData.contactInfo.map((item, idx) => (
                  <div key={`${item.label}-${idx}`} className="flex items-start space-x-4">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-full flex-shrink-0">
                      {renderIcon(item.label)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium">{item.label}</h4>
                      <p className="text-gray-400 break-words overflow-hidden">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-gray-700">
                <h4 className="text-white font-medium mb-4">Follow me on social media</h4>
                <div className="flex space-x-4">
                  {socialLinks.map((social, index) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full bg-gray-700 p-3 transition-all duration-300 hover:scale-110 hover:bg-gradient-to-r hover:from-sky-500 hover:to-violet-600 hover:shadow-lg hover:shadow-sky-500/25"
                        aria-label={social.label}
                      >
                        <Icon size={20} className="text-white" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;