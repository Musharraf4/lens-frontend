'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BiDollar } from "react-icons/bi";
import { ICallTracking, IFormTracking, useUpdateContactRevenue } from '@/services/contacts.api';
import { useSelectedCompanyStore } from '@/store/SelectedCompany';
import { useRouter, useSearchParams } from "next/navigation";

interface RevenueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  callTracking: ICallTracking[];
  formTracking: IFormTracking[];
  contactId: string
  contactType: string
}

interface RevenueData {
  [key: string]: number;
}

const RevenueModal: React.FC<RevenueModalProps> = ({
  open,
  onOpenChange,
  callTracking,
  formTracking,
  contactId,
  contactType
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedCompany } = useSelectedCompanyStore();
  const [revenues, setRevenues] = useState<RevenueData>({});
  const [activeTab, setActiveTab] = useState(contactType?.toLowerCase() || "lead");
  const removeQueryParam = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("showRevenewModal");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const updateRevenue = useUpdateContactRevenue()
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(',', '');
  };

  // Initialize revenues when modal opens
  useEffect(() => {
    if (open) {
      const initialRevenues: RevenueData = {};

      // Initialize call tracking revenues
      callTracking.forEach((call, index) => {
        const key = `call_${call.id}`;
        initialRevenues[key] = call.revenue || 0;
      });

      // Initialize form tracking revenues
      formTracking.forEach((form, index) => {
        const key = `form_${form.id}`;
        initialRevenues[key] = form.revenue || 0;
      });

      setRevenues(initialRevenues);
    }
  }, [open, callTracking, formTracking]);

  const handleRevenueChange = (key: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setRevenues(prev => ({
      ...prev,
      [key]: numValue
    }));
  };

  const handleSave = () => {
    // Format data as requested
    const formattedData = [] as any;

    // Add call tracking data
    callTracking.forEach((call) => {
      const key = `call_${call.id}`;
      formattedData.push({
        id: call.id,
        revenue: revenues[key] || 0,
        type: "call_tracking"
      });
    });

    // Add form tracking data
    formTracking.forEach((form) => {
      const key = `form_${form.id}`;
      formattedData.push({
        id: form.id,
        revenue: revenues[key] || 0,
        type: "form_tracking"
      });
    });
    // updateRevenue.mutate({ contactId, company_id: selectedCompany?.company?.id ?? '', data: formattedData, contactType: activeTab === 'deal' ? 'DEAL' : activeTab.toUpperCase() }, {
    //   onSuccess: () => {
    //     removeQueryParam();
    //     onOpenChange(false);
    //   },

    // })
  };

  const handleCancel = () => {
    onOpenChange(false);
    removeQueryParam();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        removeQueryParam();
      }
      onOpenChange(isOpen);
    }}>
      <DialogContent style={{ zIndex: 1000 }} className="max-w-2xl max-h-[90vh] overflow-y-auto p-5">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-black">
            Revenue Assignment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className='flex justify-between mx-0 my-auto mb-2'>
            <h3 className="text-black font-semibold text-base leading-6 tracking-[-0.02em]">Contact Type</h3>
            <button
              onClick={() => setActiveTab(activeTab === 'lead' ? 'deal' : 'lead')}
              className={`relative inline-flex h-7 w-20 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${activeTab === 'lead' ? 'bg-black' : 'bg-gray-300'
                }`}
            >
              <span
                className={`absolute left-1 pl-2 top-1/2 transform -translate-y-1/2 text-xs font-medium transition-colors ${activeTab === 'deal' ? 'text-gray-600' : 'text-white'
                  }`}
              >
                {activeTab === 'deal' ? '' : 'Lead'}
              </span>
              <span
                className={`inline-block h-[22px] w-[30px] transform rounded-full bg-white transition-transform ${activeTab === 'lead' ? 'translate-x-12' : 'translate-x-1'
                  }`}
              />
              <span
                className={`absolute right-1 pr-2 top-1/2 transform -translate-y-1/2 text-xs font-medium transition-colors ${activeTab === 'lead' ? 'text-white' : 'text-gray-600'
                  }`}
              >
                {activeTab === 'lead' ? '' : 'Case'}
              </span>
            </button>

          </div>
          {/* Call Tracking Section */}
          {callTracking.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-black mb-4">Call Tracking</h3>
              <div className="space-y-4">
                {callTracking.map((call, index) => {
                  const key = `call_${call.id}`;
                  return (
                    <div key={call.id} className="flex items-center gap-4 p-4 bg-neutral-25 rounded-xl">
                      <div className="flex-1 items-center justify-between">
                        <div className="flex flex-col gap-2">
                          <h3 className="text-black font-semibold text-base leading-6 capitalize tracking-[-0.02em]">{call.direction} Call</h3>

                          <span className="text-xs text-black/60 font-light leading-4 tracking-[-0.03em]">{formatDate(call.updated_at)}</span>
                        </div>
                        {/* <div className="text-xs text-neutral-500">
                          {form.timestamp ? new Date(form.timestamp).toLocaleDateString() : 'No date'} •
                          Type: {form.type}
                        </div> */}
                      </div>
                      <div className="w-32">
                        <div className="relative">
                          <BiDollar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                          <input
                            type="number"
                            placeholder="0.00"
                            value={revenues[key] || ''}
                            onChange={(e) => handleRevenueChange(key, e.target.value)}
                            className="w-full pl-8 pr-3 py-2 text-sm border border-neutral-100 rounded-full bg-white focus:border-neutral-300 focus:outline-none"
                            step="0.01"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Form Tracking Section */}
          {formTracking.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-black mb-4">Form Tracking</h3>
              <div className="space-y-4">
                {formTracking.map((form, index) => {
                  const key = `form_${form.id}`;
                  return (
                    <div key={form.id} className="flex items-center gap-4 p-4 bg-neutral-25 rounded-xl">
                      <div className="flex-1 items-center justify-between">
                        <div className="flex flex-col gap-2">
                          <h3 className="text-black font-semibold text-base leading-6 tracking-[-0.02em]">Form Filled</h3>

                          <span className="text-xs text-black/60 font-light leading-4 tracking-[-0.03em]">{formatDate(form.updated_at)}</span>
                        </div>
                        {/* <div className="text-xs text-neutral-500">
                          {form.timestamp ? new Date(form.timestamp).toLocaleDateString() : 'No date'} •
                          Type: {form.type}
                        </div> */}
                      </div>
                      <div className="w-32">
                        <div className="relative">
                          <BiDollar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                          <input
                            type="number"
                            placeholder="0.00"
                            value={revenues[key] || ''}
                            onChange={(e) => handleRevenueChange(key, e.target.value)}
                            className="w-full pl-8 pr-3 py-2 text-sm border border-neutral-100 rounded-full bg-white focus:border-neutral-300 focus:outline-none"
                            step="0.01"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* No tracking data message */}
          {callTracking.length === 0 && formTracking.length === 0 && (
            <div className="text-center py-8">
              <p className="text-neutral-500">No tracking data available for this contact.</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-neutral-100">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="px-6 py-2 rounded-full"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateRevenue.isPending}
            className="px-6 py-2 rounded-full bg-black hover:bg-neutral-50 text-white"
          >
            {updateRevenue.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RevenueModal;
