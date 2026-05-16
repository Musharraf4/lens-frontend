"use client";

import { useProviderLogin } from "@/services/auth.api";
import { useIntegrations } from "@/services/integrations.api";
import { useAuth } from "@/store/AuthContext";
import { useIntegrationContext } from "@/store/IntegrationContext";
import { useSelectedCompanyStore } from "@/store/SelectedCompany";
import { IntegrationCard } from "./IntegrationCard";

export function EmptyStateCard() {
  const { data: integrations } = useIntegrations();
  const providerLoginMutation = useProviderLogin();
  const { user } = useAuth();
  const { selectedCompany } = useSelectedCompanyStore();

  const { refreshIntegrations } = useIntegrationContext();

  const handleConnect = (integrationId: string) => {
    providerLoginMutation.mutate(
      {
        integration_id: integrationId,
        company_id: selectedCompany?.company?.id || "",
      },
      {
        onSuccess: () => {
          refreshIntegrations();
        },
        onError: (error) => {
          console.error("Provider login failed:", error);
        },
      }
    );
  };

  // Define a manual mapping of integration display names and keys
  const integrationsToShow = [
    { key: "google_ads", displayName: "Connect Google Ads" },
    { key: "google_lsa", displayName: "Connect Local Service Ads" },
    { key: "google_business", displayName: "Connect My Business" },
  ];

  return (
    <div
      style={{
        backgroundImage: 'linear-gradient(to right, #071F5F, #4678FB), url(/background.png)', // Gradient + Image
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}

      className=" blue-gradient text-white p-6 rounded-3xl">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-6 xl:col-span-7 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Set up your dashboard quickly</h2>
            <p className="text-white/60">
              You could set up your dashboard by connecting following integrations
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-3xl md:text-[56px] font-bold">10%</h3>

            <div className="w-full bg-white/20 h-3 rounded-full mr-4">
              <div
                className="bg-white h-3 rounded-full"
                style={{ width: "10%" }}
              ></div>
            </div>
          </div>
        </div>

        <div className="space-y-3 col-span-12 lg:col-span-6 xl:col-span-5">
          {integrationsToShow.map(({ key, displayName }) => {
            const integration = integrations?.find((i) => i.name === key);

            return (
              <IntegrationCard
                key={key}
                title={displayName}
                onConnect={() => integration && handleConnect(integration.id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
