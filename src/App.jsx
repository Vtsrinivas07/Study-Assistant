import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import TopWorkspaceNav from './components/TopWorkspaceNav';
import HomeWorkspace from './components/HomeWorkspace';
import AnalysisProgress from './components/AnalysisProgress';
import SwipeableFlashcards from './components/SwipeableFlashcards';
import Quiz from './components/Quiz';
import FailureInspectorModal from './components/FailureInspectorModal';

import { analyzeStudyNotes } from './services/api';
import { saveSessionToSpace, saveWorkspaceToCache, clearWorkspaceCache } from './services/storage';
import { mockStudySessions } from '../server/mockData';

export default function AppContent() {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentWorkspace, setCurrentWorkspace] = useState(mockStudySessions.machineLearning);
  const [activeSpaceId, setActiveSpaceId] = useState('space_1');
  const [workspaceKey, setWorkspaceKey] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedErrorSim, setSelectedErrorSim] = useState('');

  const [failureHarnessOpen, setFailureHarnessOpen] = useState(false);

  // Pre-seed mock data into cache on initial load if not already present
  useEffect(() => {
    saveWorkspaceToCache(mockStudySessions.machineLearning, 'space_1');
    saveWorkspaceToCache(mockStudySessions.systemDesign, 'space_2');
    saveWorkspaceToCache(mockStudySessions.algorithms, 'space_3');
  }, []);

  const handleAnalyzeNotes = async (notesText, overrideErrorSim = null, targetTab = 'flashcards') => {
    setIsLoading(true);
    setError(null);

    const errSim = overrideErrorSim !== null ? overrideErrorSim : selectedErrorSim;

    try {
      const result = await analyzeStudyNotes(notesText, { simulateError: errSim });

      if (result.success) {
        setCurrentWorkspace(result.data);
        const updatedSpaces = saveSessionToSpace(result.data);

        const match = updatedSpaces.find(s => s.title.toLowerCase() === result.data.topic.toLowerCase());
        const targetSpaceId = match ? match.id : result.data.topic;

        saveWorkspaceToCache(result.data, targetSpaceId);
        setActiveSpaceId(targetSpaceId);
        setWorkspaceKey(prev => prev + 1);
        setActiveTab(targetTab || 'flashcards');
      } else {
        setError(result.error || 'Failed to parse AI output.');
      }
    } catch (err) {
      if (err.message !== 'STALE_REQUEST_CANCELLED') {
        setError(err.message || 'Failed to analyze study material.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateCurrentTopic = async () => {
    if (!currentWorkspace || !currentWorkspace.topic) return;
    const topic = currentWorkspace.topic;
    clearWorkspaceCache(topic);

    setIsLoading(true);
    setError(null);

    try {
      const result = await analyzeStudyNotes(`Generate brand new unique quiz questions and flashcards for ${topic}`);
      if (result.success) {
        setCurrentWorkspace(result.data);
        saveWorkspaceToCache(result.data, activeSpaceId);
        setWorkspaceKey(prev => prev + 1);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message || 'Failed to regenerate study material.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSession = () => {
    setActiveSpaceId(null);
    setCurrentWorkspace(null);
    setActiveTab('overview');
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream dark:bg-graphite-950">
      
      {/* Top Workspace Header Bar */}
      <TopWorkspaceNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewSession={handleNewSession}
        onOpenFailureHarness={() => setFailureHarnessOpen(true)}
      />

      {/* Main Single-Column Focused Study Workspace Layout */}
      <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        <main className="w-full space-y-6">
          
          {isLoading && <AnalysisProgress />}

          {error && !isLoading && (
            <div className="p-6 rounded-neuron bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 space-y-3">
              <h4 className="font-extrabold text-sm text-rose-600 dark:text-rose-300">
                Analysis Failed: {error}
              </h4>
              <button onClick={handleNewSession} className="neuron-btn-primary py-2 text-xs">
                Try Again
              </button>
            </div>
          )}

          {!isLoading && !error && (
            <>
              {activeTab === 'overview' && (
                <HomeWorkspace
                  workspace={currentWorkspace}
                  onAnalyzeNotes={handleAnalyzeNotes}
                  isLoading={isLoading}
                />
              )}

              {activeTab === 'flashcards' && currentWorkspace && (
                <SwipeableFlashcards
                  key={workspaceKey}
                  flashcards={currentWorkspace.flashcards}
                  topic={currentWorkspace.topic}
                  onGoToQuiz={() => setActiveTab('quiz')}
                  onRegenerate={handleRegenerateCurrentTopic}
                  isRegenerating={isLoading}
                  onBackToWorkspace={() => setActiveTab('overview')}
                />
              )}

              {activeTab === 'quiz' && currentWorkspace && (
                <Quiz
                  key={workspaceKey}
                  quiz={currentWorkspace.quiz}
                  topic={currentWorkspace.topic}
                  onFinishQuiz={() => {}}
                  onRegenerate={handleRegenerateCurrentTopic}
                  isRegenerating={isLoading}
                  onBackToWorkspace={() => setActiveTab('overview')}
                />
              )}
            </>
          )}

        </main>

      </div>

      {/* Failure Resiliency Harness Modal */}
      <FailureInspectorModal
        isOpen={failureHarnessOpen}
        onClose={() => setFailureHarnessOpen(false)}
        onTestSimulation={(simId) => {
          setSelectedErrorSim(simId);
          handleAnalyzeNotes("Test failure scenario notes", simId);
        }}
      />

    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
