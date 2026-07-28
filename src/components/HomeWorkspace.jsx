import React, { useState } from 'react';
import { FileText, Sparkles, Trash2, Layers, HelpCircle, ArrowRight } from 'lucide-react';

const POPULAR_TOPICS = [
  "Machine Learning & Neural Networks",
  "Human Anatomy & Healthcare",
  "Financial Accounting & Business",
  "Environmental Science & Sustainability",
  "Ancient Civilizations & World History"
];

export default function HomeWorkspace({
  onAnalyzeNotes,
  isLoading
}) {
  const [notesText, setNotesText] = useState('');

  const handleClear = () => setNotesText('');

  const handleGenerate = (targetTab = 'flashcards') => {
    if (!notesText.trim() || isLoading) return;
    onAnalyzeNotes(notesText, null, targetTab);
  };

  const handlePopularTopicClick = (topic) => {
    setNotesText(topic);
  };

  return (
    <div className="space-y-6 py-2 max-w-3xl mx-auto">
      
      {/* Heading */}
      <div className="text-center space-y-2 py-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          AI Study Assistant
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xl mx-auto">
          Enter any study topic or paste lecture notes below to generate 10 interactive flashcards or a 10-question multiple-choice quiz.
        </p>
      </div>

      {/* Main Topic Input Card */}
      <div className="p-6 rounded-neuron bg-white dark:bg-graphite-900 border border-neutral-200/80 dark:border-neutral-800/80 space-y-4 shadow-subtle dark:shadow-subtle-dark">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-neutral-900 dark:text-white text-sm">What would you like to learn today?</h3>
          </div>
          <span className="text-[11px] text-neutral-400 font-mono">Topic or Notes Input</span>
        </div>

        <div className="space-y-4">
          <textarea
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            disabled={isLoading}
            rows={5}
            placeholder="Enter any topic, subject, or paste lecture notes here..."
            className="w-full p-4 rounded-xl bg-neutral-50 dark:bg-graphite-950 border border-neutral-200/80 dark:border-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition text-sm font-sans resize-none"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleClear}
                disabled={isLoading || !notesText.trim()}
                className="neuron-btn-secondary py-1.5 text-xs"
              >
                <Trash2 className="w-3.5 h-3.5 text-neutral-500" />
                <span>Clear Input</span>
              </button>
            </div>

            <span className="text-xs text-neutral-400 font-mono">
              {notesText ? `${notesText.length} chars` : 'Ready to analyze'}
            </span>
          </div>
        </div>

        {/* Popular Topics Pill Chips */}
        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800/80 space-y-2">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
            Popular Topics:
          </span>
          <div className="flex flex-wrap gap-2">
            {POPULAR_TOPICS.map((topic, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePopularTopicClick(topic)}
                className="px-3 py-1.5 rounded-xl bg-neutral-50 dark:bg-graphite-950 hover:bg-neutral-100 dark:hover:bg-graphite-800 border border-neutral-200/80 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-semibold transition hover:border-indigo-500"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Action Cards Grid Below Input Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        
        {/* Card 1: Study with Flashcards */}
        <div className="p-6 rounded-neuron bg-white dark:bg-graphite-900 border border-neutral-200/80 dark:border-neutral-800/80 space-y-4 flex flex-col justify-between shadow-subtle dark:shadow-subtle-dark">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-600/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white">
                Study with Flashcards
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Generate 10 interactive flashcards. Master concepts one card at a time with a 10-minute timer and re-test wrong cards mode.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleGenerate('flashcards')}
            disabled={isLoading || !notesText.trim()}
            className={`w-full py-2.5 text-xs font-extrabold flex items-center justify-center space-x-2 transition-all rounded-xl ${
              notesText.trim() && !isLoading
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md cursor-pointer'
                : 'bg-neutral-200 dark:bg-graphite-800 text-neutral-400 dark:text-neutral-500 cursor-not-allowed border border-neutral-300/60 dark:border-neutral-700/60'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Start Flashcards (10 Cards)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Card 2: Test Yourself with Quiz */}
        <div className="p-6 rounded-neuron bg-white dark:bg-graphite-900 border border-neutral-200/80 dark:border-neutral-800/80 space-y-4 flex flex-col justify-between shadow-subtle dark:shadow-subtle-dark">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white">
                Test Yourself (Quiz)
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Challenge yourself with a 10-question AI quiz. Track answered/unanswered progress, timer, and detailed answer explanations.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleGenerate('quiz')}
            disabled={isLoading || !notesText.trim()}
            className={`w-full py-2.5 text-xs font-extrabold flex items-center justify-center space-x-2 transition-all rounded-xl ${
              notesText.trim() && !isLoading
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer'
                : 'bg-neutral-200 dark:bg-graphite-800 text-neutral-400 dark:text-neutral-500 cursor-not-allowed border border-neutral-300/60 dark:border-neutral-700/60'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Start Quiz (10 Questions)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}
