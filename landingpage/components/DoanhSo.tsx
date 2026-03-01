'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageProvider';
import { Header } from './Header';
import { DOANH_SO_CONTENT, DOANH_SO_UNITS } from '@/constants/doanhSo';

function AnimatedNumber({ value, duration = 2000, decimals = 0, suffix = '', prefix = '' }: { value: number; duration?: number; decimals?: number; suffix?: string; prefix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            const startTime = Date.now();
            const startValue = 0;

            const animate = () => {
              const elapsed = Date.now() - startTime;
              const progress = Math.min(elapsed / duration, 1);
              
              const easeOut = 1 - Math.pow(1 - progress, 3);
              const currentValue = startValue + (value - startValue) * easeOut;
              
              setDisplayValue(currentValue);

              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                setDisplayValue(value);
              }
            };

            requestAnimationFrame(animate);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [value, duration, hasAnimated]);

  const formatValue = (val: number) => {
    if (decimals === 0) {
      return Math.floor(val).toLocaleString();
    }
    return val.toFixed(decimals).replace(/\.?0+$/, '');
  };

  return (
    <div ref={ref}>
      {prefix}{formatValue(displayValue)}{suffix}
    </div>
  );
}

export function DoanhSo() {
  const { language } = useLanguage();
  const content = DOANH_SO_CONTENT[language];
  const units = DOANH_SO_UNITS[language];

  return (
    <section id="revenue" className="relative w-full min-h-screen flex flex-col bg-[#F8F6F7] dark:bg-gray-900" style={{ zIndex: 1 }}>
      <Header />
      
      <div className="relative z-10 flex-1 flex flex-col pt-24 md:pt-32 pb-8 md:pb-16">
        <div className="text-center px-4 md:px-8 mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 dark:text-gray-200">
            {content.title}
          </h1>
        </div>

        <div className="flex-1 px-4 md:px-8 lg:px-16">
          <div className="max-w-7xl mx-auto space-y-8 md:space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 border-b border-black dark:border-gray-700 pb-8 md:pb-8">
              <div className="text-left">
                <div className="text-4xl md:text-4xl lg:text-5xl font-bold mb-2 text-black dark:text-gray-200">
                  <AnimatedNumber value={8.9} duration={2000} decimals={1} suffix={units.billionUSD} />
                </div>
                <p className="text-sm md:text-base text-black dark:text-gray-300">
                  {content.brandValue.billionWorth}
                </p>
              </div>
              <div className="text-left border-l border-black dark:border-gray-700 pl-4 md:pl-4 lg:pl-6">
                <div className="text-4xl md:text-4xl lg:text-5xl font-bold mb-2 text-black dark:text-gray-200">
                  #1
                </div>
                <p className="text-sm md:text-base text-black dark:text-gray-300">
                  {content.brandValue.vietnamMostValuable}
                </p>
              </div>
              <div className="text-left border-l-0 md:border-l border-black dark:border-gray-700 pl-0 md:pl-4 lg:pl-6">
                <div className="text-4xl md:text-4xl lg:text-5xl font-bold mb-2 text-black dark:text-gray-200">
                  #1
                </div>
                <p className="text-sm md:text-base text-black dark:text-gray-300">
                  {content.brandValue.southeastAsiaMostValuable}
                </p>
              </div>
              <div className="text-left border-l border-black dark:border-gray-700 pl-4 md:pl-4 lg:pl-6">
                <div className="text-4xl md:text-4xl lg:text-5xl font-bold mb-2 text-black dark:text-gray-200">
                  #227
                </div>
                <p className="text-sm md:text-base text-black dark:text-gray-300">
                  {content.brandValue.worldMostValuable}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-8 border-b border-black dark:border-gray-700 pb-8 md:pb-8">
              <div>
                <h2 className="text-base md:text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                  {content.markets.title}
                </h2>
                <div className="text-3xl md:text-5xl lg:text-6xl font-bold mb-2 text-black dark:text-gray-200">
                  <AnimatedNumber value={10} duration={2000} />
                </div>
                <p className="text-sm md:text-base text-black dark:text-gray-300">
                  {content.markets.description}
                </p>
              </div>
              <div>
                <h2 className="text-base md:text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                  {content.marketSize.title}
                </h2>
                <div className="text-3xl md:text-5xl lg:text-6xl font-bold mb-2 text-black dark:text-gray-200">
                  <AnimatedNumber value={270} duration={2000} suffix={units.million} />
                </div>
                <p className="text-sm md:text-base text-black dark:text-gray-300">
                  {content.marketSize.description}
                </p>
              </div>
              <div>
                <h2 className="text-base md:text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                  {content.scale.title}
                </h2>
                <div className="text-3xl md:text-5xl lg:text-6xl font-bold mb-2 text-black dark:text-gray-200">
                  <AnimatedNumber value={50000} duration={2000} suffix={units.plus} />
                </div>
                <p className="text-sm md:text-base text-black dark:text-gray-300">
                  {content.scale.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-8">
              <div>
                <h2 className="text-base md:text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                  {content.revenue.title}
                </h2>
                <div className="text-3xl md:text-5xl lg:text-6xl font-bold mb-2 text-black dark:text-gray-200">
                  <AnimatedNumber value={274} duration={2000} suffix={units.thousandTrillion} />
                </div>
                <p className="text-sm md:text-base text-black dark:text-gray-300">
                  {content.revenue.description}
                </p>
              </div>
              <div>
                <h2 className="text-base md:text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                  {content.profit.title}
                </h2>
                <div className="text-3xl md:text-5xl lg:text-6xl font-bold mb-2 text-black dark:text-gray-200">
                  <AnimatedNumber value={40.6} duration={2000} decimals={1} suffix={units.thousandTrillion} />
                </div>
                <p className="text-sm md:text-base text-black dark:text-gray-300">
                  {content.profit.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
