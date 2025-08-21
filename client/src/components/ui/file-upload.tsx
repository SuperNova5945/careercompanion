import { useRef } from "react";
import { cn } from "@/lib/utils";
import { useFileUpload } from "@/hooks/useFileUpload";
import { Button } from "./button";
import { Progress } from "./progress";

interface FileUploadProps {
  onFileUpload: (file: File) => Promise<void>;
  accept?: string;
  maxSize?: number;
  className?: string;
  children?: React.ReactNode;
}

export function FileUpload({ 
  onFileUpload, 
  accept = ".pdf,.doc,.docx",
  maxSize = 10 * 1024 * 1024,
  className,
  children 
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isDragging,
    isUploading,
    uploadProgress,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleInputChange,
  } = useFileUpload({
    accept,
    maxSize,
    onUpload: onFileUpload,
    onError: (error) => {
      console.error("Upload error:", error);
    }
  });

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("relative", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        data-testid="file-input-hidden"
      />
      
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
          isDragging ? "border-primary-400 bg-primary-50" : "border-gray-300 hover:border-primary-400",
          isUploading && "pointer-events-none opacity-50"
        )}
        data-testid="file-upload-area"
      >
        {children || (
          <>
            <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-600 mb-2">Drag and drop your file here, or</p>
            <Button 
              type="button" 
              variant="link" 
              onClick={handleBrowseClick}
              className="text-primary-600 hover:text-primary-700 font-medium p-0"
              data-testid="button-browse-files"
            >
              browse files
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              Supports {accept.replace(/\./g, '').toUpperCase()}
            </p>
          </>
        )}
        
        {isUploading && (
          <div className="mt-4">
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-sm text-gray-600 mt-2">Uploading... {uploadProgress}%</p>
          </div>
        )}
      </div>
    </div>
  );
}
