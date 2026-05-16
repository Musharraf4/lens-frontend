import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import api from './api.service';
import { useAuth } from '@/store/AuthContext';

// --- API Functions ---
/**
 * Fetches a call recording audio file by its tracking ID
 * @param callTrackingId The ID of the call tracking record
 * @returns A Blob containing the audio data in WAV format
 */
export const getCallRecording = async (callTrackingId: string): Promise<Blob> => {
  try {
    const response = await api.get(`/v1/call-tracking/${callTrackingId}/recording`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Call recording fetch failed:', error);
    throw error;
  }
};

/**
 * Creates an object URL for a blob to use in audio elements
 * @param blob The audio blob
 * @returns A URL that can be used in audio elements
 */
export const createAudioUrl = (blob: Blob): string => {
  return URL.createObjectURL(blob);
};

/**
 * Revokes an object URL when it's no longer needed
 * @param url The URL to revoke
 */
export const revokeAudioUrl = (url: string): void => {
  URL.revokeObjectURL(url);
};

// --- TanStack Query Hooks ---
/**
 * React Query hook to fetch a call recording
 * @param callTrackingId The ID of the call tracking record
 * @param options Additional query options
 * @returns Query result containing the audio blob
 */
export const useCallRecording = (
  callTrackingId: string,
  options?: Omit<UseQueryOptions<Blob, Error>, 'queryKey' | 'queryFn'>
) => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['callRecording', callTrackingId],
    queryFn: () => getCallRecording(callTrackingId),
    enabled: !!callTrackingId && isAuthenticated,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour since audio files don't change
    ...options,
  });
};
