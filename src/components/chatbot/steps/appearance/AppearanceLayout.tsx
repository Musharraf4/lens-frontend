import React, { ReactNode, useState, useEffect } from 'react';
import ChatbotAccordion from '../../ChatbotAccordion';
import { useChatbotBuilder } from '@/store/ChatbotBuilderContext';

interface AccordionSection {
  id: string;
  title: string;
  content: ReactNode;
}

interface AppearanceLayoutProps {
  title: string;
  description: string;
  accordionSections: AccordionSection[];
  preview: ReactNode;
  isReviewStep?: boolean;
}

const AppearanceLayout: React.FC<AppearanceLayoutProps> = ({
  title,
  description,
  accordionSections,
  preview,
  isReviewStep = false
}) => {
  const { state } = useChatbotBuilder();
  const { selectedDevice } = state;

  // Using the pattern from the memory to track active state for each accordion section
  const [activeSections, setActiveSections] = useState<Record<string, boolean>>({});

  // Initialize all sections with the first one active by default
  useEffect(() => {
    if (accordionSections.length === 0) return;

    const initialStates: Record<string, boolean> = {};
    accordionSections.forEach((section, index) => {
      initialStates[section.id] = index === 0; // First section is active by default
    });
    setActiveSections(initialStates);
  }, [accordionSections]);

  // Handle toggling a specific section
  const handleToggle = (sectionId: string, active: boolean) => {
    setActiveSections(prev => {
      // Create a new state object with all sections inactive
      const newState: Record<string, boolean> = {};
      Object.keys(prev).forEach(id => {
        newState[id] = false;
      });

      // Set the toggled section to its new state
      newState[sectionId] = active;

      return newState;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold">{title}</h2>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">{description}</p>
      </div>

      <div className={`grid grid-cols-1 ${isReviewStep ?
        // For review step, use single column for tablet/mobile, two columns for web
        selectedDevice === 'web' ? 'md:grid-cols-12' : 'md:grid-cols-1'
        : 'md:grid-cols-12'} gap-4 md:gap-6`}>
        {!isReviewStep && (
          <div className="col-span-1 md:col-span-3 mb-4 md:mb-0">
            <div className="space-y-2">
              {accordionSections.map((section, index) => (
                <ChatbotAccordion
                  key={section.id}
                  id={section.id}
                  stepNumber={index + 1}
                  title={section.title}
                  isActive={activeSections[section.id] || false}
                  onToggle={(active) => handleToggle(section.id, active)}
                  defaultOpen={index === 0}
                >
                  <div className="py-3">
                    {section.content}
                  </div>
                </ChatbotAccordion>
              ))}
            </div>
          </div>
        )}

        <div className={isReviewStep ?
          // For review step, use full width for tablet/mobile, 12 columns for web
          selectedDevice === 'web' ? "col-span-1 md:col-span-12" : "col-span-1"
          : "col-span-1 md:col-span-9"}>
          {preview}
        </div>
      </div>
    </div>
  );
};

export default AppearanceLayout;
