import React, { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../ui/card";
import { Bell, Plus, Pencil, Trash2 } from "lucide-react";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { useSelectedCompanyStore } from "@/store/SelectedCompany";
import { Role } from "@/enums";
import {
    useUpdateCompanyAlerts,
    useGetNotificationRecipients,
    useCreateNotificationRecipients,
    useUpdateNotificationRecipient,
    useDeleteNotificationRecipient,
} from "@/services/user.api";
import { showToast } from "../Toast";
import { NotificationRecipientModal } from "./NotificationRecipientModal";
import { NotificationRecipient } from "@/types";
import { Skeleton } from "../ui/skeleton";
import { MdOutlineNotificationAdd } from "react-icons/md";

function NotificationsSettingsTab() {
    const { selectedCompany, setSelectedCompany } = useSelectedCompanyStore();
    const [formSubmissionEmail, setFormSubmissionEmail] = useState(
        selectedCompany?.owner_notification_settings?.is_notify_form_submission ||
        false
    );
    const [callTrackingEmail, setCallTrackingEmail] = useState(
        selectedCompany?.owner_notification_settings?.is_notify_call_scheduled ||
        false
    );
    const [chatTrackingEmail, setChatTrackingEmail] = useState(
        selectedCompany?.owner_notification_settings?.is_notify_chat_scheduled ||
        false
    );

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecipient, setEditingRecipient] =
        useState<NotificationRecipient | null>(null);
    const [recipientToDelete, setRecipientToDelete] =
        useState<NotificationRecipient | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const isNotOwnerOrAdmin =
        selectedCompany?.role !== Role.Admin &&
        selectedCompany?.role !== Role.Owner;
    const companyId = selectedCompany?.company?.id || "";

    const { mutate: updateAlerts, isPending } = useUpdateCompanyAlerts();
    const {
        data: recipients = [],
        isLoading: isLoadingRecipients,
        refetch: refetchRecipients,
    } = useGetNotificationRecipients(companyId);
    const { mutate: createRecipient, isPending: isCreatingRecipient } =
        useCreateNotificationRecipients();
    const { mutate: updateRecipient, isPending: isUpdatingRecipient } =
        useUpdateNotificationRecipient();
    const { mutate: deleteRecipient, isPending: isDeletingRecipient } =
        useDeleteNotificationRecipient();

    const handleToggle = (
        key:
            | "form_submission_email"
            | "call_tracking_email"
            | "chat_tracking_email",
        value: boolean
    ) => {
        if (!selectedCompany) return;

        const payload = {
            is_notify_form_submission:
                key === "form_submission_email" ? value : formSubmissionEmail,
            is_notify_call_scheduled:
                key === "call_tracking_email" ? value : callTrackingEmail,
            is_notify_chat_scheduled:
                key === "chat_tracking_email" ? value : chatTrackingEmail,
        };

        updateAlerts(
            { companyId, data: payload },
            {
                onSuccess: () => {
                    const updatedCompany = {
                        ...selectedCompany,
                        owner_notification_settings: {
                            is_notify_call_scheduled: payload.is_notify_call_scheduled,
                            is_notify_form_submission: payload.is_notify_form_submission,
                            is_notify_chat_scheduled: payload.is_notify_chat_scheduled,
                        },
                    };
                    setSelectedCompany(updatedCompany);
                    showToast({
                        title: "Updated",
                        description: "Notification preferences updated.",
                        type: "success",
                    });
                },
                onError: () => {
                    showToast({
                        title: "Failed",
                        description: "Could not update notification preferences.",
                        type: "error",
                    });
                    // revert local state
                    if (key === "form_submission_email") setFormSubmissionEmail(!value);
                    if (key === "call_tracking_email") setCallTrackingEmail(!value);
                    if (key === "chat_tracking_email") setChatTrackingEmail(!value);
                },
            }
        );
    };

    useEffect(() => {
        if (selectedCompany) {
            setFormSubmissionEmail(
                selectedCompany?.owner_notification_settings
                    ?.is_notify_form_submission || false
            );
            setCallTrackingEmail(
                selectedCompany?.owner_notification_settings
                    ?.is_notify_call_scheduled || false
            );
            setChatTrackingEmail(
                selectedCompany?.owner_notification_settings
                    ?.is_notify_chat_scheduled || false
            );
        }
    }, [selectedCompany]);

    const handleAddEmail = () => {
        setEditingRecipient(null);
        setIsModalOpen(true);
    };

    const handleEditEmail = (recipient: NotificationRecipient) => {
        setEditingRecipient(recipient);
        setIsModalOpen(true);
    };

    const handleDeleteEmail = (recipient: NotificationRecipient) => {
        if (!selectedCompany || !recipient.id) return;
        setRecipientToDelete(recipient);
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteRecipient = () => {
        if (!selectedCompany || !recipientToDelete?.id) return;

        deleteRecipient(
            { recipientId: recipientToDelete.id },
            {
                onSuccess: () => {
                    showToast({
                        title: "Deleted",
                        description: `${recipientToDelete.email} removed from notification recipients.`,
                        type: "success",
                    });
                    setIsDeleteDialogOpen(false);
                    setRecipientToDelete(null);
                    refetchRecipients();
                },
                onError: (data: any) => {
                    showToast({
                        title: "Failed",
                        description: JSON.stringify(data?.response?.data?.detail) || "Could not remove notification recipient.",
                        type: "error",
                    });
                },
            }
        );
    };

    const closeDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
        setRecipientToDelete(null);
    };

    const handleSaveRecipient = (recipients: NotificationRecipient[]) => {
        if (!selectedCompany || recipients.length === 0) return;

        if (editingRecipient && editingRecipient.id) {
            // Update existing recipient (single recipient in edit mode)
            const data = recipients[0];
            updateRecipient(
                {
                    recipient_id: editingRecipient.id,
                    data: {
                        email: data.email,
                        is_notify_form_submission: data.is_notify_form_submission,
                        is_notify_call_scheduled: data.is_notify_call_scheduled,
                        is_notify_chat_scheduled: data.is_notify_chat_scheduled,
                    },
                },
                {
                    onSuccess: () => {
                        showToast({
                            title: "Updated",
                            description: "Notification recipient updated successfully.",
                            type: "success",
                        });
                        setIsModalOpen(false);
                        setEditingRecipient(null);
                        refetchRecipients();
                    },
                    onError: (data: any) => {
                        showToast({
                            title: "Failed",
                            description: JSON.stringify(data?.response?.data?.detail) || "Could not update notification recipient.",
                            type: "error",
                        });
                    },
                }
            );
        } else {
            // Create new recipients (can be multiple)
            createRecipient(
                {
                    companyId,
                    recipients,
                },
                {
                    onSuccess: () => {
                        showToast({
                            title: "Added",
                            description: `${recipients.length} notification recipient${recipients.length !== 1 ? "s" : ""
                                } added successfully.`,
                            type: "success",
                        });
                        setIsModalOpen(false);
                        refetchRecipients();
                    },
                    onError: (data: any) => {
                        showToast({
                            title: "Failed",
                            description: JSON.stringify(data?.response?.data?.detail) || "Could not add notification recipient.",
                            type: "error",
                        });
                    },
                }
            );
        }
    };

    const getNotificationTypes = (recipient: NotificationRecipient): string[] => {
        const types: string[] = [];
        if (recipient.is_notify_form_submission || recipient.notify_form_scheduled) {
            types.push("Form Submission");
        }
        if (recipient.is_notify_call_scheduled || recipient.notify_call_scheduled) {
            types.push("Call Tracking");
        }
        if (recipient.is_notify_chat_scheduled || recipient.notify_chat_scheduled) {
            types.push("Chat Tracking");
        }
        return types;
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Email Notifications
                    </CardTitle>
                    <CardDescription>
                        Manage your email notification preferences
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 sm:gap-4 lg:grid-cols-3">
                    <div className="flex flex-col gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors h-full">
                        <div className="flex items-center justify-between gap-3">
                            <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                                Form Submission Email
                            </h3>
                            <Switch
                                checked={formSubmissionEmail}
                                onCheckedChange={(v) => {
                                    setFormSubmissionEmail(v);
                                    handleToggle("form_submission_email", v);
                                }}
                                disabled={isNotOwnerOrAdmin || isPending}
                            />
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500">
                            Receive email notifcations when forms are submitted
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors h-full">
                        <div className="flex items-center justify-between gap-3">
                            <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                                Call Tracking Email
                            </h3>
                            <Switch
                                checked={callTrackingEmail}
                                onCheckedChange={(v) => {
                                    setCallTrackingEmail(v);
                                    handleToggle("call_tracking_email", v);
                                }}
                                disabled={isNotOwnerOrAdmin || isPending}
                            />
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500">
                            Receive email notifcations for call tracking events
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors h-full">
                        <div className="flex items-center justify-between gap-3">
                            <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                                Chat Tracking Email
                            </h3>
                            <Switch
                                checked={chatTrackingEmail}
                                onCheckedChange={(v) => {
                                    setChatTrackingEmail(v);
                                    handleToggle("chat_tracking_email", v);
                                }}
                                disabled={isNotOwnerOrAdmin || isPending}
                            />
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500">
                            Receive email notifcations for chat tracking events
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <MdOutlineNotificationAdd className="h-5 w-5" />
                                Additional Notification Emails
                            </CardTitle>
                            <CardDescription>
                                Add teammates or stakeholders who should receive selected
                                notifications.
                            </CardDescription>
                        </div>
                        <Button
                            type="button"
                            onClick={handleAddEmail}
                            disabled={
                                isNotOwnerOrAdmin ||
                                isCreatingRecipient ||
                                isUpdatingRecipient ||
                                isDeletingRecipient
                            }
                            className="flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Add Emails
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoadingRecipients ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-20 w-full" />
                            ))}
                        </div>
                    ) : recipients.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
                            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-sm font-medium text-gray-900 mb-1">
                                No notification emails added
                            </p>
                            <p className="text-xs text-gray-500 mb-4">
                                Add email addresses to receive notifications for form
                                submissions, calls, and chats.
                            </p>
                            {/* <Button
                                type="button"
                                variant="outline"
                                onClick={handleAddEmail}
                                disabled={
                                    isNotOwnerOrAdmin ||
                                    isCreatingRecipient ||
                                    isUpdatingRecipient ||
                                    isDeletingRecipient
                                }
                                className="flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Add Email
                            </Button> */}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recipients.map((recipient) => (
                                <div
                                    key={recipient.email}
                                    className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {recipient.email}
                                        </p>
                                        <div className="mt-1 flex flex-wrap gap-2">
                                            {getNotificationTypes(recipient).length ? (
                                                getNotificationTypes(recipient).map((type) => (
                                                    <span
                                                        key={`${recipient.email}-${type}`}
                                                        className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-700"
                                                    >
                                                        {type}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-[11px] text-gray-400">
                                                    No notification types selected
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEditEmail(recipient)}
                                            disabled={
                                                isNotOwnerOrAdmin ||
                                                isCreatingRecipient ||
                                                isUpdatingRecipient ||
                                                isDeletingRecipient
                                            }
                                            className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
                                        >
                                            <Pencil className="h-4 w-4" />
                                            <span className="sr-only">Edit</span>
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteEmail(recipient)}
                                            disabled={
                                                isNotOwnerOrAdmin ||
                                                isCreatingRecipient ||
                                                isUpdatingRecipient ||
                                                isDeletingRecipient ||
                                                !recipient.id
                                            }
                                            className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">Delete</span>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <NotificationRecipientModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSave={handleSaveRecipient}
                recipient={editingRecipient}
                isLoading={isCreatingRecipient || isUpdatingRecipient}
            />

            <Dialog open={isDeleteDialogOpen} onOpenChange={closeDeleteDialog}>
                <DialogContent className="max-w-md p-3">
                    <DialogHeader>
                        <DialogTitle>Remove notification recipient?</DialogTitle>
                        <DialogDescription>
                            This will remove{" "}
                            <span className="font-semibold text-gray-900">
                                {recipientToDelete?.email}
                            </span>{" "}
                            from additional notification emails.
                        </DialogDescription>
                    </DialogHeader>
                    <p className="text-sm text-gray-500">
                        They will no longer receive notifications for the selected
                        events. This action cannot be undone.
                    </p>
                    <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={closeDeleteDialog}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={confirmDeleteRecipient}
                            disabled={isDeletingRecipient}
                            className="w-full sm:w-auto"
                        >
                            {isDeletingRecipient ? "Removing..." : "Remove Email"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default NotificationsSettingsTab;
