import { useState, useCallback } from 'react';

interface UseFileUploadOptions {
  accept?: string;
  maxSize?: number;
  onUpload?: (file: File) => Promise<void>;
  onError?: (error: Error) => void;
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    accept = '.pdf,.doc,.docx',
    maxSize = 10 * 1024 * 1024, // 10MB
    onUpload,
    onError
  } = options;

  const validateFile = (file: File): boolean => {
    if (file.size > maxSize) {
      onError?.(new Error(`File size must be less than ${maxSize / 1024 / 1024}MB`));
      return false;
    }

    const allowedTypes = accept.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      onError?.(new Error(`File type ${fileExtension} is not supported`));
      return false;
    }

    return true;
  };

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!validateFile(file)) return;

    if (onUpload) {
      setIsUploading(true);
      setUploadProgress(0);
      
      try {
        await onUpload(file);
        setUploadProgress(100);
      } catch (error) {
        onError?.(error as Error);
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    }
  }, [onUpload, onError, maxSize, accept]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  }, [handleFiles]);

  return {
    isDragging,
    isUploading,
    uploadProgress,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleInputChange,
  };
}
