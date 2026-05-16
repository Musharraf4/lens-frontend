"use client";

import { Dropdown } from "@/components/Dropdown";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomerIdsForAll } from "@/services/googleAds.api";
import {
  useDisconnectIntegrationConfig,
  useIntegrationConfigCustomerIds,
  useUpdateIntegrationConfig,
  useUpdatePrimaryConnection,
} from "@/services/integrationsConfig.api";
import { useAuth } from "@/store/AuthContext";
import { useIntegrationContext } from "@/store/IntegrationContext";
import { useSelectedCompanyStore } from "@/store/SelectedCompany";
import { Search, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { CiSettings } from "react-icons/ci";
import { LuUnlink } from "react-icons/lu";
import { useProviderLogin } from "../../services/auth.api";
import { showToast } from "../Toast";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Role } from "@/enums";
import { usePlanUsage } from "@/store/PlanUsageContext";
import TooltipWrapper from "../ui/TooltipWrapper";
import IntegrationSettings from "./IntegrationSettings";
import { useGetGdsSettings, useUpdateGadsSettings, GAdsSettingsPayload } from "@/services/integrations.api";
import { MdVerifiedUser } from "react-icons/md";
import { FaUserCheck } from "react-icons/fa";

interface ActionButton {
  icon: React.ReactNode;
  name: string;
  onClick?: () => void;
}

interface SupportLink {
  name: string;
  href: string;
}

interface IntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionButtons: ActionButton[];
  supportLinks: SupportLink[];
}

const IntegrationModal: React.FC<IntegrationModalProps> = ({
  isOpen,
  onClose,
  actionButtons,
  supportLinks,
}) => {
  const { data: planUsageData, isLoading: isPlanLoading } = usePlanUsage();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedManagerId, setSelectedManagerId] = useState<string>("");
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [popoverOpen, setPopoverOpen] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [copied, setCopied] = useState(false);
  const [searchCustomerInput, setSearchCustomerInput] = useState("");
  const [updatingSettingKey, setUpdatingSettingKey] = useState<keyof GAdsSettingsPayload | null>(null);

  const scriptRef = useRef<HTMLParagraphElement>(null);
  const hasCheckedPrimaryRef = useRef<string | null>(null);

  const providerLoginMutation = useProviderLogin();
  const { refreshIntegrations, selectedIntegration } = useIntegrationContext();
  const { user } = useAuth();
  const { selectedCompany } = useSelectedCompanyStore();
  const isNotAdmin = ((selectedCompany?.role !== Role.Admin) && (selectedCompany?.role !== Role.Owner));
  const [selctedConfigId, setSelectedConfigId] = useState(
    selectedIntegration?.connections?.[0]?.configId || ""
  );
  const { mutate: disconnectIntegrationConfig } =
    useDisconnectIntegrationConfig();
  const {
    mutate: updateIntegrationConfig,
    isPending: updatingIntegrationConfig,
  } = useUpdateIntegrationConfig();
  const {
    mutate: updatePrimaryConnection,
    isPending: updatingPrimaryConnection,
  } = useUpdatePrimaryConnection();

  const { mutateAsync, isPending } = useUpdateGadsSettings()

  const { data: gadSetting, isLoading: isSettingsLoading } = useGetGdsSettings(selctedConfigId, Boolean(selectedIntegration?.name === 'google_ads'))
  const configIds =
    selectedIntegration?.connections?.map((c) => c.configId) || [];

  const customerQueries = useCustomerIdsForAll(configIds);
  const loadingCustomerIds = customerQueries.some((q) => q.isLoading);

  const customerDataArray = !loadingCustomerIds
    ? configIds.flatMap((id, index) => {
      const data = customerQueries[index].data as
        | Record<string, {
          name: string;
          customer_id: string;
        }[]>
        | undefined;
      if (!data) return [];
      return Object.entries(data).map(([managerId, customerIds]) => ({
        configId: id,
        managerId,
        customerIds: customerIds?.map((cid) => ({ customerId: cid.customer_id, name: cid.name })) || [],
      }));
    })
    : [];

  const {
    data: selectedConfigCustomerData,
    refetch: refreshIntegrationConfigCustomerIds,
  } = useIntegrationConfigCustomerIds(
    selectedIntegration?.connections?.[0]?.configId || ""
  );

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Check if any connection is selected when modal opens, if not set first as primary
  useEffect(() => {
    if (
      isOpen &&
      selectedIntegration?.connections &&
      selectedIntegration.connections.length > 0 &&
      !isNotAdmin &&
      selectedIntegration.id !== hasCheckedPrimaryRef.current
    ) {
      const hasSelectedConnection = selectedIntegration.connections.some(
        (conn) => conn.isSelected === true
      );

      if (!hasSelectedConnection) {
        const firstConnection = selectedIntegration.connections[0];
        if (firstConnection?.configId) {
          hasCheckedPrimaryRef.current = selectedIntegration.id;
          updatePrimaryConnection(
            {
              configId: firstConnection.configId,
              data: { is_selected: true },
            },
            {
              onSuccess: () => {
                refreshIntegrations();
              },
              onError: (error) => {
                console.error("Failed to set primary connection:", error);
                hasCheckedPrimaryRef.current = null; // Reset on error to allow retry
              },
            }
          );
        }
      } else {
        // Mark as checked even if already has selected connection
        hasCheckedPrimaryRef.current = selectedIntegration.id;
      }
    }

    // Reset ref when modal closes
    if (!isOpen) {
      hasCheckedPrimaryRef.current = null;
    }
  }, [isOpen, selectedIntegration, isNotAdmin, refreshIntegrations]);
  // Initialize with selected config data from API
  useEffect(() => {
    if (selectedConfigCustomerData) {
      if (selectedConfigCustomerData.manager_id) {
        setSelectedManagerId(selectedConfigCustomerData.manager_id);
      }
      if (selectedConfigCustomerData.customer_ids) {
        setSelectedCustomerIds(selectedConfigCustomerData.customer_ids);
      }
    }
  }, [selectedConfigCustomerData]);

  // Close all popovers when modal closes and reset selections
  useEffect(() => {
    if (!isOpen) {
      setPopoverOpen({});
      // Reset selections when modal closes
      setSelectedManagerId("");
      setSelectedCustomerIds([]);
    }
  }, [isOpen]);

  const handleModalClose = () => {
    // First close all popovers
    setPopoverOpen({});
    // Small delay to ensure popovers are fully closed before closing modal
    setTimeout(() => {
      onClose();
    }, 50);
  };

  const handleConnect = () => {
    if (!selectedIntegration || !user?.id) {
      console.error("No integration data or user available");
      return;
    }

    providerLoginMutation.mutate(
      {
        integration_id: selectedIntegration.id,
        company_id: selectedCompany?.company?.id || "",
      },
      {
        onSuccess: () => {
          refreshIntegrations();
        },
        onError: (error) => {
          console.error("Provider login failed:", error);
        },
      }
    );
  };

  const handleDisconnectClick = (configId: string) => {
    if (!user?.email) {
      console.error("No user email available");
      return;
    }

    disconnectIntegrationConfig(
      {
        integrationId: configId,
        data: {
          user_email: user.email,
          is_active: false,
        },
      },
      {
        onSuccess: () => {
          refreshIntegrations();
        },
        onError: (error) => {
          console.error("Disconnect failed:", error);
        },
      }
    );
  };

  const handleCustomerIdToggle = (customerId: string) => {
    setSelectedCustomerIds((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSaveSettings = (configId: string) => {
    if (!configId) {
      console.error("No config ID available");
      return;
    }

    updateIntegrationConfig(
      {
        integrationId: configId,
        data: {
          manager_id: selectedManagerId,
          customer_ids: selectedCustomerIds,
        },
      },
      {
        onSuccess: () => {
          showToast({
            title: "Settings Updated Successfully",
            type: "success",
          });
          refreshIntegrations();
          refreshIntegrationConfigCustomerIds();
          setPopoverOpen((prev) => ({ ...prev, [configId]: false }));
        },
      }
    );
  };

  const handleCopy = () => {
    if (scriptRef.current) {
      const text = scriptRef.current.innerText;
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
    }
  };

  const handleSendByEmail = () => {
    if (scriptRef.current) {
      const text = scriptRef.current.innerText;
      window.location.href = `mailto:?subject=Script%20Snippet&body=${encodeURIComponent(
        text
      )}`;
    }
  };

  function formatDisplayName(name: string) {
    return name
      .split("_")
      .map((word) =>
        word.toLowerCase() === "lsa"
          ? "LSA"
          : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(" ");
  }

  const handleConfigClick = (configId: string) => {
    setSelectedConfigId(configId);
    // setPopoverOpen((prev) => ({ ...prev, [configId]: !prev[configId] }));
  }

  const handleSetPrimaryConnection = (configId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the config click
    if (!configId || isNotAdmin) return;

    updatePrimaryConnection(
      {
        configId,
        data: { is_selected: true },
      },
      {
        onSuccess: () => {
          showToast({
            title: "Primary connection updated successfully",
            type: "success",
          });
          refreshIntegrations();
        },
        onError: (error) => {
          console.error("Failed to update primary connection:", error);
          showToast({
            title: "Failed to update primary connection",
            type: "error",
          });
        },
      }
    );
  };

  if (!selectedIntegration) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent
        className="sm:max-w-[640px] md:max-w-[720px] lg:max-w-[920px] p-0 rounded-lg overflow-hidden px-3 sm:px-5 pt-4 pb-12 sm:pb-16 max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={handleModalClose}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Header */}
        <div className="p-3 sm:p-6 flex flex-col sm:flex-row sm:items-start border-b">
          <div className="flex items-start gap-3 sm:gap-4 w-full">
            {isLoading ? (
              <Skeleton className="w-12 h-12 sm:w-16 sm:h-16 rounded-md flex-shrink-0" />
            ) : (
              <div className="bg-white rounded-2xl border flex items-center justify-center p-3 sm:p-6 flex-shrink-0">
                <Image
                  src={selectedIntegration.logo || "/default-icon.svg"}
                  alt={selectedIntegration.name}
                  width={64}
                  height={64}
                  className="w-10 h-10 sm:w-16 sm:h-16 object-contain"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              {isLoading ? (
                <>
                  <Skeleton className="h-6 sm:h-7 w-32 sm:w-40 mb-2" />
                  <Skeleton className="h-4 sm:h-5 w-full sm:w-64" />
                </>
              ) : (
                <>
                  <DialogTitle className="text-xl sm:text-2xl md:text-3xl leading-7 sm:leading-8 font-semibold align-middle tracking-[0%] text-black break-words">
                    {formatDisplayName(selectedIntegration.name)}
                  </DialogTitle>
                  <DialogDescription className="mt-1 sm:mt-2 text-xs sm:text-sm leading-5 font-normal align-middle tracking-[0%] text-neutral-500">
                    {selectedIntegration.description}
                  </DialogDescription>
                  <div className="mt-4 sm:mt-7 mb-2 sm:mb-3">
                    <span
                      className={`text-xs leading-4 font-semibold tracking-[0%] bg-neutral-25 py-1 px-3 sm:px-4 rounded-full ${selectedIntegration.isConnected
                        ? "text-green-600"
                        : "text-black"
                        }`}
                    >
                      {selectedIntegration.isConnected
                        ? "Connected"
                        : "Not connected"}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-3 sm:p-6 flex flex-col md:flex-row gap-6 md:gap-0">
          {/* Left side */}
          <div className="w-full md:w-1/2 md:pr-4 lg:pr-6 mb-4 md:mb-0">
            <h3 className="font-normal text-sm sm:text-base leading-6 tracking-[-2%] align-middle text-neutral-500 mb-3 sm:mb-5">
              Integration overview
            </h3>
            {isLoading ? (
              <>
                <Skeleton className="h-4 mb-2 w-full" />
                <Skeleton className="h-4 mb-2 w-full" />
                <Skeleton className="h-4 mb-2 w-11/12" />
                <Skeleton className="h-4 mb-2 w-full" />
                <Skeleton className="h-4 mb-2 w-10/12" />
                <Skeleton className="h-4 mb-2 w-full" />
                <Skeleton className="h-4 mb-2 w-9/12" />
              </>
            ) : (
              <p className="font-normal text-xs sm:text-sm leading-5 tracking-[0%] align-middle text-black whitespace-pre-line">
                {selectedIntegration.detailedDescription}
              </p>
            )}
            {selectedIntegration.name === "lenz_pixel" && (
              <>
                <h3 className="font-normal text-sm sm:text-base leading-6 tracking-[-2%] align-middle text-neutral-500 mb-3 sm:mb-5 mt-2">
                  Installation Instructions
                </h3>
                <p
                  ref={scriptRef}
                  className="font-normal break-all overflow-wrap-anywhere text-xs sm:text-sm leading-5 tracking-[0%] align-middle text-black whitespace-pre-line bg-neutral-100 p-4 rounded-3xl border border-neutral-500"
                >
                  {`<script type="text/javascript" src="${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/companies/${selectedCompany?.company?.id}.js"></script>`}
                </p>
                <div className="flex gap-2 justify-center mt-4">
                  <Button
                    size="sm"
                    className="rounded-full bg-black text-white hover:bg-black/80 px-4"
                    onClick={handleCopy}
                  >
                    {copied ? "Copied!" : "Copy to clipboard"}
                  </Button>
                  <Button
                    size="sm"
                    className="rounded-full bg-white text-black border border-neutral-200 hover:bg-neutral-100 px-4"
                    onClick={handleSendByEmail}
                  >
                    Send by email
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Right side */}
          <div className="w-full md:w-1/2 md:pl-4 lg:pl-6 md:border-l border-neutral-100">
            {/* Single account connection */}
            {selectedIntegration.name === "lenz_pixel" ? (
              ""
            ) : (
              <>
                {selectedIntegration.isConnected &&
                  !selectedIntegration.allow_multiple &&
                  selectedIntegration.connections &&
                  selectedIntegration.connections.length > 0 &&
                  !isLoading && (
                    <div className="mb-4">
                      <h4 className="font-medium text-sm mb-2">
                        Connected Account
                      </h4>
                      <div className="flex justify-between items-center mb-2 p-2 bg-gray-50 rounded">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">
                              {selectedIntegration.connections[0].email}
                            </p>
                            {selectedIntegration.connections[0].isSelected && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Primary
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            Updated:{" "}
                            {selectedIntegration.connections[0].updatedAt}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Dialog
                            open={
                              popoverOpen[
                              selectedIntegration.connections[0].configId
                              ]
                            }
                            onOpenChange={(open) => {
                              const singleSelectedIntegration =
                                selectedIntegration.connections || [];
                              setPopoverOpen((prev) => ({
                                ...prev,
                                [singleSelectedIntegration[0].configId!]: open,
                              }));
                            }}
                          >
                            <DialogTrigger asChild>
                              {/* <TooltipWrapper
                                message="You have no access for this action."
                                show={Boolean(isNotAdmin)}
                              > */}
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={loadingCustomerIds || isNotAdmin}
                                className="h-6 w-6 border rounded-full flex items-center justify-center cursor-pointer"
                              >
                                <CiSettings className="h-4 w-4" />
                              </Button>
                              {/* </TooltipWrapper> */}
                            </DialogTrigger>

                            {/* Transparent overlay (so no backdrop dimming) */}
                            <div className="fixed inset-0 pointer-events-none" />

                            <DialogContent className="absolute z-50 mt-2 w-96 rounded-3xl border bg-white shadow-lg p-4">
                              <div className="space-y-4">
                                <h4 className="font-medium text-sm">
                                  Account Settings
                                </h4>

                                {(() => {
                                  const firstSelectedIntegration =
                                    selectedIntegration?.connections[0] || [];

                                  const dataForConfig =
                                    customerDataArray.filter(
                                      (d) =>
                                        d.configId ===
                                        firstSelectedIntegration?.configId
                                    );

                                  const managerOptions = dataForConfig.map(
                                    (d) => {
                                      const managerName = d.customerIds?.find(c => c.customerId === d.managerId)?.name || 'Unknown';
                                      return {
                                        id: d.managerId,
                                        option: managerName, // Display name as primary
                                        name: managerName,
                                        managerId: d.managerId,
                                      };
                                    }
                                  );

                                  const selectedManagerData =
                                    dataForConfig.find(
                                      (d) => d.managerId === selectedManagerId
                                    );

                                  const customerOptions =
                                    selectedManagerData?.customerIds
                                      .filter(
                                        (id) =>
                                          id.customerId !== selectedManagerData.managerId
                                      ) // exclude managerId if present
                                      .map((id) => ({
                                        id: id.customerId,
                                        option: `${id.name}`,
                                        name: id.name,
                                      })) || [];

                                  return (
                                    <>
                                      {managerOptions.length > 0 && (
                                        <div className="space-y-2">
                                          <label className="text-xs font-medium text-gray-700">
                                            Manager ID
                                          </label>
                                          <Dropdown
                                            options={managerOptions}
                                            value={selectedManagerId}
                                            onChange={(value) =>
                                              setSelectedManagerId(
                                                String(value)
                                              )
                                            }
                                            placeholder="Select Manager ID"
                                            triggerClassName="w-full h-8 px-3 text-xs"
                                            formatOption={(option) => {
                                              if (typeof option === 'object' && 'name' in option && 'managerId' in option) {
                                                const opt = option as { name: string; managerId: string };
                                                return (
                                                  <span className="text-xs">
                                                    <span className="font-medium">{opt.name}</span>
                                                    <span className="text-gray-500 ml-1">({opt.managerId})</span>
                                                  </span>
                                                );
                                              }
                                              return typeof option === 'object' && 'option' in option
                                                ? (option as { option: string }).option
                                                : String(option);
                                            }}
                                            formatOptionForItems={(option) => {
                                              if (typeof option === 'object' && 'name' in option && 'managerId' in option) {
                                                const opt = option as { name: string; managerId: string };
                                                return (
                                                  <span className="text-xs">
                                                    <span className="font-medium">{opt.name}</span>
                                                    <span className="text-gray-500 ml-1">({opt.managerId})</span>
                                                  </span>
                                                );
                                              }
                                              return typeof option === 'object' && 'option' in option
                                                ? (option as { option: string }).option
                                                : String(option);
                                            }}
                                            getOptionLabel={(option) => {
                                              if (typeof option === 'object' && 'name' in option) {
                                                return (option as { name: string }).name;
                                              }
                                              return typeof option === 'object' && 'option' in option
                                                ? (option as { option: string }).option
                                                : String(option);
                                            }}
                                          />
                                        </div>
                                      )}

                                      {customerOptions.length > 0 && (
                                        <div className="space-y-2">
                                          <div className="flex justify-between items-center flex-wrap">
                                            <label className="text-xs font-medium text-gray-700">
                                              Customer IDs
                                            </label>
                                            <div className="relative">
                                              <Search className="absolute size-4 top-2 left-1" />
                                              <input
                                                placeholder="Search..."
                                                value={searchCustomerInput}
                                                onChange={(e) =>
                                                  setSearchCustomerInput(
                                                    e.target.value
                                                  )
                                                }
                                                className="w-36 pr-2 pl-6 text-sm py-1 border border-neutral-200 rounded-2xl"
                                              />
                                            </div>
                                          </div>

                                          <RadioGroup
                                            value={selectedCustomerIds[0] || ""}
                                            onValueChange={(value) =>
                                              setSelectedCustomerIds([value])
                                            }
                                            className="max-h-40 overflow-y-auto border rounded-md p-2 gap-1"
                                          >
                                            {(() => {
                                              const filteredCustomers =
                                                customerOptions.filter(
                                                  (customer) => {
                                                    const searchTerm = searchCustomerInput.toLowerCase();
                                                    const customerId = String(customer.id).toLowerCase();
                                                    const customerName = (customer.name || customer.option || '').toLowerCase();
                                                    return customerId.includes(searchTerm) || customerName.includes(searchTerm);
                                                  }
                                                );

                                              if (
                                                filteredCustomers.length === 0
                                              ) {
                                                return (
                                                  <p className="text-xs text-gray-500 text-center py-2">
                                                    No customers found
                                                  </p>
                                                );
                                              }

                                              return filteredCustomers.map(
                                                (customer) => (
                                                  <label
                                                    key={customer.id}
                                                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded text-xs"
                                                  >
                                                    <RadioGroupItem
                                                      value={String(
                                                        customer.id
                                                      )}
                                                      className="border-black"
                                                    />
                                                    <span>
                                                      {customer.option}
                                                    </span>
                                                  </label>
                                                )
                                              );
                                            })()}
                                          </RadioGroup>
                                        </div>
                                      )}
                                    </>
                                  );
                                })()}

                                <Button
                                  size="sm"
                                  disabled={updatingIntegrationConfig}
                                  className="w-full h-8 text-xs"
                                  onClick={() => {
                                    const firstSelectedIntegration =
                                      selectedIntegration?.connections || [];
                                    handleSaveSettings(
                                      firstSelectedIntegration[0]?.configId
                                    );
                                  }}
                                >
                                  Save Settings
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <TooltipWrapper
                            message="You have no access for this action."
                            show={Boolean(isNotAdmin)}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 border rounded-full flex items-center justify-center cursor-pointer"
                              onClick={() =>
                                selectedIntegration.connections &&
                                handleDisconnectClick(
                                  selectedIntegration.connections[0].configId
                                )
                              }
                              disabled={isNotAdmin}
                            >
                              <LuUnlink className="h-4 w-4" />
                            </Button>
                          </TooltipWrapper>
                        </div>
                      </div>
                    </div>
                  )}
                {/* Multiple account connections */}
                {selectedIntegration.isConnected &&
                  selectedIntegration.allow_multiple &&
                  selectedIntegration.connections &&
                  selectedIntegration.connections.length > 0 &&
                  !isLoading && (
                    <div className="mb-4">
                      <h4 className="font-medium text-sm mb-2">
                        Connected Accounts
                      </h4>
                      <div className="max-h-[240px] overflow-y-auto">
                        {selectedIntegration.connections.map((connection, index, array) => {
                          const isLast = index === array.length - 1;
                          const tooltipSide = isLast ? "top" : "bottom";
                          return (
                            <div
                              key={connection.configId}
                              className={`group flex justify-between items-center mb-2 p-2 ${selctedConfigId === connection.configId ? 'bg-gray-200' : 'bg-gray-50 cursor-pointer hover:bg-gray-100'}  rounded transition-colors`}
                              onClick={() => handleConfigClick(connection.configId)}
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-sm max-w-[165px] break-all overflow-wrap-anywhere">
                                    {connection.email}
                                  </p>
                                  {connection.isSelected && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      Primary
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500">
                                  Updated: {connection.updatedAt}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Dialog
                                  open={popoverOpen[connection.configId]}
                                  onOpenChange={(open) =>
                                    setPopoverOpen((prev) => ({
                                      ...prev,
                                      [connection.configId]: open,
                                    }))
                                  }
                                >
                                  <DialogTrigger asChild>
                                    {/* <TooltipWrapper
                                      message={
                                        isNotAdmin
                                          ? "You have no access for this action."
                                          : "Account Settings"
                                      }
                                      show={true}
                                      side={tooltipSide}
                                    > */}
                                    <Button
                                      variant="ghost"
                                      disabled={loadingCustomerIds || isNotAdmin}
                                      size="icon"
                                      className="h-6 w-6 border rounded-full flex items-center justify-center cursor-pointer"
                                    >
                                      <CiSettings className="h-4 w-4" />
                                    </Button>
                                    {/* </TooltipWrapper> */}
                                  </DialogTrigger>

                                  {/* Transparent overlay (no background dim) */}
                                  <div className="fixed inset-0 pointer-events-none" />

                                  <DialogContent className="absolute z-50 mt-2 w-[450px] rounded-3xl border bg-white shadow-lg p-4">
                                    <div className="space-y-4">
                                      <h4 className="font-medium text-sm">
                                        Account Settings
                                      </h4>

                                      {/* Manager + Customer IDs logic (same as before) */}
                                      {(() => {
                                        const dataForConfig =
                                          customerDataArray.filter(
                                            (d) =>
                                              d.configId === connection.configId
                                          );

                                        const managerOptions = dataForConfig.map(
                                          (d) => {
                                            const managerName = d.customerIds?.find(c => c.customerId === d.managerId)?.name || 'Unknown';
                                            return {
                                              id: d.managerId,
                                              option: managerName, // Display name as primary
                                              name: managerName,
                                              managerId: d.managerId,
                                            };
                                          }
                                        );

                                        const selectedManagerData =
                                          dataForConfig.find(
                                            (d) => d.managerId === selectedManagerId
                                          );
                                        const customerOptions =
                                          selectedManagerData?.customerIds
                                            .filter(
                                              (id) =>
                                                id.customerId !== selectedManagerData.managerId
                                            )
                                            .map((id) => ({
                                              id: id.customerId,
                                              option: `${id.name} <span class="text-gray-500">(${id.customerId})</span>`,
                                              name: id.name,
                                            })) || [];
                                        return (
                                          <>
                                            {!!managerOptions?.length ? (
                                              <>
                                                {managerOptions.length > 0 && (
                                                  <div className="space-y-2">
                                                    <label className="text-xs font-medium text-gray-700">
                                                      Manager ID
                                                    </label>
                                                    <Dropdown
                                                      options={managerOptions}
                                                      value={selectedManagerId}
                                                      onChange={(value) =>
                                                        setSelectedManagerId(
                                                          String(value)
                                                        )
                                                      }
                                                      placeholder="Select Manager ID"
                                                      triggerClassName="w-full h-8 px-3 text-xs"
                                                      formatOption={(option) => {
                                                        if (typeof option === 'object' && 'name' in option && 'managerId' in option) {
                                                          const opt = option as { name: string; managerId: string };
                                                          return (
                                                            <span className="text-xs">
                                                              <span className="font-medium">{opt.name}</span>
                                                              <span className="text-gray-500 ml-1">({opt.managerId})</span>
                                                            </span>
                                                          );
                                                        }
                                                        return typeof option === 'object' && 'option' in option
                                                          ? (option as { option: string }).option
                                                          : String(option);
                                                      }}
                                                      formatOptionForItems={(option) => {
                                                        if (typeof option === 'object' && 'name' in option && 'managerId' in option) {
                                                          const opt = option as { name: string; managerId: string };
                                                          return (
                                                            <span className="text-xs">
                                                              <span className="font-medium">{opt.name}</span>
                                                              <span className="text-gray-500 ml-1">({opt.managerId})</span>
                                                            </span>
                                                          );
                                                        }
                                                        return typeof option === 'object' && 'option' in option
                                                          ? (option as { option: string }).option
                                                          : String(option);
                                                      }}
                                                      getOptionLabel={(option) => {
                                                        if (typeof option === 'object' && 'name' in option) {
                                                          return (option as { name: string }).name;
                                                        }
                                                        return typeof option === 'object' && 'option' in option
                                                          ? (option as { option: string }).option
                                                          : String(option);
                                                      }}
                                                    />
                                                  </div>
                                                )}

                                                {customerOptions.length > 0 && (
                                                  <div className="space-y-2">
                                                    <div className="flex justify-between items-center flex-wrap">
                                                      <label className="text-xs font-medium text-gray-700">
                                                        Customer IDs
                                                      </label>
                                                      <div className="relative">
                                                        <Search className="absolute size-4 top-2 left-1" />
                                                        <input
                                                          placeholder="Search..."
                                                          value={
                                                            searchCustomerInput
                                                          }
                                                          onChange={(e) =>
                                                            setSearchCustomerInput(
                                                              e.target.value
                                                            )
                                                          }
                                                          className="w-36 pr-2 pl-6 text-sm py-1 border border-neutral-200 rounded-2xl"
                                                        />
                                                      </div>
                                                    </div>

                                                    <RadioGroup
                                                      value={
                                                        selectedCustomerIds[0] || ""
                                                      }
                                                      onValueChange={(value) =>
                                                        setSelectedCustomerIds([
                                                          value,
                                                        ])
                                                      }
                                                      className="max-h-40 overflow-y-auto border rounded-md p-2 gap-1"
                                                    >
                                                      {(() => {
                                                        const filteredCustomers =
                                                          customerOptions.filter(
                                                            (customer) => {
                                                              const searchTerm = searchCustomerInput.toLowerCase();
                                                              const customerId = String(customer.id).toLowerCase();
                                                              const customerName = (customer.name || customer.option || '').toLowerCase();
                                                              return customerId.includes(searchTerm) || customerName.includes(searchTerm);
                                                            }
                                                          );

                                                        if (
                                                          filteredCustomers.length ===
                                                          0
                                                        ) {
                                                          return (
                                                            <p className="text-xs text-gray-500 text-center py-2">
                                                              No customers found
                                                            </p>
                                                          );
                                                        }

                                                        return filteredCustomers.map(
                                                          (customer) => (
                                                            <label
                                                              key={customer.id}
                                                              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded text-xs"
                                                            >
                                                              <RadioGroupItem
                                                                value={String(
                                                                  customer.id
                                                                )}
                                                                className="h-3 w-3"
                                                              />
                                                              <span dangerouslySetInnerHTML={{ __html: customer.option }} />
                                                            </label>
                                                          )
                                                        );
                                                      })()}
                                                    </RadioGroup>
                                                  </div>
                                                )}

                                                <Button
                                                  size="sm"
                                                  disabled={
                                                    updatingIntegrationConfig
                                                  }
                                                  className="w-full h-8 text-xs"
                                                  onClick={() =>
                                                    handleSaveSettings(
                                                      connection.configId
                                                    )
                                                  }
                                                >
                                                  Save Settings
                                                </Button>
                                              </>
                                            ) : (
                                              <p className="text-center text-black">
                                                This account doesn't have any ads
                                                account connected
                                              </p>
                                            )}
                                          </>
                                        );
                                      })()}
                                    </div>
                                  </DialogContent>
                                </Dialog>

                                <TooltipWrapper
                                  message={isNotAdmin ? "You have no access for this action. " : "Unlink Account"}
                                  show={true}
                                  side={tooltipSide}
                                >
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 border rounded-full flex items-center justify-center cursor-pointer"
                                    onClick={() =>
                                      handleDisconnectClick(connection.configId)
                                    }
                                    disabled={isNotAdmin}
                                  >
                                    <LuUnlink className="h-4 w-4" />
                                  </Button>
                                </TooltipWrapper>
                                {!connection.isSelected && (
                                  <Button
                                    variant="ghost"
                                    className="h-6 border rounded-full flex items-center justify-center cursor-pointer overflow-visible transition-all duration-300 ease-in-out w-6 group-hover:w-auto group-hover:px-2 group-hover:gap-1.5 min-w-[24px] p-0 bg-transparent hover:bg-transparent group-hover:border-neutral-500 "
                                    onClick={(e) =>
                                      handleSetPrimaryConnection(
                                        connection.configId,
                                        e
                                      )
                                    }
                                    disabled={isNotAdmin || updatingPrimaryConnection}
                                  >
                                    {/* <MdVerifiedUser className="h-4 w-4 flex-shrink-0 transition-transform duration-300 object-contain block ml-[7px]" /> */}
                                    <FaUserCheck className="h-4 w-4 flex-shrink-0 transition-transform duration-300 object-contain block ml-[7px]" />
                                    <span className="text-xs font-medium whitespace-nowrap opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-[120px] transition-all duration-300 ease-in-out overflow-hidden ml-0 group-hover:ml-1.5">
                                      Set as primary
                                    </span>
                                  </Button>
                                )}
                                {/* <TooltipWrapper
                                  message={
                                    isNotAdmin
                                      ? "Add account"
                                      : "Set as primary connection"
                                  }
                                  show={true}
                                  side={tooltipSide}
                                >
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 border rounded-full flex items-center justify-center cursor-pointer"
                                    onClick={handleConnect}
                                    disabled={isNotAdmin}
                                  >
                                    +
                                  </Button>
                                </TooltipWrapper> */}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                {/* Connect/Disconnect button */}
                {isLoading ? (
                  <Skeleton className="h-9 sm:h-10 w-full mb-4 sm:mb-6" />
                ) : (
                  <TooltipWrapper
                    fullWidth
                    message={
                      isNotAdmin
                        ? "You have no access for this action."
                        : "You have reached your integrations limits."
                    }
                    show={Boolean(
                      isNotAdmin ||
                      (!planUsageData?.allowed?.integrations &&
                        !selectedIntegration.isConnected)
                    )}
                  >
                    <Button
                      className={`w-full mb-4 sm:mb-6 rounded-full h-9 sm:h-10 text-lg ${selectedIntegration.isConnected
                        ? selectedIntegration.allow_multiple
                          ? "bg-white text-black hover:bg-navy-800 border border-neutral-200"
                          : "bg-white text-black hover:bg-navy-800 border border-neutral-200"
                        : "bg-black text-white hover:bg-black/80"
                        }`}
                      onClick={
                        selectedIntegration.isConnected
                          ? selectedIntegration.allow_multiple
                            ? handleConnect
                            : () =>
                              selectedIntegration.connections &&
                              handleDisconnectClick(
                                selectedIntegration.connections[0].configId
                              )
                          : handleConnect
                      }
                      disabled={
                        providerLoginMutation.isPending ||
                        isNotAdmin ||
                        isPlanLoading ||
                        (!planUsageData?.allowed?.integrations &&
                          !selectedIntegration.isConnected)
                      }
                    >
                      {providerLoginMutation.isPending
                        ? "Opening..."
                        : selectedIntegration.isConnected
                          ? selectedIntegration.allow_multiple
                            ? "Add Account"
                            : "Disconnect"
                          : "Connect"}
                    </Button>
                  </TooltipWrapper>
                )}
              </>
            )}
            {/* Build by section */}

            {selectedIntegration?.name === 'google_ads' ? (
              <>
                {(isSettingsLoading || isLoading) ? (
                  <div className="space-y-4">
                    <Skeleton className="h-9 sm:h-10 w-full" />
                    <Skeleton className="h-9 sm:h-10 w-full" />
                    <Skeleton className="h-9 sm:h-10 w-full" />
                  </div>
                ) : selectedIntegration && selectedIntegration?.connections && selectedIntegration?.connections?.length > 0 && (
                  <IntegrationSettings
                    settings={{
                      enhanced_conversions: gadSetting?.enhanced_conversions || false,
                      send_calls_as_conversions: gadSetting?.send_calls_as_conversions || false,
                      conversion_action_type: gadSetting?.conversion_action_type || "separate",
                      send_forms_as_conversions: gadSetting?.send_forms_as_conversions || false,
                      send_leads_as_conversions: gadSetting?.send_leads_as_conversions || false,
                      send_deals_as_conversions: gadSetting?.send_deals_as_conversions || false,
                      send_call_values: gadSetting?.send_call_values || false,
                      send_form_values: gadSetting?.send_form_values || false,
                      send_deal_values: gadSetting?.send_deal_values || false,
                      primary_conversion_action: gadSetting?.primary_conversion_action || null,
                      secondary_conversion_action: gadSetting?.secondary_conversion_action || null,
                    }}
                    onSettingsChange={(updates) => {
                      const updateKey = Object.keys(updates)[0] as keyof GAdsSettingsPayload;
                      setUpdatingSettingKey(updateKey);
                      mutateAsync({
                        configId: selctedConfigId, data: updates
                      }).finally(() => {
                        setUpdatingSettingKey(null);
                      });
                    }}
                    updatingKey={isPending ? updatingSettingKey : null}
                  />
                )}

              </>
            ) : (
              <>
                <div className="mb-4 sm:mb-6">
                  <p className="font-normal text-sm sm:text-base leading-6 tracking-[-2%] align-middle text-neutral-500 mb-2">
                    Build by
                  </p>
                  {isLoading ? (
                    <Skeleton className="h-6 sm:h-8 w-20 sm:w-24" />
                  ) : (
                    <Image
                      src={selectedIntegration.builtBy || "/logo.svg"}
                      alt="Builder logo"
                      width={100}
                      height={32}
                      className="h-6 sm:h-8 w-auto object-contain"
                    />
                  )}
                </div>
                {/* Features/Action buttons */}
                <div className="mb-4 sm:mb-6">
                  <p className="font-normal text-sm sm:text-base leading-6 tracking-[-2%] align-middle text-neutral-500 mb-2 sm:mb-3">
                    Features
                  </p>
                  {isLoading ? (
                    <>
                      <Skeleton className="h-9 sm:h-10 w-full mb-2 sm:mb-3" />
                      <Skeleton className="h-9 sm:h-10 w-full mb-2 sm:mb-3" />
                      <Skeleton className="h-9 sm:h-10 w-full" />
                    </>
                  ) : (
                    <div className="space-y-2 sm:space-y-3 text-black">
                      {actionButtons.map((button, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          onClick={button.onClick}
                          className="flex items-center justify-start gap-2 border border-neutral-50 hover:bg-neutral-25 rounded-lg text-xs sm:text-sm w-full p-0 h-auto cursor-pointer"
                        >
                          <span className="text-gray-500 p-3 sm:p-4">
                            {button.icon}
                          </span>
                          <span className="truncate">{button.name}</span>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Support section */}
                <div>
                  <p className="font-normal text-sm sm:text-base leading-6 tracking-[-2%] align-middle text-neutral-500 mb-2 sm:mb-3">
                    Support
                  </p>
                  {isLoading ? (
                    <>
                      <Skeleton className="h-5 sm:h-6 w-28 sm:w-32 mb-2" />
                      <Skeleton className="h-5 sm:h-6 w-32 sm:w-36 mb-2" />
                      <Skeleton className="h-5 sm:h-6 w-24 sm:w-28" />
                    </>
                  ) : (
                    <div className="space-y-1 sm:space-y-2 disabled-div">
                      {supportLinks.map((link, index) => (
                        <Link
                          key={index}
                          href={link.href}
                          className="flex items-center gap-1 sm:gap-2 font-normal text-xs sm:text-sm leading-4 tracking-[0px] align-middle text-neutral-500 hover:text-neutral-700"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {link.name}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="sm:w-3 sm:h-3"
                          >
                            <path d="M7 17L17 7"></path>
                            <path d="M7 7h10v10"></path>
                          </svg>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IntegrationModal;
