'use client';

import React from 'react';
import { Settings2 } from 'lucide-react';

interface QualitySliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

// Quality presets with JPEG quality values (0.3 to 1.0 range mapped to 30-100)
const QUALITY_PRESETS = [
  { value: 40, label: 'Low', description: 'Smaller file', icon: '📦' },
  { value: 60, label: 'Medium', description: 'Balanced', icon: '⚖️' },
  { value: 80, label: 'High', description: 'Better quality', icon: '✨' },
  { value: 95, label: 'Max', description: 'Best quality', icon: '💎' },
];

export function QualitySlider({ value, onChange, disabled = false }: QualitySliderProps) {
  const getQualityLabel = (val: number) => {
    if (val <= 45) return 'Low';
    if (val <= 65) return 'Medium';
    if (val <= 85) return 'High';
    return 'Maximum';
  };

  const getQualityColor = (val: number) => {
    if (val <= 45) return 'text-orange-500 dark:text-orange-400';
    if (val <= 65) return 'text-blue-500 dark:text-blue-400';
    if (val <= 85) return 'text-emerald-500 dark:text-emerald-400';
    return 'text-violet-500 dark:text-violet-400';
  };

  const getActiveBg = (val: number) => {
    if (val <= 45) return 'bg-orange-500';
    if (val <= 65) return 'bg-blue-500';
    if (val <= 85) return 'bg-emerald-500';
    return 'bg-violet-500';
  };

  // Calculate slider position for visual (0-100 maps to 30-100 range)
  const sliderPercent = ((value - 30) / 70) * 100;

  return (
    <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/30 rounded-xl border border-slate-200/80 dark:border-slate-600/30 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Output Quality
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold ${getQualityColor(value)}`}>
            {getQualityLabel(value)}
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getActiveBg(value)} text-white`}>
            {value}%
          </span>
        </div>
      </div>

      {/* Preset Buttons - Primary selection method */}
      <div className="grid grid-cols-4 gap-2">
        {QUALITY_PRESETS.map((preset) => {
          const isActive = Math.abs(value - preset.value) < 10;
          return (
            <button
              key={preset.value}
              type="button"
              onClick={() => onChange(preset.value)}
              disabled={disabled}
              className={`relative py-3 px-2 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
                isActive
                  ? 'bg-white dark:bg-slate-800 border-blue-500 dark:border-blue-400 shadow-lg shadow-blue-500/20'
                  : 'bg-white/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/40'
              }`}
            >
              <div className="text-lg mb-1">{preset.icon}</div>
              <div className={`text-xs font-bold ${
                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'
              }`}>
                {preset.label}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                {preset.description}
              </div>
              {isActive && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Fine-tune Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <span>Fine-tune</span>
          <span>Smaller ← → Larger file</span>
        </div>
        <div className="relative h-6 flex items-center">
          {/* Track Background */}
          <div className="absolute inset-x-0 h-2 rounded-full bg-slate-200 dark:bg-slate-700/60 overflow-hidden">
            <div 
              className={`h-full ${getActiveBg(value)} transition-all duration-300 ease-out`}
              style={{ width: `${sliderPercent}%` }}
            />
          </div>
          
          <input
            type="range"
            min={30}
            max={100}
            step={1}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            disabled={disabled}
            className="relative w-full h-6 appearance-none cursor-pointer bg-transparent z-10
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-5
              [&::-webkit-slider-thumb]:h-5
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-white
              [&::-webkit-slider-thumb]:shadow-lg
              [&::-webkit-slider-thumb]:shadow-slate-400/50
              [&::-webkit-slider-thumb]:dark:shadow-slate-900/80
              [&::-webkit-slider-thumb]:border-2
              [&::-webkit-slider-thumb]:border-slate-300
              [&::-webkit-slider-thumb]:dark:border-slate-500
              [&::-webkit-slider-thumb]:transition-all
              [&::-webkit-slider-thumb]:duration-200
              [&::-webkit-slider-thumb]:hover:scale-110
              [&::-webkit-slider-thumb]:hover:border-blue-500
              [&::-webkit-slider-thumb]:active:scale-95
              [&::-moz-range-thumb]:w-5
              [&::-moz-range-thumb]:h-5
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-white
              [&::-moz-range-thumb]:border-2
              [&::-moz-range-thumb]:border-slate-300
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Info */}
      <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
        {value >= 85 
          ? '💎 Target: maximum allowed size (best quality)'
          : value >= 65
            ? '⚖️ Target: middle of allowed size range'
            : '📦 Target: minimum allowed size'
        }
        <span className="block mt-1 text-[10px] opacity-70">
          Output always stays within preset limits
        </span>
      </p>
    </div>
  );
}

export default QualitySlider;
