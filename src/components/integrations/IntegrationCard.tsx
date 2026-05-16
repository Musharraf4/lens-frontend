import Image from "next/image";
import { StatusTag } from "../StatusTag";
import { Card, CardContent } from "../ui/card";

type Integration = {
  id: string;
  name: string;
  description: string;
  category: string;
  logo: string;
  isConnected?: boolean;
};

function formatDisplayName(name: string) {
  return name
    .split("_")
    .map((word) =>
      word.toLowerCase() === "lsa"
        ? "LSA"
        : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
}

export function IntegrationCard({
  integration,
  onClick,
}: {
  integration: Integration;
  onClick: () => void;
}) {
  return (
    <Card
      className="relative overflow-hidden hover:shadow-md transition-shadow border border-transparent rounded-3xl cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="px-6">
        <div className="flex justify-between items-start">
          <div className="h-12 w-12 rounded-full flex items-center justify-center bg-gray-50">
            <Image
              src={integration.logo}
              alt={`${integration.name} logo`}
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
          </div>
          {integration.isConnected && (
            <StatusTag type="default" showIcon>
              Connected
            </StatusTag>
          )}
        </div>
        <h3 className="text-black text-base font-semibold leading-6 tracking-tighter align-middle mt-4">
          {formatDisplayName(integration.name)}
        </h3>
        <p className="text-sm font-normal leading-5 tracking-normal text-neutral-500 mt-1 line-clamp-2 w-full">
          {integration.description}
        </p>
      </CardContent>
    </Card>
  );
}