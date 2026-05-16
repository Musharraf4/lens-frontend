import React, { ReactNode } from "react";

export type Tab<Key extends string = string> = {
  key: Key;
  label: string;
  icon?: string | ReactNode;
};

type Props<Key extends string> = {
  tabs: Tab<Key>[];
  metric: Key;
  onTabChange: (tab: Key) => void;
  disbaled?: boolean;
};

const DynamicTabs = <Key extends string>({
  tabs,
  metric,
  onTabChange,
  disbaled
}: Props<Key>) => {
  const btnClass = (tabKey: Key) =>
    [
      "flex flex-1 items-center gap-1 px-1 md:px-4 py-0.5 sm:py-2 text-xs md:text-sm rounded-full transition-colors duration-200 whitespace-nowrap",
      metric === tabKey
        ? "bg-white shadow-sm text-gray-800"
        : "text-gray-500 hover:text-gray-700"
    ].join(" ");

  return (
    <div className="flex gap-2 w-full mx-auto">
      {tabs.map(({ key, label, icon }) => (
        <button
          key={key}
          className={btnClass(key)}
          onClick={() => onTabChange(key)}
          disabled={disbaled}
          style={{ cursor: disbaled ? "not-allowed" : "pointer", opacity: disbaled ? 0.5 : 1 }}
        >
          {metric === key && icon && (
            <>
              {typeof icon === "string" ? (
                <img src={icon} alt={`${label} Icon`} className="h-3 w-3" />
              ) : (
                icon
              )}
            </>
          )}
          {label}
        </button>
      ))}
    </div>

  );
};

export default DynamicTabs;
