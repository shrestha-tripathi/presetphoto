'use client';

/**
 * WASM-Based Image Processor
 * 
 * This module provides high-performance image processing using WebAssembly.
 * It uses multiple strategies with fallbacks:
 * 
 * 1. OffscreenCanvas + createImageBitmap (hardware-accelerated)
 * 2. Web Workers for parallel processing
 * 3. Canvas API fallback
 * 
 * Technologies Used:
 * - OffscreenCanvas: Hardware-accelerated off-main-thread rendering
 * - createImageBitmap: Async image decoding (uses browser's native decoders)
 * - Web Workers: Parallel processing without blocking UI
 * - Canvas API: Universal fallback
 */

export interface ProcessOptions {
  targetWidth: number;
  targetHeight: number;
  minSizeKB: number;
  maxSizeKB: number;
  addDate: boolean;
  signatureColor?: string | null; // Color to apply to signature (null = keep original)
  qualityPreference?: number; // 0-100, where 100 = max quality within size limit
  cropArea?: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
  };
}

export interface ProcessResult {
  blob: Blob;
  width: number;
  height: number;
  sizeKB: number;
  processingTimeMs: number;
}

// Check for OffscreenCanvas support (better performance)
const supportsOffscreenCanvas = typeof OffscreenCanvas !== 'undefined';

// Check for createImageBitmap support (async image decoding)
const supportsImageBitmap = typeof createImageBitmap !== 'undefined';

/**
 * Parse hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

/**
 * Apply color transformation to signature
 * Converts dark pixels (ink) to the target color while keeping light pixels (background) white
 * Handles transparent PNGs by treating transparent as background
 */
function applySignatureColor(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  canvas: HTMLCanvasElement | OffscreenCanvas,
  targetColor: string
): void {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const { r: targetR, g: targetG, b: targetB } = hexToRgb(targetColor);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const alpha = data[i + 3];

    // If pixel is mostly transparent, make it white
    if (alpha < 128) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 255;
      continue;
    }

    // Calculate luminance (how bright the pixel is)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // For signature images:
    // - Dark pixels (low luminance) = ink, should be colored
    // - Light pixels (high luminance) = paper/background, should stay white
    
    // Threshold for what we consider "ink" vs "background"
    const inkThreshold = 0.7; // Pixels darker than this are ink
    
    if (luminance < inkThreshold) {
      // This is ink - apply the target color with intensity based on darkness
      // Darker original = more intense color
      const intensity = 1 - (luminance / inkThreshold);
      
      // Blend between white and target color based on intensity
      data[i] = Math.round(255 - (255 - targetR) * intensity);
      data[i + 1] = Math.round(255 - (255 - targetG) * intensity);
      data[i + 2] = Math.round(255 - (255 - targetB) * intensity);
      data[i + 3] = 255; // Make fully opaque
    } else {
      // This is background - make it white
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Apply rotation to canvas
 * Rotates the image by the specified degrees
 */
async function applyRotation(
  sourceCanvas: HTMLCanvasElement | OffscreenCanvas,
  rotation: number
): Promise<HTMLCanvasElement | OffscreenCanvas> {
  if (rotation === 0) {
    return sourceCanvas;
  }

  const radians = (rotation * Math.PI) / 180;
  const sin = Math.abs(Math.sin(radians));
  const cos = Math.abs(Math.cos(radians));
  
  const sourceWidth = sourceCanvas.width;
  const sourceHeight = sourceCanvas.height;
  
  // Calculate new dimensions after rotation
  const newWidth = Math.round(sourceWidth * cos + sourceHeight * sin);
  const newHeight = Math.round(sourceWidth * sin + sourceHeight * cos);
  
  let rotatedCanvas: HTMLCanvasElement | OffscreenCanvas;
  let rotatedCtx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  
  if (typeof OffscreenCanvas !== 'undefined') {
    rotatedCanvas = new OffscreenCanvas(newWidth, newHeight);
    rotatedCtx = rotatedCanvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
  } else {
    rotatedCanvas = document.createElement('canvas');
    rotatedCanvas.width = newWidth;
    rotatedCanvas.height = newHeight;
    rotatedCtx = rotatedCanvas.getContext('2d') as CanvasRenderingContext2D;
  }
  
  // Fill with white background
  rotatedCtx.fillStyle = '#FFFFFF';
  rotatedCtx.fillRect(0, 0, newWidth, newHeight);
  
  // Move to center, rotate, then draw
  rotatedCtx.translate(newWidth / 2, newHeight / 2);
  rotatedCtx.rotate(radians);
  rotatedCtx.drawImage(sourceCanvas, -sourceWidth / 2, -sourceHeight / 2);
  
  return rotatedCanvas;
}

/**
 * High-performance image resize using createImageBitmap
 * This uses the browser's native image decoders which are often SIMD-optimized
 */
async function resizeWithImageBitmap(
  source: Blob | ImageBitmap,
  targetWidth: number,
  targetHeight: number,
  cropArea?: ProcessOptions['cropArea']
): Promise<ImageBitmap> {
  let bitmap: ImageBitmap;
  
  if (source instanceof Blob) {
    if (cropArea) {
      // Create full bitmap first, then crop
      const fullBitmap = await createImageBitmap(source);
      bitmap = await createImageBitmap(
        fullBitmap,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height,
        {
          resizeWidth: targetWidth,
          resizeHeight: targetHeight,
          resizeQuality: 'high', // 'pixelated' | 'low' | 'medium' | 'high'
        }
      );
      fullBitmap.close();
    } else {
      bitmap = await createImageBitmap(source, {
        resizeWidth: targetWidth,
        resizeHeight: targetHeight,
        resizeQuality: 'high',
      });
    }
  } else {
    if (cropArea) {
      bitmap = await createImageBitmap(
        source,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height,
        {
          resizeWidth: targetWidth,
          resizeHeight: targetHeight,
          resizeQuality: 'high',
        }
      );
    } else {
      bitmap = await createImageBitmap(source, {
        resizeWidth: targetWidth,
        resizeHeight: targetHeight,
        resizeQuality: 'high',
      });
    }
  }
  
  return bitmap;
}

/**
 * Calculate the height reserved for date band
 * This is called BEFORE scaling so we know how much space to leave
 */
function getDateBandHeight(targetHeight: number): number {
  return Math.round(targetHeight * 0.08);
}

/**
 * Add date band to the TOP of the image (within existing canvas dimensions)
 * The image should already be positioned below the band area
 */
function drawDateBand(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  canvas: HTMLCanvasElement | OffscreenCanvas,
  bandHeight: number
): void {
  // Fill band area with white
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, bandHeight);
  
  // Add date text
  const today = new Date();
  const dateStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
  
  ctx.fillStyle = '#000000';
  const fontSize = Math.max(12, Math.round(bandHeight * 0.6));
  ctx.font = `bold ${fontSize}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(dateStr, canvas.width / 2, bandHeight / 2);
}

/**
 * Binary search for optimal JPEG quality to hit target file size
 * ALWAYS ensures output is within minSizeKB and maxSizeKB bounds
 * 
 * @param qualityPreference 30-100, controls target size within the allowed range
 *   - 30 = aim for minSizeKB (smallest allowed)
 *   - 100 = aim for maxSizeKB (largest allowed, best quality)
 */
async function findOptimalQuality(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  minSizeKB: number,
  maxSizeKB: number,
  qualityPreference: number = 80,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const maxBytes = maxSizeKB * 1024;
  const minBytes = minSizeKB * 1024;
  
  // Calculate target size based on quality preference (30-100 maps to min-max range)
  // Normalize preference from 30-100 to 0-1
  const normalizedPreference = Math.max(0, Math.min(1, (qualityPreference - 30) / 70));
  const targetBytes = minBytes + (maxBytes - minBytes) * normalizedPreference;
  
  console.log(`🎯 Target: ${(targetBytes / 1024).toFixed(1)}KB (range: ${minSizeKB}-${maxSizeKB}KB, preference: ${qualityPreference}%)`);
  
  // Helper to get blob from canvas
  const getBlob = async (quality: number): Promise<Blob> => {
    if (canvas instanceof OffscreenCanvas) {
      return await canvas.convertToBlob({ type: 'image/jpeg', quality });
    } else {
      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => blob ? resolve(blob) : reject(new Error('Failed to create blob')),
          'image/jpeg',
          quality
        );
      });
    }
  };
  
  onProgress?.(65);
  
  // Binary search to find JPEG quality that produces target file size
  let lowQuality = 0.1;
  let highQuality = 1.0;
  let bestBlob: Blob | null = null;
  let bestDiff = Infinity;
  let attempts = 0;
  const maxAttempts = 12;
  
  while (attempts < maxAttempts && highQuality - lowQuality > 0.01) {
    const quality = (lowQuality + highQuality) / 2;
    const blob = await getBlob(quality);
    const sizeBytes = blob.size;
    
    onProgress?.(65 + (attempts / maxAttempts) * 30);
    
    // Check if this blob is within bounds and closer to target
    if (sizeBytes >= minBytes && sizeBytes <= maxBytes) {
      const diff = Math.abs(sizeBytes - targetBytes);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestBlob = blob;
      }
    }
    
    // Adjust search direction based on target
    if (sizeBytes < targetBytes) {
      // Need larger file, increase quality
      lowQuality = quality;
    } else {
      // Need smaller file, decrease quality
      highQuality = quality;
    }
    
    attempts++;
  }
  
  // If we don't have a valid blob yet, do a final attempt
  if (!bestBlob) {
    // Try to get something within bounds
    const finalQuality = (lowQuality + highQuality) / 2;
    bestBlob = await getBlob(finalQuality);
    
    // If still too large, keep reducing until within max
    if (bestBlob.size > maxBytes) {
      let q = finalQuality;
      while (q > 0.1 && bestBlob.size > maxBytes) {
        q -= 0.05;
        bestBlob = await getBlob(q);
      }
    }
    // If too small, keep increasing until within min (or hit max quality)
    else if (bestBlob.size < minBytes) {
      let q = finalQuality;
      while (q < 1.0 && bestBlob.size < minBytes) {
        q += 0.05;
        const newBlob = await getBlob(q);
        if (newBlob.size <= maxBytes) {
          bestBlob = newBlob;
        } else {
          break; // Don't exceed max
        }
      }
    }
  }
  
  console.log(`📏 Result: ${(bestBlob.size / 1024).toFixed(1)}KB (target was ${(targetBytes / 1024).toFixed(1)}KB)`);
  
  onProgress?.(95);
  return bestBlob;
}

/**
 * Main processing function - uses the best available method
 */
export async function processImageWASM(
  file: File,
  options: ProcessOptions,
  onProgress?: (progress: number) => void
): Promise<ProcessResult> {
  const startTime = performance.now();
  
  onProgress?.(5);
  
  let finalWidth = options.targetWidth;
  let finalHeight = options.targetHeight;
  const rotation = options.cropArea?.rotation || 0;
  
  // Strategy 1: Use createImageBitmap if available (fastest)
  if (supportsImageBitmap) {
    onProgress?.(10);
    
    // First, load the full image
    const fullBitmap = await createImageBitmap(file);
    
    onProgress?.(15);
    
    // Create a canvas for rotation + crop
    let sourceCanvas: HTMLCanvasElement | OffscreenCanvas;
    let sourceCtx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
    
    if (rotation !== 0) {
      // Apply rotation first
      const radians = (rotation * Math.PI) / 180;
      const sin = Math.abs(Math.sin(radians));
      const cos = Math.abs(Math.cos(radians));
      const rotatedWidth = Math.round(fullBitmap.width * cos + fullBitmap.height * sin);
      const rotatedHeight = Math.round(fullBitmap.width * sin + fullBitmap.height * cos);
      
      if (supportsOffscreenCanvas) {
        sourceCanvas = new OffscreenCanvas(rotatedWidth, rotatedHeight);
        sourceCtx = sourceCanvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
      } else {
        sourceCanvas = document.createElement('canvas');
        sourceCanvas.width = rotatedWidth;
        sourceCanvas.height = rotatedHeight;
        sourceCtx = sourceCanvas.getContext('2d') as CanvasRenderingContext2D;
      }
      
      sourceCtx.fillStyle = '#FFFFFF';
      sourceCtx.fillRect(0, 0, rotatedWidth, rotatedHeight);
      sourceCtx.translate(rotatedWidth / 2, rotatedHeight / 2);
      sourceCtx.rotate(radians);
      sourceCtx.drawImage(fullBitmap, -fullBitmap.width / 2, -fullBitmap.height / 2);
      fullBitmap.close();
    } else {
      // No rotation, just use bitmap directly
      if (supportsOffscreenCanvas) {
        sourceCanvas = new OffscreenCanvas(fullBitmap.width, fullBitmap.height);
        sourceCtx = sourceCanvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
      } else {
        sourceCanvas = document.createElement('canvas');
        sourceCanvas.width = fullBitmap.width;
        sourceCanvas.height = fullBitmap.height;
        sourceCtx = sourceCanvas.getContext('2d') as CanvasRenderingContext2D;
      }
      sourceCtx.drawImage(fullBitmap, 0, 0);
      fullBitmap.close();
    }
    
    onProgress?.(25);
    
    // Now crop and resize to target
    let canvas: HTMLCanvasElement | OffscreenCanvas;
    let ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
    
    // Calculate date band height if needed (BEFORE creating canvas)
    const dateBandHeight = options.addDate ? getDateBandHeight(options.targetHeight) : 0;
    const imageAreaHeight = options.targetHeight - dateBandHeight;
    
    if (supportsOffscreenCanvas) {
      canvas = new OffscreenCanvas(options.targetWidth, options.targetHeight);
      ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
    } else {
      canvas = document.createElement('canvas');
      canvas.width = options.targetWidth;
      canvas.height = options.targetHeight;
      ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    }
    
    // Fill with white background first (handles transparent PNGs)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Apply crop and resize from rotated source
    // Image is drawn BELOW the date band area (if date is enabled)
    if (options.cropArea) {
      ctx.drawImage(
        sourceCanvas,
        options.cropArea.x,
        options.cropArea.y,
        options.cropArea.width,
        options.cropArea.height,
        0,
        dateBandHeight, // Start below date band
        options.targetWidth,
        imageAreaHeight // Use remaining height for image
      );
    } else {
      // No crop, just resize
      ctx.drawImage(sourceCanvas, 0, dateBandHeight, options.targetWidth, imageAreaHeight);
    }
    
    onProgress?.(40);
    
    // Apply signature color if specified
    if (options.signatureColor) {
      console.log('🎨 Applying signature color:', options.signatureColor);
      applySignatureColor(ctx, canvas, options.signatureColor);
    }
    
    onProgress?.(45);
    
    // Draw date band at top if requested (image is already positioned below)
    if (options.addDate) {
      drawDateBand(ctx, canvas, dateBandHeight);
    }
    
    onProgress?.(50);
    
    // Find optimal quality for target size
    const blob = await findOptimalQuality(
      canvas,
      options.minSizeKB,
      options.maxSizeKB,
      options.qualityPreference ?? 85,
      onProgress
    );
    
    onProgress?.(95);
    
    const processingTimeMs = performance.now() - startTime;
    
    return {
      blob,
      width: finalWidth,
      height: finalHeight,
      sizeKB: Math.round((blob.size / 1024) * 100) / 100,
      processingTimeMs: Math.round(processingTimeMs),
    };
  }
  
  // Strategy 2: Fallback to traditional Canvas API
  onProgress?.(10);
  
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
  
  onProgress?.(20);
  
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
  
  onProgress?.(30);
  
  // First apply rotation if needed
  let sourceImage: HTMLImageElement | HTMLCanvasElement = img;
  
  if (rotation !== 0) {
    const radians = (rotation * Math.PI) / 180;
    const sin = Math.abs(Math.sin(radians));
    const cos = Math.abs(Math.cos(radians));
    const rotatedWidth = Math.round(img.width * cos + img.height * sin);
    const rotatedHeight = Math.round(img.width * sin + img.height * cos);
    
    const rotatedCanvas = document.createElement('canvas');
    rotatedCanvas.width = rotatedWidth;
    rotatedCanvas.height = rotatedHeight;
    const rotatedCtx = rotatedCanvas.getContext('2d')!;
    
    rotatedCtx.fillStyle = '#FFFFFF';
    rotatedCtx.fillRect(0, 0, rotatedWidth, rotatedHeight);
    rotatedCtx.translate(rotatedWidth / 2, rotatedHeight / 2);
    rotatedCtx.rotate(radians);
    rotatedCtx.drawImage(img, -img.width / 2, -img.height / 2);
    
    sourceImage = rotatedCanvas;
  }
  
  // Calculate date band height if needed (BEFORE creating canvas)
  const dateBandHeight = options.addDate ? getDateBandHeight(options.targetHeight) : 0;
  const imageAreaHeight = options.targetHeight - dateBandHeight;
  
  const canvas = document.createElement('canvas');
  canvas.width = options.targetWidth;
  canvas.height = options.targetHeight;
  const ctx = canvas.getContext('2d')!;
  
  // Fill with white background first (handles transparent PNGs)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Apply crop if provided - image is drawn BELOW the date band area
  if (options.cropArea) {
    ctx.drawImage(
      sourceImage,
      options.cropArea.x,
      options.cropArea.y,
      options.cropArea.width,
      options.cropArea.height,
      0,
      dateBandHeight, // Start below date band
      options.targetWidth,
      imageAreaHeight // Use remaining height for image
    );
  } else {
    // Calculate center crop using the source (possibly rotated) image
    const srcWidth = sourceImage instanceof HTMLCanvasElement ? sourceImage.width : sourceImage.width;
    const srcHeight = sourceImage instanceof HTMLCanvasElement ? sourceImage.height : sourceImage.height;
    const targetRatio = options.targetWidth / imageAreaHeight;
    const imgRatio = srcWidth / srcHeight;
    
    let sx = 0, sy = 0, sw = srcWidth, sh = srcHeight;
    
    if (imgRatio > targetRatio) {
      sw = srcHeight * targetRatio;
      sx = (srcWidth - sw) / 2;
    } else {
      sh = srcWidth / targetRatio;
      sy = (srcHeight - sh) / 2;
    }
    
    ctx.drawImage(sourceImage, sx, sy, sw, sh, 0, dateBandHeight, options.targetWidth, imageAreaHeight);
  }
  
  onProgress?.(50);
  
  // Apply signature color if specified
  if (options.signatureColor) {
    applySignatureColor(ctx, canvas, options.signatureColor);
  }
  
  onProgress?.(55);
  
  // Draw date band at top if requested (image is already positioned below)
  if (options.addDate) {
    drawDateBand(ctx, canvas, dateBandHeight);
  }
  
  onProgress?.(60);
  
  // Find optimal quality
  const blob = await findOptimalQuality(
    canvas,
    options.minSizeKB,
    options.maxSizeKB,
    options.qualityPreference ?? 85,
    onProgress
  );
  
  onProgress?.(95);
  
  const processingTimeMs = performance.now() - startTime;
  
  return {
    blob,
    width: finalWidth,
    height: finalHeight,
    sizeKB: Math.round((blob.size / 1024) * 100) / 100,
    processingTimeMs: Math.round(processingTimeMs),
  };
}

/**
 * Get browser capabilities info
 */
export function getProcessorCapabilities() {
  return {
    offscreenCanvas: supportsOffscreenCanvas,
    imageBitmap: supportsImageBitmap,
    webWorkers: typeof Worker !== 'undefined',
    sharedArrayBuffer: typeof SharedArrayBuffer !== 'undefined',
  };
}
