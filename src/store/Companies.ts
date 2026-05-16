// stores/company.store.ts
import { CompanyType } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type CompanyStore = {
  companies: CompanyType[];
  setCompanies: (companies: CompanyType[]) => void;
};

export const useCompaniesStore = create<CompanyStore>()(
  persist(
    (set) => ({
      companies: [],
      setCompanies: (companies) => set({ companies }),
    }),
    {
      name: "companies",
    }
  )
);
