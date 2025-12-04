// Type definitions for Exam Presets

export interface ImageSpec {
  widthPx: number;
  heightPx: number;
  minSizeKB: number;
  maxSizeKB: number;
  dateFormat?: boolean;
  customizable?: boolean;
  aspectRatio?: string;
  format?: string;
  background?: string;
}

export interface ExamPreset {
  id: string;
  label: string;
  category: string;
  description?: string;
  source?: string;
  specs: {
    photo: ImageSpec;
    signature: ImageSpec | null;
  };
}

export interface ProcessingState {
  step: 'upload' | 'crop' | 'processing' | 'complete';
  progress: number;
  error: string | null;
}

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

export interface ProcessedResult {
  blob: Blob;
  dataUrl: string;
  sizeKB: number;
  dimensions: {
    width: number;
    height: number;
  };
}
