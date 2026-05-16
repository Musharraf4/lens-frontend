"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, getSourceIcon } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
    Bell,
    Check,
} from "lucide-react";
import {
    useNotifications,
    useMarkNotificationAsRead,
    useUnreadNotificationsCount,
    useMarkAllNotificationsAsRead,
    DisplayNotificationType,
    DisplayNotification,
} from "@/services/notifications.api";
import { useSelectedCompanyStore } from "@/store/SelectedCompany";
import { formatNotificationDate, notificationTypeColorMap, notificationTypeCopy, transformNotification } from "@/lib/notificationsUtils";


const notificationTypeLabelMap: Record<DisplayNotificationType, string> = {
    lead_form: "Form",
    lead_chat: "Chat",
    lead_call: "Call",
    lead_conversion: "Conversion",
    integration_connected: "Connected",
    integration_disconnected: "Disconnected",
    integration_primary_set: "Primary",
    chatbot_deleted: "Chatbot Deleted",
    chatbot_created: "Chatbot Created",
    account_added: "Invitation Sent",
    phone_number_created: "Phone Number",
    phone_number_deleted: "Phone Number",
    new_account: "New Account",
};

export function NotificationPopover(): React.ReactElement {
    const router = useRouter();
    const { selectedCompany } = useSelectedCompanyStore();
    const [isPopoverOpen, setIsPopoverOpen] = React.useState<boolean>(false);
    const [currentPage, setCurrentPage] = React.useState<number>(1);
    const [allNotifications, setAllNotifications] = React.useState<DisplayNotification[]>([]);
    const [isLoadingMore, setIsLoadingMore] = React.useState<boolean>(false);
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const observerTargetRef = React.useRef<HTMLDivElement>(null);
    const markAsReadMutation = useMarkNotificationAsRead();
    const markAllAsReadMutation = useMarkAllNotificationsAsRead();

    const companyId = selectedCompany?.company?.id || "";

    const { data: notificationsData, isLoading, isFetching, refetch } = useNotifications(
        {
            companyId,
            page: currentPage,
            size: 10,
            sort_by: "created_at",
            sort_order: "desc",
        },
        isPopoverOpen && !!companyId
    );
    const {
        data: unreadCountData,
        refetch: refetchUnreadCount,
        isFetching: isUnreadCountFetching,
    } = useUnreadNotificationsCount(companyId, !!companyId);

    React.useEffect(() => {
        if (isPopoverOpen) {
            refetch();
            refetchUnreadCount();
        }
    }, [isPopoverOpen]);

    // Simplified: Just set the data directly when it comes from API
    React.useEffect(() => {
        if (!notificationsData?.items) {
            return;
        }
        const transformed = notificationsData.items.map(transformNotification);

        if (notificationsData.page === 1) {
            // Page 1: Replace all notifications with fresh data
            setAllNotifications(transformed);
        } else {
            // Page > 1: Append new notifications (dedupe by id)
            setAllNotifications((prev) => {
                const existingIds = new Set(prev.map((item) => item.id));
                const newItems = transformed.filter((item) => !existingIds.has(item.id));
                return [...prev, ...newItems];
            });
        }
        setIsLoadingMore(false);
    }, [notificationsData]);

    // Reset notifications when company changes
    React.useEffect(() => {
        if (companyId) {
            setAllNotifications([]);
            setCurrentPage(1);
            setIsLoadingMore(false);
        }
    }, [companyId]);

    const unreadCount = unreadCountData?.unread_count ?? 0;
    const hasMorePages = notificationsData ? currentPage < notificationsData.pages : false;

    const handleLoadMore = React.useCallback(() => {
        if (isLoadingMore || isFetching || !hasMorePages) {
            return;
        }
        setIsLoadingMore(true);
        setCurrentPage((prev) => prev + 1);
    }, [isLoadingMore, isFetching, hasMorePages]);

    // Intersection Observer for infinite scroll
    React.useEffect(() => {
        if (!isPopoverOpen || !hasMorePages) {
            return;
        }

        const scrollContainer = scrollContainerRef.current;
        const target = observerTargetRef.current;

        if (!target || !scrollContainer) {
            return;
        }

        const handleScroll = () => {
            if (isLoadingMore || isFetching || !hasMorePages) {
                return;
            }

            const scrollTop = scrollContainer.scrollTop;
            const scrollHeight = scrollContainer.scrollHeight;
            const clientHeight = scrollContainer.clientHeight;

            // Trigger when within 100px of bottom
            if (scrollTop + clientHeight >= scrollHeight - 100) {
                handleLoadMore();
            }
        };

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry.isIntersecting && hasMorePages && !isLoadingMore && !isFetching) {
                    handleLoadMore();
                }
            },
            {
                root: scrollContainer,
                rootMargin: "50px",
                threshold: 0.1,
            }
        );

        observer.observe(target);
        scrollContainer.addEventListener("scroll", handleScroll);

        return () => {
            observer.disconnect();
            scrollContainer.removeEventListener("scroll", handleScroll);
        };
    }, [hasMorePages, isLoadingMore, isFetching, isPopoverOpen, handleLoadMore, allNotifications.length]);

    const handleNotificationClick = async (notification: DisplayNotification) => {
        setIsPopoverOpen(false);
        if (notification.contact_id)
            router.push(`/contacts/${notification.contact_id}`);
        if (notification.type === "new_account") {
            router.push(`/accounts`);
        } else if (notification.type === "integration_connected" || notification.type === "integration_disconnected" || notification.type === "integration_primary_set") {
            router.push(`/integrations`);
        } else if (notification.type === "chatbot_created" || notification.type === "chatbot_deleted") {
            router.push(`/lead-concierge`);
        } else if (notification.type === "phone_number_created" || notification.type === "phone_number_deleted") {
            router.push(`/tracking`);
        } else {
            router.push(`/home`);
        }
        if (!notification.is_read) {
            try {
                await markAsReadMutation.mutateAsync({
                    notificationId: notification.notificationId,
                    companyId: notification.companyId,
                });
                setAllNotifications((prev) =>
                    prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
                );
                refetchUnreadCount();
            } catch (error) {
                console.error("Failed to mark notification as read:", error);
            }
        }
    };

    const handleQuickMarkRead = async (
        event: React.MouseEvent<HTMLButtonElement>,
        notification: DisplayNotification
    ) => {
        event.stopPropagation();
        if (notification.is_read) {
            return;
        }
        try {
            setAllNotifications((prev) =>
                prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
            );
            await markAsReadMutation.mutateAsync({
                notificationId: notification.notificationId,
                companyId: notification.companyId,
            });
            refetchUnreadCount();
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!companyId) return;
        try {
            await markAllAsReadMutation.mutateAsync({ companyId });
            setAllNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
            refetchUnreadCount();
        } catch (error) {
            console.error("Failed to mark all notifications as read:", error);
        }
    };
    return (
        <Popover
            open={isPopoverOpen}
            onOpenChange={(nextOpen) => {
                setIsPopoverOpen(nextOpen);
                if (nextOpen) {
                    // When opening: reset to page 1 and clear notifications
                    // Fresh data will be fetched and set directly
                    setAllNotifications([]);
                    setCurrentPage(1);
                    setIsLoadingMore(false);
                } else {
                    // When closing: reset page for next time
                    setCurrentPage(1);
                    setIsLoadingMore(false);
                }
            }}
        >
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-neutral-500 hover:bg-gray-100 hover:text-neutral-500 rounded-md transition-colors"
                    data-tour="notifications"
                >
                    <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full bg-emerald-500 px-1 text-[10px] font-semibold leading-none text-white flex items-center justify-center">
                            {isUnreadCountFetching ? "…" : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[90vw] max-w-sm sm:max-w-md p-0">
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                    <div>
                        <p className="text-sm font-semibold text-gray-900">Notifications</p>
                        <p className="text-xs text-gray-500">{unreadCount} unread</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-neutral-500 hover:text-neutral-900"
                        onClick={handleMarkAllAsRead}
                        disabled={unreadCount === 0 || markAllAsReadMutation.isPending}
                    >
                        Mark all as read
                    </Button>
                </div>
                <div ref={scrollContainerRef} className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                    {(isLoading || isFetching) && allNotifications.length === 0 ? (
                        Array.from({ length: 4 }).map((_, index) => (
                            <div key={`skeleton-${index}`} className="flex w-full flex-row items-start gap-3 px-4 py-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="flex flex-1 flex-col gap-2">
                                    <Skeleton className="h-3 w-2/3" />
                                    <Skeleton className="h-3 w-4/5" />
                                    <Skeleton className="h-3 w-1/3" />
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="h-3 w-10" />
                                </div>
                            </div>
                        ))
                    ) : allNotifications.length === 0 && !isLoading && !isFetching ? (
                        <div className="flex items-center justify-center py-8 px-4">
                            <p className="text-sm text-gray-500">No notifications</p>
                        </div>
                    ) : (
                        <>
                            {allNotifications.map((notification) => {
                                const description = notificationTypeCopy[notification.type] ?? "left an update";
                                const { date, time } = formatNotificationDate(notification.date);
                                const typeColor = notificationTypeColorMap[notification.type];

                                return (
                                    <div
                                        key={notification.id}
                                        className={cn(
                                            "group relative flex w-full items-start overflow-hidden text-left ",
                                            !notification.is_read ? "bg-neutral-50" : "bg-white",
                                            !notification.is_read && "hover:bg-neutral-25 cursor-pointer transition-colors duration-150"
                                        )}
                                    >
                                        <button
                                            className={`flex w-full flex-row items-start gap-3 px-4 py-3 text-left ${!notification.is_read && 'transition-transform duration-300 ease-out group-hover:-translate-x-12'} `}
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-50 text-neutral-700">
                                                <img
                                                    src={getSourceIcon((notification.channel ?? "direct") as string)}
                                                    alt="Source Icon"
                                                    className="h-4 w-4"
                                                />
                                            </div>
                                            <div className="flex flex-1 flex-col gap-1">
                                                <p className="text-sm text-gray-900">
                                                    <span className="font-semibold">{notification.name ?? "A Visitor"}</span>{" "}
                                                    {description}.
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {notification.detailLine ?? notification.message}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1 text-xs font-medium text-gray-400">
                                                <span>{date}</span>
                                                <span className="text-[11px] text-gray-500">{time}</span>
                                                <span
                                                    className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                                                    style={{ backgroundColor: typeColor }}
                                                >
                                                    {notificationTypeLabelMap[notification.type]}
                                                </span>
                                            </div>
                                        </button>
                                        {!notification.is_read && (
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex w-12 items-center justify-center transition-all duration-300 ease-out opacity-0 translate-x-full group-hover:pointer-events-auto group-hover:translate-x-0 group-hover:opacity-100 group-hover:delay-200">
                                                <button
                                                    title="Mark as read"
                                                    className="flex items-center justify-center rounded-full bg-white p-2 text-emerald-600 shadow-sm transition hover:bg-emerald-50"
                                                    onClick={(event) => handleQuickMarkRead(event, notification)}
                                                >
                                                    <Check className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            {hasMorePages && (
                                <div ref={observerTargetRef} className="h-10 w-full" />
                            )}
                            {isLoadingMore && (
                                <div className="px-4 py-3">
                                    <div className="flex items-center justify-center rounded-md  bg-white/60 py-2">
                                        <span className="text-xs font-medium text-neutral-500 animate-pulse">
                                            Loading more notifications…
                                        </span>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
