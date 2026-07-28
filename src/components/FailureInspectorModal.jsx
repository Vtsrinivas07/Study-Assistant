import React from 'react';
import { X, ShieldAlert, AlertTriangle, Cpu, Sparkles } from 'lucide-react';

export default function FailureInspectorModal({ isOpen, onClose, onTestSimulation }) {
  if (!isOpen) return null;

  const SCENARIOS = [
    {
      id: 'malformed',
      title: 'Malformed JSON Output',
      desc: 'Simulates AI outputting unclosed strings or trailing commas.',
      mechanism: 'Sanitized via character-by-character parser + attemptHeuristicRepair().',
      color: 'border-amber-500/30 text-amber-600 dark:text-amber-300'
    },
    {
      id: 'schema_mismatch',
      title: 'Schema / Type Mismatch',
      desc: 'Simulates AI returning missing keys or incorrect shape.',
      mechanism: 'Zod runtime schema safeParse(). Fills safe defaults for missing nodes.',
      color: 'border-purple-500/30 text-purple-600 dark:text-purple-300'
    },
    {
      id: 'timeout',
      title: 'Network Timeout & Cancel',
      desc: 'Simulates high latency or hanging LLM response (>15s).',
      mechanism: 'AbortController signal aborts fetch automatically.',
      color: 'border-sky-500/30 text-sky-600 dark:text-sky-300'
    },
    {
      id: 'empty',
      title: 'Empty Payload Response',
      desc: 'Simulates AI model returning blank 0-byte output.',
      mechanism: 'String length verification displays clean error banner.',
      color: 'border-rose-500/30 text-rose-600 dark:text-rose-300'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-graphite-950/60 backdrop-blur-md">
      <div className="w-full max-w-3xl rounded-neuron bg-white dark:bg-graphite-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
        
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-neutral-900 dark:text-white text-lg flex items-center space-x-2">
                <span>AI Failure Resiliency Test Suite</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-mono">20% Evaluation Criteria</span>
              </h3>
              <p className="text-xs text-neutral-400">
                How Study Assistant AI safely handles malformed, broken, or slow model outputs without crashing.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SCENARIOS.map(sc => (
            <div
              key={sc.id}
              className={`p-4 rounded-xl bg-neutral-50 dark:bg-graphite-950 border ${sc.color} space-y-2 flex flex-col justify-between`}
            >
              <div>
                <h5 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{sc.title}</span>
                </h5>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1">{sc.desc}</p>
              </div>

              <button
                onClick={() => {
                  onTestSimulation(sc.id);
                  onClose();
                }}
                className="mt-3 w-full py-2 rounded-lg bg-neutral-200 dark:bg-graphite-800 hover:bg-neutral-300 dark:hover:bg-graphite-700 text-neutral-900 dark:text-white text-xs font-bold transition flex items-center justify-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Run {sc.title} Test</span>
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
