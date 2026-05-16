import React, { useState, useCallback, createContext, useContext, useEffect, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useChatbotBuilder } from '@/store/ChatbotBuilderContext';
import ChatbotAccordion from '@/components/chatbot/ChatbotAccordion';
import { HexColorPicker } from 'react-colorful';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import PreviewLandingPage from '@/components/chatbot/PreviewLandingPage';
import ChatbotPreview from '@/components/chatbot/ChatbotPreview';

// Create a context for the color picker
interface ColorPickerContextType {
  isOpen: boolean;
  isGradient: boolean;
  currentColor: string;
  currentColor1?: string;
  currentColor2?: string;
  activeGradientColor?: 'color1' | 'color2';
  setIsOpen: (isOpen: boolean) => void;
  setCurrentColor: (color: string) => void;
  setCurrentColor1?: (color: string) => void;
  setCurrentColor2?: (color: string) => void;
  setActiveGradientColor?: (color: 'color1' | 'color2') => void;
  saveColor: (color: string) => void;
  saveGradient?: (color1: string, color2: string) => void;
}

const ColorPickerContext = createContext<ColorPickerContextType | undefined>(undefined);

// Gradient Color Picker Component
interface GradientColorPickerProps {
  color1: string;
  color2: string;
  onColor1Change: (color: string) => void;
  onColor2Change: (color: string) => void;
}

const GradientColorPicker: React.FC<GradientColorPickerProps> = ({
  color1,
  color2,
  onColor1Change,
  onColor2Change,
}) => {
  const [activeColor, setActiveColor] = useState<'color1' | 'color2'>('color1');
  const [slider1Position, setSlider1Position] = useState(20); // 0-100
  const [slider2Position, setSlider2Position] = useState(80); // 0-100
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<{ handle: 'slider1' | 'slider2' | null }>({ handle: null });

  const currentColor = activeColor === 'color1' ? color1 : color2;
  const onChange = activeColor === 'color1' ? onColor1Change : onColor2Change;

  // Handle slider drag
  const handleSliderMouseDown = (handle: 'slider1' | 'slider2', e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current.handle = handle;
    document.addEventListener('mousemove', handleSliderMouseMove);
    document.addEventListener('mouseup', handleSliderMouseUp);
  };

  const handleSliderMouseMove = (e: MouseEvent) => {
    if (!sliderRef.current || !isDragging.current.handle) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const position = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));

    if (isDragging.current.handle === 'slider1') {
      setSlider1Position(Math.min(position, slider2Position - 5));
    } else {
      setSlider2Position(Math.max(position, slider1Position + 5));
    }
  };

  const handleSliderMouseUp = () => {
    isDragging.current.handle = null;
    document.removeEventListener('mousemove', handleSliderMouseMove);
    document.removeEventListener('mouseup', handleSliderMouseUp);
  };

  // Handle hex input changes
  const handleHex1Change = (value: string) => {
    if (/^#?[0-9A-Fa-f]{0,6}$/.test(value)) {
      const hex = value.startsWith('#') ? value : `#${value}`;
      if (hex.length === 7) {
        onColor1Change(hex);
      }
    }
  };

  const handleHex2Change = (value: string) => {
    if (/^#?[0-9A-Fa-f]{0,6}$/.test(value)) {
      const hex = value.startsWith('#') ? value : `#${value}`;
      if (hex.length === 7) {
        onColor2Change(hex);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Color Picker Area - Shows color picker for active color */}
      <div className="relative rounded-lg overflow-hidden border border-gray-200" style={{ height: '240px' }}>
        <HexColorPicker
          color={currentColor}
          onChange={onChange}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Dual Handle Slider - Gradient range/lightness slider */}
      <div className="space-y-2">
        <div
          ref={sliderRef}
          className="relative h-2 w-full rounded cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${color1}, ${color2})`,
          }}
        >
          {/* Slider Handle 1 */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-gray-300 rounded-full cursor-grab active:cursor-grabbing shadow-sm"
            style={{ left: `${slider1Position}%`, transform: 'translate(-50%, -50%)' }}
            onMouseDown={(e) => handleSliderMouseDown('slider1', e)}
          />
          {/* Slider Handle 2 */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-gray-300 rounded-full cursor-grab active:cursor-grabbing shadow-sm"
            style={{ left: `${slider2Position}%`, transform: 'translate(-50%, -50%)' }}
            onMouseDown={(e) => handleSliderMouseDown('slider2', e)}
          />
        </div>
      </div>

      {/* Hex Inputs */}
      <div className="space-y-3">
        {/* Hex 1 */}
        <div className="flex justify-between items-center gap-3">
          <Label className="text-sm font-medium text-gray-700 min-w-[50px]">Hex 1</Label>
          <div className="flex items-center gap-2">

            <p>{color1}</p>

            <div
              className="w-8 h-8 rounded border-2 border-gray-300 flex-shrink-0 cursor-pointer hover:border-gray-400 transition-colors"
              style={{ backgroundColor: color1 }}
              onClick={() => setActiveColor('color1')}
            />
          </div>
        </div>

        {/* Hex 2 */}
        <div className="flex  justify-between items-center gap-3">
          <Label className="text-sm font-medium text-gray-700 min-w-[50px]">Hex 2</Label>
          <div className="flex items-center gap-2">

            <p>{color2}</p>
            <div
              className="w-8 h-8 rounded border-2 border-gray-300 flex-shrink-0 cursor-pointer hover:border-gray-400 transition-colors"
              style={{ backgroundColor: color2 }}
              onClick={() => setActiveColor('color2')}
            />
          </div>

        </div>
      </div>
    </div>
  );
};

// Separate component for the color picker modal
const ColorPickerModal = () => {
  const context = useContext(ColorPickerContext);
  if (!context) throw new Error('ColorPickerModal must be used within a ColorPickerProvider');

  const {
    isOpen,
    isGradient,
    currentColor,
    currentColor1,
    currentColor2,
    setIsOpen,
    setCurrentColor,
    setCurrentColor1,
    setCurrentColor2,
    saveColor,
    saveGradient
  } = context;

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden max-h-[90vh] flex flex-col">
        <DialogTitle className="sr-only">Color Picker</DialogTitle>
        <div className="flex justify-between items-center p-6 pb-4 border-b flex-shrink-0">
          <h2 className="text-xl font-semibold">{isGradient ? 'Select gradient colors' : 'Select color'}</h2>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {isGradient ? (
            // Gradient mode - unified gradient picker
            <GradientColorPicker
              color1={currentColor1 || '#D9D9D9'}
              color2={currentColor2 || '#737373'}
              onColor1Change={(color) => setCurrentColor1?.(color)}
              onColor2Change={(color) => setCurrentColor2?.(color)}
            />
          ) : (
            // Solid color mode - single color picker
            <>
              <div className="mb-6">
                <HexColorPicker
                  color={currentColor}
                  onChange={setCurrentColor}
                  className="w-auto"
                  style={{ width: 'auto', height: '240px' }}
                />
              </div>

              <div className="flex items-center justify-between bg-gray-900 p-4 rounded-md">
                <div className="flex items-center">
                  <span className="text-white text-sm">Hex</span>
                  <span className="ml-2 text-sm text-gray-300">{currentColor}</span>
                </div>
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: currentColor }}
                />
              </div>
            </>
          )}
        </div>

        {/* Footer with buttons */}
        <div className="flex justify-end p-4 border-t gap-2 flex-shrink-0">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (isGradient && saveGradient && currentColor1 && currentColor2) {
                saveGradient(currentColor1, currentColor2);
              } else if (!isGradient) {
                saveColor(currentColor);
              }
            }}
            className="px-6 bg-black text-white"
            disabled={isGradient && (!currentColor1 || !currentColor2)}
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface ChatStepProps {
  showPreview?: boolean;
}

const ChatStep: React.FC<ChatStepProps> = ({ showPreview = true }) => {
  const { state, setBotAppearance, chatbotState, toggleChatbotState } = useChatbotBuilder();
  const { themeType, themeColor, gradientColor, position } = state.botAppearance;
  const { selectedDevice } = state;

  // State for accordion
  const [openAccordion, setOpenAccordion] = useState<string | undefined>('theme-color');

  const handleAccordionChange = React.useCallback((newValue: string | undefined) => {
    setOpenAccordion(newValue);
  }, []);

  // State for color picker
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [tempColor, setTempColor] = useState(themeColor);
  const [tempColor1, setTempColor1] = useState(gradientColor?.color1 || '#2C54BB');
  const [tempColor2, setTempColor2] = useState(gradientColor?.color2 || '#4A90E2');
  const [isGradientMode, setIsGradientMode] = useState(false);

  // Toggle preview state using context
  const togglePreviewState = () => {
    toggleChatbotState();
  };

  const handleThemeTypeChange = (value: 'solid' | 'gradient') => {
    setBotAppearance({
      ...state.botAppearance,
      themeType: value
    });
    // If switching to gradient, open the color picker
    if (value === 'gradient') {
      setIsGradientMode(true);
      setTempColor1(gradientColor?.color1 || '#2C54BB');
      setTempColor2(gradientColor?.color2 || '#4A90E2');
      setIsColorPickerOpen(true);
    } else {
      setIsGradientMode(false);
    }
  };

  // Handler to save the solid color to the context
  const saveColor = useCallback((color: string) => {
    setBotAppearance({
      ...state.botAppearance,
      themeColor: color
    });
    setIsColorPickerOpen(false);
  }, [setBotAppearance, state.botAppearance]);

  // Handler to save the gradient colors to the context
  const saveGradient = useCallback((color1: string, color2: string) => {
    setBotAppearance({
      ...state.botAppearance,
      gradientColor: {
        color1,
        color2
      }
    });
    setIsColorPickerOpen(false);
  }, [setBotAppearance, state.botAppearance]);

  // Create the context value
  const colorPickerContextValue = {
    isOpen: isColorPickerOpen,
    isGradient: isGradientMode,
    currentColor: tempColor,
    currentColor1: tempColor1,
    currentColor2: tempColor2,
    setIsOpen: setIsColorPickerOpen,
    setCurrentColor: setTempColor,
    setCurrentColor1: setTempColor1,
    setCurrentColor2: setTempColor2,
    saveColor: saveColor,
    saveGradient: saveGradient
  };

  // Open color picker handler for solid color
  const openColorPicker = useCallback(() => {
    setIsGradientMode(false);
    setTempColor(themeColor); // Reset temp color to current theme color
    setIsColorPickerOpen(true);
  }, [themeColor]);

  // Open color picker handler for gradient
  const openGradientPicker = useCallback(() => {
    setIsGradientMode(true);
    setTempColor1(gradientColor?.color1 || '#2C54BB');
    setTempColor2(gradientColor?.color2 || '#4A90E2');
    setIsColorPickerOpen(true);
  }, [gradientColor]);

  // Sync temp colors when gradientColor changes
  useEffect(() => {
    if (gradientColor) {
      setTempColor1(gradientColor.color1);
      setTempColor2(gradientColor.color2);
    }
  }, [gradientColor]);

  // Provide the context to the color picker modal
  const colorPickerModal = (
    <ColorPickerContext.Provider value={colorPickerContextValue}>
      <ColorPickerModal />
    </ColorPickerContext.Provider>
  );

  // Chat interface component
  const chatInterface = (
    <div className="bg-white rounded-lg shadow-md overflow-hidden w-80 fixed bottom-4 right-4">
      <div
        className="p-4 flex items-center"
        style={{ backgroundColor: themeColor, color: '#fff' }}
      >
        <div className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-3">
          <span className="text-sm">🤖</span>
        </div>
        <div>
          <div className="font-medium">{state.botAppearance.botName || 'Chatbot'}</div>
          <div className="text-xs opacity-80">Online</div>
        </div>
      </div>

      <div className="p-4 overflow-y-auto" style={{ height: '300px' }}>
        <div className="space-y-4">
          {/* Bot message */}
          <div className="flex items-start">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
              <span className="text-xs">🤖</span>
            </div>
            <div>
              <div
                className="p-3 rounded-lg max-w-xs"
                style={{ backgroundColor: themeColor, color: '#fff' }}
              >
                Hello! How can I help you today?
              </div>
            </div>
          </div>

          {/* User message */}
          <div className="flex items-start justify-end">
            <div>
              <div
                className="p-3 rounded-lg max-w-xs ml-auto bg-gray-100"
              >
                I have a question about your services.
              </div>
            </div>
          </div>

          {/* Typing indicator */}
          <div className="flex items-start">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
              <span className="text-xs">🤖</span>
            </div>
            <div
              className="p-3 rounded-lg inline-flex space-x-1"
              style={{ backgroundColor: themeColor, color: '#fff' }}
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              <span className="w-2 h-2 rounded-full bg-white animate-pulse delay-100"></span>
              <span className="w-2 h-2 rounded-full bg-white animate-pulse delay-200"></span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat input */}
      <div className="border-t p-3 flex items-center">
        <input
          type="text"
          placeholder="Type your message..."
          className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          className="ml-2 p-2 rounded-full"
          style={{ backgroundColor: themeColor, color: '#fff' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );

  // Preview component
  const preview = (
    <div className="h-full w-full rounded-lg overflow-hidden">
      <div className="h-[600px] relative">
        <PreviewLandingPage position={position}>
          <ChatbotPreview />
        </PreviewLandingPage>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* <div>
        <h2 className="text-xl sm:text-2xl font-bold mb-1">Chat Appearance</h2>
        <p className="text-sm sm:text-base text-gray-600 mt-2">
          Customize how your chat interface looks and behaves.
        </p>
      </div> */}

      {/* Mobile Preview Toggle Button */}
      <div className="block md:hidden mb-4">
        <button
          onClick={togglePreviewState}
          className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium flex items-center justify-center gap-2"
        >
          {chatbotState === 'open' ? 'Hide Preview' : 'Show Preview'}
        </button>
      </div>

      {/* Mobile Preview (Collapsible) */}
      {chatbotState === 'open' && (
        <div className="block md:hidden mb-4 h-[400px] overflow-hidden rounded-lg">
          {preview}
        </div>
      )}

      <div className={showPreview ? `grid gap-4 md:gap-6 ${selectedDevice === 'web' ? 'grid-cols-1 md:grid-cols-12' :
        selectedDevice === 'tablet' ? 'grid-cols-1' :
          'grid-cols-1'
        }` : 'space-y-6'}>
        <div className={showPreview ? `${selectedDevice === 'web' ? 'col-span-1 md:col-span-3' :
          selectedDevice === 'tablet' ? 'col-span-1' :
            'col-span-1'
          }` : 'w-full'}>
          <div className="space-y-4">
            {/* Theme Color Accordion */}
            <ChatbotAccordion
              id="theme-color"
              stepNumber={1}
              title="Theme Color"
              value={openAccordion}
              onValueChange={handleAccordionChange}
            >
              <div className="space-y-4">
                <RadioGroup
                  value={themeType}
                  onValueChange={(value: 'solid' | 'gradient') => handleThemeTypeChange(value)}
                >
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="solid" id="theme-solid" />
                    <Label htmlFor="theme-solid">Solid</Label>
                    <div className="ml-auto flex items-center">
                      <div
                        className="w-8 h-8 rounded border cursor-pointer"
                        style={{ backgroundColor: themeColor }}
                        onClick={openColorPicker}
                      />
                      <span className="ml-2 text-sm text-gray-500">{themeColor}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 p-4 border rounded-lg mt-2">
                    <RadioGroupItem value="gradient" id="theme-gradient" />
                    <Label htmlFor="theme-gradient" className="flex-1 cursor-pointer">Gradient</Label>
                    {themeType === 'gradient' && gradientColor && (
                      <div className="ml-auto flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded border cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, ${gradientColor.color1}, ${gradientColor.color2})`
                          }}
                          onClick={openGradientPicker}
                        />
                        <span className="text-sm text-gray-500">{gradientColor.color1} / {gradientColor.color2}</span>
                      </div>
                    )}
                    {themeType === 'gradient' && !gradientColor && (
                      <div className="ml-auto">
                        <button
                          onClick={openGradientPicker}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Select colors
                        </button>
                      </div>
                    )}
                  </div>
                </RadioGroup>

                <p className="text-sm text-gray-500 mt-4">
                  Select a color theme for your chatbot interface.
                </p>
              </div>
            </ChatbotAccordion>
          </div>
        </div>

        {showPreview && (
          <div className={`${selectedDevice === 'web' ? 'col-span-1 md:col-span-9 hidden md:block' :
            selectedDevice === 'tablet' ? 'col-span-1' :
              'col-span-1'
            }`}>
            {preview}
          </div>
        )}
      </div>

      {/* Color Picker Modal */}
      {colorPickerModal}
    </div>
  );
};

export default ChatStep;
