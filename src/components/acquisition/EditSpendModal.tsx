"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BiDollar } from "react-icons/bi";
import { cn } from "@/lib/utils";

interface EditSpendModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentAmount?: number | string | null;
    onSave: (amount: number, frequency: string) => void;
    isLoading?: boolean;
    frequency?: string;
}

const FREQUENCY_OPTIONS = [
    // { label: "Daily", value: "daily" },
    // { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" },
    // { label: "Quarterly", value: "quarterly" },
    { label: "Yearly", value: "yearly" },
];

export function EditSpendModal({
    open,
    onOpenChange,
    currentAmount,
    onSave,
    isLoading = false,
    frequency,
}: EditSpendModalProps) {
    const [amount, setAmount] = useState<string>("");
    const [selectedFrequency, setSelectedFrequency] = useState<string>("monthly");

    useEffect(() => {
        if (open) {
            // Initialize with current amount if available
            setAmount(currentAmount ? String(currentAmount) : "");
            setSelectedFrequency(frequency || "monthly");
        }
    }, [open, currentAmount, frequency]);

    const handleSave = () => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount < 0) {
            return;
        }
        onSave(numAmount, selectedFrequency);
    };

    const handleCancel = () => {
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md rounded-2xl p-6">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-black">
                        SEO Budget
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {/* Amount Input */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-500 mb-2">
                            Amount
                        </label>
                        <div className="relative">
                            <BiDollar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                            <input
                                type="number"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 text-sm border border-neutral-100 rounded-full bg-white focus:border-neutral-300 focus:outline-none"
                                step="0.01"
                                min="0"
                            />
                        </div>
                    </div>

                    {/* Frequency Selection */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-500 mb-3">
                            Frequency
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {FREQUENCY_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setSelectedFrequency(option.value)}
                                    className={cn(
                                        "px-4 py-2 rounded-full text-sm font-medium transition-all",
                                        selectedFrequency === option.value
                                            ? "bg-black text-white"
                                            : "bg-neutral-25 text-neutral-600 hover:bg-neutral-100 border border-neutral-100"
                                    )}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t border-neutral-100 mt-6">
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
                        disabled={isLoading || !amount || parseFloat(amount) < 0}
                        className="px-6 py-2 rounded-full bg-black hover:bg-neutral-800 text-white"
                    >
                        {isLoading ? "Saving..." : "Save"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

