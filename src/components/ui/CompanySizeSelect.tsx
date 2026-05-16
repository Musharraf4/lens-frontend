"use client";

import { companySizeOptions } from "@/constants";
import { cn } from "@/lib/utils";
import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export default function CompanySizeSelect({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Select.Root
      value={value}
      onValueChange={onChange}
      onOpenChange={setOpen}
      disabled={disabled}
    >
      <Select.Trigger
        className={cn(
          "w-full h-10 inline-flex items-center justify-between rounded-full border border-neutral-100 px-4 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#ACDF18] focus:border-[#ACDF18]",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        aria-label="Company Size"
        disabled={disabled}
      >
        <Select.Value placeholder="Select" />
        <Select.Icon className="flex items-center">
          {open ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          sideOffset={4}
          position="popper"
          align="start"
          className="min-w-[var(--radix-select-trigger-width)] w-[var(--radix-select-trigger-width)] rounded-xl bg-white text-gray-900 shadow-md overflow-hidden z-50"
        >
          <Select.ScrollUpButton className="flex items-center justify-center text-gray-500 py-1">
            <ChevronUp />
          </Select.ScrollUpButton>

          <Select.Viewport className="p-1">
            {companySizeOptions.map((item) => (
              <Select.Item
                key={item.value}
                value={item.value}
                className={cn(
                  "text-sm px-3 py-2 rounded-md flex items-center justify-between cursor-pointer font-normal",
                  "transition-colors",
                  "hover:bg-neutral-50 hover:text-black",
                  " data-[highlighted]:text-black",
                  " data-[state=checked]:text-black",
                  "focus:outline-none focus:ring-0 focus:border-0"
                )}
              >
                <span className="flex items-center space-x-2">
                  <Select.ItemText>{item.label}</Select.ItemText>
                </span>
                <Select.ItemIndicator className="flex-shrink-0 ml-2">
                  <Check className="h-4 w-4 text-black" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>

          <Select.ScrollDownButton className="flex items-center justify-center text-gray-500 py-1">
            <ChevronDown />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
