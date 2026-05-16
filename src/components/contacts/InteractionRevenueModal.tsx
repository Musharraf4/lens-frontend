"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BiDollar } from "react-icons/bi";
import { useSelectedCompanyStore } from "@/store/SelectedCompany";
import { useUpdateIntractionRevenue } from "@/services/activity.api";

type LeadType = "lead" | "deal";
interface InteractionRevenueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interactionId: string;
  currentRevenue: number | string | null;
  currentType: string | null;
  intractionType: string | null;
}

const InteractionRevenueModal: React.FC<InteractionRevenueModalProps> = ({
  open,
  onOpenChange,
  interactionId,
  currentRevenue,
  currentType,
  intractionType,
}) => {
  const { selectedCompany } = useSelectedCompanyStore();
  const [revenue, setRevenue] = useState<string>("");
  const [activeTab, setActiveTab] = useState<LeadType>(
    (currentType?.toLowerCase() as LeadType) || "lead"
  );
  const [isLoading, setIsLoading] = useState(false);
  const updateRevenue = useUpdateIntractionRevenue();

  // Initialize form data when modal opens
  useEffect(() => {
    if (open) {
      setRevenue(currentRevenue ? String(currentRevenue) : "");
      setActiveTab(currentType === "deal" ? "deal" : "lead");
    }
  }, [open, currentRevenue, currentType]);

  const handleSave = async () => {
    if (!revenue || isNaN(Number(revenue))) {
      return;
    }

    setIsLoading(true);

    try {
      await updateRevenue.mutateAsync({
        intractionId: interactionId,
        company_id: selectedCompany?.company?.id ?? "",
        contactType: activeTab?.toUpperCase(),
        revenue: Number(revenue),
        intraction_type: intractionType ?? "",
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Error updating revenue:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and decimal point
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setRevenue(value);
    }
  };

  useEffect(() => {
    if (currentType?.toLowerCase()) {
      setActiveTab(currentType?.toLowerCase() as LeadType);
    }
  }, [currentType]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-black">
            Update Revenue
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contact Type Toggle */}
          <div className="space-y-3 flex items-center justify-between mx-0 my-auto">
            <label className="block text-sm font-medium text-neutral-600">
              Contact Type
            </label>
            <button
              onClick={() =>
                setActiveTab(activeTab === "lead" ? "deal" : "lead")
              }
              className={`relative inline-flex h-7 w-20 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${activeTab === "lead" ? "bg-black" : "bg-gray-300"
                }`}
            >
              <span
                className={`absolute left-1 pl-2 top-1/2 transform -translate-y-1/2 text-xs font-medium transition-colors ${activeTab === "deal" ? "text-gray-600" : "text-white"
                  }`}
              >
                {activeTab === 'deal' ? '' : 'Lead'}
              </span>
              <span
                className={`inline-block h-[22px] w-[30px] transform rounded-full bg-white transition-transform ${activeTab === "lead" ? "translate-x-12" : "translate-x-1"
                  }`}
              />
              <span
                className={`absolute pr-2 right-1 top-1/2 transform -translate-y-1/2 text-xs font-medium transition-colors ${activeTab === "lead" ? "text-white" : "text-gray-600"
                  }`}
              >
                {activeTab === 'lead' ? '' : 'Case'}
              </span>
            </button>
          </div>

          {/* Revenue Input */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-neutral-600">
              Revenue Amount
            </label>
            <div className="relative">
              <BiDollar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type="text"
                placeholder="0.00"
                value={revenue}
                onChange={handleRevenueChange}
                className="w-full pl-8 pr-3 py-2.5 text-sm border border-neutral-100 rounded-full bg-neutral-25 focus:border-neutral-300 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-neutral-100">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="px-6 py-2 rounded-full"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || !revenue || isNaN(Number(revenue))}
            className="px-6 py-2 rounded-full bg-black hover:bg-neutral-50 text-white disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InteractionRevenueModal;
