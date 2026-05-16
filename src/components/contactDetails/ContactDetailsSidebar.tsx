"use client";

import React, { useEffect, useState, useRef } from "react";
import TextWithCopy from "../TextWithCopy";
import { Dropdown } from "../Dropdown";
import { CiGlobe } from "react-icons/ci";
import { IoCallOutline } from "react-icons/io5";
import ReviewCard from "../ReviewCard";
import {
  useUpdateContactJobType,
  ICallTracking,
  IFormTracking,
  useUpdateContactRevenue,
} from "@/services/contacts.api";
import { useSelectedCompanyStore } from "@/store/SelectedCompany";
import RevenueModal from "./RevenueModal";
import UserLocationMap from "./GoogleMapContainer";
import { useSearchParams } from "next/navigation";
import { Input } from "../ui/input";
import { formatPhoneNumberUniversal } from "@/lib/utils";
import { CURRENCY_SYMBOL } from "@/constants";
import { Role } from "@/enums";
import TooltipWrapper from "../ui/TooltipWrapper";
import { ContactDetailsSidebarSkeleton } from "../home/Skeleton";
import { showToast } from "../Toast";

interface ContactDetailsSidebarProps {
  phone: string;
  website: string;
  location: string;
  revenue: number;
  review: {
    rating: number;
    text: string;
    date: string;
    reviewer: string;
  };
  jobType: string;
  latitude?: number;
  longitude?: number;
  isLoading?: boolean;
  contactId: string;
  callTracking?: ICallTracking[];
  formTracking?: IFormTracking[];
  contactType: string;
  sessionIPAddress: string;
}
const JOB_TYPES = [
  { id: "full-time", option: "Full Time" },
  { id: "part-time", option: "Part Time" },
  { id: "contract", option: "Contract" },
  { id: "temporary", option: "Temporary" },
  { id: "internship", option: "Internship" },
  { id: "volunteer", option: "Volunteer" },
  { id: "other", option: "Other" },
];
const ContactDetailsSidebar: React.FC<ContactDetailsSidebarProps> = ({
  phone,
  website,
  location,
  revenue,
  review,
  jobType,
  isLoading,
  contactId,
  callTracking = [],
  formTracking = [],
  contactType,
  sessionIPAddress,
}) => {
  const [revenueValue, setRevenueValue] = useState<string>(
    revenue?.toString() || ""
  );
  const [debouncedValue, setDebouncedValue] = useState<number | null>(
    revenue ?? null
  );
  const isInitialMount = useRef(true);
  const hasUserInteracted = useRef(false);
  const hasShownRevenueLimitToast = useRef(false);
  const searchParams = useSearchParams();
  const showRevenewModal = searchParams.get("showRevenewModal");
  const { selectedCompany } = useSelectedCompanyStore();
  const updateRevenue = useUpdateContactRevenue();

  const updateJobMutation = useUpdateContactJobType();
  const [selectedJob, setSelectedJob] = useState(
    jobType || JOB_TYPES[0].option
  );
  const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(
    showRevenewModal ? true : false
  );

  useEffect(() => {
    if (jobType) {
      setSelectedJob(jobType);
    }
  }, [jobType]);
  useEffect(() => {
    // Skip on initial mount or if user hasn't interacted
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!hasUserInteracted.current) {
      return;
    }

    const handler = setTimeout(() => {
      if (debouncedValue !== null && debouncedValue !== revenue) {
        updateRevenue.mutate({
          contactId,
          company_id: selectedCompany?.company?.id ?? "",
          revenue: debouncedValue,
        });
      }
    }, 1000); // 1s delay

    return () => clearTimeout(handler);
  }, [debouncedValue, revenue, contactId, selectedCompany?.company?.id]);

  useEffect(() => {
    if (!isLoading) setRevenueValue((revenue as unknown as string) || "");
  }, [isLoading]);

  if (isLoading) {
    return <ContactDetailsSidebarSkeleton />;
  }
  const disabledEdit = selectedCompany?.role === Role.Viewer;
  const tooltipDisableMessage = disabledEdit
    ? "You need to be an Admin or Editor to make changes."
    : "";
  return (
    <aside className="w-full bg-white rounded-2xl p-6 shadow">
      <div className="flex flex-col gap-6">
        {/* Job type */}
        <TooltipWrapper
          message={tooltipDisableMessage}
          show={Boolean(disabledEdit)}
        >
          <Dropdown
            options={JOB_TYPES}
            value={selectedJob}
            onChange={(value) => {
              updateJobMutation.mutate({
                contactId,
                company_id: selectedCompany?.company?.id ?? "",
                job_type: value as string,
              });
              setSelectedJob(value as string);
            }}
            label="Job type"
            width="w-full"
            disabled={disabledEdit}
          />
        </TooltipWrapper>
        <TooltipWrapper
          message={tooltipDisableMessage}
          show={Boolean(disabledEdit)}
        >
          <Input
            placeholder="Revenue"
            icon={CURRENCY_SYMBOL}
            label="Revenue"
            type="text" // Use text instead of number
            value={revenueValue}
            onChange={(e) => {
              let input = e.target.value;

              const digitCount = input.replace(/\D/g, "").length;
              if (digitCount > 6) {
                if (!hasShownRevenueLimitToast.current) {
                  showToast({
                    title: "Revenue limit reached",
                    description: "Revenue cannot exceed 6 digits.",
                    type: "warning",
                  });
                  hasShownRevenueLimitToast.current = true;
                }
                return;
              }
              hasShownRevenueLimitToast.current = false;

              // Allow only digits and optional single dot
              if (!/^\d*\.?\d*$/.test(input)) return;

              // Remove leading zeros (unless it's decimal like "0.5")
              if (/^0\d+/.test(input)) {
                input = input.replace(/^0+/, "");
              }
              setRevenueValue(input);
              const numericValue = input === "" ? null : Number(input);
              hasUserInteracted.current = true;
              setDebouncedValue(numericValue);
            }}
            disabled={disabledEdit}
          />
        </TooltipWrapper>

        {/* Contact Info */}
        <div className="flex justify-between">
          <div className="flex items-center gap-2 text-neutral-600 break-all overflow-wrap-anywhere">
            <IoCallOutline className="w-5 h-5" />
            <span>{phone ? formatPhoneNumberUniversal(phone) : 'No phone provided'}</span>
          </div>
          {phone && (
            <TextWithCopy
              text={phone}
              showText={false}
              toastTitle="The phone number has been copied to your clipboard"
              toastDescription="You can paste it wherever needed."
            />
          )}
        </div>
        <div className="flex items-center gap-2 text-neutral-600">
          <CiGlobe className="w-5 h-5 flex-shrink-0" />
          {website ? (
            <TooltipWrapper message={website} show>
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="underline  truncate max-w-[220px] whitespace-nowrap overflow-hidden text-ellipsis block"
              >
                {website}
              </a>
            </TooltipWrapper>
          ) : (
            <span className="text-neutral-400">No website provided</span>
          )}
        </div>

        {/* Map */}
        <div>
          <UserLocationMap sessionIPAddress={sessionIPAddress} phone={phone} />
        </div>
        {/* Review */}
        <ReviewCard
          title="Contact review"
          rating={4.4}
          date="18.10.2020, 10:02 AM"
          text="Think about when you send your review request — make sure issues are resolved, products have been delivered, and services completed."
          onSeeMore={() => {
            /* expand logic */
          }}
          onGoToReview={() => {
            /* navigation logic */
          }}
        />
      </div>

      {/* Revenue Modal */}
      {isRevenueModalOpen && (
        <RevenueModal
          open={isRevenueModalOpen}
          onOpenChange={setIsRevenueModalOpen}
          callTracking={callTracking}
          formTracking={formTracking}
          contactId={contactId}
          contactType={contactType}
        />
      )}
    </aside>
  );
};

export default ContactDetailsSidebar;
