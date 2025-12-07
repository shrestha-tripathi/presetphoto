'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ExamPreset, ProcessedResult, CropArea } from '@/types';

interface AppState {
  // Preset selection
  selectedPreset: ExamPreset | null;
  selectedType: 'photo' | 'signature';
  
  // Image handling
  uploadedFile: File | null;
  uploadedImageUrl: string | null;
  processedResult: ProcessedResult | null;
  lastCropArea: CropArea | null; // Store last crop for reprocessing
  
  // Custom dimensions (for custom preset)
  customDimensions: {
    width: number;
    height: number;
    minKB: number;
    maxKB: number;
  };
  
  // Signature color (null = keep original)
  signatureColor: string | null;
  
  // Output quality preference (0-100, where 100 = max quality within size limit)
  outputQuality: number;
  
  // UI state
  showCropper: boolean;
  addDate: boolean;
  darkMode: boolean;
  isCustomMode: boolean;
  
  // Actions
  setPreset: (preset: ExamPreset) => void;
  setType: (type: 'photo' | 'signature') => void;
  setUploadedFile: (file: File | null, imageUrl: string | null) => void;
  setProcessedResult: (result: ProcessedResult | null) => void;
  setLastCropArea: (cropArea: CropArea | null) => void;
  setCustomDimensions: (dims: Partial<AppState['customDimensions']>) => void;
  setSignatureColor: (color: string | null) => void;
  setOutputQuality: (quality: number) => void;
  setShowCropper: (show: boolean) => void;
  setAddDate: (add: boolean) => void;
  setDarkMode: (dark: boolean) => void;
  setIsCustomMode: (custom: boolean) => void;
  reset: () => void;
}

const initialState = {
  selectedPreset: null,
  selectedType: 'photo' as const,
  uploadedFile: null,
  uploadedImageUrl: null,
  processedResult: null,
  lastCropArea: null as CropArea | null,
  customDimensions: {
    width: 200,
    height: 230,
    minKB: 10,
    maxKB: 50,
  },
  signatureColor: null as string | null,
  outputQuality: 80, // Default to 80% (High quality preset)
  showCropper: false,
  addDate: false,
  darkMode: false,
  isCustomMode: false,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setPreset: (preset) => set({ 
        selectedPreset: preset,
        processedResult: null,
        addDate: preset?.specs.photo?.dateFormat ?? false,
        isCustomMode: preset?.id === 'custom',
      }),
      
      setType: (type) => set({ 
        selectedType: type,
        processedResult: null,
      }),
      
      setUploadedFile: (file, imageUrl) => set({ 
        uploadedFile: file,
        uploadedImageUrl: imageUrl,
        processedResult: null,
        showCropper: !!file,
      }),
      
      setProcessedResult: (result) => set({ 
        processedResult: result,
        showCropper: false,
      }),
      
      setLastCropArea: (cropArea) => set({ lastCropArea: cropArea }),
      
      setCustomDimensions: (dims) => set((state) => ({
        customDimensions: { ...state.customDimensions, ...dims },
      })),
      
      setSignatureColor: (color) => set({ signatureColor: color }),
      
      setOutputQuality: (quality) => set({ outputQuality: quality }),
      
      setShowCropper: (show) => set({ showCropper: show }),
      
      setAddDate: (add) => set({ addDate: add }),
      
      setDarkMode: (dark) => set({ darkMode: dark }),
      
      setIsCustomMode: (custom) => set({ isCustomMode: custom }),
      
      reset: () => set({
        ...initialState,
        // Preserve user preferences
        darkMode: false,
      }),
    }),
    {
      name: 'preset-photo-storage',
      partialize: (state) => ({ 
        darkMode: state.darkMode,
        customDimensions: state.customDimensions,
      }),
    }
  )
);
