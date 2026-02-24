'use client';

import { useEffect, useState, useRef } from 'react';
import { useLanguage } from '@/context/LanguageProvider';
import { TeamMember } from '@/types';
import Image from 'next/image';

interface TeamPopupProps {
  member: TeamMember | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TeamPopup({ member, isOpen, onClose }: TeamPopupProps) {
  const { language } = useLanguage();
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleScroll = () => {
    setIsScrolling(true);
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 1000);
  };

  useEffect(() => {
    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll);
      return () => {
        contentElement.removeEventListener('scroll', handleScroll);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }
  }, [isOpen]);

  if (!isOpen || !member) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full h-[400px] md:h-[450px] overflow-hidden flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          aria-label="Close"
        >
          <span className="material-icons text-2xl">close</span>
        </button>

        {/* Left Section - Image */}
        <div className="relative w-full md:w-2/5 h-full flex-shrink-0 bg-gray-100 dark:bg-gray-700">
          <Image
            src={member.image}
            alt={member.name[language]}
            fill
            className="object-contain"
            quality={90}
          />
        </div>

        {/* Right Section - Information */}
        <div 
          ref={contentRef}
          className={`flex-1 p-6 md:p-8 flex flex-col overflow-y-auto transition-opacity duration-300 ${
            isScrolling ? 'scrollbar-visible' : 'scrollbar-hidden'
          }`}
        >
          <div className="space-y-4">
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200">
                {member.name[language]}
              </h2>
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
                {member.position[language]}
              </p>
              <div className="w-16 h-1 bg-[#ee2c2c] dark:bg-red-500 rounded" />
            </div>

            {/* Bio Section */}
            {member.bio && (
              <div className="pt-4 space-y-2">
                <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                  {member.bio[language]}
                </p>
              </div>
            )}

            {/* Experience Section */}
            {member.experience && member.experience[language].length > 0 && (
              <div className="pt-4 space-y-2">
                <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-200">
                  {language === 'en' && 'Key Achievements'}
                  {language === 'vi' && 'Thành tựu nổi bật'}
                  {language === 'zh' && '主要成就'}
                  {language === 'fr' && 'Réalisations clés'}
                </h3>
                <ul className="space-y-2">
                  {member.experience[language].map((exp, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-600 dark:text-red-400 mt-1">•</span>
                      <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 flex-1">
                        {exp}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Education Section */}
            {member.education && (
              <div className="pt-4 space-y-2">
                <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-200">
                  {language === 'en' && 'Education'}
                  {language === 'vi' && 'Học vấn'}
                  {language === 'zh' && '教育背景'}
                  {language === 'fr' && 'Formation'}
                </h3>
                <p className="text-sm md:text-base text-gray-700 dark:text-gray-300">
                  {member.education[language]}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
