'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { mainNavItems, utilityNavItems } from '@/config/SidebarItems';
import { cn } from '@/lib/utils';
import { useApp } from '@/store/appStore';
import { useNumberContext } from '@/store/CreateNumberContext';
import { useSelectedCompanyStore } from '@/store/SelectedCompany';
import { usePathname, useRouter } from 'next/navigation';
import ReactivateSubscrciption from './accounts/ReactivateSubscrciption';
import { useAuth } from '@/store/AuthContext';
import { Skeleton } from './ui/skeleton';
import { TourProvider } from '@/store/TourContext';
import { useIntegrationConfigs } from '@/services/integrationsConfig.api';

interface RootLayoutContentProps {
  children: React.ReactNode;
}

export function RootLayoutContent({ children }: RootLayoutContentProps) {
  // Use window.innerWidth to determine if the device is mobile
  // Default to false (collapsed) for SSR
  const { setSidebarOpen, sidebarOpen } = useApp()
  const { user } = useAuth()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { createNumberModalOpen } = useNumberContext();
  const { selectedCompany } = useSelectedCompanyStore();
  const pathname = usePathname();
  const inActive = selectedCompany?.subscription_status !== 'active' && selectedCompany?.subscription_status !== 'trialing';
  const allowedSwitchPrefix = "/accounts/switch-to-accounts/";
  const isOnAllowedSwitchRoute = pathname.startsWith(allowedSwitchPrefix);

  // Check if we're in empty state (same logic as home page)
  const { data: IntegrationConfig, isLoading: isIntegrationConfigLoading } =
    useIntegrationConfigs(selectedCompany?.company?.id);
  const allowedNames = ["google_ads", "google_lsa", "google_business"];
  const filteredConfigurations = IntegrationConfig?.filter((config) =>
    allowedNames.includes(config.integration_name)
  );
  const hasActiveGoogleIntegration =
    filteredConfigurations &&
    filteredConfigurations.length > 0 &&
    filteredConfigurations.some((config) => config.is_active === true);
  const showEmptyState =
    !isIntegrationConfigLoading && !hasActiveGoogleIntegration;

  useEffect(() => {
    // Check if the screen is desktop-sized on client-side
    const checkScreenSize = () => {
      const isDesktop = window.innerWidth >= 768; // md breakpoint
      setSidebarOpen(isDesktop);
    };

    // Set initial state
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleMobileMenuToggle = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Track hasTrackingNumbers and hasBots with state that updates on pathname change
  const [hasTrackingNumbers, setHasTrackingNumbers] = useState(false);
  const [isEmptyState, setIsEmptyState] = useState(false);
  const [hasContact, setHasContact] = useState(false);
  const [hasBots, setHasBots] = useState(false);
  const [isAccountDisconnected, setIsAccountDisconnected] = useState(false);

  useEffect(() => {
    // Update tracking numbers and bots detection when pathname changes
    const checkElements = () => {
      setHasTrackingNumbers(!!document.querySelector('[data-tour="tracking-table"]'));
      setHasBots(!!document.querySelector('[data-tour="bot-cards"]'));
      setIsEmptyState(!!document.querySelector('[data-tour="no-data-page"]'));
      setHasContact(!!document.querySelector('[data-tour="contacts-table"]'));
      setIsAccountDisconnected(!!document.querySelector('[data-tour="account-connect-section"]'));
    };

    // Check immediately
    checkElements();

    // Also check after a short delay to ensure DOM is updated
    const timer = setTimeout(checkElements, 2000);

    return () => clearTimeout(timer);
  }, [pathname, selectedCompany?.company?.id]);

  return (
    <TourProvider
      showEmptyState={showEmptyState}
      hasTrackingNumbers={hasTrackingNumbers}
      isEmptyState={isEmptyState}
      hasContact={hasContact}
      hasBots={hasBots}
      isAccountDisconnected={isAccountDisconnected}
    >
      <div className="min-h-screen bg-neutral-25">
        <Sidebar
          mainItems={mainNavItems}
          utilityItems={utilityNavItems}
          isOpen={sidebarOpen}
          onOpenChange={setSidebarOpen}
          isMobileOpen={isMobileSidebarOpen}
          onMobileOpenChange={setIsMobileSidebarOpen}
        />
        {!createNumberModalOpen && (
          <Navbar
            isSidebarOpen={sidebarOpen}
            onMobileMenuClick={handleMobileMenuToggle}
          />
        )}
        <main style={{ maxWidth: '1800px' }} className={cn(
          "transition-all duration-300 ease-in-out max-w-screen-2xl mx-auto",
          createNumberModalOpen ? "pt-0" : "pt-16",
          sidebarOpen ? "md:pl-64" : "md:pl-16",
          "pl-0" // Default padding for mobile
        )}>
          {isOnAllowedSwitchRoute ? (
            <div className={createNumberModalOpen ? "p-0" : "p-4 md:p-8"}>{children}</div>
          ) : (selectedCompany?.company?.id !== user?.master_agency_id) && (pathname === '/accounts') && inActive ? (
            <Skeleton className="w-full h-96" />
          ) : inActive ? (
            <ReactivateSubscrciption />
          ) : (
            <div className={createNumberModalOpen ? "p-0" : "p-4 md:p-8"}>{children}</div>
          )}
        </main>
      </div>
    </TourProvider>
  );
}