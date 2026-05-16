"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import { Tabs } from "@/components/Tabs";
import { Button } from "@/components/ui/button";
import AgencyCard from "@/components/accounts/AgencyList";
import AwaitingInviteApproval from "./AwaitingInviteApproval";
import { CreateClientModal } from "./CreateClientModal";
import { ExistingAccountModal } from "./ExistingAccountModal";
import { useSelectedCompanyStore } from "@/store/SelectedCompany";
import { useAuth } from "@/store/AuthContext";
import { AiFillLock } from "react-icons/ai";
import { Skeleton } from "../ui/skeleton";

export function AccountsContainer() {
  const router = useRouter();
  const { selectedCompany } = useSelectedCompanyStore();
  const { user, changeCompanyLoading, setChangeCompanyLoading } = useAuth();

  const searchParams = useSearchParams();
  const awaitingApproval = searchParams.get("awaiting-approval");
  const [activeTab, setActiveTab] = useState(awaitingApproval ? "await" : "active");
  const [hasAccounts, setHasAccounts] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [navigateLoading, setNavigateLoading] = useState(false);
  const [openExistingAccountModal, setOpenExistingAccountModal] =
    useState(false);

  const tabOptions = [
    { label: "Active", value: "active" },
    { label: "Trial", value: "trial" },
    { label: "Past Due", value: "past" },
    { label: "Paused", value: "paused" },
    { label: "Awaiting Invite Approval", value: "await" },
  ];

  // const handleToggleAccounts = () => {
  //   if (hasAccounts) {
  //     setHasAccounts(false);
  //     setIsLoading(false);
  //   } else {
  //     setHasAccounts(true);
  //     setIsLoading(true);
  //   }
  // };

  const handleNavigateLoading = (loading: boolean) => {
    setNavigateLoading(loading);
  }
  // useEffect(() => {
  //   if (hasAccounts && isLoading) {
  //     const timer = setTimeout(() => {
  //       setIsLoading(false);
  //     }, 1000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [hasAccounts, isLoading]);
  useEffect(() => {
    if (awaitingApproval) {
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete("awaiting-approval");
        const queryString = url.searchParams.toString();
        router.replace(queryString ? `${url.pathname}?${queryString}` : url.pathname);
      } catch { }
    }
  }, [searchParams, user?.email]);
  if (navigateLoading || changeCompanyLoading) {
    return (
      <Skeleton className="w-full h-96" />
    )
  }

  if (user?.master_agency_id !== selectedCompany?.company?.id) {
    return (
      <div className="min-h-screen">
        <main>
          {" "}
          <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <div className="flex items-center flex-col text-center p-6 bg-white rounded-lg shadow-lg max-w-xs w-full">
              <AiFillLock className="text-4xl text-red-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-800">
                Access Denied
              </h2>
              <p className="mt-2 text-gray-600">
                You do not have permission to view this page.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main>
        <div className="my-2 flex flex-row justify-between items-center" data-tour="accounts-page-header">
          <div>
            <PageHeader title="Accounts Center" />
            <p className="text-[#707889] font-light text-sm">
              Manage all your clients in one place with seamless switching and
              independent billing.
            </p>
          </div>
        </div>
        <div className="my-4 ml-0 flex flex-wrap justify-between gap-2">
          <div data-tour="accounts-tabs">
            <Tabs
              tabs={tabOptions}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-end flex-1">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setOpenExistingAccountModal(true)}
              className="rounded-full border border-[#B5BAC4]"
              data-tour="accounts-add-existing-button"
            >
              Add existing account
            </Button>
            {openExistingAccountModal && (
              <ExistingAccountModal
                open={openExistingAccountModal}
                onOpenChange={setOpenExistingAccountModal}
              />
            )}
            <Button
              variant="dark"
              size="lg"
              className="rounded-full text-sm"
              onClick={() => setOpen(true)}
              data-tour="accounts-create-new-button"
            >
              Create new account
            </Button>
            {open && (
              <CreateClientModal open={open} onOpenChange={setOpen} />
            )}
          </div>
        </div>
        <div className="py-4" >
          {hasAccounts ? (
            activeTab === "await" ? (
              <AwaitingInviteApproval />
            ) : (
              <AgencyCard activeTab={activeTab} setActiveTab={setActiveTab} isLoading={isLoading} handleNavigateLoading={handleNavigateLoading} />
            )
          ) : (
            <div className="flex justify-center flex-col" data-tour="accounts-empty-state">
              <img
                src="/assets/accounts/empty-account.svg"
                alt="Empty accounts"
              />
              <p className="text-center text-2xl font-semibold py-4 text-black">
                You haven't added any Client Accounts yet
              </p>
              <p className="text-center text-sm text-black/60 font-light">
                Start setting up new client accounts to manage their data,
                campaigns, and integrations in one place.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
