"use client";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useNumberContext } from "@/store/CreateNumberContext";
import { useSelectedCompanyStore } from "@/store/SelectedCompany";
import { SidebarItem } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { BsLayoutSidebar, BsLayoutSidebarReverse } from "react-icons/bs";
import { MdChevronLeft, MdExpandLess, MdExpandMore } from "react-icons/md";

interface SidebarProps {
  mainItems: SidebarItem[];
  utilityItems: SidebarItem[];
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  isMobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}

export function Sidebar({
  mainItems,
  utilityItems,
  isOpen,
  onOpenChange,
  isMobileOpen,
  onMobileOpenChange,
}: SidebarProps): React.ReactElement {
  const pathname = usePathname();
  const router = useRouter();
  const { setCreateNumberModalOpen } = useNumberContext();
  const { selectedCompany } = useSelectedCompanyStore();
  const inActive = selectedCompany?.subscription_status !== 'active' && selectedCompany?.subscription_status !== 'trialing';
  const allowedSwitchPrefix = "/accounts/switch-to-accounts/";
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const handleLogoClick = () => {
    router.push("/home");
  };

  // Auto-expand parent items when child is active
  useEffect(() => {
    const newExpanded = new Set<string>();

    const checkChildren = (navItems: SidebarItem[]): boolean => {
      return navItems.some((item) => {
        let isActive = false;
        if (item.path && pathname.startsWith(item.path)) {
          isActive = true;
        }
        if (item.children) {
          isActive = checkChildren(item.children) || isActive;
        }
        if (isActive) {
          newExpanded.add(item.title);
        }
        return isActive;
      });
    };

    checkChildren(mainItems);
    setExpandedItems(newExpanded);
  }, [pathname, mainItems]);

  const toggleItem = (title: string) => {
    setExpandedItems((prev: Set<string>) => {
      const newSet = new Set(prev);
      if (newSet.has(title)) {
        newSet.delete(title);
      } else {
        newSet.add(title);
      }
      return newSet;
    });
  };

  // Handle navigation to parent item path
  const handleParentItemClick = (path: string | undefined) => {
    if (!path) return;
    if (inActive) return; // block when inactive
    router.push(path);
  };

  const handleLinkClick = () => {
    setCreateNumberModalOpen(false);
  };

  // Add this effect to prevent background scrolling when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      // Disable scrolling on the body
      document.body.style.overflow = "hidden";
    } else {
      // Re-enable scrolling when sidebar is closed
      document.body.style.overflow = "";
    }

    // Cleanup function to ensure scrolling is re-enabled
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);
  return (
    <>
      {/* Dark overlay for mobile - only visible when mobile sidebar is open */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => onMobileOpenChange?.(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 border-r border-border bg-[#0A0D1C] text-gray-300",
          "transition-all duration-300 ease-in-out",
          "md:z-30 z-50", // Higher z-index on mobile
          "md:translate-x-0",
          isOpen ? "w-64" : "w-16",

          // Desktop sidebar: full screen height + scroll
          "md:top-0 md:h-screen md:overflow-y-auto",

          // Mobile sidebar: below navbar, full height without scroll
          "top-[64px] h-[calc(100vh-64px)] overflow-hidden md:overflow-y-auto",
          isMobileOpen ? "translate-x-0 w-[280px]" : "md:translate-x-0 -translate-x-full"
        )}
      >
        {/* Add a close button at the top for mobile */}
        {/* {isMobileOpen && (
          <div className="md:hidden flex justify-end p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onMobileOpenChange?.(false)}
              className="text-gray-300 hover:bg-gray-800"
            >
              <MdChevronLeft className="h-5 w-5" />
            </Button>
          </div>
        )} */}

        <div className="flex flex-col justify-between h-full">
          {/* Logo Section */}
          <div className="flex items-center py-6 px-4">
            {isOpen || isMobileOpen ? (
              <div className="flex items-center justify-between w-full">
                <div
                  className="relative h-7 w-28 p-2"
                  onClick={handleLogoClick}
                >
                  <Image
                    src="/logo.svg"
                    alt="LENZ Logo"
                    fill
                    className="object-contain cursor-pointer"
                    priority
                  />
                </div>
                {/* Hide collapse button on mobile */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange?.(!isOpen)}
                  className="text-gray-300 hover:text-white hover:bg-gray-800 rounded-full transition-colors ml-2 hidden md:flex"
                >
                  <BsLayoutSidebar className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange?.(!isOpen)}
                className="text-gray-300 hover:text-white hover:bg-gray-800 rounded-full transition-colors hidden md:flex"
              >
                <BsLayoutSidebarReverse className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex-1 px-4 py-10 flex flex-col gap-2 overflow-y-auto" data-tour="sidebar-toggle">
            {mainItems.map((item) => (
              <div key={item.title}>
                {item.children ? (
                  isOpen || isMobileOpen ? (
                    <Collapsible
                      open={expandedItems.has(item.title)}
                      onOpenChange={() => toggleItem(item.title)}
                    >
                      <CollapsibleTrigger asChild>
                        <button
                          className={cn(
                            "flex items-center gap-2 p-3 cursor-pointer rounded-full w-full text-neutral-300",
                            item.children.some((child) => pathname === child.path)
                              ? "bg-neutral-900 text-white font-semibold border border-neutral-700"
                              : "hover:bg-gray-800"
                          )}
                        >
                          {/* icon */}
                          <div className="h-4 w-4 flex items-center justify-center">
                            {item.icon}
                          </div>

                          {/* title */}
                          <span className="flex-1 text-left">{item.title}</span>

                          {/* expand/collapse arrow */}
                          {expandedItems.has(item.title) ? (
                            <MdExpandLess className="h-4 w-4 shrink-0" />
                          ) : (
                            <MdExpandMore className="h-4 w-4 shrink-0" />
                          )}
                        </button>
                      </CollapsibleTrigger>

                      <CollapsibleContent className="pl-4 mt-2 space-y-2">
                        {item.children.map((child) => {
                          const isDisabled = inActive;
                          return (
                            <Link
                              key={child.title}
                              href={child.path!}
                              onClick={(e) => {
                                if (isDisabled) {
                                  e.preventDefault();
                                  return;
                                }
                                handleLinkClick();
                              }}
                              aria-disabled={isDisabled}
                              className={cn(
                                "flex items-center gap-2 p-2 rounded-full text-neutral-300 transition-colors",
                                pathname === child.path
                                  ? "bg-neutral-900 text-white pointer-events-none font-semibold border border-neutral-700"
                                  : "hover:bg-gray-800",
                                isDisabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
                              )}
                            >
                              <div className="h-4 w-4 flex items-center justify-center">
                                {child.icon}
                              </div>
                              <span>{child.title}</span>
                            </Link>
                          );
                        })}
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <div
                      className={cn(
                        "flex items-center justify-center p-2 rounded-full hover:bg-gray-800 cursor-pointer",
                        pathname.startsWith(item.path || "") && "bg-gray-800"
                      )}
                      onClick={() => handleParentItemClick(item.path)}
                    >
                      <div className="h-4 w-4 flex items-center justify-center">{item.icon}</div>
                    </div>
                  )
                ) : (
                  <Link
                    href={item.path!}
                    onClick={(e) => {
                      if (inActive) {
                        e.preventDefault();
                        return;
                      }
                      handleLinkClick();
                    }}
                    aria-disabled={inActive}
                    className={cn(
                      "flex items-center gap-2 py-2 px-3 rounded-full  text-neutral-300 ",
                      pathname.startsWith(item.path || "")
                        ? "bg-neutral-900 text-white font-semibold border pointer-events-none border-neutral-700"
                        : "hover:bg-gray-800",
                      !isOpen && !isMobileOpen ? "justify-center" : "",
                      inActive && "opacity-50 cursor-not-allowed hover:bg-transparent"
                    )}
                  >
                    <div className="h-4 w-4 flex items-center justify-center">{item.icon}</div>
                    {(isOpen || isMobileOpen) && <span>{item.title}</span>}
                  </Link>
                )}
              </div>
            ))}
          </div>
          {/* Utility Navigation - Fixed at Bottom */}
          <div className="px-4 mt-auto">
            <div className="py-4 space-y-2 border-t border-gray-800">
              {utilityItems.map((item) => {
                const isDisabled = inActive;
                return (
                  <div key={item.title}>
                    <Link
                      href={item.path!}
                      onClick={(e) => {
                        if (isDisabled) {
                          e.preventDefault();
                          return;
                        }
                      }}
                      aria-disabled={isDisabled}
                      className={cn(
                        "flex items-center gap-2 py-2 px-3 rounded-full  text-neutral-300 ",
                        pathname === item.path
                          ? "bg-neutral-900 text-white pointer-events-none font-semibold border border-neutral-700"
                          : "hover:bg-gray-800",
                        !isOpen && !isMobileOpen && "justify-center",
                        isDisabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
                      )}
                    >
                      <div className="h-4 w-4">{item.icon}</div>
                      {(isOpen || isMobileOpen) && <span>{item.title}</span>}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
