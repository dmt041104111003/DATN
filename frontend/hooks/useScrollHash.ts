'use client';

import { useEffect, useRef } from 'react';

const sectionIds = ['hero', 'about', 'core-values', 'history', 'network', 'team-preview', 'support-preview', 'footer'];

export function useScrollHash() {
  const isScrollingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleInitialHash = () => {
      const hash = window.location.hash.slice(1);
      if (hash && sectionIds.includes(hash)) {
        const element = document.getElementById(hash);
        if (element) {
          isScrollingRef.current = true;
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
              isScrollingRef.current = false;
            }, 1000);
          }, 100);
        }
      }
    };

    if (document.readyState === 'complete') {
      handleInitialHash();
    } else {
      window.addEventListener('load', handleInitialHash);
    }

    const handleHashChange = () => {
      isScrollingRef.current = true;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 1500);
    };

    window.addEventListener('hashchange', handleHashChange);

    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      if (isScrollingRef.current) return;
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollPosition = window.scrollY + 100; 
        
        let currentSection = sectionIds[0];
        
        for (let i = 0; i < sectionIds.length; i++) {
          const element = document.getElementById(sectionIds[i]);
          if (element) {
            const rect = element.getBoundingClientRect();
            const elementTop = rect.top + window.scrollY;
            
            if (scrollPosition >= elementTop) {
              currentSection = sectionIds[i];
            } else {
              break;
            }
          }
        }
        
        const newHash = `#${currentSection}`;
        if (window.location.hash !== newHash) {
          window.history.replaceState(null, '', newHash);
        }
      }, 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('load', handleInitialHash);
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('scroll', handleScroll);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      clearTimeout(scrollTimeout);
    };
  }, []);
}
