"use client";

import { ReactNode } from 'react';
import QueryProvider from '@/providers/QueryProvider';
import { NumberProvider } from '@/store/CreateNumberContext';
import { IntegrationProvider } from '@/store/IntegrationContext';
import { AppProvider } from '@/store/appStore';
import { AuthProvider } from '@/store/AuthContext';
import { ToastProvider } from '@/components/Toast';
import { PlanUsageProvider } from '@/store/PlanUsageContext';
import { DateFilterProvider } from '@/store/DateFilterContext';

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <AppProvider>
      <QueryProvider>
        <AuthProvider>
          <PlanUsageProvider>
            <NumberProvider>
              <DateFilterProvider>
                <IntegrationProvider>
                  <ToastProvider />
                  {children}
                </IntegrationProvider>
              </DateFilterProvider>
            </NumberProvider>
          </PlanUsageProvider>
        </AuthProvider>
      </QueryProvider>
    </AppProvider>
  );
} 