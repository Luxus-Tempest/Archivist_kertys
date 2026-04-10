import { useCallback, useRef, useState } from 'react';

interface UploadAreaNewProps {
  onFilesSelected?: (files: File[]) => void;
  isUploading?: boolean;
  disabled?: boolean;
}

export function UploadAreaNew({ onFilesSelected, isUploading, disabled }: UploadAreaNewProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (onFilesSelected) onFilesSelected(Array.from(e.dataTransfer.files));
    }
  }, [onFilesSelected]);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (onFilesSelected) onFilesSelected(Array.from(e.target.files));
    }
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !isUploading && fileInputRef.current?.click()}
      className={`group relative bg-surface-container-lowest rounded-[2rem] border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-4 lg:p-4 overflow-hidden min-h-[300px] cursor-pointer
        ${isDragging ? 'border-primary bg-primary/5' : 'border-outline-variant/30 hover:border-primary/50'}
        ${isUploading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
      `}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileInput} 
        className="hidden"
        disabled={disabled} 
        multiple 
      />
      
      {/* Background blur effects */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary-container/30 blur-[80px] rounded-full group-hover:scale-125 transition-transform duration-700"></div>
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-secondary-container/20 blur-[80px] rounded-full group-hover:scale-125 transition-transform duration-700"></div>
      
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="w-16 h-16 mb-4 rounded-3xl bg-primary-container/50 flex items-center justify-center text-primary-dim group-hover:scale-110 transition-transform duration-300">
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>upload_file</span>
        </div>
        <h3 className="text-xl font-bold mb-2 font-headline text-on-surface">
          {isUploading ? 'Uploading documents...' : 'Click to upload or drag & drop'}
        </h3>
        <p className="text-on-surface-variant text-sm font-body mb-6">PDF, DOCX, XLSX, high-res images etc... up to 25MB</p>
        <button className="px-6 py-3 bg-primary text-on-primary rounded-full font-semibold text-sm flex items-center gap-2 hover:bg-primary-dim active:scale-95 transition-all shadow-lg shadow-primary/10">
          {isUploading ? 'Processing...' : 'Browse Local Files'}
          <span className="material-symbols-outlined text-xs">east</span>
        </button>
      </div>
    </div>
  );
}

