import React from "react";
import { Input, InputProps } from "@/components/ui/input";

interface AmountInputProps extends Omit<InputProps, "type" | "value" | "onChange"> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

export const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChange,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  disabled,
  ...props
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9.-]/g, ""); // Only allow numbers, dot, minus
    const num = Number(val);
    if (!isNaN(num) && val !== "") {
      onChange(Math.max(min, Math.min(max, num)));
    } else if (val === "") {
      onChange(0);
    }
  };

  const handleIncrement = () => {
    onChange(Math.min(max, value + step));
  };

  const handleDecrement = () => {
    onChange(Math.max(min, value - step));
  };

  return (
    <div className="relative w-full">
      {/* Decrement Button */}
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[#0A1121] text-white flex items-center justify-center text-2xl"
        
      >
        –
      </button>
      {/* Input */}
      <Input
        {...props}
        type="text"
        value={value === 0 ? "" : value}
        onChange={handleInputChange}
        disabled={disabled}
        className="w-full h-12 text-center px-16"
        inputMode="decimal"
        pattern="[0-9]*"
        placeholder={props.placeholder || "Enter amount"}
      />
      {/* Increment Button */}
      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[#0A1121] text-white flex items-center justify-center text-2xl"
        
      >
        +
      </button>
    </div>
  );
};