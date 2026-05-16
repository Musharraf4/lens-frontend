import { useState, useCallback, useRef, useEffect } from 'react';
import { tts, TTSOptions } from '@/utils/textToSpeech';

export interface UseTextToSpeechReturn {
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
  speak: (text: string, options?: TTSOptions) => Promise<void>;
  speakWithUKFemale: (text: string, options?: Omit<TTSOptions, 'voice'>) => Promise<void>;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  error: string | null;
}

export const useTextToSpeech = (): UseTextToSpeechReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const isSpeakingRef = useRef(false);

  useEffect(() => {
    // Check if speech synthesis is supported
    setIsSupported('speechSynthesis' in window);
  }, []);

  const speak = useCallback(async (text: string, options?: TTSOptions) => {
    if (!isSupported) {
      setError('Speech synthesis not supported in this browser');
      return;
    }

    try {
      setError(null);
      setIsSpeaking(true);
      setIsPaused(false);
      isSpeakingRef.current = true;

      await tts.speak(text, options);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to speak text');
    } finally {
      setIsSpeaking(false);
      setIsPaused(false);
      isSpeakingRef.current = false;
    }
  }, [isSupported]);

  const speakWithUKFemale = useCallback(async (text: string, options?: Omit<TTSOptions, 'voice'>) => {
    if (!isSupported) {
      setError('Speech synthesis not supported in this browser');
      return;
    }

    try {
      setError(null);
      setIsSpeaking(true);
      setIsPaused(false);
      isSpeakingRef.current = true;

      // Force UK female voice
      const ukFemaleVoice = tts.getUKFemaleVoice();
      const ttsOptions: TTSOptions = {
        ...options,
        voice: ukFemaleVoice || undefined,
        lang: 'en-GB'
      };

      await tts.speak(text, ttsOptions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to speak text');
    } finally {
      setIsSpeaking(false);
      setIsPaused(false);
      isSpeakingRef.current = false;
    }
  }, [isSupported]);

  const stop = useCallback(() => {
    tts.stop();
    setIsSpeaking(false);
    setIsPaused(false);
    isSpeakingRef.current = false;
  }, []);

  const pause = useCallback(() => {
    if (isSpeakingRef.current) {
      tts.pause();
      setIsPaused(true);
    }
  }, []);

  const resume = useCallback(() => {
    if (isSpeakingRef.current) {
      tts.resume();
      setIsPaused(false);
    }
  }, []);

  return {
    isSpeaking,
    isPaused,
    isSupported,
    speak,
    speakWithUKFemale,
    stop,
    pause,
    resume,
    error,
  };
};
