"use client";

import { Button } from "@/components/ui/button";
import { Role } from "@/enums";
import { useSelectedCompanyStore } from "@/store/SelectedCompany";
import { IntegrationCardProps } from "@/types";

export function IntegrationCard({
  title,
  onConnect,
}: IntegrationCardProps & { onConnect: () => void }) {
  const { selectedCompany } = useSelectedCompanyStore();
  return (
    <div
      className="bg-white/20 
 flex items-center justify-between p-4 rounded-2xl space-y-2"
    >
      <div className="flex items-center">
        <div className="w-4 h-4 rounded-full border-2 border-gray-300 mr-3"></div>
        <span className="text-white">{title}</span>
      </div>
      <div>
        <Button
          onClick={onConnect}
          variant="dark"
          size="sm"
          disabled={((selectedCompany?.role !== Role.Admin) && (selectedCompany?.role !== Role.Owner))}
          className="rounded-full"
        >
          Connect
        </Button>
      </div>
    </div>
  );
}
