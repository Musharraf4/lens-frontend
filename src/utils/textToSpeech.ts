/**
 * Text-to-Speech utility using Web Speech API
 */

export interface TTSOptions {
  voice?: SpeechSynthesisVoice;
  rate?: number; // 0.1 to 10
  pitch?: number; // 0 to 2
  volume?: number; // 0 to 1
  lang?: string;
}

export class TextToSpeech {
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private isSupported: boolean;

  constructor() {
    this.synth = window.speechSynthesis;
    this.isSupported = 'speechSynthesis' in window;
    
    if (this.isSupported) {
      this.loadVoices();
    }
  }

  private loadVoices() {
    this.voices = this.synth.getVoices();
    
    // Some browsers load voices asynchronously
    if (this.voices.length === 0) {
      this.synth.onvoiceschanged = () => {
        this.voices = this.synth.getVoices();
      };
    }
  }

  /**
   * Get available voices
   */
  getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  /**
   * Get voices by language
   */
  getVoicesByLang(lang: string): SpeechSynthesisVoice[] {
    return this.voices.filter(voice => voice.lang.startsWith(lang));
  }

  /**
   * Get UK female voices specifically
   */
  getUKFemaleVoices(): SpeechSynthesisVoice[] {
    return this.voices.filter(voice => 
      voice.lang.startsWith('en-GB') && 
      voice.name.toLowerCase().includes('female')
    );
  }

  /**
   * Get attractive female voices (any language)
   */
getAttractiveFemaleVoices(): SpeechSynthesisVoice[] {
  const knownFemaleVoiceNames = [
    'Samantha',
    'Victoria',
    'Karen',
    'Moira',
    'Fiona',
    'Google UK English Female',
    'Microsoft Zira',
    'Microsoft Hazel',
    'Google US English',
    'Siri Female'
  ];
  return this.voices.filter(voice => {
    return voice.lang.startsWith('en') &&
      knownFemaleVoiceNames.some(name => voice.name.includes(name));
  });
}


  /**
   * Get the best attractive female voice available
   */
  getUKFemaleVoice(): SpeechSynthesisVoice | null {
    // First try to find attractive-sounding female voices
    const attractiveFemaleVoices = this.getAttractiveFemaleVoices();
    if (attractiveFemaleVoices.length > 0) {
      // Prefer voices that are marked as default
      const defaultAttractive = attractiveFemaleVoices.find(voice => voice.default);
      if (defaultAttractive) return defaultAttractive;
      
      // Return the first available attractive female voice
      return attractiveFemaleVoices[0];
    }
    
    // Fallback to UK female voices
    const ukFemaleVoices = this.getUKFemaleVoices();
    if (ukFemaleVoices.length > 0) {
      // Prefer voices that are marked as default
      const defaultUKFemale = ukFemaleVoices.find(voice => voice.default);
      if (defaultUKFemale) return defaultUKFemale;
      
      // Return the first available UK female voice
      return ukFemaleVoices[0];
    }
    
    // Fallback to any English female voice
    const anyEnglishFemale = this.voices.find(voice => 
      voice.lang.startsWith('en') && 
      (voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('woman'))
    );
    
    if (anyEnglishFemale) return anyEnglishFemale;
    
    return null;
  }

  /**
   * Get default voice (preferably UK female)
   */
  getDefaultVoice(): SpeechSynthesisVoice | null {
    // Try to get UK female voice first
    const ukFemaleVoice = this.getUKFemaleVoice();
    if (ukFemaleVoice) return ukFemaleVoice;
    
    // Try to find any UK voice (male or female)
    const ukVoice = this.voices.find(voice => 
      voice.lang.startsWith('en-GB')
    );
    
    if (ukVoice) return ukVoice;
    
    // Try to find any English female voice
    const englishFemaleVoice = this.voices.find(voice => 
      voice.lang.startsWith('en') && 
      voice.name.toLowerCase().includes('female')
    );
    
    if (englishFemaleVoice) return englishFemaleVoice;
    
    // Try to find any English voice
    const englishVoice = this.voices.find(voice => 
      voice.lang.startsWith('en')
    );
    
    if (englishVoice) return englishVoice;
    
    // Fallback to any default voice
    const defaultVoice = this.voices.find(voice => voice.default);
    if (defaultVoice) return defaultVoice;
    
    // Fallback to first available voice
    return this.voices[0] || null;
  }

  /**
   * Speak text
   */
  speak(text: string, options: TTSOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      if (!text.trim()) {
        reject(new Error('No text to speak'));
        return;
      }

      // Cancel any ongoing speech
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice
      utterance.voice = options.voice || this.getDefaultVoice();
      
      // Set speech parameters
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;
      utterance.lang = options.lang || 'en-GB';

      // Event handlers
      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));
      utterance.onstart = () => console.log('Speech started');

      // Speak
      this.synth.speak(utterance);
    });
  }

  /**
   * Stop current speech
   */
  stop(): void {
    this.synth.cancel();
  }

  /**
   * Pause current speech
   */
  pause(): void {
    this.synth.pause();
  }

  /**
   * Resume paused speech
   */
  resume(): void {
    this.synth.resume();
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.synth.speaking;
  }

  /**
   * Check if currently paused
   */
  isPaused(): boolean {
    return this.synth.paused;
  }
}

// Create singleton instance
export const tts = new TextToSpeech();

// Convenience function for quick text-to-speech
export const speakText = (text: string, options?: TTSOptions): Promise<void> => {
  return tts.speak(text, options);
};
