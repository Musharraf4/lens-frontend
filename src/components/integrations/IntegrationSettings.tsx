"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { GAdsSettingsPayload } from "@/services/integrations.api";

export interface IntegrationSettingsData {
    enhanced_conversions: boolean;
    send_calls_as_conversions: boolean;
    conversion_action_type: "single" | "separate";
    send_forms_as_conversions: boolean;
    send_leads_as_conversions: boolean;
    primary_conversion_action: string | null;
    send_deals_as_conversions: boolean;
    send_deal_values: boolean;
    secondary_conversion_action: string | null;
    send_call_values: boolean;
    send_form_values: boolean;
}

interface IntegrationSettingsProps {
    settings: IntegrationSettingsData;
    onSettingsChange: (settings: GAdsSettingsPayload) => void;
    disabled?: boolean;
    updatingKey?: keyof GAdsSettingsPayload | null;
}

const IntegrationSettings: React.FC<IntegrationSettingsProps> = ({
    settings,
    onSettingsChange,
    disabled = false,
    updatingKey = null,
}) => {
    const handleCheckboxChange = (key: keyof IntegrationSettingsData, checked: boolean) => {
        onSettingsChange({ [key]: checked });
    };

    const handleRadioChange = (value: "single" | "separate") => {
        onSettingsChange({ conversion_action_type: value });
    };

    const isSettingUpdating = (key: keyof GAdsSettingsPayload) => {
        return updatingKey === key;
    };

    return (
        <div className="space-y-3">
            <p className="font-medium text-md mb-1">Conversions</p>

            {/* Enhanced Conversions Section */}
            {/* <div className="space-y-3">
                <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                        Enhanced conversions
                    </h3>
                    <p className="text-xs text-gray-600 leading-5 mb-3">
                        Enhanced conversions is an upgraded version of offline conversion import
                        that uses customer data (like phone numbers) to improve accuracy and
                        bidding performance in Google Ads. This setting must be enabled in your
                        Google Ads account
                    </p>
                    {isSettingUpdating("enhanced_conversions") ? (
                        <Skeleton className="h-5 w-full" />
                    ) : (
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="enhanced_conversions"
                                checked={settings.enhanced_conversions}
                                onCheckedChange={(checked) =>
                                    handleCheckboxChange("enhanced_conversions", checked as boolean)
                                }
                                disabled={disabled}
                            />
                            <Label
                                htmlFor="enhanced_conversions"
                                className="text-sm font-normal text-gray-900 cursor-pointer"
                            >
                                Turn on enhanced conversions
                            </Label>
                        </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                        We'll automatically create new conversion actions in your Google Ads
                        account and report leads as conversions.
                    </p>
                </div>
            </div> */}
            {/* Leads Section */}
            <p className="font-medium text-sm">Leads</p>
            <div className="space-y-3">
                {isSettingUpdating("send_leads_as_conversions") ? (
                    <Skeleton className="h-5 w-full" />
                ) : (
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="send_leads_as_conversions"
                            checked={settings.send_leads_as_conversions}
                            onCheckedChange={(checked) =>
                                handleCheckboxChange("send_leads_as_conversions", checked as boolean)
                            }
                            disabled={disabled}
                        />
                        <Label
                            htmlFor="send_leads_as_conversions"
                            className="text-sm font-normal text-gray-900 cursor-pointer"
                        >
                            Send leads as conversions
                        </Label>
                    </div>
                )}
            </div>

            {/* Calls Section */}
            <p className="font-medium text-sm">Calls</p>
            <div className="space-y-3">
                {isSettingUpdating("send_calls_as_conversions") ? (
                    <Skeleton className="h-5 w-full" />
                ) : (
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="send_calls_as_conversions"
                            checked={settings.send_calls_as_conversions}
                            onCheckedChange={(checked) =>
                                handleCheckboxChange("send_calls_as_conversions", checked as boolean)
                            }
                            disabled={disabled}
                        />
                        <Label
                            htmlFor="send_calls_as_conversions"
                            className="text-sm font-normal text-gray-900 cursor-pointer"
                        >
                            Send calls as conversions
                        </Label>
                    </div>
                )}

                {settings.send_calls_as_conversions && (
                    <div className="ml-6 space-y-2">
                        {isSettingUpdating("conversion_action_type") ? (
                            <Skeleton className="h-10 w-full" />
                        ) : (
                            <RadioGroup
                                value={settings.conversion_action_type}
                                onValueChange={handleRadioChange}
                                disabled={disabled}
                                className="space-y-2"
                            >
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem
                                        value="single"
                                        id="conversion_action_single"
                                        className="h-4 w-4"
                                    />
                                    <Label
                                        htmlFor="conversion_action_single"
                                        className="text-sm font-normal text-gray-900 cursor-pointer"
                                    >
                                        Create one conversion action for all calls
                                    </Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem
                                        value="separate"
                                        id="conversion_action_separate"
                                        className="h-4 w-4"
                                    />
                                    <Label
                                        htmlFor="conversion_action_separate"
                                        className="text-sm font-normal text-gray-900 cursor-pointer"
                                    >
                                        Create separate conversion actions for first-time callers and
                                        repeat callers
                                    </Label>
                                </div>
                            </RadioGroup>
                        )}
                        <p className="text-xs text-gray-500 ml-6">
                            Recommended for people using Google's automated bid strategy to
                            optimize campaigns around first-time callers.
                        </p>
                    </div>
                )}
            </div>

            {/* Forms Section */}
            <p className="font-medium text-sm">Forms</p>
            <div className="space-y-3">
                {isSettingUpdating("send_forms_as_conversions") ? (
                    <Skeleton className="h-5 w-full" />
                ) : (
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="send_forms_as_conversions"
                            checked={settings.send_forms_as_conversions}
                            onCheckedChange={(checked) =>
                                handleCheckboxChange("send_forms_as_conversions", checked as boolean)
                            }
                            disabled={disabled}
                        />
                        <Label
                            htmlFor="send_forms_as_conversions"
                            className="text-sm font-normal text-gray-900 cursor-pointer"
                        >
                            Send form submissions as conversions
                        </Label>
                    </div>
                )}
            </div>



            {/* Deals Section */}
            <p className="font-medium text-sm">Cases</p>
            <div className="space-y-3">
                {isSettingUpdating("send_deals_as_conversions") ? (
                    <Skeleton className="h-5 w-full" />
                ) : (
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="send_deals_as_conversions"
                            checked={settings.send_deals_as_conversions}
                            onCheckedChange={(checked) =>
                                handleCheckboxChange("send_deals_as_conversions", checked as boolean)
                            }
                            disabled={disabled}
                        />
                        <Label
                            htmlFor="send_deals_as_conversions"
                            className="text-sm font-normal text-gray-900 cursor-pointer"
                        >
                            Send deals as conversions
                        </Label>
                    </div>
                )}
            </div>

            {/* Conversion Values Section */}
            <div className="space-y-4 border-t pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Conversion Values
                </h3>

                {/* Call Values */}
                <div className="space-y-2">
                    <p className="text-xs text-gray-600 leading-5">
                        Input the monetary value of each call in your caller timeline, and
                        we'll report it to Google Ads along with the conversion.
                    </p>
                    {isSettingUpdating("send_call_values") ? (
                        <Skeleton className="h-5 w-full" />
                    ) : (
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="send_call_values"
                                checked={settings.send_call_values}
                                onCheckedChange={(checked) =>
                                    handleCheckboxChange("send_call_values", checked as boolean)
                                }
                                disabled={disabled}
                            />
                            <Label
                                htmlFor="send_call_values"
                                className="text-sm font-normal text-gray-900 cursor-pointer"
                            >
                                Send call values
                            </Label>
                        </div>
                    )}
                </div>

                {/* Form Values */}
                <div className="space-y-2">
                    <p className="text-xs text-gray-600 leading-5">
                        Input the monetary value of each form submission in your timeline,
                        and we'll report it to Google Ads along with the conversion.
                    </p>
                    {isSettingUpdating("send_form_values") ? (
                        <Skeleton className="h-5 w-full" />
                    ) : (
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="send_form_values"
                                checked={settings.send_form_values}
                                onCheckedChange={(checked) =>
                                    handleCheckboxChange("send_form_values", checked as boolean)
                                }
                                disabled={disabled}
                            />
                            <Label
                                htmlFor="send_form_values"
                                className="text-sm font-normal text-gray-900 cursor-pointer"
                            >
                                Send form values
                            </Label>
                        </div>
                    )}
                </div>

                {/* Deal Values */}
                <div className="space-y-2">
                    <p className="text-xs text-gray-600 leading-5">
                        Input the monetary value of each deal in your timeline, and we'll
                        report it to Google Ads along with the conversion.
                    </p>
                    {isSettingUpdating("send_deal_values") ? (
                        <Skeleton className="h-5 w-full" />
                    ) : (
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="send_deal_values"
                                checked={settings.send_deal_values}
                                onCheckedChange={(checked) =>
                                    handleCheckboxChange("send_deal_values", checked as boolean)
                                }
                                disabled={disabled}
                            />
                            <Label
                                htmlFor="send_deal_values"
                                className="text-sm font-normal text-gray-900 cursor-pointer"
                            >
                                Send deal values
                            </Label>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IntegrationSettings;


