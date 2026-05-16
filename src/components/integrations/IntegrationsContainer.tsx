"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Tabs } from "@/components/Tabs";
import { BiImport } from "react-icons/bi";
import { MdCenterFocusWeak } from "react-icons/md";
import { IoSearchOutline } from "react-icons/io5";
import { PiPhoneCallLight } from "react-icons/pi";
import { IntegrationCard } from "@/components/integrations/IntegrationCard";
import IntegrationModal from "@/components/integrations/IntegrationsModal";
import { useIntegrationContext, ExtendedIntegration } from "@/store/IntegrationContext";
import { Skeleton } from "@/components/ui/skeleton";

// Skeleton card component
const SkeletonCard = () => (
    <div className="flex flex-col space-y-3 p-4 border rounded-lg">
        <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-3 w-[80px]" />
            </div>
        </div>
        <Skeleton className="h-4 w-full" />
        <div className="flex justify-between items-center pt-2">
            <Skeleton className="h-8 w-[100px]" />
            <Skeleton className="h-6 w-6 rounded-full" />
        </div>
    </div>
);


export default function IntegrationsContainer() {
    // Get integration data from context
    const {
        integrations,
        isLoading,
        error,
        refreshIntegrations,
        selectedIntegration,
        setSelectedIntegration
    } = useIntegrationContext();

    const [showSkeletons, setShowSkeletons] = useState(true);

    useEffect(() => {
        // Set a minimum loading time of 5 seconds
        const timer = setTimeout(() => {
            setShowSkeletons(false);
        }, 800);

        return () => clearTimeout(timer);
    }, []);

    // Local UI states
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Define tabs configuration
    const tabOptions = [
        { label: "All integrations", value: "all" },
        { label: "Marketing platforms", value: "Marketing" },
        { label: "CRM platforms", value: "CRM" },
    ];

    // Filter integrations based on active tab and search query
    const filteredIntegrations = integrations.filter((integration) => {
        const categoryMatch =
            activeTab === "all" ||
            integration.category.toLowerCase() === activeTab.toLowerCase();

        const searchMatch = searchQuery.toLowerCase().split(' ').every(word =>
            integration.name.toLowerCase().includes(word)
        );

        return categoryMatch && searchMatch;
    });

    // Handle opening the modal with the selected integration
    const handleOpenModal = (integration: ExtendedIntegration) => {
        setSelectedIntegration(integration);
        setIsModalOpen(true);
    };

    // Handle closing the modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedIntegration(null);
    };

    // Action buttons for modal
    const actionButtons = [
        {
            icon: <BiImport className="h-4 w-4" />,
            name: "Import campaign data",
            onClick: () => console.log("Configuration settings clicked")
        },
        {
            icon: <MdCenterFocusWeak className="h-4 w-4" />,
            name: "Track conversions",
            onClick: () => console.log("Sync data clicked")
        },
        {
            icon: <PiPhoneCallLight className="h-4 w-4" />,
            name: "Push call tracking data",
            onClick: () => console.log("View analytics clicked")
        }
    ];

    // Support links for modal
    const supportLinks = [
        {
            name: "Installation guide",
            href: "https://docs.example.com"
        },
        {
            name: "Troubleshooting tips",
            href: "https://api.example.com"
        },
        {
            name: "Google support",
            href: "https://support.example.com"
        }
    ];

    // Error state
    if (error) {
        return (
            <div className="w-full">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Integrations</h1>
                    <p className="text-gray-600 mt-1">
                        Improve workflow and connect the tools you use every day
                    </p>
                </div>
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <p className="text-red-600 mb-4">Failed to load integrations</p>
                        <button
                            onClick={refreshIntegrations}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="mb-8" data-tour="integrations-page-header">
                <h1 className="text-3xl font-bold">Integrations</h1>
                <p className="text-gray-600 mt-1">
                    Improve workflow and connect the tools you use every day
                </p>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
                <div data-tour="integrations-tabs">
                    <Tabs
                        tabs={tabOptions}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    />
                </div>

                <div className="relative flex items-center" data-tour="integrations-search">
                    <Input
                        type="text"
                        placeholder="Search..."
                        className="pl-4 pr-10 py-2 w-[160px] h-[40px] text-sm font-normal rounded-full border-2 border-[#CDD2DA] text-[#030C23] focus:outline-none focus:border-[#ACDF18] focus:shadow-[0_0_0_2px_#D8F990] focus:ring-2 focus:ring-[#D8F990] placeholder:text-[#B5BAC4]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="absolute right-3 text-[#B5BAC4]">
                        <IoSearchOutline className="h-4 w-4" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-tour="integrations-cards">
                {(isLoading || showSkeletons) ? (
                    Array.from({ length: 8 }).map((_, index) => (
                        <SkeletonCard key={`skeleton-${index}`} />
                    ))
                ) : (
                    filteredIntegrations.map((integration) => (
                        <IntegrationCard
                            key={integration.id}
                            integration={{
                                ...integration,
                                isConnected: integration.isConnected,
                                logo: integration.logo || "",
                            }}
                            onClick={() => handleOpenModal(integration)}
                        />
                    ))
                )}
            </div>

            {!isLoading && filteredIntegrations.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-gray-500">No integrations found matching your criteria.</p>
                </div>
            )}

            {selectedIntegration && (
                <IntegrationModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    actionButtons={actionButtons}
                    supportLinks={supportLinks}
                />
            )}
        </div>
    );
}