"use client";

import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { useIntegrations, IIntegration } from '@/services/integrations.api';
import { IIntegrationConfig, useIntegrationConfigs } from '@/services/integrationsConfig.api';
import { useSelectedCompanyStore } from './SelectedCompany';

// New interface for connection details
export interface IntegrationConnection {
  configId: string;
  email: string;
  updatedAt: string;
  isActive: boolean;
  configData?: Record<string, any>;
  isSelected?: boolean
}

// Updated Extended Integration interface
export interface ExtendedIntegration extends IIntegration {
  logo?: string;
  detailedDescription?: string;
  builtBy?: string;
  isConnected?: boolean;
  connections?: IntegrationConnection[]; // Array of connections
  // Keep accountInfo for backward compatibility or primary connection display
  accountInfo?: {
    username: string;
    updatedAt: string;
  };
  displayName?: string;
}

// New connection status structure
export type ConnectionStatus = Record<string, {
  isConnected: boolean;
  connections: IntegrationConnection[];
}>;

// Context type definition
interface IntegrationContextType {
  // Data and loading states
  integrations: ExtendedIntegration[];
  isLoading: boolean;
  error: Error | null;
  connectionStatus: ConnectionStatus;

  // Selected integration state
  selectedIntegration: ExtendedIntegration | null;
  setSelectedIntegration: (integration: ExtendedIntegration | null) => void;

  // Actions
  refreshIntegrations: () => void;
}

// Create the context
const IntegrationContext = createContext<IntegrationContextType | undefined>(undefined);

// Helper functions for data transformation
const getLogoForProvider = (name: string): string => {
  const logoMap: Record<string, string> = {
    "google_ads": "/GoogleAdsIcon.svg",
    "google_business": "/GoogleBusinessIcon.svg",
    "google_lsa": "/GoogleIcon.svg",
    "lenz_pixel": "/LenzPixelIcon.svg",
    "hubspot": "/HubspotIcon.svg",
    "clio": "/ClioIcon.svg",
    "zapier": "/ZapierIcon.svg",
  };
  return logoMap[name] || "";
};

const getBuiltByLogoForProvider = (provider: string): string => {
  const logoMap: Record<string, string> = {
    google: "/GoogleFullIcon.svg",
    lenz: "/LenzPixelFullIcon.svg",
    hubspot: "/HubSpotFullIcon.svg",
    clio: "/ClioFullIcon.svg",
    zapier: "/ZapierFullIcon.svg",
    // Add more mappings as needed
  };
  return logoMap[provider] || "/logo.svg";
};

// Helper function to format integration names
const formatIntegrationName = (name: string): string => {
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Function to map API data to UI format with connection status
const mapIntegrationData = (
  apiIntegration: IIntegration,
  connectionStatus: ConnectionStatus,
): ExtendedIntegration => {
  const connectionInfo = connectionStatus[apiIntegration.name];
  const isConnected = connectionInfo?.isConnected || false;
  const connections = connectionInfo?.connections || [];

  // Get primary connection (first active one) for backward compatibility
  const primaryConnection = connections[0];

  return {
    ...apiIntegration,
    logo: getLogoForProvider(apiIntegration.name),
    detailedDescription: apiIntegration.details?.replace(/\\n/g, '\n'),
    builtBy: getBuiltByLogoForProvider(apiIntegration.provider),
    isConnected: isConnected,
    connections: connections,
    // Set accountInfo based on primary connection
    accountInfo: primaryConnection ? {
      username: primaryConnection.email,
      updatedAt: primaryConnection.updatedAt
    } : undefined,
    displayName: formatIntegrationName(apiIntegration.name),
  };
};

// Provider component
export const IntegrationProvider = ({ children }: { children: ReactNode }) => {
  // Local state for selected integration
  const [selectedIntegration, setSelectedIntegration] = useState<ExtendedIntegration | null>(null);
  const { selectedCompany } = useSelectedCompanyStore();

  // Fetch integrations and integration configs
  const {
    data: integrationsData,
    isLoading: isLoadingIntegrations,
    error: integrationsError,
    refetch: refetchIntegrations
  } = useIntegrations();
  const {
    data: integrationConfigsData,
    isLoading: isLoadingConfigs,
    error: configsError,
    refetch: refetchConfigs
  } = useIntegrationConfigs(selectedCompany?.company?.id);


  // Create connection status mapping with detailed connection info
  const connectionStatus: ConnectionStatus = useMemo(() => {
    if (!integrationConfigsData || !Array.isArray(integrationConfigsData)) return {};

    const statusMap: ConnectionStatus = {};

    // Group configs by integration name
    const configsByIntegration = integrationConfigsData.reduce((acc, config) => {
      if (!acc[config.integration_name]) {
        acc[config.integration_name] = [];
      }
      acc[config.integration_name].push(config);
      return acc;
    }, {} as Record<string, IIntegrationConfig[]>);

    // Process each integration
    if (integrationsData && Array.isArray(integrationsData)) {
      integrationsData.forEach(integration => {
        const configs = configsByIntegration[integration.name] || [];
        const activeConnections = configs
          .filter(config => config.is_active)
          .map(config => ({
            configId: config.id,
            email: config.user_email,
            updatedAt: new Date(/* you might have a timestamp field */).toLocaleDateString(),
            isActive: config.is_active,
            configData: config.config_data,
            isSelected: config.is_selected
          }))
          .sort((a, b) => a.email.localeCompare(b.email));

        // If there's only one connection, mark it as primary
        if (activeConnections.length === 1) {
          activeConnections[0].isSelected = true;
        }

        statusMap[integration.name] = {
          isConnected: activeConnections.length > 0,
          connections: activeConnections
        };
      });
    }

    return statusMap;
  }, [integrationConfigsData, integrationsData]);

  // Transform API data to UI format with correct connection status
  const integrations: ExtendedIntegration[] = useMemo(() => {
    return integrationsData && Array.isArray(integrationsData)
      ? integrationsData.map(integration => mapIntegrationData(integration, connectionStatus))
      : [];
  }, [integrationsData, connectionStatus]);

  // Combined loading state
  const isLoading = isLoadingIntegrations || isLoadingConfigs;

  // Combined error state
  const error = integrationsError || configsError;

  // Refresh both APIs
  const refreshIntegrations = () => {
    refetchIntegrations();
    refetchConfigs();
  };

  // Update selected integration when integrations data changes
  useEffect(() => {
    if (selectedIntegration && integrations.length > 0) {
      // Find the updated version of the selected integration
      const updatedSelectedIntegration = integrations.find(
        integration => integration.id === selectedIntegration.id
      );

      if (updatedSelectedIntegration) {
        setSelectedIntegration(updatedSelectedIntegration);
      } else {
        // If the integration is no longer found, clear the selection
        setSelectedIntegration(null);
      }
    }
  }, [integrations, selectedIntegration]);

  const contextValue: IntegrationContextType = {
    // Data and loading states
    integrations,
    isLoading,
    error,
    connectionStatus,

    // Selected integration state
    selectedIntegration,
    setSelectedIntegration,

    // Actions
    refreshIntegrations,
  };

  return (
    <IntegrationContext.Provider value={contextValue}>
      {children}
    </IntegrationContext.Provider>
  );
};

// Custom hook for consuming the context
export const useIntegrationContext = () => {
  const context = useContext(IntegrationContext);
  if (!context) {
    throw new Error('useIntegrationContext must be used within an IntegrationProvider');
  }
  return context;
};
