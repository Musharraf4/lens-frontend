"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/AuthContext";
import { useSelectedCompanyStore } from "@/store/SelectedCompany";
import { CompanyType } from "@/types";
import { Settings } from "lucide-react";
import React from "react";
import { GoArrowUpRight } from "react-icons/go";
import { MdMenu } from "react-icons/md";
import { DropDownUserHeader } from "./ui/DropDownUserHeader";
import { usePathname, useRouter } from "next/navigation";
import { NotificationPopover } from "./NotificationPopover";
import { Joyride } from "react-joyride";
import { useTour } from "@/store/TourContext";

interface NavbarProps {
  isSidebarOpen: boolean;
  onMobileMenuClick?: () => void;
}

export function Navbar({ isSidebarOpen, onMobileMenuClick }: NavbarProps): React.ReactElement {
  const { user, setChangeCompanyLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { setSelectedCompany, selectedCompany } = useSelectedCompanyStore();

  const handleAgencySelect = (agency: CompanyType) => {
    setSelectedCompany(agency);
    if (pathname.startsWith('/accounts') && user?.master_agency_id !== agency.company?.id) {
      setChangeCompanyLoading(true);
      router.push(`/accounts/switch-to-accounts/${agency.company?.id}`);
    }
    // if (pathname.startsWith('/accounts/switch-to-accounts/')) {
    //   router.push(`/accounts/switch-to-accounts/${agency.company?.id}`);
    // }
  };

  // Get tour context
  const { runTour, stepIndex, handleJoyrideCallback, handleStartTour, tourSteps } = useTour();


  return (
    <>
      <nav
        className={cn(
          "fixed top-0 h-16 bg-neutral-25 border-b border-gray-200 flex items-center justify-between px-4 transition-all duration-300 ease-in-out z-50",
          "w-full left-0",
          "md:w-[calc(100%-4rem)] md:left-16",
          isSidebarOpen ? "md:w-[calc(100%-16rem)] md:left-64" : ""
        )}
      >
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-neutral-500 hover:bg-neutral-50 hover:text-neutral-500 rounded-md transition-colors"
            onClick={onMobileMenuClick}
          >
            <MdMenu className="h-5 w-5" />
          </Button>

          {/* Help text with responsive line breaks */}
          <div className="flex flex-wrap sm:items-center gap-0 sm:gap-1 text-neutral-500 text-xs sm:text-sm font-medium">
            <span>Need help?</span>
            <span
              className="flex items-center gap-1 cursor-pointer hover:text-neutral-700 transition-colors"
              onClick={handleStartTour}
            >
              Take a tour
              <GoArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-neutral-500 hover:bg-gray-100 hover:text-neutral-500 rounded-md transition-colors"
            onClick={() => router.push('/settings')}
            data-tour="settings"
          >
            <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          <NotificationPopover />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="group flex items-center gap-1 sm:gap-2 px-2 py-1 border border-neutral-200 bg-white rounded-full hover:bg-gray-50 focus:outline-none focus:ring-0 data-[state=open]:border-[#D8F990] data-[state=open]:shadow-[0_0_0_2px_#D8F990] transition"
                data-tour="account-center"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={user?.profile_picture ?? undefined}
                    alt="User Avatar"
                  />
                  <AvatarFallback className="bg-gray-200 text-gray-600">
                    {user?.first_name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>

                {/* Agency name hidden on small screens */}
                <span className="hidden sm:inline text-xs sm:text-sm font-medium text-gray-800">
                  {selectedCompany?.company?.name}
                </span>

                {/* Chevron hidden on small screens */}
                <svg
                  className="hidden sm:block w-3 h-3 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-48 sm:w-56"
            >
              {user && (
                <DropdownMenuItem
                  className="cursor-default focus:bg-transparent hover:bg-transparent px-0 py-0"
                  asChild
                >
                  <DropDownUserHeader
                    user={user}
                    handleAgencySelect={handleAgencySelect}
                  />
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
      <Joyride
        steps={tourSteps}
        run={runTour}
        stepIndex={stepIndex}
        continuous
        showSkipButton
        showProgress
        callback={handleJoyrideCallback}
        scrollToFirstStep={false}
        scrollOffset={50}
        disableScrolling={true}
        disableScrollParentFix={true}
        disableCloseOnEsc={true}
        disableOverlayClose={true}
        spotlightPadding={8}
        spotlightClicks={false}
        locale={{
          back: 'Back',
          close: 'Close',
          last: 'End',
          next: 'Next',
          open: 'Open',
          skip: 'Skip',
        }}
        floaterProps={{
          offset: 20,
          disableFlip: false,
          placement: 'auto',
          styles: {
            floater: {
              maxWidth: 'min(380px, calc(100vw - 40px))',
              transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
              filter: 'none',
            },
            arrow: {
              display: 'block',
            },
          },
          wrapperOptions: {
            offset: 0,
            position: true,
          },
          modifiers: {
            preventOverflow: {
              enabled: true,
            },
            flip: {
              enabled: true,
            },
            computeStyles: {
              enabled: true,
            },
          },
        }}
        styles={{
          options: {
            primaryColor: "#0A0D1C",
            zIndex: 10000,
          },
          overlay: {
            cursor: 'default',
            // transition: 'opacity 0.5s ease-in-out',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
          spotlight: {
            // transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            borderRadius: '8px',
          },
          tooltip: {
            padding: "12px 16px",
            borderRadius: "12px",
            fontSize: "14px",
            lineHeight: "1.5",
            animation: 'fadeIn 0.3s ease-in-out',
          },
          tooltipContainer: {
            textAlign: "left",
          },
          tooltipTitle: {
            fontSize: "16px",
            fontWeight: "600",
            marginBottom: "8px",
            lineHeight: "1.4",
          },
          tooltipContent: {
            padding: "0",
            fontSize: "14px",
            lineHeight: "1.5",
          },
          buttonNext: {
            borderRadius: "9999px",
            padding: "8px 16px",
            fontSize: "14px",
            fontWeight: "500",
            outline: "none",
            transition: "all 0.2s ease-in-out",
          },
          buttonBack: {
            borderRadius: "9999px",
            padding: "8px 16px",
            fontSize: "14px",
            fontWeight: "500",
            marginRight: "8px",
            border: "1px solid #e5e7eb",
            outline: "none",
            transition: "all 0.2s ease-in-out",
          },
          buttonSkip: {
            borderRadius: "9999px",
            padding: "8px 16px",
            fontSize: "14px",
            fontWeight: "500",
            border: "1px solid #e5e7eb",
            outline: "none",
            transition: "all 0.2s ease-in-out",
          },
          buttonClose: {
            display: "none",
          },
          beacon: {
            borderRadius: "50%",
            transition: "all 0.3s ease-in-out",
          },
          beaconInner: {
            borderRadius: "50%",
            animation: 'pulse 1.5s ease-in-out infinite',
          },
          beaconOuter: {
            borderRadius: "50%",
            animation: 'pulse 1.5s ease-in-out infinite',
          },
        }}
      />

    </>
  );
}
