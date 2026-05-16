// stores/company.store.ts
import { CompanyType } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type SelectedCompanyStore = {
  selectedCompany: CompanyType | null;
  setSelectedCompany: (company: CompanyType | null) => void;
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
};

export const useSelectedCompanyStore = create<SelectedCompanyStore>()(
  persist(
    (set) => ({
      selectedCompany: null,
      hasHydrated: false,
      setSelectedCompany: (company) => set({ selectedCompany: company }),
      setHasHydrated: (state) => set({ hasHydrated: state }),
    }),
    {
      name: "selected_company",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
