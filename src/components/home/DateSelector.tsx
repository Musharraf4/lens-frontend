'use client';

import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateSelectorProps } from '@/types';

export function DateSelector({ selected, onChange, disabled, additional }: DateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const baseOptions = [
    "This Month",
    "Last Month",
    "Last 30 Days",
    "This Quarter",
    "Last Quarter",
    "This Year",
    "Last 120 Days",
  ];
  const options = additional ? [...baseOptions, "All Time"] : baseOptions;

  return (
    <div className="relative flex" data-tour="date-selector">
      <Select
        value={selected}
        onValueChange={(value) => {
          onChange(value);
          setHasInteracted(true);
        }}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (open) setHasInteracted(true);
        }}
        disabled={disabled}
      >
        <SelectTrigger
          className="w-[140px] sm:w-[160px] md:w-[180px] rounded-full px-3 sm:px-4 py-1 text-sm sm:text-base transition-all cursor-pointer"
          style={{
            background: 'var(--Dropdown-Simple-button-bg-gray, #F7F9FB)',
            border: (isOpen || (selected && hasInteracted))
              ? '1px solid var(--Dropdown-Simple-button-border-selected, #ACDF18)'
              : '1px solid #CDD2DA',
            boxShadow: (isOpen || (selected && hasInteracted)) ? '0px 0px 0px 2px #D8F990' : 'none',
          }}
          hideIcon={true}
        >
          <div className="flex items-center justify-between w-full">
            <SelectValue placeholder="Select time" className="truncate" />
            <CalendarDays className="ml-1 w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
          </div>
        </SelectTrigger>
        <SelectContent
          className='text-[#030C23] text-sm font-normal w-[var(--radix-select-trigger-width)]'
          align="center"
          sideOffset={8}
        >
          {options.map((option) => (
            <SelectItem
              key={option}
              value={option}
              className="text-xs sm:text-sm px-3 py-2"
            >
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}