import { CloudUpload, Trash2, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { SvgIcon } from './SvgIcon';
import { useDocument } from '../hooks/useDocument';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { UploadResponse } from '../types/documents';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  file: File;
}

export interface UploadAreaProps {
  onUploadSuccess?: (data: UploadResponse) => void;
}

export function UploadArea({ onUploadSuccess }: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFiles, isUploading, error } = useDocument();

  // Simulate file upload progress
  useEffect(() => {
    const intervals = files.map((file) => {
      if (file.progress >= 100) return null;
      
      return setInterval(() => {
        setFiles(currentFiles => 
          currentFiles.map(f => {
            if (f.id === file.id) {
              const nextProgress = Math.min(f.progress + Math.random() * 10 + 5, 100);
              return { ...f, progress: nextProgress };
            }
            return f;
          })
        );
      }, 100);
    });

    return () => {
      intervals.forEach(i => { if (i) clearInterval(i) });
    };
  }, [files]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  // Removed unused formatSize function

  const addFiles = (newFiles: FileList | File[]) => {
    const newUploads: UploadedFile[] = Array.from(newFiles).map(file => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
      size: file.size,
      progress: 0,
      file
    }));
    setFiles(prev => [...prev, ...newUploads]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };
  
  const handleUpload = async () => {
    if (files.length === 0) return;
    
    // Extract actual File objects
    const rawFiles = files.map(f => f.file);
    const result = await uploadFiles(rawFiles);
    
    if (result) {
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }
      // Vider les fichiers après succès
      setFiles([]);
    }
  };

  return (
    <div className="w-full space-y-4 max-w-full">
      {/* Upload Box */}
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={isUploading ? undefined : handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`w-full border-2 border-dashed rounded-xs flex flex-col items-center justify-center transition-all cursor-pointer bg-white overflow-hidden py-10
            ${isDragging ? 'border-zinc-500 bg-zinc-50' : 'border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50/50'}
            ${isUploading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
          `}
        >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileInput} 
          className="hidden" 
          multiple 
          accept=".pdf,.ppt,.xls,.xlsx,.jpg,.jpeg,.png,.csv" 
        />
        
        <div className="w-10 h-10 mb-3 rounded-full bg-white border border-zinc-200 flex items-center justify-center ">
           <CloudUpload strokeWidth={1.5} className="w-5 h-5 text-zinc-700" />
        </div>
        <h3 className="text-sm font-medium text-zinc-900 mb-1">
          <span className="font-semibold underline underline-offset-2">Cliquez pour téléverser</span> ou glissez-déposez
        </h3>
        <p className="text-xs text-zinc-500 font-medium">
          PDF, PPT, XLS ou JPG (max. 25MB)
        </p>
      </div>

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="space-y-4 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {files.map(file => (
              <div 
                key={file.id} 
                className="bg-white cursor-default border border-zinc-200 pt-2 rounded-xs px-2 py-1 flex items-start gap-3 relative hover:border-zinc-300 transition-colors "
              >
                {/* File Icon */}
                <div className="w-8 h-8 rounded-xs bg-zinc-100 flex items-center justify-center shrink-0 border border-zinc-200/50">
                  <SvgIcon 
                    name={file.name.split('.').pop() || 'default'} 
                    width="25" 
                    height="25" 
                    color="#71717a" 
                    className="w-5.5 h-5.5 text-zinc-500" 
                  />
                </div>
                
                {/* File Details */}
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[12px] font-medium text-zinc-900 truncate">
                      {file.name}
                    </span>
                  </div>
                  
                  {/* <span className="text-xs font-medium text-zinc-500 block mb-1.5">
                    {formatSize(file.size)}
                  </span> */}
                  
                  {/* Progress Bar Area */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 w-[90%] bg-zinc-100 border border-zinc-200/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full text-[10px] bg-zinc-900 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${Math.round(file.progress)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-zinc-600 min-w-[25px] text-right">
                      {Math.round(file.progress)}%
                    </span>
                  </div>
                </div>

                {/* Trash Button Absolute */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                  className="absolute cursor-pointer top-2.5 right-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-md transition-colors"
                >
                  <Trash2 strokeWidth={1.5} className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col gap-2 pt-4 border-t border-zinc-200/60 mt-4">
            {error && (
               <div className="text-red-500 text-sm mb-2 font-medium bg-red-50 px-3 py-2 rounded-md border border-red-100">
                 {error}
               </div>
            )}
            <div className="flex items-center justify-end gap-3 w-full">
              <Button 
                  variant="outline"
                  className="!w-auto px-6 py-2 shadow-none bg-white"
                  onClick={() => setFiles([])}
                  disabled={isUploading}
              >
                Nettoyer
              </Button>
              <Button 
                  variant="solid" 
                  className="!w-auto px-6 py-2 shadow-none flex items-center gap-2"
                  onClick={handleUpload}
                  disabled={isUploading || files.length === 0}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  'Envoyer'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
