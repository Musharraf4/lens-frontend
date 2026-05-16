import React from "react";
import { useNumberContext } from "@/store/CreateNumberContext";
import { Input } from "@/components/ui/input";
import DataTable from "@/components/DataTable";
import { Checkbox } from "@/components/ui/checkbox";
import { AmountInput } from "@/components/AmountInput";
import { StatusTag } from "@/components/StatusTag";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPhoneNumberUniversal } from "@/lib/utils";

export function useNumberPoolGeneratorSteps() {
  const {
    dailyVisitors,
    setDailyVisitors,
    trackingNumbers,
    setTrackingNumbers,
    areaCodeError,
    setAreaCodeError,
    areaCodeAlternatives,
    setAreaCodeAlternatives,
    selectedNumbers,
    setSelectedNumbers,
    areaCode,
    setAreaCode,
    availableNumbers,
    isLoadingNumbers,
  } = useNumberContext();

  // Transform API data to match the table format
  const generatedNumbers = availableNumbers.map((number, index) => ({
    id: index + 1,
    country: "USA",
    number: formatPhoneNumberUniversal(number.phone_number),
    location: `${number.locality || ""}${number.locality && number.region ? ", " : ""}${number.region || ""}`,
    voice: number.capabilities.voice,
    messaging: number.capabilities.SMS,
  }));

  // Area code validation logic
  const handleAreaCodeChange = (val: string) => {
    setAreaCode(val);
  };

  // Table columns for generated numbers
  const columns = [
    {
      id: "select",
      header: () => null,
      cell: ({ row }: any) => (
        <Checkbox
          checked={selectedNumbers.includes(row.original.number)}
          onCheckedChange={() => {
            setSelectedNumbers((prev) =>
              prev.includes(row.original.number)
                ? prev.filter((n) => n !== row.original.number)
                : prev.length < trackingNumbers
                  ? [...prev, row.original.number]
                  : prev
            );
          }}
          disabled={
            !selectedNumbers.includes(row.original.number) &&
            selectedNumbers.length >= trackingNumbers
          }
        />
      ),
    },
    {
      accessorKey: "country",
      header: "Country",
      cell: ({ row }: any) => (
        <div className="flex items-center">
          <span className="mr-1">🇺🇸</span>
          <span>{row.getValue("country")}</span>
        </div>
      ),
    },
    {
      accessorKey: "number",
      header: "Number",
      cell: ({ row }: any) => <span>{row.getValue("number")}</span>,
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }: any) => <span>{row.getValue("location")}</span>,
    },
    {
      accessorKey: "voice",
      header: "Voice",
      cell: ({ row }: any) => <span>{row.getValue("voice") ? "On" : "Off"}</span>,
    },
    {
      accessorKey: "messaging",
      header: "Messaging",
      cell: ({ row }: any) => <span>{row.getValue("messaging") ? "On" : "Off"}</span>,
    },
  ];

  // Step 1: Pool settings
  const poolSettingsStep = {
    id: "1",
    label: "Choose Number Pool Settings",
    body: (
      <div className="space-y-6">
        <div className="flex gap-8">
          <div className="flex-1">
            <div>How many daily visitors does your website get?</div>
            <div className="mt-2">
              <AmountInput
                value={dailyVisitors}
                onChange={setDailyVisitors}
                min={0}
                step={1}
                placeholder="Enter amount"
                className="w-32"
              />
            </div>
          </div>
          <div className="flex-1">
            <div>Tracking numbers you'll need</div>
            <div className="mt-2">
              <AmountInput
                value={trackingNumbers}
                onChange={setTrackingNumbers}
                min={1}
                step={1}
                placeholder="Enter amount"
                className="w-32"
              />
            </div>
          </div>
        </div>
        <div className="flex gap-8 items-end py-2">
          <div className="w-1/2">
            <div className="flex items-center gap-2">
              <span>Enter the area code (e.g., 314)</span>
              <span
                className="text-gray-400 cursor-help"
                title="Area code info"
              >
                ?
              </span>
            </div>
            <Input
              value={areaCode}
              onChange={(e) => handleAreaCodeChange(e.target.value)}
              placeholder="Area code"
              className="mt-2"
            />
          </div>
          {areaCodeError && (
            <div className="text-red-500 mt-1 w-1/2">
              Entered code is not available, select alternative:
              <div className="flex gap-2 mt-1">
                {areaCodeAlternatives.map((code) => (
                  <div
                    onClick={() => handleAreaCodeChange(code)}
                    key={code}
                  >
                    <StatusTag>{code}</StatusTag>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    ),
  };

  // Step 2: Choose generated numbers
  const generatedNumbersStep = {
    id: "2",
    label: `Choose Generated Numbers`,
    body: (
      <div>
        {isLoadingNumbers ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading available numbers...</span>
          </div>
        ) : areaCode.length < 3 ? (
          <div className="text-center py-6 text-gray-500">
            Enter an area code (minimum 3 digits) to see available numbers.
          </div>
        ) : generatedNumbers.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            {areaCodeError
              ? "No available numbers found for this area code. Try a different one."
              : "No numbers available. Please check the area code."}
          </div>
        ) : generatedNumbers.length < trackingNumbers ? (
          <div>
            <div className="mb-4 p-4 border border-yellow-300 bg-yellow-50 rounded-md text-yellow-800">
              <p className="font-medium">Not enough numbers available</p>
              <p className="text-sm mt-1">
                Only {generatedNumbers.length} numbers are available in this area code, but you
                requested {trackingNumbers}.
              </p>
            </div>
            <DataTable
              columns={columns}
              data={generatedNumbers}
              hidePageSizeDropdown
            />
            <div className="text-sm text-gray-500 mt-2">
              {selectedNumbers.length} / {generatedNumbers.length} available numbers selected
              (requested: {trackingNumbers})
            </div>
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={generatedNumbers}
              hidePageSizeDropdown
            />
            <div className="text-sm text-gray-500 mt-2">
              {selectedNumbers.length} / {trackingNumbers} numbers selected
            </div>
          </>
        )}
      </div>
    ),
  };

  return [poolSettingsStep, generatedNumbersStep];
}
