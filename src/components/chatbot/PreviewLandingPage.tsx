import React, { ReactNode, useEffect, useState } from 'react';
import DeviceSelector from './DeviceSelector';
import { useChatbotBuilder } from '@/store/ChatbotBuilderContext';

interface PreviewLandingPageProps {
  children?: ReactNode;
  position?: string; // Add position prop
  hideDeviceSelector?: boolean; // Add prop to hide device selector
  height?: boolean;
}

const PreviewLandingPage: React.FC<PreviewLandingPageProps> = ({ children, position, hideDeviceSelector = false, height = false }) => {
  const { state, setSelectedDevice } = useChatbotBuilder();
  const [hasBotScript, setHasBotScript] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to extract bot ID from HTML
  const extractBotId = (html: string): string | null => {
    // Look for script tags with /bots/ pattern
    const scriptPattern = /<script[^>]*src="[^"]*\/bots\/([a-f0-9-]+)\.js"[^>]*><\/script>/gi;
    const match = html.match(scriptPattern);

    if (match) {
      // Extract bot_id from the first match
      const botIdMatch = match[0].match(/\/bots\/([a-f0-9-]+)\.js/);
      if (botIdMatch && botIdMatch[1]) {
        return botIdMatch[1];
      }
    }

    // Fallback: try to find any script with bot pattern in src attribute
    const scripts = html.match(/<script[^>]*src="[^"]*\/bots\/[^"]*"[^>]*>/gi);
    if (scripts) {
      for (const script of scripts) {
        const botIdMatch = script.match(/\/bots\/([a-f0-9-]+)\.js/);
        if (botIdMatch && botIdMatch[1]) {
          return botIdMatch[1];
        }
      }
    }

    return null;
  };

  useEffect(() => {
    const checkBotScript = async () => {
      if (!state.publishInfo.mainDomain) {
        setError("No domain configured");
        setLoading(false);
        setHasBotScript(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`https://${state.publishInfo.mainDomain}`);

        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.statusText}`);
        }

        const html = await res.text();
        const botId = extractBotId(html);

        // Set state to true if bot script found, false otherwise
        setHasBotScript(botId !== null);

        if (botId) {
          console.log("Bot ID found:", botId);
        } else {
          console.log("No bot script found");
        }
      } catch (err) {
        console.error("Error fetching HTML:", err);
        setError(err instanceof Error ? err.message : "Failed to load preview");
        setHasBotScript(false);
      } finally {
        setLoading(false);
      }
    };

    checkBotScript();
  }, [state.publishInfo.mainDomain]);
  const { selectedDevice } = state;
  const getPositionClasses = (position: string) => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'center-left':
        return 'top-1/2 left-4 -translate-y-1/2';
      case 'center-right':
        return 'top-1/2 right-4 -translate-y-1/2';
      default:
        return 'bottom-4 right-4';
    }
  };

  const getDeviceClasses = (device: 'web' | 'tablet' | 'mobile') => {
    switch (device) {
      case 'web':
        return 'w-full h-full';
      case 'tablet':
        return 'w-[768px] h-full mx-auto shadow-lg';
      case 'mobile':
        return 'w-[375px] h-full mx-auto shadow-lg';
      default:
        return 'w-full h-full';
    }
  };

  const getIframeStyle = (device: 'web' | 'tablet' | 'mobile') => {
    switch (device) {
      case 'web':
        return { display: 'block', width: '100%', height: '100%' };
      case 'tablet':
        return { display: 'block', width: '768px', height: '100%', maxWidth: '100%' };
      case 'mobile':
        return { display: 'block', width: '375px', height: '100%', maxWidth: '100%' };
      default:
        return { display: 'block', width: '100%', height: '100%' };
    }
  };
  return (
    <div className={`w-full flex flex-col relative min-h-0 ${height ? 'h-[80vh]' : 'h-full'}`}>
      {/* Device Selector - Top inline - Only show if not hidden */}
      {!hideDeviceSelector && (
        <div className="w-full flex items-center justify-center flex-shrink-0">
          <DeviceSelector
            selectedDevice={selectedDevice}
            onDeviceChange={setSelectedDevice}
          />
        </div>
      )}

      {/* Preview Container with proper centering */}
      <div className={`flex-1 flex items-center justify-center min-h-0 ${selectedDevice === 'web' ? 'p-2 sm:p-4 bg-gray-50' : 'p-2 sm:p-4 bg-gray-50'
        }`}>
        <div className={`bg-[#f5e7c6] rounded-lg border border-gray-200 relative h-full ${getDeviceClasses(selectedDevice)}`}>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
              <div className="text-gray-600">Loading preview...</div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
              <div className="text-red-600">Error: {error}</div>
            </div>
          )}
          {state.publishInfo.mainDomain && (
            <iframe
              src={`https://${state.publishInfo.mainDomain}`}
              sandbox="allow-scripts allow-same-origin allow-modals allow-forms allow-popups"
              className="border-none"
              style={getIframeStyle(selectedDevice)}
              title="preview"
            />
          )}

          {/* Chatbot Container - This is where the chatbot will be rendered */}
          {!hasBotScript && (
            <div className={position ? `absolute z-50 w-auto ${getPositionClasses(position)}` : "absolute bottom-4 right-4 z-50 w-auto"}>
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewLandingPage;
