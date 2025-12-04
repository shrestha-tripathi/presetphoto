'use client';

import React from 'react';
import { Download, RefreshCw, CheckCircle, FileImage, HardDrive } from 'lucide-react';
import type { ProcessedResult, ImageSpec } from '@/types';

interface ResultDisplayProps {
  result: ProcessedResult;
  spec: ImageSpec;
  fileName: string;
  onReset: () => void;
}

export function ResultDisplay({ result, spec, fileName, onReset }: ResultDisplayProps) {
  const isWithinSizeRange = result.sizeKB >= spec.minSizeKB && result.sizeKB <= spec.maxSizeKB;
  const isDimensionsMatch = 
    result.dimensions.width === spec.widthPx && 
    (result.dimensions.height === spec.heightPx || spec.dateFormat);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = result.dataUrl;
    link.download = fileName.replace(/\.[^/.]+$/, '') + '_processed.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full space-y-6">
      {/* Success Message */}
      <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-500/15 dark:to-teal-500/15 border border-emerald-200/80 dark:border-emerald-400/30 rounded-2xl animate-fade-in-scale">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/30 animate-float">
          <CheckCircle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-emerald-800 dark:text-emerald-300 text-lg">Processing Complete!</h3>
          <p className="text-sm text-emerald-600 dark:text-emerald-400">Your image is ready for download</p>
        </div>
      </div>

      {/* Image Preview */}
      <div className="bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800/60 dark:to-slate-900/60 rounded-2xl p-6 flex items-center justify-center dark:ring-1 dark:ring-white/5">
        <div className="relative group">
          {/* Checkered background for transparency, white bg for signatures */}
          <div className="absolute inset-0 rounded-xl bg-white shadow-inner" style={{ backgroundImage: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)', backgroundSize: '16px 16px', backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px' }} />
          <img
            src={result.dataUrl}
            alt="Processed result"
            className="relative max-w-full max-h-72 object-contain rounded-xl shadow-2xl shadow-slate-300/50 dark:shadow-black/30 ring-1 ring-slate-200 dark:ring-slate-600 bg-white transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>

      {/* Specs Verification */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`p-5 rounded-2xl border-2 transition-all duration-300 hover:-translate-y-0.5 ${
          isDimensionsMatch 
            ? 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-500/15 dark:to-teal-500/15 border-emerald-200 dark:border-emerald-400/30' 
            : 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/15 dark:to-orange-500/15 border-amber-200 dark:border-amber-400/30'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDimensionsMatch ? 'bg-emerald-100 dark:bg-emerald-500/20' : 'bg-amber-100 dark:bg-amber-500/20'}`}>
              <FileImage className={`w-4 h-4 ${isDimensionsMatch ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`} />
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Dimensions</span>
          </div>
          <p className={`font-bold text-xl ${isDimensionsMatch ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`}>
            {result.dimensions.width} × {result.dimensions.height}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Required: {spec.widthPx} × {spec.heightPx} px
          </p>
        </div>

        <div className={`p-5 rounded-2xl border-2 transition-all duration-300 hover:-translate-y-0.5 ${
          isWithinSizeRange 
            ? 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-500/15 dark:to-teal-500/15 border-emerald-200 dark:border-emerald-400/30' 
            : 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-500/15 dark:to-rose-500/15 border-red-200 dark:border-red-400/30'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isWithinSizeRange ? 'bg-emerald-100 dark:bg-emerald-500/20' : 'bg-red-100 dark:bg-red-500/20'}`}>
              <HardDrive className={`w-4 h-4 ${isWithinSizeRange ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`} />
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">File Size</span>
          </div>
          <p className={`font-bold text-xl ${isWithinSizeRange ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
            {result.sizeKB.toFixed(1)} KB
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Required: {spec.minSizeKB} - {spec.maxSizeKB} KB
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-2">
        <button
          onClick={onReset}
          className="flex-1 flex items-center justify-center gap-2 p-4 bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700/60 transition-all duration-300 font-semibold active:scale-[0.98] hover:scale-[1.02] dark:ring-1 dark:ring-white/10"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Process Another</span>
        </button>
        
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 active:scale-[0.98] hover:scale-[1.02] group"
        >
          <Download className="w-5 h-5 transition-transform group-hover:translate-y-0.5" />
          <span>Download</span>
        </button>
      </div>

      {/* Privacy Note */}
      <div className="text-center pt-2">
        <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Processed entirely in your browser • No data uploaded
        </p>
      </div>
    </div>
  );
}

export default ResultDisplay;
