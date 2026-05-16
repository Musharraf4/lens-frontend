import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// ChatbotAccordion.tsx
export interface ChatbotAccordionProps {
  id: string;
  stepNumber: number; // Add step number prop
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  value?: string; // Controlled value
  onValueChange?: (value: string | undefined) => void; // Controlled change handler
  className?: string;
  isActive?: boolean;
  onToggle?: (active: boolean) => void;
  statusTag?: React.ReactNode; // Add statusTag prop
}

const ChatbotAccordion: React.FC<ChatbotAccordionProps> = ({
  id,
  stepNumber,
  title,
  children,
  defaultOpen = false,
  value,
  onValueChange,
  className = '',
  isActive,
  onToggle,
  statusTag,
}) => {
  // Calculate isActive from value if not explicitly provided
  // If value is provided (controlled mode), check if value === id
  // Otherwise, use defaultOpen for uncontrolled mode
  const calculatedIsActive = isActive !== undefined
    ? isActive
    : (value !== undefined ? value === id : defaultOpen);

  // In controlled mode (value provided), use value directly
  // In uncontrolled mode, use defaultOpen to determine initial state
  // When value is provided, it should be either the id (open) or undefined (closed)
  const currentValue = value !== undefined
    ? (value === id ? id : undefined)
    : (defaultOpen ? id : undefined);

  const handleValueChange = (newValue: string | undefined) => {
    // Always call onValueChange if provided (controlled mode)
    if (onValueChange) {
      onValueChange(newValue);
    }
    onToggle?.(newValue === id);
  };

  return (
    <Accordion
      type="single"
      collapsible
      value={currentValue}
      onValueChange={handleValueChange}
      className={`w-full bg-white rounded-lg shadow-sm mb-4 ${className}`}
    >
      <AccordionItem value={id} className="border-0">
        <AccordionTrigger
          className="px-4 py-3 text-base font-medium"
        >
          <div className="flex items-center gap-2.5 flex-1">
            {/* Step number circle */}
            <div className={`w-6 h-6 rounded-full items-center ${'bg-gray-100 text-gray-500'
              }`}>
              {stepNumber}
            </div>
            <span className="">{title}</span>
            {/* Status tag - only show when accordion is not active */}
            {!calculatedIsActive && statusTag && (
              <div className="">{statusTag}</div>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4">
          {children}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ChatbotAccordion;
