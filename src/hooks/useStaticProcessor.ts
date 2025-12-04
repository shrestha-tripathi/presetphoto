'use client';

import { useState, useCallback, useRef } from 'react';
import { processImageWASM, getProcessorCapabilities, type ProcessOptions } from '@/lib/wasmProcessor';
import type { ImageSpec, CropArea, ProcessedResult, ProcessingState } from '@/types';

interface UseStaticProcessorOptions {
  spec: ImageSpec;
  addDate?: boolean;
  signatureColor?: string | null;
}

interface UseStaticProcessorReturn {
  processImage: (file: File, cropArea?: CropArea, signatureColorOverride?: string | null) => Promise<ProcessedResult>;
  state: ProcessingState;
  reset: () => void;
  capabilities: ReturnType<typeof getProcessorCapabilities>;
}

/**
 * Enhanced Static Processor Hook
 * 
 * Uses optimized processing with multiple strategies:
 * 1. createImageBitmap + OffscreenCanvas (hardware-accelerated, fastest)
 * 2. Traditional Canvas API (universal fallback)
 * 
 * Features:
 * - Zero network calls - 100% client-side
 * - Iterative binary search compression for exact KB targets
 * - Optional date stamp overlay
 * - Progress tracking
 * - Performance metrics
 */
export function useStaticProcessor({
  spec,
  addDate = false,
  signatureColor = null,
}: UseStaticProcessorOptions): UseStaticProcessorReturn {
  const [state, setState] = useState<ProcessingState>({
    step: 'upload',
    progress: 0,
    error: null,
  });
  
  // Cache capabilities check
  const capabilities = useRef(getProcessorCapabilities());

  const reset = useCallback(() => {
    setState({
      step: 'upload',
      progress: 0,
      error: null,
    });
  }, []);

  const processImage = useCallback(
    async (file: File, cropArea?: CropArea, signatureColorOverride?: string | null): Promise<ProcessedResult> => {
      // Use override if provided, otherwise fall back to hook's signatureColor
      const effectiveColor = signatureColorOverride !== undefined ? signatureColorOverride : signatureColor;
      
      try {
        setState({ step: 'processing', progress: 0, error: null });

        const options: ProcessOptions = {
          targetWidth: spec.widthPx,
          targetHeight: spec.heightPx,
          minSizeKB: spec.minSizeKB,
          maxSizeKB: spec.maxSizeKB,
          addDate,
          signatureColor: effectiveColor,
          cropArea: cropArea ? {
            x: cropArea.x,
            y: cropArea.y,
            width: cropArea.width,
            height: cropArea.height,
            rotation: cropArea.rotation,
          } : undefined,
        };

        // Use the optimized processor
        const result = await processImageWASM(
          file,
          options,
          (progress) => setState((s) => ({ ...s, progress }))
        );

        setState({ step: 'complete', progress: 100, error: null });

        // Create object URL for display
        const dataUrl = URL.createObjectURL(result.blob);

        console.log(`✨ Processing complete in ${result.processingTimeMs}ms`);
        console.log(`📊 Capabilities:`, capabilities.current);

        return {
          blob: result.blob,
          dataUrl,
          sizeKB: result.sizeKB,
          dimensions: {
            width: result.width,
            height: result.height,
          },
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Processing failed';
        setState({ step: 'upload', progress: 0, error: errorMessage });
        throw error;
      }
    },
    [spec, addDate, signatureColor]
  );

  return {
    processImage,
    state,
    reset,
    capabilities: capabilities.current,
  };
}

export default useStaticProcessor;
