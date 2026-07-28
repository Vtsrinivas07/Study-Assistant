import React, { useState, useEffect } from 'react';
import { Layers, RotateCcw, ArrowLeft, ArrowRight, CheckCircle2, RefreshCw, Pause, Play, AlertCircle, HelpCircle } from 'lucide-react';
import { recordCardSwipe } from '../services/storage';

export default function SwipeableFlashcards({ flashcards = [], topic = 'Study Topic', onFinishDrill, onGoToQuiz, onMetricUpdate, onRegenerate, isRegenerating, onBackToWorkspace }) {
  const [cards, setCards] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);

  // Track cards swiped left ("Review Again") for the Re-Test Mode
  const [wrongCards, setWrongCards] = useState([]);
  const [isReTestMode, setIsReTestMode] = useState(false);

  useEffect(() => {
    const list = Array.isArray(flashcards) ? flashcards.slice(0, 10) : [];
    setCards(list);
    setCurrentIdx(0);
    setIsFlipped(false);
    setWrongCards([]);
    setIsReTestMode(false);
  }, [flashcards]);

  if (!cards || cards.length === 0) {
    return (
      <div className="p-8 rounded-neuron bg-white dark:bg-graphite-900 border border-neutral-200/80 dark:border-neutral-800 text-center space-y-4 max-w-xl mx-auto my-6 shadow-subtle dark:shadow-subtle-dark">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-600/20 text-indigo-600 flex items-center justify-center mx-auto">
          <Layers className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white">Flashcard Study Deck (10 Cards)</h3>
          <p className="text-xs text-neutral-400">Click below to generate custom flashcards for this study topic.</p>
        </div>
        <button onClick={onRegenerate} disabled={isRegenerating} className="neuron-btn-primary mx-auto">
          <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
          <span>{isRegenerating ? 'Generating Cards...' : 'Generate 10 Flashcards Now'}</span>
        </button>
      </div>
    );
  }

  const activeCard = cards[currentIdx];
  const isCompleted = currentIdx >= cards.length;

  const handleSwipe = (dir) => {
    if (!activeCard) return;
    setSwipeDirection(dir);
    const isKnown = dir === 'right';
    recordCardSwipe(isKnown);
    if (onMetricUpdate) onMetricUpdate();

    if (!isKnown) {
      setWrongCards(prev => {
        if (!prev.some(c => c.id === activeCard.id)) {
          return [...prev, activeCard];
        }
        return prev;
      });
    }

    setTimeout(() => {
      setSwipeDirection(null);
      setIsFlipped(false);
      if (currentIdx < cards.length - 1) {
        setCurrentIdx(prev => prev + 1);
      } else {
        setCurrentIdx(cards.length);
        if (onFinishDrill) onFinishDrill();
      }
    }, 200);
  };

  const handleStartReTestWrong = () => {
    if (wrongCards.length === 0) return;
    setCards([...wrongCards]);
    setCurrentIdx(0);
    setIsFlipped(false);
    setIsReTestMode(true);
    setWrongCards([]);
  };

  const handleResetFullDeck = () => {
    const list = Array.isArray(flashcards) ? flashcards.slice(0, 10) : [];
    setCards(list);
    setCurrentIdx(0);
    setIsFlipped(false);
    setWrongCards([]);
    setIsReTestMode(false);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto py-2">
      
      {/* Top Deck Control Header */}
      <div className="p-4 rounded-neuron bg-white dark:bg-graphite-900 border border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between gap-3 shadow-subtle dark:shadow-subtle-dark flex-wrap">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          {onBackToWorkspace && (
            <button
              onClick={onBackToWorkspace}
              className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-graphite-800 transition mr-1"
              title="Back to Topic Input"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-neutral-900 dark:text-white text-base truncate">
                {isReTestMode ? `Re-Testing Wrong Cards (${cards.length})` : `Flashcard Deck: ${topic}`}
              </h3>
              {isReTestMode && (
                <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[10px] font-bold uppercase">
                  Re-Test Mode
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 truncate">Press Space/Tap to Flip • Left (Review) • Right (Know It)</p>
          </div>
        </div>

        {/* Deck Progress Counter */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <span className="text-xs font-mono font-bold text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-graphite-800 px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700">
            Card {Math.min(currentIdx + 1, cards.length)} of {cards.length}
          </span>
        </div>
      </div>

      {!isCompleted && activeCard ? (
        <div className="space-y-6">
          
          {/* Main Flashcard Flip Box */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className={`min-h-[280px] sm:min-h-[320px] p-8 rounded-neuron bg-white dark:bg-graphite-900 border-2 cursor-pointer transition-all duration-300 flex flex-col justify-between shadow-lg relative ${
              swipeDirection === 'left'
                ? '-translate-x-12 rotate-[-6deg] border-amber-500 opacity-0'
                : swipeDirection === 'right'
                ? 'translate-x-12 rotate-[6deg] border-emerald-500 opacity-0'
                : isFlipped
                ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-500/5'
                : 'border-neutral-200/80 dark:border-neutral-800/80 hover:border-neutral-400'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-graphite-800 font-mono text-[10px] font-bold text-neutral-500">
                {activeCard.category || activeCard.concept}
              </span>
              <span className="text-[11px] text-neutral-400 font-semibold">
                {isFlipped ? 'Answer View' : 'Tap or Space to Flip'}
              </span>
            </div>

            <div className="my-auto text-center space-y-3 px-4">
              {!isFlipped ? (
                <>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block font-mono">
                    Question
                  </span>
                  <h3 className="text-lg sm:text-xl font-extrabold text-neutral-900 dark:text-white leading-snug">
                    {activeCard.question}
                  </h3>
                </>
              ) : (
                <>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block font-mono">
                    Answer Explanation
                  </span>
                  <p className="text-sm sm:text-base font-semibold text-neutral-800 dark:text-neutral-200 leading-relaxed">
                    {activeCard.answer}
                  </p>
                </>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-3 border-t border-neutral-100 dark:border-neutral-800/60">
              <span>Difficulty: <strong className="text-neutral-700 dark:text-neutral-300">{activeCard.difficulty}</strong></span>
              <span>Card {currentIdx + 1} of {cards.length}</span>
            </div>
          </div>

          {/* Swipe Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleSwipe('left')}
              className="p-4 rounded-neuron bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-extrabold transition flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Review Again (←)</span>
            </button>

            <button
              onClick={() => handleSwipe('right')}
              className="p-4 rounded-neuron bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-extrabold transition flex items-center justify-center space-x-2"
            >
              <span>Know It (→)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      ) : (
        /* Deck Completed & Re-Test Screen */
        <div className="p-8 rounded-neuron bg-white dark:bg-graphite-900 border border-neutral-200/80 dark:border-neutral-800/80 text-center space-y-6 shadow-subtle dark:shadow-subtle-dark">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white">
              {isReTestMode ? 'Re-Test Completed!' : 'Flashcard Deck Completed!'}
            </h3>
            <p className="text-xs text-neutral-500">
              You finished reviewing {cards.length} cards.
              {wrongCards.length > 0 && (
                <span className="text-amber-600 dark:text-amber-400 font-bold block mt-1">
                  ⚠️ You marked {wrongCards.length} card(s) as "Review Again".
                </span>
              )}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {onGoToQuiz && (
              <button onClick={onGoToQuiz} className="neuron-btn-primary text-xs bg-emerald-600 hover:bg-emerald-700">
                <HelpCircle className="w-4 h-4" />
                <span>Take 10-Question Quiz Now</span>
              </button>
            )}

            {wrongCards.length > 0 && (
              <button onClick={handleStartReTestWrong} className="neuron-btn-primary text-xs bg-amber-600 hover:bg-amber-700">
                <AlertCircle className="w-4 h-4" />
                <span>Re-Test {wrongCards.length} Wrong Card(s)</span>
              </button>
            )}

            <button onClick={handleResetFullDeck} className="neuron-btn-secondary text-xs">
              <RotateCcw className="w-4 h-4" />
              <span>Restart 10-Card Deck</span>
            </button>

            {onRegenerate && (
              <button onClick={onRegenerate} disabled={isRegenerating} className="neuron-btn-secondary text-xs">
                <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                <span>{isRegenerating ? 'Generating...' : 'Regenerate Flashcards'}</span>
              </button>
            )}

            {onBackToWorkspace && (
              <button onClick={onBackToWorkspace} className="neuron-btn-secondary text-xs">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
