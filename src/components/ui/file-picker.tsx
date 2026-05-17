'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, ImageIcon } from 'lucide-react';

interface FilePickerProps {
  label: string;
  accept?: string;
  onChange: (file: File | null) => void;
  preview?: boolean;
}

export function FilePicker({ label, accept = 'image/*', onChange, preview = true }: FilePickerProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFileName(file.name);
      if (preview) {
        setPreviewUrl(URL.createObjectURL(file));
      }
      onChange(file);
    }
  };

  const handleClear = () => {
    setFileName(null);
    setPreviewUrl(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-2 text-right">
      <label className="text-xs text-gray-400 font-medium">{label}</label>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      {previewUrl ? (
        <div className="relative group">
          <div className="relative w-full h-32 rounded-xl overflow-hidden border border-glass-border bg-black/30">
            <Image src={previewUrl} alt="معاينة" fill className="object-contain p-2" />
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 left-2 p-1.5 rounded-full bg-red-500/80 text-white hover:bg-red-500 transition-all opacity-0 group-hover:opacity-100 shadow-lg"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <p className="text-[10px] text-gray-500 mt-1 truncate">{fileName}</p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center justify-center gap-3 w-full py-4 px-4 rounded-xl border-2 border-dashed border-glass-border bg-white/[0.02] hover:border-primary/40 hover:bg-primary/5 transition-all group cursor-pointer"
        >
          <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
            <Upload className="w-5 h-5" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-bold text-white/70 group-hover:text-white transition-colors">اختر صورة</span>
            <span className="text-[10px] text-gray-500">PNG, JPG, WEBP</span>
          </div>
        </button>
      )}
    </div>
  );
}
