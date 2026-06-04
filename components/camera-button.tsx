'use client';

import { useState, useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { extractTextFromImage } from '@/lib/api';

interface CameraButtonProps {
  onExtractionCompleted: (text: string) => void;
  disabled?: boolean;
}

export default function CameraButton({ onExtractionCompleted, disabled }: CameraButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    if (!isProcessing) {
      fileInputRef.current?.click();
    }
  }

  function compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Max dimensions
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return reject(new Error('Canvas not supported'));
          }
          ctx.drawImage(img, 0, 0, width, height);

          // Get base64 string
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so the same file can be selected again if needed
    e.target.value = '';

    setIsProcessing(true);
    try {
      toast.info("Analyzing image...");
      
      // 1. Compress image client-side to save bandwidth and token cost
      const base64Image = await compressImage(file);
      
      // 2. Send to backend OCR
      const { text } = await extractTextFromImage(base64Image);
      
      if (text) {
        onExtractionCompleted(text);
        toast.success("Text extracted!");
      } else {
        toast.error("Could not find any text in the image.");
      }
    } catch (err) {
      console.error("OCR error:", err);
      toast.error("Failed to analyze image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={handleClick}
        disabled={disabled || isProcessing}
        title="Take a photo of your notes"
        type="button"
        className={`
          flex items-center justify-center h-10 w-10 shrink-0 rounded-full transition-all
          ${!isProcessing ? 'bg-primary/10 text-primary hover:bg-primary/20' : ''}
          ${isProcessing ? 'bg-muted text-muted-foreground' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {!isProcessing && <Camera className="h-5 w-5" />}
        {isProcessing && <Loader2 className="h-5 w-5 animate-spin" />}
      </button>
    </>
  );
}
