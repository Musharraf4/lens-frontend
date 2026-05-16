import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { CiPlay1, CiPause1 } from "react-icons/ci";
import { useCallRecording, createAudioUrl, revokeAudioUrl } from '@/services/callRecoding.api';

interface WaveSurferPlayerProps {
  audioUrl: string;
  callTrackingId: string;
}

const WaveSurferPlayer: React.FC<WaveSurferPlayerProps> = ({ audioUrl, callTrackingId }) => {
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const { data: audioBlob, isLoading, isError } = useCallRecording(callTrackingId);

  useEffect(() => {
    if (!waveformRef.current || !audioBlob) return;
    
    const audioUrl = createAudioUrl(audioBlob);
    const audioElement = document.createElement('audio');
    audioElement.src = audioUrl;
    
    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      backend: 'MediaElement',
      media: audioElement,
      waveColor: '#B5BAC4',
      progressColor: '#000000',
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 40,
    });
    
    // Save the wavesurfer instance to the ref
    wavesurferRef.current = wavesurfer;

    // ✅ diagnostics
    wavesurfer.on('error', (e) =>
      console.error('[WaveSurfer] error while loading/decoding', e),
    );

    wavesurfer.on('ready', () => setIsReady(true));
    wavesurfer.on('finish', () => setIsPlaying(false));
    wavesurfer.on('play', () => setIsPlaying(true));
    wavesurfer.on('pause', () => setIsPlaying(false));

    const handleResize = () => {
      if (wavesurfer && waveformRef.current) {
        // @ts-ignore: containerWidth is not in types, but is used internally
        wavesurfer.drawer.containerWidth = waveformRef.current.clientWidth;
        // @ts-ignore: drawBuffer is not in types, but is available
        wavesurfer.drawBuffer();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      wavesurfer?.destroy();
      revokeAudioUrl(audioUrl);
    };
  }, [audioBlob]);

  const handlePlayPause = () => {
    if (wavesurferRef.current && isReady) {
      wavesurferRef.current.playPause();
    }
  };

  return (
    <div className="flex items-center gap-2 w-full">
      <button
        onClick={handlePlayPause}
        className="w-8 h-8 rounded-full bg-black flex items-center justify-center"
        type="button"
        disabled={!isReady}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <CiPause1 className="w-5 h-5 text-white" />
        ) : (
          <CiPlay1 className="w-5 h-5 text-white" />
        )}
      </button>
      <div
        ref={waveformRef}
        className="flex-1 h-10 min-w-[150px]"
      />
    </div>
  );
};

export default WaveSurferPlayer; 