"use client";

import React, { createContext, useContext, useState, ReactNode, useRef, useMemo } from "react";
import { usePathname } from "next/navigation";
import { CallBackProps, STATUS, LIFECYCLE, Step } from "react-joyride";

interface TourContextType {
  runTour: boolean;
  setRunTour: (run: boolean) => void;
  stepIndex: number | undefined;
  setStepIndex: (index: number | undefined) => void;
  handleJoyrideCallback: (data: CallBackProps) => void;
  handleStartTour: () => void;
  tourSteps: Step[];
}

const TourContext = createContext<TourContextType | undefined>(undefined);

// Common steps that appear on every page
const getCommonSteps = (): Step[] => [
  {
    target: '[data-tour="sidebar-toggle"]',
    content: "Click any of these pages to navigate through the application.",
    placement: "right",
    disableBeacon: true,
  },
  {
    target: '[data-tour="settings"]',
    content: "Click here to manage your account including profile details, account center settings, and notifications.",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tour="notifications"]',
    content: "Click here to view all your notifications and updates.",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tour="account-center"]',
    content: "Click here to access your profile, switch accounts, and manage your account settings",
    placement: "right",
    disableBeacon: true,
  },
];

// Home page steps
const getHomePageSteps = (showEmptyState: boolean): Step[] => {
  const commonSteps = getCommonSteps();

  if (showEmptyState) {
    return [
      ...commonSteps,
      {
        target: '[data-tour="empty-state-card"]',
        content: "Welcome to your dashboard! Connect your integrations to start tracking your marketing performance. This card shows your setup progress.",
        placement: "bottom",
        disableBeacon: true,
      },
      {
        target: '[data-tour="main-metrics"]',
        content: "These are your main metrics - Revenue and Cases. Track your business performance at a glance with these key indicators.",
        placement: "top",
      },
      {
        target: '[data-tour="secondary-metrics"]',
        content: "Here you'll find additional metrics like CPA (Cost Per Acquisition), Spend, Traffic, and ROAS (Return on Ad Spend). These help you understand your marketing efficiency.",
        placement: "top",
      },
      {
        target: '[data-tour="add-integration-card"]',
        content: "Need to add integrations. Use this section to connect additional marketing channels and expand your tracking capabilities.",
        placement: "top",
      },
    ];
  } else {
    return [
      ...commonSteps,
      {
        target: '[data-tour="main-metrics"]',
        content: "These are your main metrics - Revenue and Cases. Track your business performance at a glance with these key indicators.",
        placement: "top",
      },
      {
        target: '[data-tour="secondary-metrics"]',
        content: "Here you'll find additional metrics like CPA (Cost Per Acquisition), Spend, Traffic, and ROAS (Return on Ad Spend). These help you understand your marketing efficiency.",
        placement: "top",
      },
      {
        target: '[data-tour="stacked-chart"]',
        content: "The Performance chart shows your revenue and cases trends over time.",
        placement: "top",
      },
      {
        target: '[data-tour="channels-chart"]',
        content: "These charts show your channel performance. Analyze which channels drive the most revenue.",
        placement: "right",
      },
      {
        target: '[data-tour="conversion-rate-chart"]',
        content: "These charts show your conversion rates. Shows the conversion rate of your marketing campaigns.",
        placement: "left",
      },
      {
        target: '[data-tour="channel-table"]',
        content: "The Channel Table provides a detailed breakdown of performance by channel.",
        placement: "top",
      },
    ];
  }
};

// Tracking page steps
const getTrackingPageSteps = (hasNumbers: boolean): Step[] => {
  const commonSteps = getCommonSteps();

  if (hasNumbers) {
    return [
      ...commonSteps,
      {
        target: '[data-tour="tracking-tabs"]',
        content: "Switch between Numbers, Forms, and Chats tabs to manage different types of tracking.",
        placement: "bottom",
      },
      {
        target: '[data-tour="create-number-button"]',
        content: "Click here to create a new tracking number for calls, forms, or chats. Track your marketing campaigns with dedicated phone numbers.",
        placement: "bottom",
        disableBeacon: true,
      },
      {
        target: '[data-tour="tracking-table"]',
        content: "View and manage all your tracking numbers in this table. Click on any number to edit or view details.",
        placement: "top",
      },
    ];
  } else {
    return [
      ...commonSteps,
      {
        target: '[data-tour="tracking-tabs"]',
        content: "Switch between Numbers, Forms, and Chats tabs to manage different types of tracking.",
        placement: "bottom",
      },
      {
        target: '[data-tour="create-number-button"]',
        content: "Click here to create your first tracking number for calls, forms, or chats.",
        placement: "bottom",
        disableBeacon: true,
      },
      {
        target: '[data-tour="tracking-empty-state"]',
        content: "You don't have any tracking numbers yet. Once you create tracking numbers, they will appear here.",
        placement: "bottom",
      },
    ];
  }
};

// Lead Concierge page steps
const getLeadConciergePageSteps = (hasBots: boolean): Step[] => {
  const commonSteps = getCommonSteps();

  if (hasBots) {
    return [
      ...commonSteps,
      {
        target: '[data-tour="lead-concierge-tabs"]',
        content: "Switch between Active, Paused, and Drafts tabs to manage your chatbots.",
        placement: "bottom",
      },
      {
        target: '[data-tour="create-bot-button"]',
        content: "Click here to build your Lead Concierge, a chatbot that engages visitors, qualifies leads, and captures",
        placement: "bottom",
        disableBeacon: true,
      },
      {
        target: '[data-tour="bot-cards"]',
        content: "Manage your company’s chatbots here.Active bots can be edited, paused and reactive, and incomplete bots are saved as drafts.",
        placement: "right",
      },
    ];
  } else {
    return [
      ...commonSteps,
      {
        target: '[data-tour="lead-concierge-tabs"]',
        content: "Switch between Active, Paused, and Drafts tabs to manage your chatbots.",
        placement: "bottom",
      },
      {
        target: '[data-tour="create-bot-button"]',
        content: "Click here to build your first Lead Concierge, a chatbot that engages visitors, qualifies leads",
        placement: "bottom",
        disableBeacon: true,
      },
      {
        target: '[data-tour="lead-concierge-empty-state"]',
        content: "You don't have any chatbots yet. Once you create bots, they will appear here.",
        placement: "bottom",
      },
    ];
  }
};

// Settings page steps
const getSettingsPageSteps = (): Step[] => {
  const commonSteps = getCommonSteps();

  return [
    ...commonSteps,
    {
      target: '[data-tour="settings-tabs"]',
      content: "Switch between General Information, Notifications, and Account Center tabs to manage different settings.",
      placement: "bottom",
    },
    {
      target: '[data-tour="main-settings-content"]',
      content: "View your master agancy account details",
      placement: "top",
    },
    {
      target: '[data-tour="company-card"]',
      content: "View company details here you have access.",
      placement: "bottom",
    }

  ];
};

// Accounts page steps
const getAccountsPageSteps = (hasAccounts: boolean): Step[] => {
  const commonSteps = getCommonSteps();

  if (hasAccounts) {
    return [
      ...commonSteps,
      {
        target: '[data-tour="accounts-tabs"]',
        content: "Switch between Active, Trial, Past Due, Paused, and Awaiting Invite Approval tabs to filter accounts by status.",
        placement: "bottom",
      },
      {
        target: '[data-tour="accounts-add-existing-button"]',
        content: "Click here to add an existing account to your agency.",
        placement: "bottom",
      },
      {
        target: '[data-tour="accounts-create-new-button"]',
        content: "Click here to create a new client account with independent billing and data management.",
        placement: "bottom",
      },
      {
        target: '[data-tour="accounts-content"]',
        content: "View and manage any of your client account here. Each account can be switched to independently.",
        placement: "right",
      },
    ];
  } else {
    return [
      ...commonSteps,
      {
        target: '[data-tour="accounts-tabs"]',
        content: "Switch between Active, Trial, Past Due, Paused, and Awaiting Invite Approval tabs to filter accounts by status.",
        placement: "bottom",
      },
      {
        target: '[data-tour="accounts-add-existing-button"]',
        content: "Click here to add an existing account to your agency.",
        placement: "bottom",
      },
      {
        target: '[data-tour="accounts-create-new-button"]',
        content: "Click here to create a new client account with independent billing and data management.",
        placement: "bottom",
      },
      {
        target: '[data-tour="accounts-content"]',
        content: "No accounts yet. Use the buttons above to add existing accounts or create new ones.",
        placement: "top",
      },
    ];
  }
};

// Contacts page steps
const getContactsPageSteps = (hasContact: boolean): Step[] => {
  const commonSteps = getCommonSteps();
  if (!hasContact) {
    return [
      ...commonSteps,
      {
        target: '[data-tour="contacts-tabs"]',
        content: "Switch between All contacts, Leads, and Cases tabs to view different types of contacts.",
        placement: "bottom",
      },
      {
        target: '[data-tour="contacts-search-date"]',
        content: "Use the search bar to find specific contacts, and the date selector to filter by time range.",
        placement: "bottom",
      },
      {
        target: '[data-tour="filters-dropdown"]',
        content: "Use these filters to refine your contacts by channel, type, revenue, job type, landing page, and more.",
        placement: "bottom",
      },
      {
        target: '[data-tour="no-data-page"]',
        content: "No contacts data available. Connect your channels to start tracking interactions.",
        placement: "top",
      },
    ]
  } else {
    return [
      ...commonSteps,
      {
        target: '[data-tour="contacts-tabs"]',
        content: "Switch between All contacts, Leads, and Cases tabs to view different types of contacts.",
        placement: "bottom",
      },
      {
        target: '[data-tour="contacts-search-date"]',
        content: "Use the search bar to find specific contacts, and the date selector to filter by time range.",
        placement: "bottom",
      },
      {
        target: '[data-tour="filters-dropdown"]',
        content: "Use these filters to refine your contacts by channel, type, revenue, job type, landing page, and more.",
        placement: "bottom",
      },
      {
        target: '[data-tour="table-row"]',
        content: "View detailed information about each contact in this table. Click on any here to see more details.",
        placement: "top",
      },
    ];
  }
};

// Integrations page steps
const getIntegrationsPageSteps = (): Step[] => {
  const commonSteps = getCommonSteps();

  return [
    ...commonSteps,
    {
      target: '[data-tour="integrations-tabs"]',
      content: "Switch between All integrations, Marketing platforms, and CRM platforms tabs to filter integrations by category.",
      placement: "bottom",
    },
    {
      target: '[data-tour="integrations-search"]',
      content: "Use the search bar to quickly find specific integrations by name.",
      placement: "bottom",
    },
    {
      target: '[data-tour="integrations-cards"]',
      content: "Browse and connect integrations here. Click on any integration card to view details and connect it.",
      placement: "top",
    },
  ];
};

// Activity page steps
const getActivityPageSteps = (isEmptyState: boolean): Step[] => {
  const commonSteps = getCommonSteps();

  if (!isEmptyState) {
    return [
      ...commonSteps,
      {
        target: '[data-tour="activity-tabs"]',
        content: "Switch between Summary, Calls, Forms, and Chats tabs to view different types of interactions.",
        placement: "bottom",
      },
      {
        target: '[data-tour="no-data-page"]',
        content: "No activity data available. Connect your channels to start tracking interactions.",
        placement: "top",
      },
    ];
  } else {

    return [
      ...commonSteps,
      {
        target: '[data-tour="activity-tabs"]',
        content: "Switch between Summary, Calls, Forms, and Chats tabs to view different types of interactions.",
        placement: "bottom",
      },
      {
        target: '[data-tour="activity-chart"]',
        content: "This chart shows your activity trends over time. Visualize patterns in calls, forms, and chats.",
        placement: "top",
      },
      {
        target: '[data-tour="filters-dropdown"]',
        content: "Use these filters to refine your activity data by date, channel, type, revenue, job type, and interaction type.",
        placement: "bottom",
      },
      {
        target: '[data-tour="table-row"]',
        content: "View detailed information about each interaction in this table. Click here to see more details.",
        placement: "top",
      },
    ];
  }
};

// Acquisition pages - Google Ads
const getGoogleAdsPageSteps = (hasConnection: boolean): Step[] => {
  const commonSteps = getCommonSteps();
  if (hasConnection) {
    return [
      ...commonSteps,
      {
        target: '[data-tour="google-ads-tabs"]',
        content: "Switch between Overview, Insights, Competitors, and Projection tabs to view different aspects of your Google Ads performance.",
        placement: "bottom",
      },
      {
        target: '[data-tour="google-ads-date-selector"]',
        content: "Select a date range to filter your Google Ads data and analyze performance over time.",
        placement: "bottom",
      },
      {
        target: '[data-tour="google-ads-top-4-cards"]',
        content: "These are your top 4 key metrics: Ad Spend, Revenue, Cases, and ROAS. Track your Google Ads performance at a glance.",
        placement: "top",
      },
      {
        target: '[data-tour="google-ads-chart"]',
        content: "The Marketing Funnel chart shows how visitors progress through your marketing funnel from impressions to conversions.",
        placement: "top",
      },
      {
        target: '[data-tour="google-ads-revenue-by-campaign"]',
        content: "This pie chart shows revenue distribution by campaign. Identify which campaigns are driving the most revenue.",
        placement: "right",
      },
      {
        target: '[data-tour="google-ads-other-4-charts"]',
        content: "View additional performance metrics: Conversion Rate, CPA (Cost Per Acquisition), CPC (Cost Per Click), and CTR (Click-Through Rate).",
        placement: "left",
      },
      {
        target: '[data-tour="google-ads-top-performing-charts"]',
        content: "These charts show performance by campaigns, zip codes and their leads, revenue, and ROI.",
        placement: "right",
      },
      {
        target: '[data-tour="google-ads-top-keywords-charts"]',
        content: "These charts show top and lowest performing keywords performance by their leads, revenue, and ROI.",
        placement: "left",
      },
      {
        target: '[data-tour="google-ads-campaigns-table"]',
        content: "The Campaign Performance table provides detailed metrics for each campaign including spend, revenue, leads, and ROI.",
        placement: "top",
      },
    ];
  } else {
    return [
      ...commonSteps,
      {
        target: '[data-tour="google-ads-tabs"]',
        content: "Switch between Overview, Insights, Competitors, and Projection tabs to view different aspects of your Google Ads performance.",
        placement: "bottom",
      },
      {
        target: '[data-tour="google-ads-date-selector"]',
        content: "Select a date range to filter your Google Ads data and analyze performance over time.",
        placement: "bottom",
      },
      {
        target: '[data-tour="account-connect-section"]',
        content: "Connect your Google Ads account to start tracking and analyzing your ad performance.",
        placement: "right",
      },
    ];
  }
};

// Acquisition pages - Organic
const getOrganicPageSteps = (hasData: boolean): Step[] => {
  const commonSteps = getCommonSteps();

  if (hasData) {
    return [
      ...commonSteps,
      {
        target: '[data-tour="organic-date-selector"]',
        content: "Select a date range to filter your organic acquisition data and analyze performance over time.",
        placement: "bottom",
      },
      {
        target: '[data-tour="organic-metrics"]',
        content: "View your organic metrics including revenue, cases, spend, ROI, traffic, and case rate.",
        placement: "top",
      },
      {
        target: '[data-tour="table-row"]',
        content: "See each landing page that is driving the most organic traffic and conversions.",
        placement: "top",
      },
    ];
  } else {
    return [
      ...commonSteps,
      {
        target: '[data-tour="organic-date-selector"]',
        content: "Select a date range to filter your organic acquisition data.",
        placement: "bottom",
      },
      {
        target: '[data-tour="no-data-page"]',
        content: "No organic data available yet. Once you start receiving organic traffic, metrics will appear here.",
        placement: "top",
      },
    ];
  }
};

// Acquisition pages - Local Service Ads
const getLSAPageSteps = (hasConnection: boolean): Step[] => {
  const commonSteps = getCommonSteps();

  if (hasConnection) {
    return [
      ...commonSteps,
      {
        target: '[data-tour="lsa-date-selector"]',
        content: "Select a date range to filter your Local Service Ads data and analyze performance over time.",
        placement: "bottom",
      },
      {
        target: '[data-tour="lsa-content"]',
        content: "View your Local Service Ads metrics, Revenue, Lead Spend and Return on ad spend.",
        placement: "top",
      },
      {
        target: '[data-tour="lsa-stacked-chart"]',
        content: "This chart shows your Local Service Ads performance including leads and cases over time.",
        placement: "top",
      },
      {
        target: '[data-tour="lsa-company-card"]',
        content: "This card shows your connected Local Service Ads account and its metrics.",
        placement: "top",
      },
      {
        target: '[data-tour="lsa-heatmap"]',
        content: "This heatmap visualizes your Local Service Ads leads and revenue.",
        placement: "top",
      }
    ];
  } else {
    return [
      ...commonSteps,
      {
        target: '[data-tour="account-connect-section"]',
        content: "Connect your Local Service Ads account to start tracking your local ad performance.",
        placement: "bottom",
      },
    ];
  }
};

// Acquisition pages - Google My Business
const getGoogleMyBusinessPageSteps = (hasConnection: boolean): Step[] => {
  const commonSteps = getCommonSteps();

  if (hasConnection) {
    return [
      ...commonSteps,
      {
        target: '[data-tour="date-selector"]',
        content: "Select a date range to filter your Google My Business data and analyze performance over time.",
        placement: "bottom",
      },
      {
        target: '[data-tour="gmb-content"]',
        content: "View Google Business metrics and analytics of selected account.",
        placement: "top",
      },
      {
        target: '[data-tour="gmb-company-card"]',
        content: "This card shows your connected Google Business Profile locations and their metrics.",
        placement: "top",
      },
      {
        target: '[data-tour="gmb-stacked-chart"]',
        content: "This chart shows your Google Business Profile analytics including traffic, leads, and cases over time.",
        placement: "top",
      }
    ];
  } else {
    return [
      ...commonSteps,
      {
        target: '[data-tour="account-connect-section"]',
        content: "Connect your Google My Business account to start tracking your business profile performance.",
        placement: "bottom",
      },
    ];
  }
};

// Acquisition pages - Landing Pages
const getLandingPagesPageSteps = (hasData: boolean): Step[] => {
  const commonSteps = getCommonSteps();

  if (hasData) {
    return [
      ...commonSteps,
      {
        target: '[data-tour="landing-pages-date-selector"]',
        content: "Select a date range to filter your landing pages data and analyze performance over time.",
        placement: "bottom",
      },
      {
        target: '[data-tour="filters-dropdown"]',
        content: "Filter and sort landing pages by channel, revenue, RPS, conversion rate, and more.",
        placement: "bottom",
      },
      {
        target: '[data-tour="landing-pages-table"]',
        content: "View detailed metrics for each landing page including traffic, leads, deals, and performance.",
        placement: "top",
      },
    ];
  } else {
    return [
      ...commonSteps,
      {
        target: '[data-tour="landing-pages-date-selector"]',
        content: "Select a date range to filter your landing pages data.",
        placement: "bottom",
      },
      {
        target: '[data-tour="filters-dropdown"]',
        content: "Filter and sort landing pages by channel, revenue, RPS, conversion rate, and more.",
        placement: "bottom",
      },
      {
        target: '[data-tour="no-data-page"]',
        content: "No landing page data available yet. Landing pages will appear here once you start tracking them.",
        placement: "bottom",
      },
    ];
  }
};

// Help page steps
const getHelpPageSteps = (): Step[] => {
  const commonSteps = getCommonSteps();

  return [
    ...commonSteps,
    {
      target: '[data-tour="help-header"]',
      content: "Welcome to the Help page! This section introduces LENZ and explains what our platform does for small businesses.",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: '[data-tour="help-core-value"]',
      content: "Discover LENZ's core value proposition. Learn how we help you track marketing performance, compare lead types, optimize budgets, and make data-driven decisions.",
      placement: "top",
    },
    {
      target: '[data-tour="help-business-model"]',
      content: "LENZ operates on a simple SaaS subscription model designed specifically for small businesses.",
      placement: "top",
    },
    {
      target: '[data-tour="help-contact"]',
      content: "Need assistance? Reach out to our support team anytime via email for help with your account or questions about LENZ.",
      placement: "top",
    },
  ];
};

// Get page-specific steps based on pathname
const getPageSteps = (
  pathname: string,
  showEmptyState: boolean,
  hasTrackingNumbers: boolean,
  hasBots: boolean,
  isEmptyState: boolean,
  hasContact: boolean,
  isAccountDisconnected: boolean
): Step[] => {
  if (pathname === '/home') {
    return getHomePageSteps(showEmptyState);
  } else if (pathname === '/tracking') {
    return getTrackingPageSteps(!isEmptyState);
  } else if (pathname === '/lead-concierge') {
    // Use passed prop, or check dynamically if available
    const botCardsElement = typeof document !== 'undefined' ? document.querySelector('[data-tour="bot-cards"]') : null;
    const emptyStateElement = typeof document !== 'undefined' ? document.querySelector('[data-tour="lead-concierge-empty-state"]') : null;
    // If bot-cards exists and has content, or if empty state doesn't exist, assume has bots
    const hasBotsData = hasBots || (!!botCardsElement && !emptyStateElement);
    return getLeadConciergePageSteps(hasBotsData);
  } else if (pathname === '/settings') {
    return getSettingsPageSteps();
  } else if (pathname === '/accounts' || pathname.startsWith('/accounts/')) {
    // Check if accounts exist by looking for empty state
    const emptyState = typeof document !== 'undefined' ? document.querySelector('[data-tour="accounts-empty-state"]') : null;
    const hasAccounts = !emptyState;
    return getAccountsPageSteps(hasAccounts);
  } else if (pathname === '/contacts' || pathname.startsWith('/contacts/')) {
    return getContactsPageSteps(!isEmptyState);
  } else if (pathname === '/integrations') {
    return getIntegrationsPageSteps();
  } else if (pathname === '/activity') {
    return getActivityPageSteps(!isEmptyState);
  } else if (pathname === '/acquisition/google-ads') {

    return getGoogleAdsPageSteps(!isAccountDisconnected);
  } else if (pathname === '/acquisition/organic') {
    return getOrganicPageSteps(!isEmptyState);
  } else if (pathname === '/acquisition/local-service-ads') {
    return getLSAPageSteps(!isAccountDisconnected);
  } else if (pathname === '/acquisition/google-my-business') {
    return getGoogleMyBusinessPageSteps(!isAccountDisconnected);
  } else if (pathname === '/acquisition/landing-pages') {
    return getLandingPagesPageSteps(!isEmptyState);
  } else if (pathname === '/help') {
    return getHelpPageSteps();
  }


  // Default: just show common steps for unknown pages
  return getCommonSteps();
};

// Helper function to disable beacons on all steps
const disableBeaconsOnSteps = (steps: Step[]): Step[] => {
  return steps.map(step => ({
    ...step,
    disableBeacon: true,
  }));
};


export const TourProvider = ({
  children,
  showEmptyState,
  hasTrackingNumbers = false,
  hasBots = false,
  isEmptyState = false,
  hasContact = false,
  isAccountDisconnected = false
}: {
  children: ReactNode;
  showEmptyState: boolean;
  hasTrackingNumbers?: boolean;
  hasBots?: boolean;
  isEmptyState?: boolean;
  hasContact?: boolean;
  isAccountDisconnected?: boolean;
}) => {
  console.log("isAccountDisconnected", isAccountDisconnected)
  const [runTour, setRunTour] = useState(false);
  const [stepIndex, setStepIndex] = useState<number | undefined>(undefined);
  const pathname = usePathname();
  const lastProcessedStepRef = useRef<number>(-1);

  const tourSteps: Step[] = useMemo(() => {
    const steps = getPageSteps(pathname, showEmptyState, hasTrackingNumbers, hasBots, isEmptyState, hasContact, isAccountDisconnected);
    return disableBeaconsOnSteps(steps);
  }, [pathname, showEmptyState, hasTrackingNumbers, hasBots, isEmptyState, hasContact, isAccountDisconnected]);


  // Prevent user scrolling while allowing programmatic scrolling
  React.useEffect(() => {
    if (runTour) {
      // Force scrollbar to always be visible to prevent layout shifts
      const originalOverflow = document.documentElement.style.overflowY;
      document.documentElement.style.overflowY = 'scroll';

      // Prevent user-initiated scroll events
      const preventScroll = (e: Event) => {
        // Allow programmatic scrolling by checking if event is trusted (user-initiated)
        if (e.isTrusted) {
          e.preventDefault();
          e.stopPropagation();
        }
      };

      // Add event listeners for all scroll methods
      window.addEventListener('wheel', preventScroll, { passive: false });
      window.addEventListener('touchmove', preventScroll, { passive: false });
      window.addEventListener('keydown', (e: KeyboardEvent) => {
        // Prevent arrow keys, space, page up/down from scrolling
        if (['ArrowUp', 'ArrowDown', 'Space', 'PageUp', 'PageDown', 'Home', 'End'].includes(e.code)) {
          e.preventDefault();
        }
      });

      return () => {
        // Restore original overflow
        document.documentElement.style.overflowY = originalOverflow;

        // Cleanup event listeners
        window.removeEventListener('wheel', preventScroll);
        window.removeEventListener('touchmove', preventScroll);
      };
    }
  }, [runTour]);

  const handleStartTour = () => {
    lastProcessedStepRef.current = -1;
    // Always set stepIndex first, then wait for element before starting runTour
    setStepIndex(0);

    // Wait for the first step element to be available before starting
    const firstStep = tourSteps[0];
    if (firstStep) {
      const target = typeof firstStep.target === 'string' ? firstStep.target : null;
      if (target) {
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          const element = document.querySelector(target);
          if (element) {
            // Element exists, start tour immediately
            setRunTour(true);
          } else {
            // Element not found, poll for it with shorter intervals
            let attempts = 0;
            const maxAttempts = 50; // 5 seconds max (50 * 100ms)
            let checkElement: NodeJS.Timeout | null = null;
            checkElement = setInterval(() => {
              attempts++;
              const el = document.querySelector(target);
              if (el) {
                if (checkElement) clearInterval(checkElement);
                setRunTour(true);
                console.log('First step element found, starting tour');
              } else if (attempts >= maxAttempts) {
                if (checkElement) clearInterval(checkElement);
                console.warn('First step element not found after 5 seconds, starting tour anyway');
                setRunTour(true);
              }
            }, 100);
          }
        });
      } else {
        // No target, start immediately
        setRunTour(true);
      }
    } else {
      // No steps, start anyway
      setRunTour(true);
    }
  };

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, index, action, lifecycle, step } = data;

    console.log('Tour callback:', { status, index, action, lifecycle, pathname });

    // When tooltip is being shown, ensure element and tooltip are both visible
    if (lifecycle === 'tooltip' && step) {
      const target = typeof step.target === 'string' ? step.target : null;
      if (target && typeof document !== 'undefined') {
        const element = document.querySelector(target) as HTMLElement;
        if (element) {
          // Use requestAnimationFrame to ensure smooth scrolling after tooltip renders
          requestAnimationFrame(() => {
            const rect = element.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;

            // Calculate if element is in view with enough space for tooltip
            const tooltipSpace = 400; // Approximate tooltip height + padding
            const elementCenter = rect.top + rect.height / 2;
            const idealTop = viewportHeight / 2 - rect.height / 2;

            // Check if we need to scroll
            const needsScroll =
              rect.top < 100 || // Too close to top
              rect.bottom > viewportHeight - 100 || // Too close to bottom
              (rect.bottom + tooltipSpace > viewportHeight); // Not enough space for tooltip

            if (needsScroll) {
              // Calculate optimal scroll position
              const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
              const elementTop = rect.top + scrollTop;
              const targetScroll = elementTop - idealTop;

              // Smooth scroll to position
              window.scrollTo({
                top: Math.max(0, targetScroll),
                behavior: 'smooth'
              });
            }

            // Also check parent scrollable containers
            let parent = element.parentElement;
            while (parent && parent !== document.body) {
              const style = window.getComputedStyle(parent);
              const overflow = style.overflow;
              const overflowY = style.overflowY;
              if (overflow === 'auto' || overflow === 'scroll' || overflowY === 'auto' || overflowY === 'scroll') {
                const parentRect = parent.getBoundingClientRect();
                const elementRect = element.getBoundingClientRect();

                if (elementRect.top < parentRect.top || elementRect.bottom > parentRect.bottom) {
                  // Scroll within parent container
                  const parentScrollTop = parent.scrollTop;
                  const elementTopInParent = element.offsetTop;
                  const parentHeight = parent.clientHeight;
                  const targetParentScroll = elementTopInParent - (parentHeight / 2) + (rect.height / 2);

                  parent.scrollTo({
                    top: Math.max(0, targetParentScroll),
                    behavior: 'smooth'
                  });
                }
              }
              parent = parent.parentElement;
            }
          });
        }
      }
      return;
    }

    // Don't process anything if just being initialized
    if (lifecycle === 'init' || lifecycle === 'ready') {
      return;
    }

    // Finish or skip - properly reset tour state
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      // Use setTimeout to ensure state updates happen after Joyride cleanup
      setTimeout(() => {
        setRunTour(false);
        setStepIndex(undefined);
        lastProcessedStepRef.current = -1;
      }, 100);
      return;
    }

    // Handle errors - if element not found, wait for it
    if (status === STATUS.ERROR || lifecycle === LIFECYCLE.ERROR) {
      // If it's the first step (index 0) and element not found, wait for it
      if (index === 0) {
        const currentStep = tourSteps[index];
        const target = typeof currentStep?.target === 'string' ? currentStep.target : null;
        if (target) {
          console.log('First step element not found, waiting for it...');
          let checkElement: NodeJS.Timeout | null = null;
          checkElement = setInterval(() => {
            const element = document.querySelector(target);
            if (element) {
              if (checkElement) clearInterval(checkElement);
              // Element found, restart tour at this step
              setStepIndex(0);
              setRunTour(true);
              console.log('First step element found, restarting tour');
            }
          }, 100);
          setTimeout(() => {
            if (checkElement) clearInterval(checkElement);
            const element = document.querySelector(target);
            if (element) {
              setStepIndex(0);
              setRunTour(true);
            } else {
              console.warn('First step element still not found after 3 seconds');
              // Try to continue anyway
              setStepIndex(0);
              setRunTour(true);
            }
          }, 3000);
          return;
        }
      }

      // Not first step, ignore the error but don't stop the tour
      console.log('Tour error at step', index, 'but continuing');
      return;
    }

    // Only act when user moves to next step and step completed
    if (action !== 'next' || lifecycle !== LIFECYCLE.COMPLETE) {
      return;
    }

    // Prevent duplicate processing
    if (lastProcessedStepRef.current === index) {
      return;
    }
    lastProcessedStepRef.current = index;

    // Advance to next step immediately
    const nextStep = tourSteps[index + 1];
    if (nextStep) {
      setStepIndex(index + 1);
    } else {
      // No next step, tour will finish naturally
      console.log('No next step, tour ending');
    }
  };

  return (
    <TourContext.Provider
      value={{
        runTour,
        setRunTour,
        stepIndex,
        setStepIndex,
        handleJoyrideCallback,
        handleStartTour,
        tourSteps,
      }}
    >
      {children}
    </TourContext.Provider>
  );
};

export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return context;
};
