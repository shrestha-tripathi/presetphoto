'use client';

import React from 'react';

interface ProcessingOverlayProps {
  progress: number;
  message?: string;
}

export function ProcessingOverlay({ progress, message }: ProcessingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-800/95 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl dark:shadow-black/50 dark:ring-1 dark:ring-white/10 animate-fade-in-scale">
        {/* Animated Icon */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="44"
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-700/50"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="48"
              cy="48"
              r="44"
              stroke="url(#progressGradient)"
              strokeWidth="8"
              fill="none"
              strokeDasharray={2 * Math.PI * 44}
              strokeDashoffset={2 * Math.PI * 44 * (1 - progress / 100)}
              strokeLinecap="round"
              className="transition-all duration-300 drop-shadow-lg"
              style={{ filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))' }}
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{Math.round(progress)}%</span>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
          Processing Your Image
        </h3>
        
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {message || getProgressMessage(progress)}
        </p>

        {/* Progress Steps */}
        <div className="mt-6 space-y-2">
          <ProgressStep label="Cropping image" active={progress < 50} complete={progress >= 50} />
          <ProgressStep label="Optimizing size" active={progress >= 50 && progress < 90} complete={progress >= 90} />
          <ProgressStep label="Finalizing" active={progress >= 90} complete={progress === 100} />
        </div>
      </div>
    </div>
  );
}

function ProgressStep({ label, active, complete }: { label: string; active: boolean; complete: boolean }) {
  return (
    <div className={`flex items-center gap-2 text-sm transition-colors duration-300 ${complete ? 'text-emerald-600 dark:text-emerald-400' : active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}>
      <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
        complete ? 'bg-emerald-100 dark:bg-emerald-500/20' : active ? 'bg-blue-100 dark:bg-blue-500/20' : 'bg-slate-100 dark:bg-slate-700/50'
      }`}>
        {complete ? (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : active ? (
          <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse" />
        ) : (
          <div className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full" />
        )}
      </div>
      <span className="font-medium">{label}</span>
    </div>
  );
}

function getProgressMessage(progress: number): string {
  if (progress < 30) return 'Reading your image...';
  if (progress < 50) return 'Applying crop adjustments...';
  if (progress < 70) return 'Optimizing file size...';
  if (progress < 90) return 'Fine-tuning compression...';
  return 'Almost done...';
}

export default ProcessingOverlay;
