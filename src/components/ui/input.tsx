import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  selected?: boolean;
  skeleton?: boolean;
  icon?: React.ReactNode;
  label?: string;
  iconPosition?: "left" | "right";
  inputSize?: "small" | "medium";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      inputSize = "medium",
      className,
      type,
      selected,
      skeleton,
      disabled,
      icon,
      label,
      iconPosition = "left",
      ...props
    },
    ref
  ) => {
    if (skeleton) {
      return (
        <div
          className={cn(
            "h-12 w-full rounded-full animate-pulse",
            "bg-[linear-gradient(90deg,_#F7F9FB_0%,_#E6E9EE_100%)]"
          )}
        />
      );
    }
    const inputElement = icon ? (
      <div className="relative w-full">
        {iconPosition === "left" && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center text-neutral-400 pointer-events-none">
            {icon}
          </span>
        )}
        {iconPosition === "right" && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center text-neutral-400 ">
            {icon}
          </span>
        )}
        <input
          type={type}
          disabled={disabled}
          ref={ref}
          className={cn(
            "flex w-full rounded-full py-2 text-base font-normal",
            iconPosition === "left" ? "px-10 pr-6" : "pr-10 pl-6",
            "bg-neutral-25",
            inputSize === "medium" ? "h-12" : "h-9",
            "border",
            "border-neutral-100",
            "text-black placeholder:text-neutral-300",
            "leading-6",
            "tracking-[0px]",
            "hover:border-neutral-500",
            "focus:border-2 focus:border-neutral-500 focus:outline-none",
            selected && "border-lime-300 shadow-[0_0_0_2px_#D8F990] focus:border-lime-300",
            disabled &&
              "bg-[#FAFAFA] border-neutral-100 text-neutral-200 placeholder:text-neutral-200 pointer-events-none",
            className
          )}
          {...props}
        />
      </div>
    ) : (
      <input
        type={type}
        disabled={disabled}
        ref={ref}
        className={cn(
          "flex h-12 w-full rounded-full px-6 py-2 text-base font-normal",
          "bg-neutral-25",
          "border",
          "border-neutral-100",
          "text-black placeholder:text-black",
          "leading-6",
          "tracking-[0px]",
          "hover:border-neutral-500",
          "focus:border-2 focus:border-neutral-500 focus:outline-none",
          selected && "border-lime-300 shadow-[0_0_0_2px_#D8F990] focus:border-lime-300",
          disabled &&
            "bg-[#FAFAFA] border-neutral-100 text-neutral-200 placeholder:text-neutral-200 cursor-not-allowed",
          className
        )}
        {...props}
      />
    );
    if (label) {
      return (
        <div>
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
          {inputElement}
        </div>
      );
    }
    return inputElement;
  }
);
Input.displayName = "Input";

export { Input };
