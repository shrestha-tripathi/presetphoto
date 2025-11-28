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
      onCropComplete(croppedAreaPixels);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      {/* Cropper Area */}
      <div className="flex-1 relative">
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
            containerClassName: 'bg-gray-900',
            cropAreaClassName: 'border-2 border-white',
          }}
        />
      </div>

      {/* Controls */}
      <div className="bg-gray-900 p-4 space-y-4">
        {/* Zoom Control */}
        <div className="flex items-center gap-4">
          <ZoomOut className="w-5 h-5 text-gray-400" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
          />
          <ZoomIn className="w-5 h-5 text-gray-400" />
        </div>

        {/* Rotation */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setRotation((r) => (r - 90) % 360)}
            className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            title="Rotate Left"
          >
            <RotateCw className="w-5 h-5 text-white transform -scale-x-100" />
          </button>
          <span className="text-white text-sm min-w-[60px] text-center">
            {rotation}°
          </span>
          <button
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            title="Rotate Right"
          >
            <RotateCw className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 flex items-center justify-center gap-2 p-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
            <span>Cancel</span>
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 flex items-center justify-center gap-2 p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
          >
            <Check className="w-5 h-5" />
            <span>Crop & Process</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImageCropper;
