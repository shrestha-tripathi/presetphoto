'use client';

import React, { useCallback } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

interface FileUploadProps {
  onFileSelect: (file: File, imageUrl: string) => void;
  accept?: string;
  maxSizeMB?: number;
}

export function FileUpload({ 
  onFileSelect, 
  accept = 'image/jpeg,image/png,image/webp',
  maxSizeMB = 10 
}: FileUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const validateAndProcessFile = useCallback((file: File) => {
    setError(null);
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG, PNG, or WebP)');
      return;
    }
    
    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }
    
    // Create object URL for preview
    const imageUrl = URL.createObjectURL(file);
    onFileSelect(file, imageUrl);
  }, [maxSizeMB, onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) validateAndProcessFile(file);
  }, [validateAndProcessFile]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndProcessFile(file);
  }, [validateAndProcessFile]);

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-2xl p-10 md:p-14
          transition-all duration-300 cursor-pointer group
          ${isDragging 
            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 scale-[1.02]' 
            : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
        />
        
        <div className="flex flex-col items-center justify-center text-center">
          <div className={`
            w-20 h-20 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300
            ${isDragging 
              ? 'bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/30' 
              : 'bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800 group-hover:from-blue-500 group-hover:to-indigo-500 group-hover:shadow-lg group-hover:shadow-blue-500/30'
            }
          `}>
            <Upload className={`w-9 h-9 transition-colors duration-300 ${isDragging ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-white'}`} />
          </div>
          
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
            {isDragging ? 'Drop your image here' : 'Upload your image'}
          </h3>
          
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
            Drag and drop or <span className="text-blue-600 dark:text-blue-400 font-medium">browse files</span>
          </p>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <ImageIcon className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">JPEG, PNG, WebP • Max {maxSizeMB}MB</span>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-red-600 dark:text-red-400 text-lg">!</span>
          </div>
          <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}

export default FileUpload;
