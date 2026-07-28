import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

export default function AnalysisProgress() {
  return (
    <div className="p-8 rounded-neuron bg-white dark:bg-graphite-900 border border-neutral-200/80 dark:border-neutral-800/80 space-y-4 text-center max-w-md mx-auto shadow-subtle dark:shadow-subtle-dark py-12">
      
      <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-600/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
        <Loader2 className="w-7 h-7 animate-spin" />
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white flex items-center justify-center space-x-2">
          <span>Generating AI Study Material...</span>
        </h3>
        <p className="text-xs text-neutral-400">
          Creating 10 personalized flashcards & 10 interactive quiz questions.
        </p>
      </div>

    </div>
  );
}
