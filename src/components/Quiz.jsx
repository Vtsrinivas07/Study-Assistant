import React, { useState, useEffect } from 'react';
import { HelpCircle, CheckCircle2, XCircle, ArrowRight, ArrowLeft, RotateCcw, Award, RefreshCw, Pause, Play, AlertCircle } from 'lucide-react';
import { recordQuizAnswer, recordQuizCompletion } from '../services/storage';

export default function Quiz({ quiz = [], topic = 'Study Topic', onFinishQuiz, onMetricUpdate, onRegenerate, isRegenerating, onBackToWorkspace }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState(Array(10).fill(null));
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 10-minute timer (600 seconds)
  const [timeLeft, setTimeLeft] = useState(600);
  const [isPaused, setIsPaused] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  useEffect(() => {
    setCurrentIdx(0);
    setUserAnswers(Array(10).fill(null));
    setIsSubmitted(false);
    setTimeLeft(600);
    setIsPaused(false);
    setShowCancelModal(false);
    setShowSubmitModal(false);
  }, [quiz]);

  // Timer interval hook
  useEffect(() => {
    if (isSubmitted || isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, isPaused]);

  if (!quiz || !Array.isArray(quiz) || quiz.length === 0) {
    return (
      <div className="p-8 rounded-neuron bg-white dark:bg-graphite-900 border border-neutral-200/80 dark:border-neutral-800 text-center space-y-4 max-w-xl mx-auto my-6 shadow-subtle dark:shadow-subtle-dark">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-600/20 text-indigo-600 flex items-center justify-center mx-auto">
          <HelpCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white">Interactive AI Quiz (10 Questions)</h3>
          <p className="text-xs text-neutral-400">Click below to generate custom multiple-choice quiz questions for this study topic.</p>
        </div>
        <button onClick={onRegenerate} disabled={isRegenerating} className="neuron-btn-primary mx-auto">
          <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
          <span>{isRegenerating ? 'Generating Quiz...' : 'Generate 10 Questions Now'}</span>
        </button>
      </div>
    );
  }

  // Ensure exactly 10 questions
  const quizList = quiz.slice(0, 10);
  const currentQ = quizList[currentIdx] || quizList[0];

  const getCorrectIndex = (q) => {
    if (typeof q?.correctIndex === 'number') return q.correctIndex;
    const parsed = parseInt(q?.correctIndex, 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleSelectOption = (optionIdx) => {
    if (isSubmitted) return;
    const updated = [...userAnswers];
    updated[currentIdx] = optionIdx;
    setUserAnswers(updated);
  };

  const handleCancelClick = () => {
    setIsPaused(true);
    setShowCancelModal(true);
  };

  const handleResumeTimer = () => {
    setShowCancelModal(false);
    setIsPaused(false);
  };

  const handleOpenSubmitModal = () => {
    setIsPaused(true);
    setShowSubmitModal(true);
  };

  const confirmSubmitQuiz = () => {
    setShowSubmitModal(false);
    setIsPaused(true);
    setIsSubmitted(true);

    let correct = 0;
    quizList.forEach((q, idx) => {
      const chosen = userAnswers[idx];
      const correctIdx = getCorrectIndex(q);
      if (chosen === correctIdx) correct++;
    });

    recordQuizCompletion(correct);
    if (onMetricUpdate) onMetricUpdate();
    if (onFinishQuiz) onFinishQuiz(correct);
  };

  const handleSubmitQuiz = confirmSubmitQuiz;

  const handleRetakeQuiz = () => {
    setCurrentIdx(0);
    setUserAnswers(Array(10).fill(null));
    setIsSubmitted(false);
    setTimeLeft(600);
    setIsPaused(false);
    setShowCancelModal(false);
    setShowSubmitModal(false);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Metrics calculations
  const answeredCount = userAnswers.filter(a => a !== null).length;
  const unansweredCount = 10 - answeredCount;

  let correctCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;

  quizList.forEach((q, idx) => {
    const chosen = userAnswers[idx];
    const correctIdx = getCorrectIndex(q);
    if (chosen === null) {
      skippedCount++;
    } else if (chosen === correctIdx) {
      correctCount++;
    } else {
      incorrectCount++;
    }
  });

  const scorePct = Math.round((correctCount / 10) * 100);
  const timeTakenSecs = 600 - timeLeft;

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-2">
      
      {/* Quiz Control Top Bar */}
      {!isSubmitted && (
        <div className="p-4 rounded-neuron bg-white dark:bg-graphite-900 border border-neutral-200/80 dark:border-neutral-800/80 space-y-3 shadow-subtle dark:shadow-subtle-dark">
          
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
              <div>
                <h3 className="font-extrabold text-neutral-900 dark:text-white text-base leading-none">
                  Quiz: {topic}
                </h3>
                <p className="text-xs text-neutral-400 mt-1">10 Multiple Choice Questions</p>
              </div>
            </div>

            {/* 10-Minute Countdown Timer */}
            <div className="flex items-center space-x-2">
              <div className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-bold flex items-center space-x-1.5 ${
                timeLeft < 120
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 animate-pulse'
                  : 'bg-neutral-100 dark:bg-graphite-800 border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200'
              }`}>
                <span>⏱️ {formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>

          {/* Answered & Unanswered Status Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800/80 text-xs">
            <div className="flex items-center space-x-3 font-semibold">
              <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Answered: {answeredCount}
              </span>
              <span className="text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Unanswered: {unansweredCount}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCancelClick}
                className="px-3 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-graphite-800 transition text-xs font-bold"
              >
                Cancel Quiz
              </button>

              <button
                onClick={handleOpenSubmitModal}
                className="px-3.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-sm"
              >
                Submit Quiz
              </button>
            </div>
          </div>

          {/* 1 to 10 Question Navigator Pills */}
          <div className="grid grid-cols-10 gap-1 pt-1">
            {quizList.map((_, qIdx) => {
              const isAns = userAnswers[qIdx] !== null;
              const isCurr = qIdx === currentIdx;

              let style = "bg-neutral-100 dark:bg-graphite-800 text-neutral-400 border-neutral-200 dark:border-neutral-800";
              if (isAns) style = "bg-emerald-500 text-white border-emerald-600 font-bold";
              if (isCurr) style += " ring-2 ring-indigo-600 border-indigo-600 font-extrabold";

              return (
                <button
                  key={qIdx}
                  onClick={() => setCurrentIdx(qIdx)}
                  className={`py-1 rounded text-[11px] border transition text-center ${style}`}
                  title={`Go to Question ${qIdx + 1}`}
                >
                  {qIdx + 1}
                </button>
              );
            })}
          </div>

        </div>
      )}

      {/* Active Question View */}
      {!isSubmitted && currentQ && (
        <div className="p-6 sm:p-8 rounded-neuron bg-white dark:bg-graphite-900 border border-neutral-200/80 dark:border-neutral-800/80 space-y-6 shadow-subtle dark:shadow-subtle-dark">
          
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
              QUESTION {currentIdx + 1} OF 10
            </span>
            <span>{userAnswers[currentIdx] !== null ? 'Answer Selected' : 'Select one option below'}</span>
          </div>

          <h3 className="text-lg sm:text-xl font-extrabold text-neutral-900 dark:text-white leading-snug">
            {currentQ.question}
          </h3>

          {/* Option Buttons */}
          <div className="space-y-3">
            {(currentQ.options || ['Option A', 'Option B', 'Option C', 'Option D']).map((optionText, optIdx) => {
              const isSelected = userAnswers[currentIdx] === optIdx;

              let btnStyle = "bg-neutral-50 dark:bg-graphite-950 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white hover:border-indigo-500";
              if (isSelected) {
                btnStyle = "bg-indigo-500/10 border-indigo-600 text-indigo-900 dark:text-indigo-200 font-bold ring-2 ring-indigo-500/30";
              }

              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full p-4 rounded-xl border transition-all text-left text-xs sm:text-sm flex items-center justify-between font-medium ${btnStyle}`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`w-6 h-6 rounded-lg font-mono text-xs font-bold flex items-center justify-center ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-neutral-200/60 dark:bg-graphite-800 text-neutral-700 dark:text-neutral-300'
                    }`}>
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span>{optionText}</span>
                  </div>

                  {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
                </button>
              );
            })}
          </div>

          {/* Bottom Next / Prev Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <button
              onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="neuron-btn-secondary text-xs disabled:opacity-30"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {currentIdx < 9 ? (
              <button
                onClick={() => setCurrentIdx(prev => Math.min(9, prev + 1))}
                className="neuron-btn-primary text-xs"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleOpenSubmitModal}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition shadow-md flex items-center space-x-2"
              >
                <span>Submit Quiz</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      )}

      {/* Submit Quiz Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-graphite-900 rounded-neuron p-6 max-w-sm w-full border border-neutral-200 dark:border-neutral-800 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white">Submit Quiz?</h3>
              <p className="text-xs text-neutral-400">You cannot change your answers after submission.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-graphite-950 border border-neutral-200/60 dark:border-neutral-800 text-xs space-y-1.5 font-semibold">
              <div className="flex items-center justify-between text-neutral-700 dark:text-neutral-300">
                <span>Answered:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{answeredCount} / 10</span>
              </div>
              {unansweredCount > 0 && (
                <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
                  <span>Unanswered:</span>
                  <span className="font-bold">{unansweredCount}</span>
                </div>
              )}
            </div>

            {unansweredCount > 0 && (
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] font-bold">
                💡 You have {unansweredCount} unanswered question{unansweredCount > 1 ? 's' : ''}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  setIsPaused(false);
                }}
                className="neuron-btn-secondary text-xs py-2.5 justify-center"
              >
                Cancel
              </button>

              <button
                onClick={confirmSubmitQuiz}
                className="neuron-btn-primary text-xs py-2.5 justify-center"
              >
                Submit Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Quiz Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-graphite-900 rounded-neuron p-6 max-w-md w-full border border-neutral-200 dark:border-neutral-800 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-3 text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white">Quiz Paused</h3>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Your 10-minute timer is paused at <strong>{formatTime(timeLeft)}</strong>. You have answered <strong>{answeredCount} of 10</strong> questions.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={handleResumeTimer}
                className="neuron-btn-primary text-xs"
              >
                <span>Resume Quiz</span>
              </button>

              <button
                onClick={() => {
                  setShowCancelModal(false);
                  if (onBackToWorkspace) onBackToWorkspace();
                }}
                className="px-4 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-500/20 transition"
              >
                Exit Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Completed Summary View */}
      {isSubmitted && (
        <div className="space-y-6">
          
          {/* Main Results Card */}
          <div className="p-8 rounded-neuron bg-white dark:bg-graphite-900 border border-neutral-200/80 dark:border-neutral-800/80 text-center space-y-6 shadow-subtle dark:shadow-subtle-dark">
            
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-600/20 text-indigo-600 flex items-center justify-center mx-auto">
              <Award className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-neutral-100 dark:bg-graphite-800 font-mono text-xs font-bold text-neutral-500">
                {topic}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                Quiz Completed!
              </h2>
              <p className="text-xs text-neutral-400">Here is your full performance report and score metrics.</p>
            </div>

            {/* Score Ring / Percentage */}
            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-graphite-950 border border-neutral-200/60 dark:border-neutral-800 inline-block max-w-xs w-full">
              <span className="text-xs font-bold uppercase text-neutral-400 tracking-wider block font-mono">Final Score</span>
              <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight block my-1">
                {scorePct}%
              </span>
              <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                {correctCount} Correct out of 10 Questions
              </span>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-2xl mx-auto text-left">
              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-graphite-950 border border-neutral-200/60 dark:border-neutral-800 space-y-1">
                <span className="text-[10px] font-bold text-neutral-400 uppercase font-mono block">Total Questions</span>
                <span className="text-lg font-extrabold text-neutral-900 dark:text-white">10</span>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase font-mono block">Correct</span>
                <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{correctCount}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1">
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase font-mono block">Incorrect</span>
                <span className="text-lg font-extrabold text-rose-600 dark:text-rose-400">{incorrectCount}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase font-mono block">Skipped</span>
                <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400">{skippedCount}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-graphite-950 border border-neutral-200/60 dark:border-neutral-800 space-y-1">
                <span className="text-[10px] font-bold text-neutral-400 uppercase font-mono block">Time Taken</span>
                <span className="text-lg font-extrabold text-neutral-900 dark:text-white font-mono">{formatTime(timeTakenSecs)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button onClick={handleRetakeQuiz} className="neuron-btn-primary text-xs">
                <RotateCcw className="w-4 h-4" />
                <span>Retake Quiz</span>
              </button>

              <button onClick={onBackToWorkspace} className="neuron-btn-secondary text-xs">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </button>

              {onRegenerate && (
                <button onClick={onRegenerate} disabled={isRegenerating} className="neuron-btn-secondary text-xs">
                  <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                  <span>{isRegenerating ? 'Generating...' : 'Regenerate Quiz'}</span>
                </button>
              )}
            </div>

          </div>

          {/* Review Answers Section */}
          <div className="p-6 sm:p-8 rounded-neuron bg-white dark:bg-graphite-900 border border-neutral-200/80 dark:border-neutral-800/80 space-y-6 shadow-subtle dark:shadow-subtle-dark">
            <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-800 pb-3">
              Detailed Answer Review (10 Questions)
            </h3>

            <div className="space-y-6">
              {quizList.map((q, idx) => {
                const userChoice = userAnswers[idx];
                const correctIdx = getCorrectIndex(q);
                const isUserCorrect = userChoice === correctIdx;
                const isSkipped = userChoice === null;

                return (
                  <div key={idx} className="p-5 rounded-xl bg-neutral-50 dark:bg-graphite-950 border border-neutral-200/60 dark:border-neutral-800 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        QUESTION {idx + 1}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isUserCorrect ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                        isSkipped ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                        'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      }`}>
                        {isUserCorrect ? 'Correct' : isSkipped ? 'Skipped' : 'Incorrect'}
                      </span>
                    </div>

                    <h4 className="font-bold text-neutral-900 dark:text-white text-sm">
                      {q.question}
                    </h4>

                    <div className="space-y-2 pt-1">
                      {(q.options || []).map((opt, optIdx) => {
                        const isThisUserChoice = userChoice === optIdx;
                        const isThisCorrect = correctIdx === optIdx;

                        let optStyle = "bg-white dark:bg-graphite-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300";
                        if (isThisCorrect) {
                          optStyle = "bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold";
                        } else if (isThisUserChoice && !isThisCorrect) {
                          optStyle = "bg-rose-500/10 border-rose-500 text-rose-800 dark:text-rose-200 font-bold";
                        }

                        return (
                          <div key={optIdx} className={`p-3 rounded-lg border flex items-center justify-between ${optStyle}`}>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-bold">{String.fromCharCode(65 + optIdx)}.</span>
                              <span>{opt}</span>
                            </div>

                            {isThisCorrect && (
                              <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Correct Answer</span>
                              </span>
                            )}
                            {isThisUserChoice && !isThisCorrect && (
                              <span className="text-[10px] font-extrabold text-rose-600 dark:text-rose-400 flex items-center space-x-1">
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Your Answer</span>
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/20 text-neutral-700 dark:text-neutral-300 space-y-1">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 block text-[11px]">Explanation:</span>
                      <p className="leading-relaxed font-medium">{q.explanation || 'Detailed answer explanation.'}</p>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
