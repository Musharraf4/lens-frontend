"use client";

import PageHeader from "@/components/PageHeader";
import { Tabs } from "@/components/Tabs";
import CreateNumberModal from "@/components/tracking/CreateNumberModal";
import EditNumberModal from "@/components/tracking/EditNumberModal";
import FormTab from "@/components/tracking/form-tab/FormTab";
import NumberPoolTable from "@/components/tracking/NumberPoolTable";
import { TrackingTable } from "@/components/tracking/TrackingTable";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { usePhoneNumbers } from "@/services/phoneNumbers.api";
import { useApp } from "@/store/appStore";
import { useNumberContext } from "@/store/CreateNumberContext";
import { EditNumberProvider } from "@/store/EditNumberContext";
import { useSelectedCompanyStore } from "@/store/SelectedCompany";
import { useState } from "react";
import { IoArrowBack } from 'react-icons/io5';
import { Role } from "@/enums";
import { usePlanUsage } from "@/store/PlanUsageContext";
import TooltipWrapper from "@/components/ui/TooltipWrapper";

export default function TrackingPage() {
  const { data: planUsageData, isLoading: isPlanLoading } = usePlanUsage();
  const { createNumberModalOpen, setCreateNumberModalOpen } = useNumberContext();
  const { editNumberModalOpen, setEditNumberModalOpen } = useApp();
  const [activeTab, setActiveTab] = useState("numbers");
  const [numberPoolTableId, setNumberPoolTableId] = useState<{ name: string; id: string } | null>(
    null
  );
  const [selectedNumberId, setSelectedNumberId] = useState<string | null>(null);
  const { selectedCompany } = useSelectedCompanyStore();
  const disableAction = selectedCompany?.role === Role.Viewer

  const isTrackingNumbersLimitReached = planUsageData && planUsageData.allowed && !planUsageData.allowed.tracking_numbers;
  // Get API data to find the record to edit
  const { data: trackingDataAPI } = usePhoneNumbers({
    page: 1,
    size: 10,
    company_id: selectedCompany?.company?.id,
  });

  const tabOptions = [
    { label: "Numbers", value: "numbers" },
    { label: "Forms", value: "forms" },
    { label: "Chats", value: "chats" },
  ];

  // Find the record to edit from API data
  const recordToEdit = trackingDataAPI?.items?.find(
    (rec: any) => String(rec.id) === String(selectedNumberId)
  );
  const initialType = recordToEdit?.pool_type;

  const handleEditNumber = (id: string) => {
    setSelectedNumberId(id);
    setEditNumberModalOpen(true);
  };

  const handleCloseEditModal = (open: boolean) => {
    setEditNumberModalOpen(open);
    if (!open) {
      setSelectedNumberId(null);
    }
  };

  return (
    <>
      {createNumberModalOpen ? (
        <CreateNumberModal />
      ) : (
        <div>
          {!!numberPoolTableId && (
            <div className='flex gap-1 items-start'>
              <button className='mt-0.5' onClick={() => setNumberPoolTableId(null)}>
                <IoArrowBack />
              </button>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage
                      className="text-gray-500 cursor-pointer"

                    >
                      {"Phone Numbers"}
                    </BreadcrumbPage>
                    <BreadcrumbSeparator />
                    <BreadcrumbPage className="text-black">
                      {numberPoolTableId.name || ""}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          )}
          <PageHeader
            title="Phone Numbers"
            description="Let's track and manage your calls, forms, and chats."
            data-tour="tracking-page-header"
          />

          <div className="flex w-full justify-between items-center flex-wrap gap-3 mt-4">
            <div data-tour="tracking-tabs">
              <Tabs
                tabs={tabOptions}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </div>
            {!disableAction && (
              <div className="ml-auto" data-tour="create-number-button">
                <TooltipWrapper message='You have reached your tracking numbers limit.' show={Boolean(isTrackingNumbersLimitReached)}>
                  <Button
                    className="rounded-full"
                    onClick={() => setCreateNumberModalOpen(true)}
                    disabled={isPlanLoading || isTrackingNumbersLimitReached}
                  >
                    Create Number
                  </Button>
                </TooltipWrapper>
              </div>
            )}
          </div>

          <div className="mt-4">
            {activeTab === "numbers" &&
              (!!numberPoolTableId ? (
                <div className="mt-4">
                  <NumberPoolTable numberPoolTableId={numberPoolTableId.id} />
                </div>
              ) : (
                <div data-tour={trackingDataAPI?.items && trackingDataAPI.items.length > 0 ? "tracking-table" : "tracking-empty-state"}>
                  <TrackingTable
                    onEditNumber={handleEditNumber}
                    setNumberPoolTableId={setNumberPoolTableId}
                  />
                </div>
              ))}
            {activeTab === "forms" && <FormTab />}
            {activeTab === "chats" && <p>Chats</p>}
          </div>
        </div>
      )}
      {editNumberModalOpen && selectedNumberId && (
        <EditNumberProvider
          initialType={initialType}
          initialNumberId={selectedNumberId}
        >
          <EditNumberModal
            open={editNumberModalOpen}
            onOpenChange={handleCloseEditModal}
          />
        </EditNumberProvider>
      )}
    </>
  );
}
