import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Pencil, Upload } from 'lucide-react';
import { uploadAttachment } from '@/services/chatbot.api';
import { showToast } from '@/components/Toast';

interface VideoUploaderProps {
  currentVideo: string | null;
  fileName: string;
  onVideoUpload: (videoDataUrl: string, fileName: string) => void;
  onVideoDelete: () => void;
  onVideoPreview?: (videoUrl: string, file?: File) => void;
  className?: string;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({
  currentVideo,
  fileName,
  onVideoUpload,
  onVideoDelete,
  onVideoPreview,
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    // Check file type
    if (!file.type.startsWith('video/')) {
      showToast({
        type: 'error',
        title: 'Invalid file type',
        description: 'Please upload a video file',
      });
      setIsUploading(false);
      return;
    }

    // Check file size (limit to 100MB)
    if (file.size > 100 * 1024 * 1024) {
      showToast({
        type: 'error',
        title: 'File too large',
        description: 'Video size should be less than 100MB',
      });
      setIsUploading(false);
      return;
    }
    const blob = new Blob([file], { type: file.type });

    // If you need to preview the video or upload it
    const blobUrl = URL.createObjectURL(blob);
    try {
      const uploadResponse = await uploadAttachment(file, 'video');
      onVideoUpload(uploadResponse?.url, file.name);
    } catch (_) {
      showToast({
        type: "error",
        title: "Upload failed",
        description:
          "Failed to upload video. Request Entity Too Large, Please try again.",
      });
    }
    // Show preview modal if callback provided
    if (onVideoPreview) {
      onVideoPreview(blobUrl, file);
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {

      }
      setIsUploading(false);
    };

    reader.onerror = () => {
      showToast({
        type: 'error',
        title: 'Error reading file',
        description: 'Failed to read the video file. Please try again.',
      });
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {currentVideo ? (
        <>
          <div className="flex justify-center items-center p-4 border rounded-lg border-neutral-50 ">
            <div
              className="flex items-center cursor-pointer hover:opacity-70 transition-opacity"
              onClick={() => {
                if (currentVideo && onVideoPreview) {
                  onVideoPreview(currentVideo);
                }
              }}
            >
              <svg className="w-6 h-6 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h18M3 16h18" />
              </svg>
              <span className="text-sm text-black">{fileName || 'welcomemessage.mp4'}</span>
            </div>
          </div>
          <div className="flex justify-center space-x-2">
            <Button variant="outline" size="sm" onClick={triggerFileInput} disabled={isUploading}>
              <Pencil className="w-4 h-4 mr-1" /> Edit
            </Button>
            <Button variant="outline" size="sm" className="text-red-500" onClick={onVideoDelete} disabled={isUploading}>
              <Trash2 className="w-4 h-4 mr-1" /> Delete
            </Button>
          </div>
        </>
      ) : (
        <>
          {isUploading ? (
            <div className="w-full p-4 border rounded-lg border-neutral-50 flex justify-center items-center">
              <span className="text-sm text-black">Uploading...</span>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full h-14 border border-gray-200 rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-gray-50"
              onClick={triggerFileInput}
              disabled={isUploading}
            >
              <Upload className="w-5 h-5" />
              <span>Upload</span>
            </Button>
          )}
        </>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="video/*"
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
};

export default VideoUploader;
