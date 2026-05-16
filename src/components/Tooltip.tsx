import { HelpCircle } from "lucide-react";
import React, { FC, ReactNode } from "react";

type TooltipProps = {
  tooltipText: string;
  tooltipClass?: string

};
export const Tooltip: FC<TooltipProps> = ({ tooltipText, tooltipClass }) => {
  return (
    <div className="group relative inline-block">
      <HelpCircle
        size={14}
        className={`${tooltipClass || 'text-neutral-300'} hover:text-[#51597A] cursor-pointer`}
      />
      <div
        className="absolute z-50 hidden group-hover:block rounded-lg p-3 mt-1 w-48 text-xs font-normal text-white left-0 whitespace-normal break-words"
        style={{
          background: 'var(--Common-Overlay-dark, #030C238F)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0px 4px 32px 0px rgba(16, 30, 54, 0.08)'
        }}
      >
        {tooltipText}
      </div>
    </div>
  );
};
