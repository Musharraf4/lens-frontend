import { getCurrencySymbolByCode } from "@/lib/utils";

export const DEFAULT_CURRENCY_SYMBOL = '$';

export function getCurrencySymbol(): string {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('currency');
    return stored || DEFAULT_CURRENCY_SYMBOL;
  }

  return DEFAULT_CURRENCY_SYMBOL;
}

export const CURRENCY_SYMBOL =
  typeof window !== 'undefined' ? getCurrencySymbolByCode(localStorage.getItem('currency')) || DEFAULT_CURRENCY_SYMBOL : DEFAULT_CURRENCY_SYMBOL;

export const companySizeOptions = [
  { value: "one_to_ten", label: "1-10" },
  { value: "eleven_to_fifty", label: "11-50" },
  { value: "fiftyone_to_two_hundrad", label: "51-200" },
  { value: "two_hundrad_to_five_hundrad", label: "201-500" },
  { value: "five_hundrad_to_thousand", label: "501-1000" },
  { value: "thousand_plus", label: "1000+" },
];

export const industries = [
  { value: "law", label: "Law Firm" },
  { value: "healthcare", label: "Healthcare" },
  { value: "real_estate", label: "Real Estate" },
  { value: "home_services", label: "Home Services" },
  { value: "other", label: "Other" },
];
