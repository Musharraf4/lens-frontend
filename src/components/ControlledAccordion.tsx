import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import React from "react";

export interface Step {
  id: string;
  label: string;
  body: React.ReactNode;
  statusTag?: React.ReactNode;
  disabled?: boolean;
}

export interface ControlledAccordionProps {
  steps: Step[];
  className?: string;
  activeIds: string[];
  setActiveIds: React.Dispatch<React.SetStateAction<string[]>>;
}

export const ControlledAccordion: React.FC<ControlledAccordionProps> = ({
  steps,
  className = "",
  activeIds,
  setActiveIds,
}) => {
  return (
    <Accordion
      type="multiple"
      value={activeIds.map((id) => id.toString())}
      onValueChange={(values) => {
        // Radix guarantees string[] here because type="multiple"
        if (Array.isArray(values)) {
          setActiveIds(values.map((v) => v));
        }
      }}
      className={`w-full ${className}`}
    >
      {steps.map((step) => {
        const isActive = activeIds.includes(step.id);

        return (
          <AccordionItem
            key={step.id}
            disabled={step?.disabled}
            value={step.id.toString()}
            className="border-0 mb-4 bg-white rounded-lg shadow-sm"
          >
            <AccordionTrigger className="px-4 py-3 text-base font-medium">
              <div className="flex items-center gap-2.5 flex-1">
                <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-100 text-gray-500">
                  {step.id}
                </div>
                <span>{step.label}</span>
                {!isActive && step.statusTag && <div>{step.statusTag}</div>}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4">{step.body}</AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};
