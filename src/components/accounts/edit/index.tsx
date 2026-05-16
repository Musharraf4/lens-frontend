"use client";

import { useApp } from "@/store/appStore";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { FC, useState } from "react";
import { ClientGeneralInformation } from "./GeneralInformation";
import { ClientPlanAndPayment } from "./planAndPayment.tsx";
import { ClientUsers } from "./users";
import { CompanyDetail, CompanyUser } from "@/types";
import { useGetSingleCompanyDetail } from "@/services/home.api";
import { Skeleton } from "@/components/ui/skeleton";

type EditClientFormProps = {
  setShowEditForm: (open: null) => void;
  userDetails: CompanyDetail;
};

type SectionKey = "general" | "users" | "payment" | null;

export const EditClientForm: FC<EditClientFormProps> = ({ setShowEditForm, userDetails }) => {
  const { sidebarOpen } = useApp();
  const [openSection, setOpenSection] = useState<SectionKey>("general");
  const { data: userData, isLoading: isCompanyDetailsLoading } = useGetSingleCompanyDetail(userDetails?.id);
  const { data: companyDetails } = userData || {};
  const toggleSection = (section: SectionKey) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  return (
    <div
      className={`bg-neutral-25 h-screen absolute top-0 right-0 z-50 w-full p-3 overflow-y-auto
    ${sidebarOpen ? "md:[width:calc(100%_-_256px)]" : "md:[width:calc(100%_-_65px)]"}`}
    >
      {/* Header */}
      <div className="flex justify-between flex-col sm:flex-row gap-2 mb-4">
        <div className="flex items-center gap-2">
          <X
            onClick={() => setShowEditForm(null)}
            className="cursor-pointer"
          />
          <h4 className="text-2xl text-black font-semibold">Edit of {userDetails?.name}</h4>
        </div>
      </div>

      <div className="space-y-4">
        {/* General Information */}
        <div className="bg-white p-3 rounded-2xl">
          <div
            onClick={() => toggleSection("general")}
            className="w-full flex justify-between items-center py-3 font-semibold text-black cursor-pointer"
          >
            <div className="flex gap-2">
              <div>
                <small className="rounded-full px-2 py-1 bg-neutral-300/30 font-semibold">1</small>
              </div>
              <p className="text-black font-semibold">General Information</p>
            </div>
            {openSection === "general" ? <ChevronUp /> : <ChevronDown />}
          </div>

          <div
            className={`transition-all duration-300 overflow-hidden ${openSection === "general" ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
              }`}
          >
            {isCompanyDetailsLoading ? <Skeleton className="w-full h-72" /> : <ClientGeneralInformation companyDetails={companyDetails} setShowEditForm={setShowEditForm} />}
          </div>
        </div>

        {/* Users*/}
        <div className="bg-white p-3 rounded-2xl">
          <div
            onClick={() => toggleSection("users")}
            className="w-full flex justify-between items-center py-3 font-semibold text-black cursor-pointer"
          >
            <div className="flex gap-2">
              <div>
                <small className="rounded-full px-2 py-1 bg-neutral-300/30 font-semibold">2</small>
              </div>
              <p className="text-black font-semibold">Users</p>
            </div>
            {openSection === "users" ? <ChevronUp /> : <ChevronDown />}
          </div>

          <div
            className={`transition-all duration-300 overflow-hidden ${openSection === "users" ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
              }`}
          >
            {isCompanyDetailsLoading ? <Skeleton className="w-full h-72" /> : <ClientUsers users={companyDetails?.users as CompanyUser[]} companyId={userDetails?.id} />}

          </div>
        </div>

        {/* Plan & Payment */}

        <div className="bg-white p-3 rounded-2xl">
          <div
            onClick={() => toggleSection("payment")}
            className="w-full flex justify-between items-center py-3 font-semibold text-black cursor-pointer"
          >
            <div className="flex gap-2">
              <div>
                <small className="rounded-full px-2 py-1 bg-neutral-300/30 font-semibold">3</small>
              </div>
              <p className="text-black font-semibold">Plan & Payment</p>
            </div>
            {openSection === "payment" ? <ChevronUp /> : <ChevronDown />}
          </div>

          <div
            className={`transition-all duration-300 overflow-hidden ${openSection === "payment" ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
              }`}
          >
            <ClientPlanAndPayment companyId={userDetails?.id} paymentDetails={companyDetails?.billing} />
          </div>
        </div>
      </div>
    </div>
  );
};
