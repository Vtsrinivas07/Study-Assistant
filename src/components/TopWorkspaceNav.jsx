import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function TopWorkspaceNav({ onNewSession }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full bg-cream/80 dark:bg-graphite-950/80 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Left: Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={onNewSession}>
          <span className="font-extrabold text-lg tracking-tight text-neutral-900 dark:text-white">
            Study Assistant
          </span>
        </div>

        {/* Right Actions: Theme Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-neutral-100 dark:bg-graphite-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-graphite-700 transition"
            title={theme === 'dark' ? "Switch to Light Cream Mode" : "Switch to Dark Graphite Mode"}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-700" />}
          </button>
        </div>

      </div>
    </header>
  );
}
