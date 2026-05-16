import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Pencil, Upload } from 'lucide-react';

interface ImageUploaderProps {
  currentImage: string | null;
  onImageUpload: (imageDataUrl: string) => void;
  onImageDelete: () => void;
  className?: string;
  isPreviewStep?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  currentImage,
  onImageUpload,
  onImageDelete,
  className = '',
  isPreviewStep
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      setIsUploading(false);
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      setIsUploading(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onImageUpload(result);
      }
      setIsUploading(false);
    };

    reader.onerror = () => {
      alert('Error reading file');
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {currentImage ? (
        <>
          <div className="flex justify-center">
            <div className={`w-16 h-16 ${!isPreviewStep ? 'rounded-full' : ''}  overflow-hidden`}>
              <img src={currentImage} alt="Uploaded image" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="flex justify-center space-x-2">
            <Button variant="outline" size="sm" onClick={triggerFileInput} disabled={isUploading}>
              <Pencil className="w-4 h-4 mr-1" /> Edit
            </Button>
            <Button variant="outline" size="sm" className="text-red-500" onClick={onImageDelete} disabled={isUploading}>
              <Trash2 className="w-4 h-4 mr-1" /> Delete
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path>
              </svg>
            </div>
          </div>
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              className="flex border-neutral-200 rounded-full items-center"
              onClick={triggerFileInput}
              disabled={isUploading}
            >
              <Upload className="w-4 h-4 mr-1" /> Add Photo
            </Button>
          </div>
        </>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
};

export default ImageUploader;
