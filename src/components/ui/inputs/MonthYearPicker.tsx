"use client";

import { FC, useState, useRef, useEffect } from "react";
import { Controller } from "react-hook-form";
import { Calendar } from "lucide-react";

type MonthYearPickerProps = {
  name: string;
  label?: string;
  control: any;
  errors?: Record<string, any>;
};

export const MonthYearPicker: FC<MonthYearPickerProps> = ({
  name,
  label,
  control,
  errors,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 15 }, (_, i) => currentYear + i);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      {label && (
        <label className="block text-sm font-medium text-[#707889] text-left mb-1">
          {label}
        </label>
      )}

      <Controller
        name={name}
        control={control}
        // rules={{
        //   required: "Expiration date is required",
         
        // }}
        render={({ field }) => {
          const handleDateSelect = (month: number, year: number) => {
            if (!month || !year) return;
            const monthStr = String(month).padStart(2, "0");
            const yearStr = String(year).slice(-2);
            field.onChange(`${monthStr}/${yearStr}`);
            setIsOpen(false);
          };

          return (
            <>
              <button
                type="button"
                className={`
                  w-full p-2 sm:p-2.5 pr-10 border rounded-full text-sm cursor-pointer flex items-center justify-between relative
                  ${errors?.[name] ? "border-red-500" : "border-neutral-100"}
                  ${field.value ? "text-black" : "text-neutral-200"}
                `}
                onClick={() => setIsOpen((prev) => !prev)}
              >
                <span>{field.value || "MM/YY"}</span>
                <Calendar
                  className={`
                    absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4
                    ${errors?.[name] ? "text-red-500" : "text-black"}
                  `}
                />
              </button>

              {isOpen && (
                <div className="absolute mt-2 bg-white p-4 rounded-lg shadow-lg border border-neutral-100 w-64 z-50">
                  <div className="flex gap-2">
                    {/* Month Select */}
                    <select
                      className="w-1/2 p-2 border border-neutral-100 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      onChange={(e) => {
                        const month = parseInt(e.target.value);
                        const year = field.value
                          ? parseInt(field.value.split("/")[1]) + 2000
                          : currentYear;
                        handleDateSelect(month, year);
                      }}
                      value={field.value ? parseInt(field.value.split("/")[0]) : ""}
                    >
                      <option value="">Month</option>
                      {months.map((m) => (
                        <option key={m} value={m}>
                          {m.toString().padStart(2, "0")}
                        </option>
                      ))}
                    </select>

                    {/* Year Select */}
                    <select
                      className="w-1/2 p-2 border border-neutral-100 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      onChange={(e) => {
                        const year = parseInt(e.target.value);
                        const month = field.value
                          ? parseInt(field.value.split("/")[0])
                          : 1;
                        handleDateSelect(month, year);
                      }}
                      value={field.value ? parseInt(field.value.split("/")[1]) + 2000 : ""}
                    >
                      <option value="">Year</option>
                      {years.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </>
          );
        }}
      />

      {errors?.[name] && (
        <p className="text-red-500 text-xs mt-1">{errors[name]?.message}</p>
      )}
    </div>
  );
};
