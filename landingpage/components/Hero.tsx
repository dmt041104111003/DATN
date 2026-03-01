'use client';

import { useLanguage } from '@/context/LanguageProvider';
import { HERO_CONTENT } from '@/constants/hero';
import Link from 'next/link';
import { Header } from './Header';
import { useState, useEffect } from 'react';

const HERO_SLIDES = ['/1.webp', '/2.webp', '/3.webp', '/4.webp', '/5.webp', '/6.webp', '/7.webp', '/bot.png'];

export function Hero() {
  const { language } = useLanguage();
  const content = HERO_CONTENT[language];
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setSlideIndex((i) => (i + 1) % HERO_SLIDES.length);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="hero" className="relative w-full h-screen flex flex-col overflow-hidden bg-[#f6f6f6] dark:bg-gray-900">
      <Header />

      <div className="relative flex-1 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 lg:gap-10 px-4 md:px-6 lg:px-8 pt-20 md:pt-24 pb-6 min-h-0 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0" aria-hidden>
          <div className="hero-ripple-wrapper">
            <div className="hero-ripple" />
            <div className="hero-ripple" />
            <div className="hero-ripple" />
            <div className="hero-ripple" />
          </div>
        </div>
        <div className="main relative z-10 w-full max-w-[260px] sm:max-w-[320px] md:max-w-[380px] flex-shrink-0 flex justify-center items-center">
          <img className="logo lazy absolute opacity-0 w-0 h-0" data-src="/static/images/logo.eef1810b1229.png" src="/static/images/logo.eef1810b1229.png" alt="" />
          <div className="w-full overflow-visible p-3 md:p-4 pb-6" style={{ aspectRatio: '29.1/32.37' }}>
          <svg className="carousel w-full h-full block drop-shadow-[0_8px_24px_rgba(234,32,53,0.25)] overflow-visible" viewBox="0 0 29.1 32.37" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" style={{ overflow: 'visible' }}>
            <defs>
              <path id="bannerOuter" d="M28.31,6.962c-1.945-5.343-7.853-8.099-13.196-6.153l-8.271,3.01c-5.344,1.945-7.983,7.629-6.039,12.973c0.52,1.428,1.578,3.359,2.545,4.831l6.163,10.562h0.127l0,0c0.009-0.14,0.022-0.29,0.04-0.448c0.004-0.038,0.01-0.08,0.015-0.12c0.015-0.126,0.032-0.255,0.052-0.392c0.006-0.041,0.014-0.086,0.02-0.128c0.023-0.147,0.05-0.298,0.08-0.453c0.006-0.032,0.013-0.065,0.019-0.099c0.037-0.188,0.078-0.381,0.125-0.579c0-0.003,0.001-0.005,0.002-0.007c0.203-0.861,0.5-1.814,0.912-2.775l0,0c0.577-1.345,1.263-2.582,2.357-3.723c0.826-1.02,8.896-3.303,8.896-3.303C27.5,18.213,30.255,12.305,28.31,6.962z" />
            </defs>
            <mask id="myMask">
              <rect x="0" y="0" width="29.1" height="32.37" fill="black" />
              <use href="#bannerOuter" fill="white" />
            </mask>
            <path fill="#EA2035" fillRule="evenodd" d="M28.31,6.962c-1.945-5.343-7.853-8.099-13.196-6.153l-8.271,3.01c-5.344,1.945-7.983,7.629-6.039,12.973c0.52,1.428,1.578,3.359,2.545,4.831l6.163,10.562h0.127l0,0c0.009-0.14,0.022-0.29,0.04-0.448c0.004-0.038,0.01-0.08,0.015-0.12c0.015-0.126,0.032-0.255,0.052-0.392c0.006-0.041,0.014-0.086,0.02-0.128c0.023-0.147,0.05-0.298,0.08-0.453c0.006-0.032,0.013-0.065,0.019-0.099c0.037-0.188,0.078-0.381,0.125-0.579c0-0.003,0.001-0.005,0.002-0.007c0.203-0.861,0.5-1.814,0.912-2.775l0,0c0.577-1.345,1.263-2.582,2.357-3.723c0.826-1.02,8.896-3.303,8.896-3.303C27.5,18.213,30.255,12.305,28.31,6.962z M20.927,16.78c0,0-8.54,2.711-9.727,3.785c-0.583,0.552-1.863,2.476-2.113,4.275c0,0-4.679-8.12-5.02-9.056c-1.266-3.478,0.527-7.322,4.005-8.588l8.271-3.011c3.478-1.266,7.323,0.527,8.588,4.005C26.197,11.67,24.404,15.514,20.927,16.78z" />
            <g mask="url(#myMask)">
              <g
                className="hero-carousel-track"
                transform={`translate(${-slideIndex * 29.1}, 0)`}
                style={{ transition: 'transform 0.6s ease-in-out' }}
              >
                {HERO_SLIDES.map((src, i) => (
                  <image key={src} href={src} x={i * 29.1} y={0} width="29.1" height="32.37" preserveAspectRatio="xMidYMid slice" />
                ))}
              </g>
            </g>
          </svg>
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-start text-left w-full max-w-xl pr-8 sm:pr-10 md:pr-12 lg:pr-16">
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mb-2 md:mb-3 tracking-wide">
            {content.tagline}
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 dark:text-gray-100 leading-tight mb-4 md:mb-6">
            {content.titleLine1}
            <br />
            {content.titleLine2}
          </h1>
          <Link
            href="#about"
            className="text-sm md:text-base text-gray-600 dark:text-gray-400 hover:text-[#ee2c2c] dark:hover:text-red-400 transition-colors border-b-2 border-[#ee2c2c] dark:border-red-500 pb-0.5 w-fit"
          >
            {content.ctaText}
          </Link>
        </div>
      </div>
    </section>
  );
}
