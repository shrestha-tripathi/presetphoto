'use client';

import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, Check, FileImage, PenTool, Settings2 } from 'lucide-react';
import type { ExamPreset, ImageSpec } from '@/types';
import examPresets from '@/config/examPresets.json';

interface PresetSelectorProps {
  selectedPreset: ExamPreset | null;
  selectedType: 'photo' | 'signature';
  onPresetSelect: (preset: ExamPreset) => void;
  onTypeSelect: (type: 'photo' | 'signature') => void;
  addDate?: boolean;
  customDimensions: {
    width: number;
    height: number;
    minKB: number;
    maxKB: number;
  };
  onCustomDimensionsChange: (dims: Partial<PresetSelectorProps['customDimensions']>) => void;
  isCustomMode: boolean;
}

export function PresetSelector({
  selectedPreset,
  selectedType,
  onPresetSelect,
  onTypeSelect,
  addDate = false,
  customDimensions,
  onCustomDimensionsChange,
  isCustomMode,
}: PresetSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Define category order (Custom first, then others)
  const categoryOrder = [
    '⚙️ Custom',
    '🎓 NTA Exams',
    '🏛️ UPSC',
    '📋 SSC',
    '🏦 Banking',
    '🚂 Railway',
    '👮 Police & Defence',
    '🏛️ State PSC',
    '👨‍🏫 Teaching',
    '📄 Documents',
  ];

  // Group presets by category with custom order
  const groupedPresets = useMemo(() => {
    const groups: Record<string, ExamPreset[]> = {};
    
    (examPresets as ExamPreset[]).forEach((preset) => {
      if (!groups[preset.category]) {
        groups[preset.category] = [];
      }
      groups[preset.category].push(preset);
    });
    
    // Return sorted by categoryOrder
    const sortedGroups: Record<string, ExamPreset[]> = {};
    categoryOrder.forEach(cat => {
      if (groups[cat]) {
        sortedGroups[cat] = groups[cat];
      }
    });
    // Add any remaining categories not in the order
    Object.keys(groups).forEach(cat => {
      if (!sortedGroups[cat]) {
        sortedGroups[cat] = groups[cat];
      }
    });
    
    return sortedGroups;
  }, []);

  // Filter presets based on search (search in label, category, id, and description)
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groupedPresets;
    
    const filtered: Record<string, ExamPreset[]> = {};
    const query = searchQuery.toLowerCase();
    
    Object.entries(groupedPresets).forEach(([category, presets]) => {
      const matchingPresets = presets.filter(
        (p) =>
          p.label.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.id.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query)) ||
          (p.source && p.source.toLowerCase().includes(query))
      );
      
      if (matchingPresets.length > 0) {
        filtered[category] = matchingPresets;
      }
    });
    
    return filtered;
  }, [groupedPresets, searchQuery]);

  const currentSpec: ImageSpec | null = selectedPreset
    ? selectedType === 'photo'
      ? selectedPreset.specs.photo
      : selectedPreset.specs.signature
    : null;
  
  const hasSignature = selectedPreset?.specs.signature !== null;

  // Get display spec (custom or preset)
  const displaySpec = isCustomMode ? {
    widthPx: customDimensions.width,
    heightPx: customDimensions.height,
    minSizeKB: customDimensions.minKB,
    maxSizeKB: customDimensions.maxKB,
  } : currentSpec;

  return (
    <div className={`w-full space-y-5 ${isOpen ? 'relative z-50' : ''}`}>
      {/* Preset Dropdown */}
      <div className="relative">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2.5 flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">1</span>
          Select Exam / Document Type
        </label>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/40 rounded-xl hover:border-blue-400 dark:hover:border-blue-500/50 hover:bg-white dark:hover:bg-slate-800/60 transition-all duration-300 group dark:ring-1 dark:ring-white/5 dark:hover:ring-blue-500/20"
        >
          <div className="flex items-center gap-3">
            {selectedPreset?.id === 'custom' && <Settings2 className="w-5 h-5 text-blue-500" />}
            <span className={selectedPreset ? 'text-slate-800 dark:text-slate-200 font-semibold' : 'text-slate-400 dark:text-slate-500'}>
              {selectedPreset?.label || 'Choose an exam preset...'}
            </span>
          </div>
          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} group-hover:text-blue-500`} />
        </button>

        {/* Dropdown Panel */}
        {isOpen && (
          <div className="absolute z-[100] w-full mt-2 bg-white dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700/50 rounded-xl shadow-2xl shadow-slate-200/50 dark:shadow-black/30 max-h-96 overflow-hidden backdrop-blur-xl dark:ring-1 dark:ring-white/10 animate-slide-down">
            {/* Search */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-700/30 bg-slate-50/50 dark:bg-slate-900/30 sticky top-0 z-10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by exam name, type, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600/40 bg-white dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-400 dark:ring-1 dark:ring-white/5"
                />
              </div>
              {searchQuery && (
                <div className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                  {Object.values(filteredGroups).flat().length} results found
                </div>
              )}
            </div>

            {/* Options */}
            <div className="overflow-y-auto max-h-72">
              {Object.entries(filteredGroups).map(([category, presets]) => (
                <div key={category}>
                  <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-900/60 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100/50 dark:border-slate-700/30">
                    {category}
                  </div>
                  {presets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        onPresetSelect(preset);
                        setIsOpen(false);
                        setSearchQuery('');
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-500/15 transition-all duration-200 ${
                        selectedPreset?.id === preset.id ? 'bg-blue-50 dark:bg-blue-500/15 border-l-2 border-blue-500' : 'border-l-2 border-transparent'
                      }`}
                    >
                      <div className="flex flex-col items-start">
                        <div className="flex items-center gap-2">
                          {preset.id === 'custom' && <Settings2 className="w-4 h-4 text-blue-500" />}
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{preset.label}</span>
                        </div>
                        {preset.description && (
                          <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{preset.description}</span>
                        )}
                      </div>
                      {selectedPreset?.id === preset.id && (
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ))}
              
              {Object.keys(filteredGroups).length === 0 && (
                <div className="p-6 text-center text-slate-400 dark:text-slate-500 text-sm">
                  No presets found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Custom Dimensions Input */}
      {isCustomMode && (
        <div className="p-5 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-violet-50 dark:from-blue-500/10 dark:via-indigo-500/10 dark:to-violet-500/10 rounded-xl border border-blue-200/50 dark:border-blue-400/20 dark:ring-1 dark:ring-white/5 animate-fade-in">
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Settings2 className="w-3.5 h-3.5 text-white" />
            </div>
            Custom Dimensions
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                Width (px)
              </label>
              <input
                type="number"
                value={customDimensions.width}
                onChange={(e) => onCustomDimensionsChange({ width: parseInt(e.target.value) || 200 })}
                min={50}
                max={2000}
                className="w-full px-4 py-3 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-600/50 bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                Height (px)
              </label>
              <input
                type="number"
                value={customDimensions.height}
                onChange={(e) => onCustomDimensionsChange({ height: parseInt(e.target.value) || 200 })}
                min={50}
                max={2000}
                className="w-full px-4 py-3 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-600/50 bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                Min Size (KB)
              </label>
              <input
                type="number"
                value={customDimensions.minKB}
                onChange={(e) => onCustomDimensionsChange({ minKB: parseInt(e.target.value) || 5 })}
                min={1}
                max={500}
                className="w-full px-4 py-3 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-600/50 bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                Max Size (KB)
              </label>
              <input
                type="number"
                value={customDimensions.maxKB}
                onChange={(e) => onCustomDimensionsChange({ maxKB: parseInt(e.target.value) || 100 })}
                min={5}
                max={1000}
                className="w-full px-4 py-3 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-600/50 bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>
      )}

      {/* Type Toggle (Photo/Signature) */}
      {selectedPreset && !isCustomMode && (
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Image Type
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => onTypeSelect('photo')}
              className={`flex-1 flex items-center justify-center gap-2.5 p-4 rounded-xl border-2 transition-all duration-200 ${
                selectedType === 'photo'
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/15 dark:to-indigo-500/15 text-blue-700 dark:text-blue-400 shadow-lg shadow-blue-500/10'
                  : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/50 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <FileImage className="w-5 h-5" />
              <span className="font-semibold">Photo</span>
            </button>
            
            {hasSignature && (
              <button
                onClick={() => onTypeSelect('signature')}
                className={`flex-1 flex items-center justify-center gap-2.5 p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedType === 'signature'
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/15 dark:to-indigo-500/15 text-blue-700 dark:text-blue-400 shadow-lg shadow-blue-500/10'
                    : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/50 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <PenTool className="w-5 h-5" />
                <span className="font-semibold">Signature</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Specs Display */}
      {displaySpec && (
        <div className="p-5 bg-gradient-to-br from-slate-100/80 to-slate-50 dark:from-slate-700/30 dark:to-slate-800/30 rounded-xl border border-slate-200/80 dark:border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              {isCustomMode ? 'Custom Specs' : 'Required Specs'}
            </h4>
            {selectedPreset?.source && !isCustomMode && (
              <span className="text-[10px] px-2 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full font-semibold">
                {selectedPreset.source}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-sm">
              <span className="text-slate-400 dark:text-slate-500 text-[10px] font-semibold uppercase tracking-wider block mb-1.5">Dimensions</span>
              <p className="font-bold text-base text-slate-800 dark:text-slate-200">
                {displaySpec.widthPx} × {displaySpec.heightPx}<span className="text-xs font-normal text-slate-400 ml-1">px</span>
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-sm">
              <span className="text-slate-400 dark:text-slate-500 text-[10px] font-semibold uppercase tracking-wider block mb-1.5">File Size</span>
              <p className="font-bold text-base text-slate-800 dark:text-slate-200">
                {displaySpec.minSizeKB} - {displaySpec.maxSizeKB}<span className="text-xs font-normal text-slate-400 ml-1">KB</span>
              </p>
            </div>
            {currentSpec?.aspectRatio && !isCustomMode && (
              <div className="bg-white dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-sm">
                <span className="text-slate-400 dark:text-slate-500 text-[10px] font-semibold uppercase tracking-wider block mb-1.5">Aspect Ratio</span>
                <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">{currentSpec.aspectRatio}</p>
              </div>
            )}
            {currentSpec?.background && !isCustomMode && (
              <div className="bg-white dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-sm">
                <span className="text-slate-400 dark:text-slate-500 text-[10px] font-semibold uppercase tracking-wider block mb-1.5">Background</span>
                <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">{currentSpec.background}</p>
              </div>
            )}
          </div>
          {addDate && selectedType === 'photo' && (
            <div className="mt-4 flex items-center gap-2.5 text-sm text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 p-3 rounded-xl border border-blue-200/50 dark:border-blue-500/20">
              <span className="text-base">📅</span>
              <span className="font-medium">Date stamp will be added</span>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close - backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[99]" 
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export default PresetSelector;
