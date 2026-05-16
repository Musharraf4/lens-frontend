"use client";

import { ToggleButtonProps } from "@/types";
import { useCallback, useEffect, useState } from "react";

export function ToggleButton({ options, selectedOption, onSelect }: ToggleButtonProps) {
    const [isMobile, setIsMobile] = useState(false);
    const checkScreenSize = useCallback(() => {
      const width = window.innerWidth;
      setIsMobile(width < 640);
    }, []);
   useEffect(()=>{
    checkScreenSize();
    // Listen for resize events
    window.addEventListener("resize", checkScreenSize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, [checkScreenSize]);

  return (
    <div className="w-fit border border-neutral-50 rounded-full flex bg-white">
      {options.map(({ label, icon }, index) => (
        <button
          key={index}
          className={`flex  items-center gap-1 px-2 cursor-pointer py-1 text-sm rounded-full ${
            selectedOption === label
              ? "text-black border border-neutral-100 bg-neutral-25"
              : "text-neutral-500"
          }`}
          onClick={() => onSelect(label)}
        >
          {selectedOption === label && (
            <>
            {typeof icon === "string" ? <img src={icon} alt="icon" className="w-3 h-3" /> : icon}
            </>
          )}
          {!isMobile && label}
        </button>
      ))}
    </div>
  );
}
