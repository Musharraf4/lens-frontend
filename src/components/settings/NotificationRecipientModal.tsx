"use client";

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { NotificationRecipient } from '@/types';
import { Plus, Trash2 } from 'lucide-react';

interface NotificationRecipientModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (data: NotificationRecipient[]) => void;
    recipient?: NotificationRecipient | null;
    isLoading?: boolean;
}

type RecipientRow = {
    id: string;
    email: string;
    is_notify_form_submission: boolean;
    is_notify_call_scheduled: boolean;
    is_notify_chat_scheduled: boolean;
    emailError?: string;
};

const generateRowId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return Math.random().toString(36).slice(2);
};

export function NotificationRecipientModal({
    open,
    onOpenChange,
    onSave,
    recipient,
    isLoading = false,
}: NotificationRecipientModalProps) {
    const [rows, setRows] = useState<RecipientRow[]>([]);
    const [formSubmission, setFormSubmission] = useState(false);
    const [callTracking, setCallTracking] = useState(false);
    const [chatTracking, setChatTracking] = useState(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    useEffect(() => {
        if (open) {
            if (recipient) {
                // Edit mode - single recipient
                setRows([{
                    id: generateRowId(),
                    email: recipient.email,
                    is_notify_form_submission: Boolean(recipient.notify_form_scheduled),
                    is_notify_call_scheduled: Boolean(recipient.notify_call_scheduled),
                    is_notify_chat_scheduled: Boolean(recipient.notify_chat_scheduled),
                }]);
                setFormSubmission(recipient.is_notify_form_submission);
                setCallTracking(recipient.is_notify_call_scheduled);
                setChatTracking(recipient.is_notify_chat_scheduled);
            } else {
                // Add mode - start with one empty row
                setRows([{
                    id: generateRowId(),
                    email: '',
                    is_notify_form_submission: false,
                    is_notify_call_scheduled: false,
                    is_notify_chat_scheduled: false,
                }]);
                setFormSubmission(false);
                setCallTracking(false);
                setChatTracking(false);
            }
        }
    }, [open, recipient]);

    const addRow = () => {
        setRows((prev) => [
            ...prev,
            {
                id: generateRowId(),
                email: '',
                is_notify_form_submission: formSubmission,
                is_notify_call_scheduled: callTracking,
                is_notify_chat_scheduled: chatTracking,
            }
        ]);
    };

    const removeRow = (id: string) => {
        setRows((prev) => prev.filter((row) => row.id !== id));
    };

    const updateRow = (id: string, field: keyof Omit<RecipientRow, 'id' | 'emailError'>, value: any) => {
        setRows((prev) => prev.map((row) => {
            if (row.id === id) {
                return { ...row, [field]: value, emailError: undefined };
            }
            return row;
        }));
    };

    const validateRow = (row: RecipientRow): boolean => {
        if (!row.email.trim()) {
            setRows((prev) => prev.map((r) =>
                r.id === row.id ? { ...r, emailError: 'Email is required' } : r
            ));
            return false;
        }
        if (!emailRegex.test(row.email.trim())) {
            setRows((prev) => prev.map((r) =>
                r.id === row.id ? { ...r, emailError: 'Please enter a valid email address' } : r
            ));
            return false;
        }
        const hasPreference = row.is_notify_form_submission || row.is_notify_call_scheduled || row.is_notify_chat_scheduled;
        if (!hasPreference) {
            setRows((prev) => prev.map((r) =>
                r.id === row.id ? { ...r, emailError: 'Select at least one notification type' } : r
            ));
            return false;
        }
        return true;
    };

    const handleSave = () => {
        // Validate all rows
        const allValid = rows.every(validateRow);
        if (!allValid) {
            return;
        }

        // Check for duplicate emails
        const emails = rows.map(r => r.email.trim().toLowerCase());
        const duplicates = emails.filter((email, index) => emails.indexOf(email) !== index);
        if (duplicates.length > 0) {
            const duplicateEmail = duplicates[0];
            setRows((prev) => prev.map((row) => {
                if (row.email.trim().toLowerCase() === duplicateEmail) {
                    return { ...row, emailError: 'Duplicate email address' };
                }
                return row;
            }));
            return;
        }

        const recipients: NotificationRecipient[] = rows.map((row) => ({
            email: row.email.trim(),
            is_notify_form_submission: row.is_notify_form_submission,
            is_notify_call_scheduled: row.is_notify_call_scheduled,
            is_notify_chat_scheduled: row.is_notify_chat_scheduled,
        }));

        onSave(recipients);
    };

    const handleClose = () => {
        if (!isLoading) {
            onOpenChange(false);
        }
    };

    const handleToggleAll = (field: 'is_notify_form_submission' | 'is_notify_call_scheduled' | 'is_notify_chat_scheduled', value: boolean) => {
        setRows((prev) => prev.map((row) => ({ ...row, [field]: value })));
        if (field === 'is_notify_form_submission') setFormSubmission(value);
        if (field === 'is_notify_call_scheduled') setCallTracking(value);
        if (field === 'is_notify_chat_scheduled') setChatTracking(value);
    };

    const allRowsValid = rows.length > 0 && rows.every((row) => {
        const emailValid = row.email.trim() && emailRegex.test(row.email.trim());
        const hasPreference = row.is_notify_form_submission || row.is_notify_call_scheduled || row.is_notify_chat_scheduled;
        return emailValid && hasPreference;
    });

    const hasNoDuplicates = rows.length === 0 || new Set(rows.map(r => r.email.trim().toLowerCase())).size === rows.length;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col p-3 sm:p-4 md:p-6">
                <DialogHeader className="flex-shrink-0 pb-1 sm:pb-2">
                    <DialogTitle className="text-lg sm:text-xl md:text-2xl font-semibold">
                        {recipient ? 'Edit Notification Email' : 'Add Notification Emails'}
                    </DialogTitle>
                    <DialogDescription className="text-sm sm:text-base">
                        {recipient
                            ? 'Update the email and notification preferences for this recipient.'
                            : 'Add one or more email addresses to receive notifications. You can configure preferences for each email individually.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-2 sm:space-y-4">
                    {/* Email Rows */}
                    <div className="space-y-3 sm:space-y-4">
                        {rows.map((row, index) => (
                            <div
                                key={row.id}
                                className="relative rounded-xl border-2 border-gray-200 bg-white p-3 sm:p-4 md:p-5 hover:border-gray-300 transition-colors"
                            >
                                {/* Remove Button - Top Right Corner */}
                                {rows.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeRow(row.id)}
                                        disabled={isLoading}
                                        className="absolute top-2 right-2 sm:top-3 sm:right-3 h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0 z-10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Remove</span>
                                    </Button>
                                )}

                                <div className="flex flex-col md:flex-row items-start justify-between gap-3 sm:gap-4 md:gap-6">
                                    {/* Email Input - Left side on md+ */}
                                    <div className="w-full md:w-60 lg:w-60 flex-shrink-0 space-y-2">
                                        <Label htmlFor={`email-${row.id}`} className="text-sm font-medium text-gray-700">
                                            Email Address {rows.length > 1 && (
                                                <span className="ml-1 text-xs text-gray-500">#{index + 1}</span>
                                            )}
                                        </Label>
                                        <Input
                                            id={`email-${row.id}`}
                                            type="email"
                                            placeholder="name@company.com"
                                            value={row.email}
                                            onChange={(e) => updateRow(row.id, 'email', e.target.value)}
                                            onBlur={() => {
                                                if (row.email.trim()) {
                                                    validateRow(row);
                                                }
                                            }}
                                            disabled={isLoading}
                                            className={`w-full ${row.emailError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                        />
                                        {row.emailError && (
                                            <p className="text-xs sm:text-sm text-red-500">{row.emailError}</p>
                                        )}
                                    </div>

                                    {/* Notification Preferences - Right side on md+ */}
                                    <div className="flex-1 w-full space-y-2 sm:space-y-3">
                                        <Label className="text-sm font-medium text-gray-700">Notification Preferences</Label>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                                            {/* Form Submission */}
                                            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-2.5 sm:p-3 hover:bg-gray-50 transition-colors">
                                                <div className="flex-1 min-w-0 pr-2">
                                                    <p className="text-xs sm:text-sm font-medium text-gray-900">Form Submission</p>
                                                </div>
                                                <Switch
                                                    checked={row.is_notify_form_submission}
                                                    onCheckedChange={(v) => updateRow(row.id, 'is_notify_form_submission', v)}
                                                    disabled={isLoading}
                                                    className="flex-shrink-0"
                                                />
                                            </div>

                                            {/* Call Tracking */}
                                            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-2.5 sm:p-3 hover:bg-gray-50 transition-colors">
                                                <div className="flex-1 min-w-0 pr-2">
                                                    <p className="text-xs sm:text-sm font-medium text-gray-900">Call Tracking</p>
                                                </div>
                                                <Switch
                                                    checked={row.is_notify_call_scheduled}
                                                    onCheckedChange={(v) => updateRow(row.id, 'is_notify_call_scheduled', v)}
                                                    disabled={isLoading}
                                                    className="flex-shrink-0"
                                                />
                                            </div>

                                            {/* Chat Tracking */}
                                            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-2.5 sm:p-3 hover:bg-gray-50 transition-colors">
                                                <div className="flex-1 min-w-0 pr-2">
                                                    <p className="text-xs sm:text-sm font-medium text-gray-900">Chat Tracking</p>
                                                </div>
                                                <Switch
                                                    checked={row.is_notify_chat_scheduled}
                                                    onCheckedChange={(v) => updateRow(row.id, 'is_notify_chat_scheduled', v)}
                                                    disabled={isLoading}
                                                    className="flex-shrink-0"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add More Button */}
                    {!recipient && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={addRow}
                            disabled={isLoading}
                            className="w-full flex items-center bg-neutral-25 justify-center gap-2 border-dashed h-10 sm:h-11 text-sm sm:text-base"
                        >
                            <Plus className="h-4 w-4" />
                            Add Another Email
                        </Button>
                    )}
                </div>

                <DialogFooter className="flex-shrink-0 border-t pt-3 sm:pt-4 mt-1 sm:mt-4 flex-col sm:flex-row gap-2 sm:gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={isLoading}
                        className="w-full sm:w-auto min-w-[100px] h-10 sm:h-11"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={!allRowsValid || !hasNoDuplicates || isLoading || rows.length === 0}
                        className="w-full sm:w-auto min-w-[120px] h-10 sm:h-11 text-sm sm:text-base"
                    >
                        {isLoading ? 'Saving...' : recipient ? 'Update' : `Add ${rows.length} Email${rows.length !== 1 ? 's' : ''}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
