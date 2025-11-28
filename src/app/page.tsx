'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { Shield, Zap, Wifi, WifiOff, Download, Moon, Sun, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useStaticProcessor } from '@/hooks/useStaticProcessor';
import {
  FileUpload,
  PresetSelector,
  ImageCropper,
  ResultDisplay,
  ProcessingOverlay,
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
    setPreset,
    setType,
    setUploadedFile,
    setProcessedResult,
    setShowCropper,
    setAddDate,
    setDarkMode,
    setCustomDimensions,
    reset,
  } = useAppStore();

  const [isOnline, setIsOnline] = useState(true);
  const [mounted, setMounted] = useState(false);

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
      const result = await processImage(uploadedFile, cropArea);
      setProcessedResult(result);
    } catch (error) {
      console.error('Processing failed:', error);
    }
  }, [uploadedFile, currentSpec, processImage, setProcessedResult]);

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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a14] transition-colors duration-300">
      {/* Subtle gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-500/[0.02] via-transparent to-indigo-500/[0.02] dark:from-blue-500/[0.03] dark:to-indigo-500/[0.03] pointer-events-none" />
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 dark:shadow-blue-500/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800 dark:text-white text-lg tracking-tight">PresetPhoto</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Exam Photo Processor</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-amber-500" />
              ) : (
                <Moon className="w-5 h-5 text-slate-500" />
              )}
            </button>
            
            {/* Online Status */}
            <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold tracking-wide ${
              isOnline 
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20' 
                : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20'
            }`}>
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span className="uppercase">{isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Trust Banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-600 dark:to-teal-600">
        <div className="max-w-3xl mx-auto px-6 py-2.5 flex items-center justify-center gap-2 text-sm">
          <Shield className="w-4 h-4 text-white/90" />
          <span className="font-medium text-white/95 tracking-wide">
            100% Private · Zero Upload · Works Offline
          </span>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative max-w-3xl mx-auto px-6 py-10">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <StepIndicator 
            number={1} 
            label="Select" 
            active={!selectedPreset} 
            complete={!!selectedPreset}
            darkMode={darkMode}
          />
          <div className="w-16 h-px bg-gradient-to-r from-slate-300 to-slate-200 dark:from-slate-700 dark:to-slate-800" />
          <StepIndicator 
            number={2} 
            label="Upload" 
            active={!!selectedPreset && !uploadedFile} 
            complete={!!uploadedFile}
            darkMode={darkMode}
          />
          <div className="w-16 h-px bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700" />
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
          <section className="card relative z-20">
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
              <div className="mt-5 flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-xl border border-blue-100/80 dark:border-blue-500/20">
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
                    addDate ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-slate-300 dark:bg-slate-600'
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
          </section>

          {/* Upload Section */}
          {selectedPreset && !processedResult && (
            <section className="card relative z-10">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">2</span>
                Upload Your {selectedType === 'photo' ? 'Photo' : 'Signature'}
              </h2>
              <FileUpload onFileSelect={handleFileSelect} />
            </section>
          )}

          {/* Result Section */}
          {processedResult && currentSpec && uploadedFile && (
            <section className="card">
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
      <footer className="border-t border-slate-200/50 dark:border-slate-800/50 mt-20 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500 dark:text-slate-500 font-medium">
              © {new Date().getFullYear()} PresetPhoto
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-600">
              Made with ♥ for exam aspirants
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
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${
        complete 
          ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30' 
          : active 
            ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30 scale-110' 
            : darkMode ? 'bg-slate-800 text-slate-500 ring-1 ring-slate-700' : 'bg-slate-100 text-slate-400 ring-1 ring-slate-200'
      }`}>
        {complete ? '✓' : number}
      </div>
      <span className={`text-xs font-semibold tracking-wide ${
        active || complete 
          ? (darkMode ? 'text-slate-200' : 'text-slate-700') 
          : (darkMode ? 'text-slate-600' : 'text-slate-400')
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
    <div className="group relative bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 hover:-translate-y-1">
      <div className="w-12 h-12 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="font-bold text-slate-800 dark:text-white mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}
