import React from 'react';
import { Button } from './button';
import { Play, Square, Pause } from 'lucide-react';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

interface PreviewMessageButtonProps {
  message: string;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'ghost' | 'outline';
}

export const PreviewMessageButton: React.FC<PreviewMessageButtonProps> = ({
  message,
  disabled = false,
  className = '',
  size = 'sm',
  variant = 'ghost'
}) => {
  const { isSpeaking, isPaused, isSupported, speakWithUKFemale, stop, pause, resume, error } = useTextToSpeech();

  const handleClick = async () => {
    if (!message.trim()) return;

    if (isSpeaking) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
    } else {
      try {
        await speakWithUKFemale(message, {
          rate: 0.9, // Slower, more sultry pace
          pitch: 1.1, // Slightly higher pitch for more attractive tone
          volume: 1 // Higher volume for better presence
        });
      } catch (err) {
        console.error('Text-to-speech error:', err);
      }
    }
  };

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    stop();
  };

  if (!isSupported) {
    return (
      <Button
        type="button"
        variant={variant}
        size={size}
        disabled={true}
        className={`flex items-center gap-1 ${className}`}
        title="Text-to-speech not supported in this browser"
      >
        <div className="bg-gray-400 rounded-full p-2">
          <Play className="h-4 w-4 text-white" />
        </div>
        Preview message
      </Button>
    );
  }

  const getIcon = () => {
    if (isSpeaking && !isPaused) {
      return <Pause className="h-4 w-4 text-white" />;
    }
    return <Play className="h-4 w-4 text-white" />;
  };

  const getButtonText = () => {
    if (isSpeaking && !isPaused) return 'Pause';
    if (isPaused) return 'Resume';
    return 'Preview message';
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={handleClick}
        disabled={disabled || !message.trim()}
        className={`flex items-center gap-1 ${className}`}
        title={error || undefined}
      >
        <div className={`rounded-full p-2 ${isSpeaking ? 'bg-orange-500' : 'bg-black'}`}>
          {getIcon()}
        </div>
        {getButtonText()}
      </Button>

      {isSpeaking && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleStop}
          className="ml-1"
          title="Stop playback"
        >
          <Square className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};
