import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  selected?: boolean
  skeleton?: boolean
  icon?: React.ReactNode
  label?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, selected, skeleton, disabled, icon, label, ...props }, ref) => {
    if (skeleton) {
      return (
        <div
          className={cn(
            "h-24 w-full rounded-lg animate-pulse",
            "bg-[linear-gradient(90deg,_#F7F9FB_0%,_#E6E9EE_100%)]"
          )}
        />
      )
    }

    const textareaElement = icon ? (
      <div className="relative w-full">
        <span className="absolute left-4 top-6 -translate-y-1/2 flex items-center text-neutral-400 pointer-events-none">
          {icon}
        </span>
        <textarea
          disabled={disabled}
          ref={ref}
          className={cn(
            "flex min-h-24 w-full rounded-lg px-10 py-3 text-base font-normal",
            "bg-neutral-25",
            "border",
            "border-neutral-100",
            "text-black placeholder:text-black",
            "leading-6",
            "tracking-[0px]",
            "hover:border-neutral-500",
            "focus:border-2 focus:border-neutral-500 focus:outline-none",
            selected &&
            "border-lime-300 shadow-[0_0_0_2px_#D8F990] focus:border-lime-300",
            disabled &&
            "bg-[#FAFAFA] border-neutral-100 text-neutral-200 placeholder:text-neutral-200 cursor-not-allowed",
            className
          )}
          {...props}
        />
      </div>
    ) : (
      <textarea
        disabled={disabled}
        ref={ref}
        className={cn(
          "flex min-h-24 w-full rounded-lg px-6 py-3 text-base font-normal",
          "bg-neutral-25",
          "border",
          "border-neutral-100",
          "text-black placeholder:text-black",
          "leading-6",
          "tracking-[0px]",
          "hover:border-neutral-500",
          "focus:border-2 focus:border-neutral-500 focus:outline-none",
          selected &&
          "border-lime-300 shadow-[0_0_0_2px_#D8F990] focus:border-lime-300",
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
          {textareaElement}
        </div>
      )
    }

    return textareaElement;
  }
)
Textarea.displayName = "Textarea"

export { Textarea }