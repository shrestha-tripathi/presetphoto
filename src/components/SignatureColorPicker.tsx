'use client';

import React from 'react';
import { Palette } from 'lucide-react';

// Predefined signature colors
export const SIGNATURE_COLORS = [
  { id: 'original', label: 'Original', color: null },
  { id: 'black', label: 'Black', color: '#000000' },
  { id: 'blue', label: 'Blue', color: '#0000FF' },
  { id: 'darkblue', label: 'Dark Blue', color: '#00008B' },
  { id: 'navy', label: 'Navy', color: '#000080' },
  { id: 'green', label: 'Green', color: '#006400' },
  { id: 'red', label: 'Red', color: '#8B0000' },
] as const;

export type SignatureColorId = typeof SIGNATURE_COLORS[number]['id'] | 'custom';

interface SignatureColorPickerProps {
  selectedColor: string | null;
  onColorChange: (color: string | null) => void;
}

export function SignatureColorPicker({
  selectedColor,
  onColorChange,
}: SignatureColorPickerProps) {
  const [showCustomPicker, setShowCustomPicker] = React.useState(false);
  const [customColor, setCustomColor] = React.useState('#0000FF');

  // Check if current color is a preset or custom
  const isCustomColor = selectedColor && !SIGNATURE_COLORS.some(c => c.color === selectedColor);
  
  const handlePresetClick = (color: string | null) => {
    onColorChange(color);
    setShowCustomPicker(false);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    onColorChange(newColor);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Palette className="w-4 h-4 text-purple-500 dark:text-purple-400" />
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Signature Color
        </span>
      </div>

      {/* Preset Colors */}
      <div className="flex flex-wrap gap-2">
        {SIGNATURE_COLORS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => handlePresetClick(preset.color)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300 hover:scale-105 active:scale-95 ${
              selectedColor === preset.color
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/20 ring-2 ring-purple-500/30 shadow-lg shadow-purple-500/10'
                : 'border-slate-200 dark:border-slate-700/50 hover:border-purple-300 dark:hover:border-purple-500/50 bg-white dark:bg-slate-800/60 dark:ring-1 dark:ring-white/5'
            }`}
            title={preset.label}
          >
            {preset.color ? (
              <span
                className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-500 shadow-inner"
                style={{ backgroundColor: preset.color }}
              />
            ) : (
              <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-500 bg-gradient-to-br from-red-400 via-green-400 to-blue-400" />
            )}
            <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
              {preset.label}
            </span>
          </button>
        ))}

        {/* Custom Color Button */}
        <button
          type="button"
          onClick={() => setShowCustomPicker(!showCustomPicker)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300 hover:scale-105 active:scale-95 ${
            isCustomColor
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/20 ring-2 ring-purple-500/30 shadow-lg shadow-purple-500/10'
              : 'border-slate-200 dark:border-slate-700/50 hover:border-purple-300 dark:hover:border-purple-500/50 bg-white dark:bg-slate-800/60 dark:ring-1 dark:ring-white/5'
          }`}
          title="Custom Color"
        >
          <span
            className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-500 shadow-inner"
            style={{ backgroundColor: isCustomColor ? selectedColor : customColor }}
          />
          <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
            Custom
          </span>
        </button>
      </div>

      {/* Custom Color Picker */}
      {showCustomPicker && (
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700/40 animate-fade-in dark:ring-1 dark:ring-white/5">
          <input
            type="color"
            value={isCustomColor ? selectedColor : customColor}
            onChange={handleCustomColorChange}
            className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0 shadow-inner"
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Pick a custom color
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              {isCustomColor ? selectedColor : customColor}
            </p>
          </div>
        </div>
      )}

      {/* Info Text */}
      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
        <span className="inline-block w-1 h-1 rounded-full bg-purple-400"></span>
        Works best with signatures on white/light backgrounds.
      </p>
    </div>
  );
}

export default SignatureColorPicker;
