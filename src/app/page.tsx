'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { Shield, Zap, Wifi, WifiOff, Download, Moon, Sun } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useStaticProcessor } from '@/hooks/useStaticProcessor';
import {
  FileUpload,
  PresetSelector,
  ImageCropper,
  ResultDisplay,
  ProcessingOverlay,
  SignatureColorPicker,
  QualitySlider,
} from '@/components';
import type { CropArea, ImageSpec, ExamPreset } from '@/types';

export default function HomePage() {
  const {
    selectedPreset,
    selectedType,
    uploadedFile,
    uploadedImageUrl,
    processedResult,
    showCropper,
    addDate,
    darkMode,
    customDimensions,
    isCustomMode,
    signatureColor,
    lastCropArea,
    outputQuality,
    setPreset,
    setType,
    setUploadedFile,
    setProcessedResult,
    setLastCropArea,
    setShowCropper,
    setAddDate,
    setDarkMode,
    setCustomDimensions,
    setSignatureColor,
    setOutputQuality,
    reset,
  } = useAppStore();

  const [isOnline, setIsOnline] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isReprocessing, setIsReprocessing] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply dark mode class to html
  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.toggle('dark', darkMode);
    }
  }, [darkMode, mounted]);

  // Get current spec - use custom dimensions if in custom mode
  const currentSpec: ImageSpec | null = isCustomMode
    ? {
        widthPx: customDimensions.width,
        heightPx: customDimensions.height,
        minSizeKB: customDimensions.minKB,
        maxSizeKB: customDimensions.maxKB,
        dateFormat: false,
      }
    : selectedPreset
      ? selectedType === 'photo'
        ? selectedPreset.specs.photo
        : selectedPreset.specs.signature
      : null;

  // Initialize processor hook
  const { processImage, state: processorState } = useStaticProcessor({
    spec: currentSpec || { widthPx: 200, heightPx: 200, minSizeKB: 10, maxSizeKB: 100 },
    addDate: addDate && selectedType === 'photo',
    signatureColor: selectedType === 'signature' ? signatureColor : null,
    qualityPreference: outputQuality,
  });

  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle file upload
  const handleFileSelect = useCallback((file: File, imageUrl: string) => {
    setUploadedFile(file, imageUrl);
  }, [setUploadedFile]);

  // Handle crop complete
  const handleCropComplete = useCallback(async (cropArea: CropArea) => {
    if (!uploadedFile || !currentSpec) return;
    
    try {
      setLastCropArea(cropArea); // Save for reprocessing
      const result = await processImage(uploadedFile, cropArea);
      setProcessedResult(result);
    } catch (error) {
      console.error('Processing failed:', error);
    }
  }, [uploadedFile, currentSpec, processImage, setProcessedResult, setLastCropArea]);

  // Handle reprocessing (when color changes)
  const handleReprocess = useCallback(async () => {
    if (!uploadedFile || !currentSpec || !lastCropArea) return;
    
    setIsReprocessing(true);
    try {
      const result = await processImage(uploadedFile, lastCropArea);
      setProcessedResult(result);
    } catch (error) {
      console.error('Reprocessing failed:', error);
    } finally {
      setIsReprocessing(false);
    }
  }, [uploadedFile, currentSpec, lastCropArea, processImage, setProcessedResult]);

  // Handle reset
  const handleReset = useCallback(() => {
    if (uploadedImageUrl) {
      URL.revokeObjectURL(uploadedImageUrl);
    }
    if (processedResult?.dataUrl) {
      URL.revokeObjectURL(processedResult.dataUrl);
    }
    reset();
  }, [uploadedImageUrl, processedResult, reset]);

  // Calculate aspect ratio
  const aspectRatio = currentSpec ? currentSpec.widthPx / currentSpec.heightPx : 1;

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080a12] transition-colors duration-500 overflow-hidden">
      {/* Enhanced gradient overlays for dark mode */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-500/[0.02] via-transparent to-indigo-500/[0.02] dark:from-blue-600/[0.08] dark:via-indigo-600/[0.03] dark:to-violet-600/[0.06] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-transparent via-transparent to-transparent dark:from-blue-900/20 dark:via-transparent dark:to-transparent pointer-events-none" />
      
      {/* Animated Student/Exam Theme Background Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Floating Pencil */}
        <svg className="absolute top-[15%] left-[8%] w-12 h-12 text-blue-500/10 dark:text-blue-400/10 animate-float" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z"/>
        </svg>
        
        {/* Graduation Cap */}
        <svg className="absolute top-[25%] right-[12%] w-16 h-16 text-indigo-500/10 dark:text-indigo-400/10 animate-float delay-300" style={{animationDelay: '1s'}} viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 014.653-2.52.75.75 0 00-.65-1.352 56.129 56.129 0 00-4.78 2.589 1.858 1.858 0 00-.859 1.228 49.803 49.803 0 00-4.634-1.527.75.75 0 01-.231-1.337A60.653 60.653 0 0111.7 2.805z"/>
          <path d="M13.06 15.473a48.45 48.45 0 017.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 01-.46.71 47.878 47.878 0 00-8.105 4.342.75.75 0 01-.832 0 47.877 47.877 0 00-8.104-4.342.75.75 0 01-.461-.71c.035-1.442.121-2.87.255-4.286A48.4 48.4 0 016 13.18v1.27a1.5 1.5 0 00-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.661a6.729 6.729 0 00.551-1.608 1.5 1.5 0 00.14-2.67v-.645a48.549 48.549 0 013.44 1.668 2.25 2.25 0 002.12 0z"/>
          <path d="M4.462 19.462c.42-.419.753-.89 1-1.394.453.213.902.434 1.347.661a6.743 6.743 0 01-1.286 1.794.75.75 0 11-1.06-1.06z"/>
        </svg>
        
        {/* Book */}
        <svg className="absolute top-[60%] left-[5%] w-14 h-14 text-emerald-500/10 dark:text-emerald-400/10 animate-float" style={{animationDelay: '2s'}} viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z"/>
        </svg>
        
        {/* Calculator */}
        <svg className="absolute top-[45%] right-[6%] w-10 h-10 text-purple-500/10 dark:text-purple-400/10 animate-float" style={{animationDelay: '0.5s'}} viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" d="M6.32 1.827a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V19.5a3 3 0 01-3 3H6.75a3 3 0 01-3-3V4.757c0-1.47 1.073-2.756 2.57-2.93zM7.5 11.25a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H8.25a.75.75 0 01-.75-.75v-.008zm.75 1.5a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H8.25zm-.75 3a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H8.25a.75.75 0 01-.75-.75v-.008zm.75 1.5a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75V18a.75.75 0 00-.75-.75H8.25zm1.748-6a.75.75 0 01.75-.75h.007a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.007a.75.75 0 01-.75-.75v-.008zm.75 1.5a.75.75 0 00-.75.75v.008c0 .414.335.75.75.75h.007a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75h-.007zm-.75 3a.75.75 0 01.75-.75h.007a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.007a.75.75 0 01-.75-.75v-.008zm.75 1.5a.75.75 0 00-.75.75v.008c0 .414.335.75.75.75h.007a.75.75 0 00.75-.75V18a.75.75 0 00-.75-.75h-.007zm1.754-6a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008zm.75 1.5a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75h-.008zm-.75 3a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008zm.75 1.5a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75V18a.75.75 0 00-.75-.75h-.008zm1.748-6a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008zm.75 1.5a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75h-.008zm-8.25-6A.75.75 0 018.25 6h7.5a.75.75 0 01.75.75v1.5a.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75v-1.5zm9 7.5a.75.75 0 00-.75.75v2.25c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75v-2.25a.75.75 0 00-.75-.75h-.008z" clipRule="evenodd"/>
        </svg>
        
        {/* Light bulb (idea) */}
        <svg className="absolute top-[75%] right-[15%] w-10 h-10 text-amber-500/10 dark:text-amber-400/10 animate-float" style={{animationDelay: '1.5s'}} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 .75a8.25 8.25 0 00-4.135 15.39c.686.398 1.115 1.008 1.134 1.623a.75.75 0 00.577.706c.352.083.71.148 1.074.195.323.041.6-.218.6-.544v-4.661a6.714 6.714 0 01-.937-.171.75.75 0 11.374-1.453 5.261 5.261 0 002.626 0 .75.75 0 11.374 1.452 6.712 6.712 0 01-.937.172v4.66c0 .327.277.586.6.545.364-.047.722-.112 1.074-.195a.75.75 0 00.577-.706c.02-.615.448-1.225 1.134-1.623A8.25 8.25 0 0012 .75z"/>
          <path fillRule="evenodd" d="M9.013 19.9a.75.75 0 01.877-.597 11.319 11.319 0 004.22 0 .75.75 0 11.28 1.473 12.819 12.819 0 01-4.78 0 .75.75 0 01-.597-.876zM9.754 22.344a.75.75 0 01.824-.668 13.682 13.682 0 002.844 0 .75.75 0 11.156 1.492 15.156 15.156 0 01-3.156 0 .75.75 0 01-.668-.824z" clipRule="evenodd"/>
        </svg>
        
        {/* Document/Paper */}
        <svg className="absolute bottom-[20%] left-[12%] w-12 h-12 text-cyan-500/10 dark:text-cyan-400/10 animate-float" style={{animationDelay: '2.5s'}} viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z" clipRule="evenodd"/>
          <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z"/>
        </svg>
        
        {/* Trophy/Achievement */}
        <svg className="absolute top-[35%] left-[18%] w-10 h-10 text-yellow-500/10 dark:text-yellow-400/10 animate-float" style={{animationDelay: '3s'}} viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.753 6.753 0 006.138 5.6 6.73 6.73 0 002.743 1.346A6.707 6.707 0 019.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a.75.75 0 000 1.5h12.75a.75.75 0 000-1.5h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.707 6.707 0 01-1.112-3.173 6.73 6.73 0 002.743-1.347 6.753 6.753 0 006.139-5.6.75.75 0 00-.585-.858 47.077 47.077 0 00-3.07-.543V2.62a.75.75 0 00-.658-.744 49.22 49.22 0 00-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 00-.657.744zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 013.16 5.337a45.6 45.6 0 012.006-.343v.256zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 01-2.863 3.207 6.72 6.72 0 00.857-3.294z" clipRule="evenodd"/>
        </svg>
        
        {/* Math formulas - decorative text */}
        <div className="absolute top-[10%] right-[25%] text-2xl font-serif text-blue-500/[0.06] dark:text-blue-400/[0.08] animate-float select-none" style={{animationDelay: '1.2s'}}>
          π
        </div>
        <div className="absolute top-[50%] left-[25%] text-xl font-serif text-indigo-500/[0.06] dark:text-indigo-400/[0.08] animate-float select-none" style={{animationDelay: '0.8s'}}>
          ∑
        </div>
        <div className="absolute bottom-[30%] right-[22%] text-2xl font-serif text-purple-500/[0.06] dark:text-purple-400/[0.08] animate-float select-none" style={{animationDelay: '2.2s'}}>
          √x
        </div>
        <div className="absolute top-[70%] right-[35%] text-lg font-serif text-emerald-500/[0.06] dark:text-emerald-400/[0.08] animate-float select-none" style={{animationDelay: '1.8s'}}>
          ∞
        </div>
        
        {/* ABC Letters */}
        <div className="absolute bottom-[15%] right-[8%] text-3xl font-bold text-rose-500/[0.05] dark:text-rose-400/[0.07] animate-float select-none" style={{animationDelay: '0.3s'}}>
          A
        </div>
        <div className="absolute top-[20%] left-[30%] text-2xl font-bold text-teal-500/[0.05] dark:text-teal-400/[0.07] animate-float select-none" style={{animationDelay: '2.8s'}}>
          B+
        </div>
      </div>
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/[0.06] shadow-sm dark:shadow-none">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 dark:shadow-blue-500/30 overflow-hidden transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
              {/* Camera icon matching favicon */}
              <svg viewBox="0 0 512 512" fill="none" className="w-8 h-8">
                <path d="M256 128c-70.7 0-128 57.3-128 128s57.3 128 128 128 128-57.3 128-128-57.3-128-128-128zm0 208c-44.2 0-80-35.8-80-80s35.8-80 80-80 80 35.8 80 80-35.8 80-80 80z" fill="white"/>
                <circle cx="256" cy="256" r="40" fill="white"/>
                <path d="M400 144h-48l-24-48H184l-24 48h-48c-17.7 0-32 14.3-32 32v192c0 17.7 14.3 32 32 32h288c17.7 0 32-14.3 32-32V176c0-17.7-14.3-32-32-32z" fill="white" fillOpacity="0.3"/>
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-slate-800 dark:text-white text-lg tracking-tight transition-colors">PresetPhoto</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Exam Photo Processor</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-all duration-300 hover:scale-110 active:scale-95 dark:ring-1 dark:ring-white/10 overflow-hidden group"
              aria-label="Toggle dark mode"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400/0 via-amber-400/0 to-amber-400/0 group-hover:from-amber-400/10 group-hover:via-orange-400/10 group-hover:to-amber-400/10 dark:group-hover:from-amber-400/20 dark:group-hover:via-orange-400/20 dark:group-hover:to-amber-400/20 transition-all duration-300" />
              {darkMode ? (
                <Sun className="w-5 h-5 text-amber-400 transition-transform duration-300 group-hover:rotate-45" />
              ) : (
                <Moon className="w-5 h-5 text-slate-500 transition-transform duration-300 group-hover:-rotate-12" />
              )}
            </button>
            
            {/* Online Status */}
            <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 ${
              isOnline 
                ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20 dark:ring-emerald-400/30' 
                : 'bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20 dark:ring-amber-400/30'
            }`}>
              {isOnline ? <Wifi className="w-3.5 h-3.5 animate-pulse" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span className="uppercase">{isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Trust Banner */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 dark:from-emerald-600 dark:via-teal-500 dark:to-emerald-600 animated-gradient">
        <div className="max-w-3xl mx-auto px-6 py-2.5 flex items-center justify-center gap-2 text-sm">
          <Shield className="w-4 h-4 text-white/90 animate-pulse" />
          <span className="font-medium text-white/95 tracking-wide">
            100% Private · Zero Server Upload · Works Offline
          </span>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative max-w-3xl mx-auto px-6 py-10">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3 mb-10 animate-fade-in">
          <StepIndicator 
            number={1} 
            label="Select" 
            active={!selectedPreset} 
            complete={!!selectedPreset}
            darkMode={darkMode}
          />
          <div className="w-16 h-0.5 bg-gradient-to-r from-slate-300 to-slate-200 dark:from-slate-700/60 dark:to-slate-800/60 rounded-full" />
          <StepIndicator 
            number={2} 
            label="Upload" 
            active={!!selectedPreset && !uploadedFile} 
            complete={!!uploadedFile}
            darkMode={darkMode}
          />
          <div className="w-16 h-0.5 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-800/60 dark:to-slate-700/60 rounded-full" />
          <StepIndicator 
            number={3} 
            label="Download" 
            active={!!uploadedFile && !processedResult} 
            complete={!!processedResult}
            darkMode={darkMode}
          />
        </div>

        <div className="space-y-6">
          {/* Preset Selector */}
          <section className="card relative z-20 animate-slide-up dark:bg-slate-800/50 dark:border-slate-700/30 dark:ring-1 dark:ring-white/5">
            <PresetSelector
              selectedPreset={selectedPreset}
              selectedType={selectedType}
              onPresetSelect={setPreset}
              onTypeSelect={setType}
              addDate={addDate}
              customDimensions={customDimensions}
              onCustomDimensionsChange={setCustomDimensions}
              isCustomMode={isCustomMode}
            />
            
            {/* Date Toggle - always show for photos */}
            {selectedType === 'photo' && (
              <div className="mt-5 flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-xl border border-blue-100/80 dark:border-blue-400/20 transition-all duration-300 hover:border-blue-200 dark:hover:border-blue-400/30">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-white">Add Date Stamp</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Adds current date to photo {currentSpec?.dateFormat && <span className="text-blue-600 dark:text-blue-400 font-medium">(recommended)</span>}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={addDate}
                  onClick={() => setAddDate(!addDate)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${
                    addDate ? 'bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/30' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                      addDate ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            )}

            {/* Signature Color Picker - show for signatures (hide if result exists, shown in result section instead) */}
            {selectedType === 'signature' && !processedResult && (
              <div className="mt-5 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-500/10 dark:to-pink-500/10 rounded-xl border border-purple-100/80 dark:border-purple-400/20 transition-all duration-300 hover:border-purple-200 dark:hover:border-purple-400/30 animate-fade-in">
                <SignatureColorPicker
                  selectedColor={signatureColor}
                  onColorChange={setSignatureColor}
                />
              </div>
            )}

            {/* Quality Slider - show when preset is selected and no result yet */}
            {selectedPreset && !processedResult && (
              <div className="mt-5">
                <QualitySlider
                  value={outputQuality}
                  onChange={setOutputQuality}
                />
              </div>
            )}
          </section>

          {/* Upload Section */}
          {selectedPreset && !processedResult && (
            <section className="card relative z-10 animate-slide-up delay-150 dark:bg-slate-800/50 dark:border-slate-700/30 dark:ring-1 dark:ring-white/5">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-blue-500/25">2</span>
                Upload Your {selectedType === 'photo' ? 'Photo' : 'Signature'}
              </h2>
              <FileUpload onFileSelect={handleFileSelect} />
            </section>
          )}

          {/* Result Section */}
          {processedResult && currentSpec && uploadedFile && (
            <section className="card animate-fade-in-scale dark:bg-slate-800/50 dark:border-slate-700/30 dark:ring-1 dark:ring-white/5">
              {/* Show color picker for signatures even after processing */}
              {selectedType === 'signature' && (
                <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-500/10 dark:to-pink-500/10 rounded-xl border border-purple-100/80 dark:border-purple-400/20">
                  <SignatureColorPicker
                    selectedColor={signatureColor}
                    onColorChange={async (color) => {
                      setSignatureColor(color);
                      // Reprocess with new color (pass color directly to avoid stale closure)
                      if (lastCropArea && uploadedFile && currentSpec) {
                        setIsReprocessing(true);
                        try {
                          // Pass the new color directly as 3rd argument to avoid state lag
                          const result = await processImage(uploadedFile, lastCropArea, color);
                          setProcessedResult(result);
                        } catch (error) {
                          console.error('Reprocessing failed:', error);
                        } finally {
                          setIsReprocessing(false);
                        }
                      }
                    }}
                  />
                  {isReprocessing && (
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 animate-pulse">
                      ⏳ Reprocessing with new color...
                    </p>
                  )}
                </div>
              )}

              {/* Quality Slider - always show in result section for adjustments */}
              <div className="mb-6">
                <QualitySlider
                  value={outputQuality}
                  onChange={async (quality) => {
                    setOutputQuality(quality);
                    // Reprocess with new quality (pass quality directly to avoid stale closure)
                    if (lastCropArea && uploadedFile && currentSpec) {
                      setIsReprocessing(true);
                      try {
                        const result = await processImage(uploadedFile, lastCropArea, signatureColor, quality);
                        setProcessedResult(result);
                      } catch (error) {
                        console.error('Reprocessing failed:', error);
                      } finally {
                        setIsReprocessing(false);
                      }
                    }
                  }}
                />
                {isReprocessing && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 animate-pulse">
                    ⏳ Reprocessing with new quality...
                  </p>
                )}
              </div>

              <ResultDisplay
                result={processedResult}
                spec={currentSpec}
                fileName={uploadedFile.name}
                onReset={handleReset}
              />
            </section>
          )}
        </div>

        {/* Features Section */}
        {!selectedPreset && (
          <section className="mt-16 grid md:grid-cols-3 gap-5">
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="100% Private"
              description="All processing happens in your browser. Your photos never leave your device."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="Lightning Fast"
              description="Hardware-accelerated engine for instant image processing."
            />
            <FeatureCard
              icon={<Download className="w-6 h-6" />}
              title="Works Offline"
              description="Install as a PWA and use anywhere, no internet needed."
            />
          </section>
        )}
      </main>

      {/* Cropper Modal */}
      {showCropper && uploadedImageUrl && currentSpec && (
        <ImageCropper
          imageUrl={uploadedImageUrl}
          aspectRatio={aspectRatio}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setShowCropper(false);
            setUploadedFile(null, null);
          }}
        />
      )}

      {/* Processing Overlay */}
      {processorState.step === 'processing' && (
        <ProcessingOverlay progress={processorState.progress} />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200/50 dark:border-white/5 mt-20 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              © {new Date().getFullYear()} PresetPhoto
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-500 flex items-center gap-1">
              Made with <span className="text-red-500 animate-pulse">♥</span> for exam aspirants
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Step Indicator Component
function StepIndicator({ 
  number, 
  label, 
  active, 
  complete,
  darkMode,
}: { 
  number: number; 
  label: string; 
  active: boolean; 
  complete: boolean;
  darkMode: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-500 ${
        complete 
          ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 animate-fade-in-scale' 
          : active 
            ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/40 scale-110 animate-glow-pulse' 
            : darkMode 
              ? 'bg-slate-800/80 text-slate-500 ring-1 ring-slate-700/50' 
              : 'bg-slate-100 text-slate-400 ring-1 ring-slate-200'
      }`}>
        {complete ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        ) : number}
      </div>
      <span className={`text-xs font-semibold tracking-wide transition-colors duration-300 ${
        active || complete 
          ? (darkMode ? 'text-slate-200' : 'text-slate-700') 
          : (darkMode ? 'text-slate-500' : 'text-slate-400')
      }`}>
        {label}
      </span>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
}) {
  return (
    <div className="group relative bg-white dark:bg-slate-800/40 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/30 hover:border-blue-300 dark:hover:border-blue-500/40 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/5 hover:-translate-y-1.5 dark:ring-1 dark:ring-white/5 dark:hover:ring-blue-500/20 overflow-hidden">
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 dark:group-hover:from-blue-500/10 dark:group-hover:to-indigo-500/10 transition-all duration-500 rounded-2xl" />
      
      <div className="relative">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 group-hover:shadow-lg group-hover:shadow-blue-500/20">
          {icon}
        </div>
        <h3 className="font-bold text-slate-800 dark:text-white mb-2 tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
