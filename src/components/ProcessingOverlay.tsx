'use client';

import React from 'react';

interface ProcessingOverlayProps {
  progress: number;
  message?: string;
}

export function ProcessingOverlay({ progress, message }: ProcessingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
        {/* Animated Icon */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="44"
              stroke="currentColor"
              className="text-gray-200 dark:text-slate-700"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="48"
              cy="48"
              r="44"
              stroke="#3B82F6"
              strokeWidth="8"
              fill="none"
              strokeDasharray={2 * Math.PI * 44}
              strokeDashoffset={2 * Math.PI * 44 * (1 - progress / 100)}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">{Math.round(progress)}%</span>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          Processing Your Image
        </h3>
        
        <p className="text-sm text-gray-500 dark:text-slate-400">
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
    <div className={`flex items-center gap-2 text-sm ${complete ? 'text-green-600 dark:text-green-400' : active ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-slate-500'}`}>
      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
        complete ? 'bg-green-100 dark:bg-green-900/30' : active ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-gray-100 dark:bg-slate-700'
      }`}>
        {complete ? (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : active ? (
          <div className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full animate-pulse" />
        ) : (
          <div className="w-2 h-2 bg-gray-300 dark:bg-slate-600 rounded-full" />
        )}
      </div>
      <span>{label}</span>
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
