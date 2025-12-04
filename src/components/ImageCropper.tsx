'use client';

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Crop, ZoomIn, ZoomOut, RotateCw, Check, X } from 'lucide-react';
import type { CropArea } from '@/types';

interface Point {
  x: number;
  y: number;
}

interface ImageCropperProps {
  imageUrl: string;
  aspectRatio: number;
  onCropComplete: (croppedArea: CropArea) => void;
  onCancel: () => void;
}

export function ImageCropper({
  imageUrl,
  aspectRatio,
  onCropComplete,
  onCancel,
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);

  const handleCropComplete = useCallback(
    (_: any, croppedAreaPixels: CropArea) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleConfirm = () => {
    if (croppedAreaPixels) {
      // Include rotation in the crop area
      onCropComplete({
        ...croppedAreaPixels,
        rotation,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      {/* Cropper Area */}
      <div className="flex-1 relative">
        {/* Light checkered background for better signature visibility */}
        <div 
          className="absolute inset-0" 
          style={{ 
            backgroundColor: '#f5f5f5',
            backgroundImage: 'linear-gradient(45deg, #e0e0e0 25%, transparent 25%), linear-gradient(-45deg, #e0e0e0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e0e0e0 75%), linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)', 
            backgroundSize: '20px 20px', 
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' 
          }} 
        />
        <Cropper
          image={imageUrl}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspectRatio}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={handleCropComplete}
          cropShape="rect"
          showGrid={true}
          classes={{
            containerClassName: 'bg-transparent',
            mediaClassName: 'bg-white',
            cropAreaClassName: 'border-2 border-blue-500',
          }}
        />
      </div>

      {/* Controls */}
      <div className="bg-slate-900/95 backdrop-blur-lg p-4 space-y-4 border-t border-slate-700/50">
        {/* Zoom Control */}
        <div className="flex items-center gap-4">
          <ZoomOut className="w-5 h-5 text-slate-400" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <ZoomIn className="w-5 h-5 text-slate-400" />
        </div>

        {/* Rotation */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setRotation((r) => (r - 90) % 360)}
            className="p-2.5 bg-slate-800 rounded-xl hover:bg-slate-700 transition-all duration-200 hover:scale-105 active:scale-95"
            title="Rotate Left"
          >
            <RotateCw className="w-5 h-5 text-white transform -scale-x-100" />
          </button>
          <span className="text-white text-sm min-w-[60px] text-center font-medium bg-slate-800 px-3 py-1.5 rounded-lg">
            {rotation}°
          </span>
          <button
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="p-2.5 bg-slate-800 rounded-xl hover:bg-slate-700 transition-all duration-200 hover:scale-105 active:scale-95"
            title="Rotate Right"
          >
            <RotateCw className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 flex items-center justify-center gap-2 p-3.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ring-1 ring-white/10"
          >
            <X className="w-5 h-5" />
            <span className="font-medium">Cancel</span>
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 flex items-center justify-center gap-2 p-3.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
          >
            <Check className="w-5 h-5" />
            <span className="font-medium">Crop & Process</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImageCropper;
