'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageProvider';
import { HISTORY_ITEMS, HISTORY_TITLE } from '@/constants/history';
import Image from 'next/image';
import { Header } from './Header';

export function History() {
  const { language } = useLanguage();
  const [selectedYear, setSelectedYear] = useState(HISTORY_ITEMS[0].year);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedItem = HISTORY_ITEMS.find((item) => item.year === selectedYear) || HISTORY_ITEMS[0];

  const scrollTimeline = (direction: 'left' | 'right') => {
    if (timelineRef.current) {
      const scrollAmount = 200;
      timelineRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const navigateYear = (direction: 'prev' | 'next') => {
    const currentIndex = HISTORY_ITEMS.findIndex((item) => item.year === selectedYear);
    if (direction === 'prev' && currentIndex > 0) {
      setSelectedYear(HISTORY_ITEMS[currentIndex - 1].year);
    } else if (direction === 'next' && currentIndex < HISTORY_ITEMS.length - 1) {
      setSelectedYear(HISTORY_ITEMS[currentIndex + 1].year);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  return (
    <section id="history" className="relative w-full h-screen flex flex-col overflow-hidden">
      <Header />
      
      <div className="absolute inset-0 z-0">
        <Image
          src="/lichsu.jpg"
          alt="History Background"
          fill
          priority
          className="object-cover"
          quality={90}
        />
        <div className="absolute inset-0 bg-black/60 z-0" />
      </div>
      
      <div className="relative z-10 flex-1 flex flex-col pt-16 md:pt-20 pb-4 md:pb-6 overflow-hidden">
        <div className="text-center px-4 md:px-8 mb-3 md:mb-4 flex-shrink-0">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            {HISTORY_TITLE[language]}
          </h1>
        </div>

        <div className="px-4 md:px-8 mb-3 md:mb-4 flex-shrink-0">
          <div className="max-w-7xl mx-auto relative">
            <div className="md:hidden relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-white rounded-lg border-2 border-gray-300 px-4 py-3 flex items-center justify-between text-gray-800 font-medium"
              >
                <span>{selectedYear}</span>
                <span className="material-icons text-gray-600">
                  {isDropdownOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border-2 border-gray-300 shadow-lg overflow-hidden z-50 max-h-60 overflow-y-auto">
                  {HISTORY_ITEMS.map((item) => (
                    <button
                      key={item.year}
                      onClick={() => {
                        setSelectedYear(item.year);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors ${
                        selectedYear === item.year
                          ? 'bg-red-50 text-[#c41e3a] font-medium'
                          : 'text-gray-800'
                      }`}
                    >
                      {item.year}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden md:block relative">
              <button
                onClick={() => {
                  navigateYear('prev');
                  scrollTimeline('left');
                }}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 text-white hover:text-red-200 transition-colors"
                aria-label="Previous year"
              >
                <span className="material-icons text-2xl md:text-3xl">chevron_left</span>
              </button>
              
              <div
                ref={timelineRef}
                className="flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide px-8 md:px-10 scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {HISTORY_ITEMS.map((item) => (
                  <button
                    key={item.year}
                    onClick={() => setSelectedYear(item.year)}
                    className={`flex-1 min-w-0 px-2 md:px-3 py-1.5 md:py-2 rounded-full font-medium text-xs md:text-sm transition-all whitespace-nowrap ${
                      selectedYear === item.year
                        ? 'bg-white text-gray-800 border-2 border-[#c41e3a]'
                        : 'bg-transparent text-white border-2 border-white/60 hover:bg-white/10'
                    }`}
                  >
                    {item.year}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  navigateYear('next');
                  scrollTimeline('right');
                }}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 text-white hover:text-red-200 transition-colors"
                aria-label="Next year"
              >
                <span className="material-icons text-2xl md:text-3xl">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 md:px-8 lg:px-16 overflow-hidden">
          <div className="max-w-7xl mx-auto h-full">
            <div className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-2xl p-4 md:p-6 lg:p-8 h-full flex flex-col">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8 flex-1 min-h-0">
                <div className="space-y-2 md:space-y-3 overflow-y-auto">
                  <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800 dark:text-gray-200">
                    {selectedItem.title[language]}
                  </h2>
                  <ul className="space-y-2 md:space-y-3">
                    {selectedItem.milestones[language].map((milestone, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-[#c41e3a] mt-1">•</span>
                        <p className="text-xs md:text-sm text-gray-600 leading-relaxed flex-1">
                          {milestone}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="relative w-full h-full min-h-[200px] rounded-lg overflow-hidden">
                  <Image
                    src={selectedItem.image}
                    alt={`History ${selectedItem.year}`}
                    fill
                    priority
                    className="object-cover transition-opacity duration-300"
                    quality={90}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      const basePath = selectedItem.image.replace(/\.(jpg|jpeg|png|webp)$/i, '');
                      const formats = ['jpg', 'jpeg', 'png', 'webp'];
                      const currentFormat = formats.find((f) => selectedItem.image.toLowerCase().endsWith(f)) || 'jpg';
                      const currentIndex = formats.indexOf(currentFormat);
                      
                      if (currentIndex < formats.length - 1) {
                        target.src = `${basePath}.${formats[currentIndex + 1]}`;
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
