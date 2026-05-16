"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

type DateFilterContextValue = {
    timeRange: string;
    setTimeRange: React.Dispatch<React.SetStateAction<string>>;
};

const DateFilterContext = createContext<DateFilterContextValue | undefined>(undefined);

export function DateFilterProvider({ children }: { children: React.ReactNode }) {
    const [timeRange, setTimeRange] = useState<string>("Last 30 Days");

    const value = useMemo<DateFilterContextValue>(() => ({
        timeRange,
        setTimeRange,
    }), [timeRange]);

    return (
        <DateFilterContext.Provider value={value}>
            {children}
        </DateFilterContext.Provider>
    );
}

export function useDateFilter() {
    const ctx = useContext(DateFilterContext);
    if (!ctx) {
        throw new Error("useDateFilter must be used within a DateFilterProvider");
    }
    return ctx;
}










