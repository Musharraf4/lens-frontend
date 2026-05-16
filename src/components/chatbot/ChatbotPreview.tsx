import React, { useState, useEffect, CSSProperties } from 'react';
import { useChatbotBuilder } from '@/store/ChatbotBuilderContext';
import { hexToRgba } from '@/lib/utils';

interface ChatbotPreviewProps {
  initialState?: 'open' | 'closed';
  position?: 'bottom-right' | 'bottom-left' | 'center-right' | 'center-left';
  initialData?: any;
}

const ChatbotPreview: React.FC<ChatbotPreviewProps> = ({
  initialState,
  position = 'bottom-right',
  initialData,
}) => {
  const { state, chatbotState, setChatbotState, toggleChatbotState } = useChatbotBuilder();
  const { botAppearance, topics, firstLastMessages } = state;
  const { selectedDevice } = state;
  const {
    botName,
    botPhoto,
    photoType,
    greeting,
    themeColor,
    gradientColor,
    themeType
  } = botAppearance || {};
  const avatarImage = initialData ? initialData.botAppearance.botPhoto || (photoType === 'custom' && botPhoto) : botPhoto;
  const { firstDialogVideo } = firstLastMessages || {};
  const displayFirstDialogVideo = initialData?.firstLastMessages?.firstDialogVideo || firstDialogVideo;

  // Derived theme values (solid or gradient)
  const gradientStart = gradientColor?.color1;
  const gradientEnd = gradientColor?.color2;
  const hasGradient =
    themeType === 'gradient' &&
    Boolean(gradientStart && gradientEnd);
  const baseThemeColor = themeColor || '#2C54BB';
  const themeBackground = hasGradient
    ? `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`
    : baseThemeColor;
  const themeHoverBackground = hasGradient
    ? `linear-gradient(135deg, ${gradientEnd}, ${gradientStart})`
    : `${baseThemeColor}`;
  const themeSoftBackground = hasGradient
    ? `linear-gradient(135deg, ${hexToRgba(gradientStart, 0.08)}, ${hexToRgba(gradientEnd, 0.08)})`
    : `${baseThemeColor}`;
  const themeBorderColor = hasGradient ? gradientStart! : baseThemeColor;
  const themeAccentColor = hasGradient ? gradientEnd! : baseThemeColor;

  // Fallback data when initialData is not provided
  const displayBotName = initialData?.botAppearance?.botName || botName || 'Bot name';
  const displayGreeting = initialData?.botAppearance?.greeting || greeting || 'Greeting Message...';
  const displayTopics = initialData?.topics || topics || [];

  // Use context state or initialState if provided
  const [isOpen, setIsOpen] = useState(initialState !== undefined ? initialState === 'open' : chatbotState === 'open');

  // Update local state when context state changes
  useEffect(() => {
    if (initialState === undefined) {
      setIsOpen(chatbotState === 'open');
    }
  }, [chatbotState, initialState]);

  // Toggle chat open/closed
  const toggleChat = () => {
    if (initialState === undefined) {
      toggleChatbotState();
    } else {
      setChatbotState(isOpen ? 'closed' : 'open');
    }
    setIsOpen(prev => !prev);
  };

  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [hoveredTopic, setHoveredTopic] = useState<string | null>(null);

  // Function to render the bot avatar
  const renderAvatar = () => (
    <div
      className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center text-white"
      style={{ background: themeBackground }}
    >
      {avatarImage ? (
        <img src={avatarImage} alt={displayBotName || 'Bot'} className="w-full h-full object-cover" />
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path>
        </svg>
      )}
    </div>
  );

  // Function to render topics as radio buttons
  const renderTopics = () => {
    const topicsToRender = displayTopics.length > 0 ? displayTopics : topics;
    if (!topicsToRender || topicsToRender.length === 0) return null;

    return (
      <div className="mt-4 space-y-2 w-fit">
        {topicsToRender.map((topic: any) => {
          const isSelected = selectedTopic === topic.id;
          const isHovered = hoveredTopic === topic.id;
          const isActive = isSelected || isHovered;

          const baseStyle: CSSProperties = hasGradient
            ? {
              borderRadius: '10px',
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: gradientStart,
            }
            : {
              borderRadius: '10px',
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: themeBorderColor,
            };

          const activeStyle: CSSProperties = hasGradient
            ? {
              borderRadius: '10px',
              background: themeHoverBackground,
              color: '#ffffff',
              borderColor: 'transparent',
              boxShadow: `0 0 0 2px ${hexToRgba(gradientStart, 0.2)}`,
            }
            : {
              borderRadius: '10px',
              background: themeSoftBackground,
              borderColor: themeBorderColor,
            };

          return (
            <label
              key={topic.id}
              className="flex items-center p-2 rounded visible-text border transition-all duration-150 cursor-pointer"
              style={isActive ? activeStyle : baseStyle}
              onMouseEnter={() => setHoveredTopic(topic.id)}
              onMouseLeave={() => setHoveredTopic(null)}
            >
              <input
                type="radio"
                name="topic"
                value={topic.id}
                checked={selectedTopic === topic.id}
                onChange={() => setSelectedTopic(topic.id)}
                className="mr-2"
                style={{
                  accentColor: themeAccentColor,
                }}
              />
              <span>{topic.name}</span>
            </label>
          );
        })}
      </div>
    );
  };

  // Get positioning classes based on the position prop
  const getPositionStyles = () => {
    // We'll implement this in the future when we add the positioning feature
    // For now, we'll use the default positioning from the parent container
    return {};
  };

  return (
    <div className="w-auto h-auto overflow-y-auto" style={{ display: 'block', visibility: 'visible' }}>
      {!isOpen ? (
        // Closed state (minimized chat button)
        <div
          className="cursor-pointer flex items-center gap-3"
          onClick={toggleChat}
        >
          {/* Avatar outside the message bubble */}

          {/* Message bubble */}
          <div className="bg-white rounded-lg shadow-lg p-3 min-w-[270px]">
            <div className="flex flex-col">
              <span className="font-medium text-sm">{displayBotName}</span>
              <span className="text-xs text-gray-500 truncate">
                {displayGreeting}
              </span>
            </div>
          </div>
          {renderAvatar()}
        </div>
      ) : (
        // Open state (expanded chat interface)
        <div className={`${selectedDevice === 'mobile' ? 'w-[300px]' : 'w-[350px]'} flex flex-col max-h-[calc(100vh-200px)]`}>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full max-h-[500px] min-h-[400px] relative">
            {/* Background Video */}
            {displayFirstDialogVideo && (
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover z-0"
              >
                <source src={displayFirstDialogVideo} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}

            {/* Overlay for better content readability */}
            {displayFirstDialogVideo && (
              <div className="absolute inset-0 bg-black/30 z-[1]"></div>
            )}

            {/* Header */}
            {/* Bot greeting message */}
            <div className='px-4 pt-3 flex-shrink-0 relative z-10'>
              <button
                onClick={toggleChat}
                className={displayFirstDialogVideo ? "text-white hover:text-white/80" : "text-gray-500 hover:text-gray-800"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              <div>
                <p className={displayFirstDialogVideo ? 'visible-text' : ''}>{displayGreeting}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {renderAvatar()}
                  <div>
                    {/* <p className="font-medium">{displayBotName}</p> */}
                    <p className={`text-xs ${displayFirstDialogVideo ? 'visible-text' : 'text-neutral-500'}`}>Just now</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Chat body - scrollable */}
            <div className="px-4 flex-1 overflow-y-auto min-h-0 relative z-10">
              {/* Topics as radio buttons */}
              {renderTopics()}
            </div>

            {/* Footer with powered by label */}
            <div className={`p-2 text-center flex-shrink-0 relative z-10 ${displayFirstDialogVideo ? 'bg-black/40' : 'bg-gray-50'}`}>
              <p className={`text-xs ${displayFirstDialogVideo ? 'visible-text' : 'text-gray-500'}`}>
                Powered by <span>  <img
                  src="/LenzPixelFullIcon.svg"
                  alt="LENZ Logo"
                  className="object-contain cursor-pointer visible-text"
                  style={{ display: 'inline-block', width: '33px', height: '31px' }}
                />

                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotPreview;
