import React from "react";
import { UseFormRegister, FieldValues, Path, FieldErrors } from "react-hook-form";

type FormInputProps<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  rules?: object;
  type?: string;
  errors?: FieldErrors<T>;
  placeholder?: string;
  requiredMark?: boolean;
  className?: string;
};

export const FormInput = <T extends FieldValues>({
  label,
  name,
  register,
  rules,
  type = "text",
  errors,
  placeholder,
  requiredMark = false,
  className = "",
}: FormInputProps<T>) => {
  const error = errors?.[name];

  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-neutral-500 text-left mb-1"
      >
        {label}
      </label>
      <div className="relative flex items-center">
        <input
          type={type}
          placeholder={placeholder || "Enter"}
          {...register(name, rules)}
          className={`text-black w-full p-2 sm:p-2.5 !pr-8 border rounded-full text-sm bg-neutral-25 ${
            error
              ? "border-red-500 focus:border-red-500"
              : "border-neutral-100 focus:border-neutral-100"
          } ${className}`}
        />
        {requiredMark && <span className="absolute right-3 text-neutral-500 text-sm">*</span>}
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-500">{`${error.message}` || "Invalid input"}</p>
      )}
    </div>
  );
};
