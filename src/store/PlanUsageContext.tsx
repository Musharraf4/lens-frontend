"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useSelectedCompanyStore } from "@/store/SelectedCompany";
import { useCheckPlanUsed } from "@/services/user.api";
import { PlansUserResponse } from "@/types";

type PlanUsageContextValue = {
    data?: PlansUserResponse;
    isLoading: boolean;
    isFetching: boolean;
    error: unknown;
    refetch: () => void;
    companyId: string | null;
};

const PlanUsageContext = createContext<PlanUsageContextValue | undefined>(undefined);

export function PlanUsageProvider({ children }: { children: React.ReactNode }) {
    const { selectedCompany } = useSelectedCompanyStore();
    const companyId = selectedCompany?.company?.id ?? null;

    const {
        data,
        isLoading,
        isFetching,
        error,
        refetch,
    } = useCheckPlanUsed(companyId ?? "");

    // Normalize axios response shape if needed (api.get returns AxiosResponse)
    const value = useMemo<PlanUsageContextValue>(() => ({
        data,
        isLoading,
        isFetching,
        error,
        refetch: () => { void refetch(); },
        companyId,
    }), [data, isLoading, isFetching, error, refetch, companyId]);

    return (
        <PlanUsageContext.Provider value={value}>
            {children}
        </PlanUsageContext.Provider>
    );
}

export function usePlanUsage() {
    const ctx = useContext(PlanUsageContext);
    if (!ctx) {
        throw new Error("usePlanUsage must be used within a PlanUsageProvider");
    }
    return ctx;
}


