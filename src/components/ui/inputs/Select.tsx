"use client";

import React, { useState, useEffect } from "react";
import { UseFormRegister, FieldValues, Path, FieldErrors, useController, Control, useFormContext } from "react-hook-form";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import * as Select from "@radix-ui/react-select";
import { cn } from "@/lib/utils";

type FormSelectProps<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  rules?: object;
  errors?: FieldErrors<T>;
  options: { value: string; label: string }[];
  placeholder?: string;
  requiredMark?: boolean;
  className?: string;
  control?: Control<T>;
};

export const FormSelect = <T extends FieldValues>({
  label,
  name,
  register,
  rules,
  errors,
  options,
  placeholder = "Select",
  requiredMark = false,
  className = "",
  control,
}: FormSelectProps<T>) => {
  const error = errors?.[name];
  const [open, setOpen] = useState(false);

  // Use useController if control is provided, otherwise use register
  const controller = control ? useController({
    name,
    control,
    rules,
  }) : null;

  // Access form context to read defaultValues/current values when not using controller
  const formContext = useFormContext<T>();
  const initialValue = (controller?.field.value ?? formContext?.getValues?.(name as any) ?? "") as string;
  const [value, setValue] = useState<string>(initialValue);

  // Update local state when controller value changes
  useEffect(() => {
    if (controller?.field.value !== undefined) {
      setValue(controller.field.value);
    }
  }, [controller?.field.value]);

  // When not using controller, keep value in sync with form defaultValues and external changes
  useEffect(() => {
    if (!controller && formContext) {
      const current = formContext.getValues(name as any) as unknown as string | undefined;
      if (current !== undefined) setValue(current);

      const subscription = formContext.watch((_, info) => {
        if (!info?.name || info.name === (name as string)) {
          const nextVal = formContext.getValues(name as any) as unknown as string | undefined;
          if (nextVal !== undefined) setValue(nextVal);
        }
      });
      return () => {
        if (subscription && typeof (subscription as any).unsubscribe === "function") (subscription as any).unsubscribe();
      };
    }
  }, [controller, formContext, name]);

  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    if (controller) {
      controller.field.onChange(newValue);
    } else {
      // Fallback to register approach
      // Ensure field is registered and update form state
      register(name, rules);
      formContext?.setValue?.(name as any, newValue as any, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    }
  };

  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-neutral-500 text-left mb-1"
      >
        {label}
      </label>
      <div className="relative flex items-center">
        <Select.Root value={value} onValueChange={handleValueChange} onOpenChange={setOpen}>
          <Select.Trigger
            className={cn(
              "cursor-pointer disabled:pointer-events-none text-black w-full p-2 sm:p-2.5 pr-10 border rounded-full text-sm !bg-neutral-25 appearance-none flex items-center justify-between",
              error ? "border-red-500 focus:border-red-500" : "border-neutral-100",
              className
            )}
          >
            <Select.Value placeholder={placeholder} />
            <Select.Icon className="h-4 w-4 text-neutral-500">
              {open ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Select.Icon>
          </Select.Trigger>

          <Select.Portal>
            <Select.Content
              className="min-w-[var(--radix-select-trigger-width)] w-[var(--radix-select-trigger-width)] bg-white rounded-xl text-gray-900 shadow-lg overflow-hidden"
              style={{ zIndex: 9999 }}
              position="popper"
              sideOffset={4}
              align="start"
            >
              <Select.ScrollUpButton className="flex items-center justify-center text-gray-500 py-1">
                <ChevronUp className="h-4 w-4" />
              </Select.ScrollUpButton>

              <Select.Viewport className="p-1">
                {options.map((opt) => (
                  <Select.Item
                    key={opt.value}
                    value={opt.value}
                    className="text-sm px-3 py-2 rounded-md flex items-center justify-between cursor-pointer font-normal text-black hover:bg-neutral-50 focus:outline-none focus:ring-0 focus:border-0"
                  >
                    <span className="flex items-center space-x-2">
                      <Select.ItemText>{opt.label}</Select.ItemText>
                    </span>
                    <Select.ItemIndicator className="flex-shrink-0 ml-2">
                      <Check className="h-4 w-4 text-black" />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Viewport>

              <Select.ScrollDownButton className="flex items-center justify-center text-gray-500 py-1">
                <ChevronDown className="h-4 w-4" />
              </Select.ScrollDownButton>
            </Select.Content>
          </Select.Portal>
        </Select.Root>

        {requiredMark && <span className="absolute right-8 text-neutral-500 text-sm">*</span>}
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-500">{`${error.message}` || "Invalid selection"}</p>
      )}
    </div>
  );
};
