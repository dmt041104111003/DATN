'use client';

import { useTheme } from '@/context/ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full hover:opacity-80 transition-opacity"
      aria-label="Toggle theme"
    >
      <span className="material-icons text-gray-700 dark:text-gray-200 text-lg md:text-xl">
        {theme === 'light' ? 'dark_mode' : 'light_mode'}
      </span>
    </button>
  );
}
