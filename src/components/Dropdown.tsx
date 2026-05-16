import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type OptionObject = {
  id: string | number;
  option: string;
  icon?: React.ReactNode;
  name?: string;
  managerId?: string;
  [key: string]: any; // Allow additional properties
};

function isOptionObject(option: any): option is OptionObject {
  return typeof option === "object" && option !== null && "id" in option && "option" in option;
}

interface DropdownProps {
  options: Array<string | number | OptionObject>;
  value: string | number;
  onChange: (value: string | number) => void;
  formatOption?: (option: string | number | OptionObject) => string | React.ReactNode;
  formatOptionForItems?: (option: string | number | OptionObject) => string | React.ReactNode;
  placeholder?: string;
  suffix?: string;
  triggerClassName?: string;
  contentClassName?: string;
  getOptionValue?: (option: string | number | OptionObject) => string | number;
  getOptionLabel?: (option: string | number | OptionObject) => string;
  label?: string;
  width?: string;
  disabled?: boolean;
  selected?: boolean;
}

export function Dropdown({
  options,
  value,
  onChange,
  formatOption,
  formatOptionForItems,
  placeholder = "Select an option",
  suffix = "",
  triggerClassName = "w-[130px] rounded-full",
  contentClassName = "",
  getOptionValue = (option) => (isOptionObject(option) ? option.id : (option as string | number)),
  getOptionLabel = (option) => (isOptionObject(option) ? option.option : String(option)),
  label,
  width,
  disabled,
  selected,
}: DropdownProps) {
  // Find the currently selected option
  const selectedOption = options.find((option) => getOptionValue(option) === value);

  // Format the displayed text for the current value - now using JSX instead of plain string
  const displayContent = selectedOption ? (
    suffix ? (
      <>
        {formatOption ? formatOption(selectedOption) : getOptionLabel(selectedOption)}
        <span style={{ color: "#8A909F" }}> {suffix}</span>
      </>
    ) : formatOption ? (
      formatOption(selectedOption)
    ) : (
      getOptionLabel(selectedOption)
    )
  ) : (
    placeholder
  );

  return (
    <div className={width ? width : ""}>
      {label && (
        <label
          className="text-neutral-500"
          style={{
            fontWeight: 400,
            fontSize: 16,
            lineHeight: "24px",
            letterSpacing: "-0.02em",
            verticalAlign: "middle",
            display: "inline-block",
            marginBottom: 8,
          }}
        >
          {label}
        </label>
      )}
      <Select
        value={String(value)}
        onValueChange={(newValue) => {
          // Convert string back to the original type
          let typedValue: any;

          // Find the matching option to get the correct type
          const matchedOption = options.find((opt) => String(getOptionValue(opt)) === newValue);

          if (matchedOption) {
            // If we found a matching option, use its value
            typedValue = getOptionValue(matchedOption);
          } else if (typeof value === "number") {
            // Fallback to number conversion if value is a number
            typedValue = Number(newValue);
          } else {
            // Otherwise just use the string value
            typedValue = newValue;
          }

          onChange(typedValue);
        }}
      >
        <SelectTrigger
          disabled={disabled}
          className={cn(
            "inline-flex h-12 rounded-full py-2 px-2 text-base font-normal",
            "bg-neutral-25",
            "border border-neutral-100",
            "text-black placeholder:text-black",
            "leading-6 tracking-[0px]",
            "hover:border-neutral-500",
            "focus:border-2 focus:border-neutral-500 focus:outline-none",
            selected && "border-lime-300 shadow-[0_0_0_2px_#D8F990] focus:border-lime-300",
            disabled &&
            "bg-[#FAFAFA] border-neutral-100 text-neutral-200 placeholder:text-neutral-200 cursor-not-allowed",
            width ? `${width} rounded-full px-5` : triggerClassName
          )}
        >
          <SelectValue placeholder={placeholder}>{displayContent}</SelectValue>
        </SelectTrigger>
        <SelectContent className={contentClassName}>
          {options.map((option) => (
            <SelectItem
              key={String(getOptionValue(option))}
              value={String(getOptionValue(option))}
            >
              {isOptionObject(option) && option.icon ? (
                <div className="flex items-center gap-2">
                  {option.icon}
                  {suffix ? (
                    <>
                      {formatOptionForItems ? formatOptionForItems(option) : formatOption ? formatOption(option) : getOptionLabel(option)}
                      <span style={{ color: "#8A909F" }}> {suffix}</span>
                    </>
                  ) : formatOptionForItems ? (
                    formatOptionForItems(option)
                  ) : formatOption ? (
                    formatOption(option)
                  ) : (
                    getOptionLabel(option)
                  )}
                </div>
              ) : suffix ? (
                <>
                  {formatOptionForItems ? formatOptionForItems(option) : formatOption ? formatOption(option) : getOptionLabel(option)}
                  <span style={{ color: "#8A909F" }}> {suffix}</span>
                </>
              ) : formatOptionForItems ? (
                formatOptionForItems(option)
              ) : formatOption ? (
                formatOption(option)
              ) : (
                getOptionLabel(option)
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
