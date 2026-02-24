'use client';

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageProvider';
import { CONTACT_CONTENT } from '@/constants/support';
import { Header } from './Header';

export function Contact() {
  const { language } = useLanguage();
  const content = CONTACT_CONTENT[language];
  const [formData, setFormData] = useState({
    topic: '',
    name: '',
    email: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setFormData({
      topic: '',
      name: '',
      email: '',
      message: '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section id="contact" className="relative w-full min-h-screen flex flex-col bg-white dark:bg-gray-900 overflow-x-hidden">
      <Header />
      
      <div className="relative z-10 flex-1 flex flex-col pt-14 md:pt-20 pb-6 md:pb-12">
        {/* Header Section */}
        <div className="px-3 sm:px-4 md:px-8 lg:px-16 mb-6 md:mb-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 dark:text-gray-200 mb-2 md:mb-3">
              {content.title[language]}
            </h1>
            <p className="text-xs sm:text-sm md:text-base uppercase text-gray-700 dark:text-gray-300 mb-4 md:mb-6">
              {content.subtitle[language]}
            </p>
            
            {/* Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
              {/* Left Column - Description */}
              <div>
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                  {content.info.description?.[language] || 'We always value and appreciate customer feedback, which helps our products and services improve day by day. Our customer care system operates 24/7 to receive your input and continuously enhance our service quality.'}
                </p>
              </div>
              
              {/* Right Column - Contact Details */}
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <span className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">Address: </span>
                  <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{content.info.address[language]}</span>
                </div>
                <div>
                  <span className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">Phone: </span>
                  <a href={`tel:${content.info.phone[language].replace(/\s/g, '')}`} className="text-sm sm:text-base font-semibold text-red-600 dark:text-red-400 hover:underline">
                    {content.info.phone[language]}
                  </a>
                </div>
                {content.info.fax && (
                  <div>
                    <span className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">Fax: </span>
                    <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{content.info.fax[language]}</span>
                  </div>
                )}
                <div>
                  <span className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">Hotline: </span>
                  <a href={`tel:${content.info.hotline?.[language]?.replace(/\s/g, '') || content.info.phone[language].replace(/\s/g, '')}`} className="text-sm sm:text-base font-semibold text-red-600 dark:text-red-400 hover:underline">
                    {content.info.hotline?.[language] || content.info.phone[language]}
                  </a>
                </div>
              </div>
            </div>
            
            {/* Divider */}
            <div className="border-t border-gray-300 dark:border-gray-600"></div>
          </div>
        </div>

        {/* Form Section */}
        <div className="flex-1 px-3 sm:px-4 md:px-8 lg:px-16">
          <div className="max-w-7xl mx-auto">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              {/* Left Column */}
              <div className="space-y-4 sm:space-y-5 md:space-y-6">
                {/* Topic */}
                <div>
                  <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {content.form.topic?.[language] || content.form.subject[language]} <span className="text-red-600 dark:text-red-400">*</span>
                  </label>
                  <select
                    id="topic"
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 appearance-none cursor-pointer"
                  >
                    <option value="">{content.form.topicPlaceholder?.[language] || content.form.subjectPlaceholder[language]}</option>
                    <option value="general">{content.form.topics?.general?.[language] || 'General Inquiry'}</option>
                    <option value="support">{content.form.topics?.support?.[language] || 'Support'}</option>
                    <option value="feedback">{content.form.topics?.feedback?.[language] || 'Feedback'}</option>
                  </select>
                </div>

                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {content.form.name[language]} <span className="text-red-600 dark:text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={content.form.namePlaceholder[language]}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {content.form.email[language]} <span className="text-red-600 dark:text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={content.form.emailPlaceholder[language]}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4 sm:space-y-5 md:space-y-6">
                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {content.form.messageLabel?.[language] || content.form.message[language]} <span className="text-red-600 dark:text-red-400">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={content.form.messagePlaceholder[language]}
                    required
                    rows={8}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 resize-none"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white font-semibold uppercase text-sm sm:text-base rounded border border-red-500 dark:border-red-600 transition-colors duration-200 min-h-[44px]"
                  >
                    {content.form.submit[language]}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
