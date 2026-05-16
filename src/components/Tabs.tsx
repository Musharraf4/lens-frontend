import React from "react";

type Tab = {
  label: string;
  value: string;
  count?: number;
  isDisabled?: boolean;
};

type TabsProps = {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (value: string) => void;
  className?: string;
};

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = "",
}) => (
  <div
    className={`flex gap-2 p-1 overflow-x-auto ${className}`}
  >
    {tabs.map((tab) => (
      <button
        key={tab.value}
        className={`
    flex items-center flex-shrink-0 
    px-2 sm:px-4 md:px-6 
    py-1 sm:py-1.5 disabled:pointer-events-none
    rounded-full 
    text-xs sm:text-sm md:text-base 
    ${activeTab === tab.value
            ? "bg-black text-white pointer-events-none"
            : "text-neutral-500 hover:bg-neutral-50"}
    ${tab?.isDisabled ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}
  `}
        onClick={() => onTabChange(tab.value)}
        disabled={tab?.isDisabled ?? false}
      >
        {tab.label}
        {tab.count !== undefined && (
          <span
            className={`ml-1 sm:ml-2 px-1.5 py-0.5 text-[10px] sm:text-[12px] font-medium rounded-full ${activeTab === tab.value
                ? "bg-neutral-800 text-white"
                : "bg-neutral-100 text-black"
              }`}
          >
            {tab.count}
          </span>
        )}
      </button>
    ))}
  </div>
);
