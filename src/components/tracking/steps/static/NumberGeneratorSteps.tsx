import React, { useEffect } from "react";
import { useNumberContext } from "@/store/CreateNumberContext";
import { Input } from "@/components/ui/input";
import { Card, CardDescription } from "@/components/ui/card";
import { InfoIcon, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPhoneNumberUniversal } from "@/lib/utils";

// Generated phone numbers for the second step
const GENERATED_NUMBERS = ["420-398-5578", "420-123-4567", "420-378-5435", "420-678-9098"];

export function useNumberGeneratorSteps() {
  const {
    numberSpecification,
    setNumberSpecification,
    areaCode,
    setAreaCode,
    selectedGeneratedNumber,
    setSelectedGeneratedNumber,
    numberName,
    setNumberName,
    availableNumbers,
    isLoadingNumbers,
    areaCodeError,
    setActiveIds,
  } = useNumberContext();

  return [
    {
      id: "1",
      label: "Select Number Specifications",
      body: (
        <div className="flex flex-col md:flex-row gap-6">
          <Card
            className={`flex-1 cursor-pointer border-2 transition-all p-6 ${numberSpecification === "area-code"
              ? "border-primary shadow-md"
              : "border-gray-200 hover:border-primary/60"
              }`}
            onClick={() => {
              setNumberSpecification("area-code");
              setSelectedGeneratedNumber("");
            }}
          >
            <div className="space-y-4">
              <h3 className="font-medium">Area Code-Specific Number</h3>
              <p className="text-sm text-gray-600">
                Phone number that includes a specific area code, allowing callers to identify the
                geographic location of the number.
              </p>
              {areaCode.length > 0 && areaCode.length < 3 && (
                <div className="flex items-center mt-4 text-xs text-red-600">
                  <InfoIcon
                    size={16}
                    className="mr-1"
                  />
                  <span>Area code must be 3-6 digits</span>
                </div>
              )}
              {areaCodeError && (
                <div className="flex items-center mt-4 text-xs text-red-600">
                  <InfoIcon
                    size={16}
                    className="mr-1"
                  />
                  <span>No available numbers found for this area code</span>
                </div>
              )}
              <div className="mt-4">
                <Input
                  placeholder="Enter the country code (e.g., 314)"
                  value={areaCode}
                  onChange={(e) => {
                    setAreaCode(e.target.value);
                    setActiveIds(["1", "2"]);
                  }}
                  disabled={numberSpecification !== "area-code"}
                  minLength={3}
                  maxLength={6}
                />
              </div>
            </div>
          </Card>

          <Card
            className={`flex-1 cursor-pointer border-2 transition-all p-6 ${numberSpecification === "toll-free"
              ? "border-primary shadow-md"
              : "border-gray-200 hover:border-primary/60"
              }`}
            onClick={() => {
              setNumberSpecification("toll-free");
              setSelectedGeneratedNumber("");
            }}
          >
            <div className="space-y-4">
              <h3 className="font-medium">Toll-Free Number</h3>
              <p className="text-sm text-gray-600">
                Phone number that allows callers to reach you without incurring long-distance
                charges, typically starting with 800, 888, or similar prefixes.
              </p>
              <div className="flex items-center mt-4 text-sm text-blue-600">
                <InfoIcon
                  size={16}
                  className="mr-1"
                />
                <span>$5 per number each month</span>
              </div>
            </div>
          </Card>
        </div>
      ),
    },
    {
      id: "2",
      label: "Choose a Generated Number",
      body: (
        <div className="space-y-6">
          <p className="text-sm text-gray-600">
            Select one number with Area Code {areaCode || "---"}{" "}
            {numberSpecification === "toll-free" ? "Toll-Free" : ""}
          </p>

          {isLoadingNumbers ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((index) => (
                <div
                  key={index}
                  className="flex items-center"
                >
                  <div className="mr-2 h-4 w-4 rounded-full bg-gray-200" />
                  <Skeleton className="h-6 w-32" />
                </div>
              ))}
            </div>
          ) : availableNumbers.length > 0 || numberSpecification === "toll-free" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableNumbers.map((number) => (
                <div
                  key={number.phone_number}
                  className="flex items-center"
                >
                  <input
                    type="radio"
                    id={number.phone_number}
                    name="phoneNumber"
                    value={number.phone_number}
                    checked={selectedGeneratedNumber === number.phone_number}
                    onChange={() => {
                      setSelectedGeneratedNumber(number.phone_number);
                      setActiveIds(["3"]);
                    }}
                    className="mr-2 h-4 w-4 cursor-pointer"
                  />
                  <label
                    htmlFor={number.phone_number}
                    className="cursor-pointer text-base"
                  >
                    {formatPhoneNumberUniversal(number.phone_number)}
                  </label>
                </div>
              ))}
            </div>
          ) : areaCode.length >= 3 ? (
            <div className="py-4 text-center text-gray-500">
              {areaCodeError
                ? "No available numbers found for this area code. Try a different one."
                : "Enter an area code to see available numbers."}
            </div>
          ) : (
            <div className="py-4 text-center text-gray-500">
              Enter an area code to see available numbers.
            </div>
          )}
        </div>
      ),
    },
    {
      id: "3",
      label: "Name the Number",
      body: (
        <div className="max-w-lg space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Name the number for easier tracking and management and identification
            </p>
            <Input
              placeholder="Number name"
              value={numberName}
              onChange={(e) => setNumberName(e.target.value)}
            />
          </div>
        </div>
      ),
    },
  ];
}
