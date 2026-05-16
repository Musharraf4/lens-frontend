"use client";

import React, { useEffect, useState } from "react";
import FormSidebar from "./FormSidebar";
import FormContent from "./FormContent";
import { Switch } from "@/components/ui/switch";
import { useGoogleLeadFormConfig, useSaveGoogleLeadFormConfig } from "@/services/googleLeadFormConfig.api";

const FormTab = () => {
    const [trackFormSubmissions, setTrackFormSubmissions] = useState(false);

    const { mutate: saveGoogleLeadFormConfig } = useSaveGoogleLeadFormConfig();
    const { data: googleLeadFormConfig, refetch: refetchGoogleLeadFormConfig } = useGoogleLeadFormConfig();

    const handleTrackFormSubmissions = (checked: boolean) => {
        setTrackFormSubmissions(checked);
        saveGoogleLeadFormConfig({
            tracking_enabled: checked,
        }, {
            onSuccess: () => {
                refetchGoogleLeadFormConfig();
            }
        });

    };

    useEffect(() => {
        if (googleLeadFormConfig) {
            setTrackFormSubmissions(googleLeadFormConfig.tracking_enabled);
        }
    }, [googleLeadFormConfig]);

    return (
        <div className="h-full flex flex-col gap-4">
            <div className="flex items-center justify-between px-6 py-7 rounded-xl bg-white">
                <h2 className="text-base font-normal text-black leading-6 tracking-[-0.02em] align-middle">Track form submissions and attribution data from your website</h2>
                <Switch
                    checked={trackFormSubmissions}
                    onCheckedChange={handleTrackFormSubmissions}
                />
            </div>

            <div className="flex gap-4 bg-gray-50 h-full overflow-hidden">
                <FormSidebar />
                <FormContent isEnabled={trackFormSubmissions} />
            </div>
        </div>
    );
};

export default FormTab;
