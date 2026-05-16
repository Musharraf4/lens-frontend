import { Button } from "@/components/ui/button";
import { StatusTag } from "@/components/StatusTag";
import { AiOutlineLink } from "react-icons/ai";
import Image from "next/image";
import TextWithCopy from "@/components/TextWithCopy";
import Timeline from "@/components/Timeline";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { useCreateApiKey, useGoogleLeadFormConfig } from "@/services/googleLeadFormConfig.api";

interface FormContentProps {
    isEnabled: boolean;
}

const FormContent = ({ isEnabled }: FormContentProps) => {
    const [isLoading, setIsLoading] = useState(true);
    // const WEBHOOK_URL = "https://www.figma.com/design/rYLhEUR7dVPX64xlgemzPU/Lenz-CRM?node-id=1850-35...";
    const API_KEY = "your-generated-api-key"; // Replace with actual logic if needed

    const { mutate: createApiKey } = useCreateApiKey();
    const { data: googleLeadFormConfig, refetch: refetchGoogleLeadFormConfig } = useGoogleLeadFormConfig();

    const handleCreateApiKey = () => {
        createApiKey(undefined, {
            onSuccess: () => {
                refetchGoogleLeadFormConfig();
            }
        });
    };

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    const timelineItems = [
        {
            title: "Webhook URL",
            description: "Create a new search campaign in your Google Ads account. Under Lead Delivery options, copy and paste the webhook URL into the designated fields.",
            datetime: googleLeadFormConfig?.updated_at || "",
            status: googleLeadFormConfig?.webhook_url ? "Active" : "Inactive",
            statusIcon: null,
            icon: <AiOutlineLink className="text-xl" />,
            body: (
                <TextWithCopy
                    text={googleLeadFormConfig?.webhook_url ?? ""}
                    toastTitle="Webhook URL Copied"
                    toastDescription="Paste this URL in Google Ads Lead Delivery."
                />
            ),
        },
        {
            title: "API Keys",
            description: "Create and paste the API key into the designated fields in Google Ads.",
            datetime: googleLeadFormConfig?.updated_at || "",
            status: googleLeadFormConfig?.api_key ? "Active" : "Inactive",
            statusIcon: null,
            icon: <Image src="/FormFilledIcon.svg" alt="API Keys Icon" width={20} height={20} />,
            body: (
                <>
                    {googleLeadFormConfig?.api_key ?
                        <TextWithCopy
                            text={googleLeadFormConfig?.api_key ?? ""}
                            toastTitle="API Key Copied"
                            toastDescription="Paste this API Key in Google Ads Lead Delivery."
                        /> :
                        <div>
                            <Button className="rounded-full" onClick={handleCreateApiKey}>
                                Create API Key
                            </Button>
                        </div>
                    }
                </>
            ),
        },
    ];

    return (
        <div className="w-3/4 h-full flex-1 relative">
            <div className="bg-white rounded-3xl p-6 h-full overflow-auto">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    {isLoading ? (
                        <>
                            <div className="flex items-center gap-6">
                                <Skeleton className="w-[112px] h-[112px] rounded-2xl" />
                                <div className="flex flex-col gap-2">
                                    <Skeleton className="w-48 h-6" />
                                    <Skeleton className="w-96 h-4" />
                                    <Skeleton className="w-80 h-4" />
                                    <Skeleton className="w-36 h-4 mt-1" />
                                </div>
                            </div>
                            <Skeleton className="w-24 h-8 rounded-full" />
                        </>
                    ) : (
                        <>
                            <div className="flex items-center gap-6">
                                <div className="border border-neutral-50 rounded-2xl p-6">
                                    <Image
                                        src="/GoogleAdsIcon.svg"
                                        alt="Google Ads"
                                        width={48}
                                        height={48}
                                        className="rounded-md"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <h2 className="text-lg font-medium">Google Ads Lead Forms</h2>
                                    <p className="text-sm text-gray-500">
                                        Connect your Google Ads lead forms to automatically capture and attribute leads
                                        generated through Google's native lead form extensions.
                                    </p>
                                    <p className="text-sm text-gray-500">Read Full Description</p>
                                </div>
                            </div>
                            <StatusTag>Lead Forms</StatusTag>
                        </>
                    )}
                </div>

                <div className="space-y-6 mt-6">
                    <Timeline items={timelineItems} />
                </div>
            </div>

            {/* Overlay when disabled */}
            {!isEnabled && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                    <h3 className="text-lg font-medium">Enable form submission tracking</h3>
                    <p className="text-sm text-gray-500 mt-2 text-center max-w-md">
                        To review comprehensive submission data and optimize performance.
                    </p>
                </div>
            )}
        </div>
    );
};

export default FormContent;