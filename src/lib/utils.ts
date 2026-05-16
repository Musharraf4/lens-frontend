import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const fmt = (range: string) => range.toLowerCase().replace(/\s+/g, "_");

export const formatCurrency = (n?: number | null) =>
  n != null ? `$ ${n.toLocaleString()}` : "$ 0";

export function formatNumber(num?: null | number | string) {
  if (num == null || num === undefined) {
    return 0;
  }
  // Convert number to string with two decimal places
  let formatted = Number(num).toFixed(2);
  // Parse back to number to remove trailing zeros
  let result = parseFloat(formatted);
  // If the number is effectively an integer, return it as an integer
  if (Math.abs(result - Math.round(result)) < 1e-10) {
    return Math.round(result);
  }
  // Otherwise, return the number with up to two decimal places
  return result;
}

export const normalizedParams = (params: any) =>
  Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (Array.isArray(value)) {
        return [key, value.join(",")];
      }
      return [key, value];
    })
  );

dayjs.extend(relativeTime);

export function formatRelativeTime(date: string) {
  return dayjs(date).fromNow();
}
export function truncateString(str: string, length: number) {
  if (!str) return "";
  return str.length > length ? str.slice(0, length) + "..." : str;
}

export function formatString(str: string) {
  if (!str) return "";
  return str
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatPhoneNumberUniversal(input: string) {
  if (!input) return input;

  // Remove all non-digit characters except "+"
  let cleanedInput = input.replace(/[^\d+]/g, "");

  // Normalize to + format
  if (cleanedInput.startsWith("00")) {
    cleanedInput = "+" + cleanedInput.slice(2);
  } else if (cleanedInput.startsWith("0")) {
    cleanedInput = "+1" + cleanedInput.slice(1); // Assume US if leading 0
  } else if (!cleanedInput.startsWith("+")) {
    cleanedInput = "+1" + cleanedInput; // Assume US if no + or 0
  }

  // Remove "+" for processing
  const digitsOnly = cleanedInput.replace(/\+/g, "");

  // Try to extract country code and rest
  let countryCode = "";
  let rest = "";

  for (let i = 1; i <= 3; i++) {
    const code = digitsOnly.slice(0, i);
    const remaining = digitsOnly.slice(i);

    if (remaining.length >= 7) {
      countryCode = "+" + code;
      rest = remaining;
      break;
    }
  }

  if (!countryCode || rest.length < 7) {
    return input;
  }

  const area = rest.slice(0, 3);
  const middle = rest.slice(3, 6);
  const last = rest.slice(6, 10);

  // ✅ Format: +X XXX-XXX-XXXX
  const formatted = `${countryCode} ${area}-${middle}-${last}`;

  return formatted;
}

export const getSourceIcon = (title: string) => {
  const checkedTitle = title.replace(/\s+/g, "_").toLowerCase();
  switch (checkedTitle) {
    case "organic":
      return "/Search.svg";
    case "pinterest":
      return "/Pinterest.svg";
    case "direct":
      return "/DIrect.svg";
    case "referral":
      return "/Link.svg";
    case "retargeting":
      return "/Refresh.svg";
    case "google_ads":
      return "/GoogleAdsIcon.svg";
    case "web_referral":
      return "/DesktopIcon.svg";
    case "all_traffic":
    case "all":
      return "/dynamic-traffic-icons/AllTrafficIcon.svg";
    case "search":
      return "/dynamic-traffic-icons/SearchIcon.svg";
    case "web_referral":
      return "/dynamic-traffic-icons/WebReferralIcon.svg";
    case "source_medium":
      return "/dynamic-traffic-icons/SourceAndMediumIcon.svg";
    case "direct_visit":
      return "/dynamic-traffic-icons/SearchIcon.svg";
    case "google_ads":
      return "/GoogleAdsIcon.svg";
    case "custom":
      return "/CustomStaticTrackingIcon.svg";
    case "google_my_business":
      return "/GoogleBusinessIcon.svg";
    case "local_service_ads":
    case "local_service_ads":
    case "lsa":
    case "google_lsa":
    case "google_local_service_ads":
      return "/dynamic-traffic-icons/DirectVisitIcon.svg";
    case "bing_ads":
      return "/MicrosoftAdsIcon.svg";
    case "facebook":
    case "facebook_ads":
      return "/FacebookIcon.svg";
    case "instagram":
      return "/InstagramIcon.svg";
    case "tv":
      return "/TVIcon.svg";
    case "print_ad":
      return "/PrintAdIcon.svg";
    case "billboard":
      return "/BillboardIcon.svg";
    case "youtube":
      return "/YouTubeIcon.svg";
    case "linkedin":
      return "/LinkedInIcon.svg";
    case "x":
      return "/XIcon.svg";
    case "billboard":
      return "/TiktokIcon.svg";
    case "google_my_business":
    case "my_business":
    case "google_business":
      return "/GoogleBusinessIcon.svg";
    case "chatbot":
      return "/ChatIcon.svg";
    case "add_existing_account":
      return "/smsfollowup.svg";
    case "phone_number":
      return "/phoneicon.svg";
    default:
      return "/DIrect.svg";
  }
};

export function convertCompanySizeString(inputString: string) {
  if (!inputString) return inputString;

  const mapping: Record<string, string> = {
    "1_10": "one_to_ten",
    "11_50": "eleven_to_fifty",
    "51_200": "fiftyone_to_two_hundrad",
    "201_500": "two_hundrad_to_five_hundrad",
    "501_1000": "five_hundrad_to_thousand",
    "1000_plus": "thousand_plus",
  };

  return mapping[inputString] || inputString;
}

export function formatCompactNumber(value?: number | string | null): string {
  if (!value) return "0";
  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num)) return "0";

  return num >= 1000 ? (num / 1000).toFixed(1) + "k" : num.toFixed(0);
}

export function getCurrencySymbolByCode(code: string | null): string {
  if (!code) return "$";
  const map: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    INR: "₹",
  };

  const upperCode = code.toUpperCase();
  return map[upperCode] || code;
}

export function getTrialDaysLeft(trialEndIso: string): number {
  const now = new Date();
  const trialEnd = new Date(trialEndIso);

  const msLeft = trialEnd.getTime() - now.getTime();
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));

  return Math.max(daysLeft, 0); // prevent negative numbers
}

export const getCardLogo = (brand: string): string => {
  switch (brand.toLowerCase()) {
    case "visa":
      return "https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png";
    case "mastercard":
      return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQl9iuVaaKs7wpjtwKnozaP3jl9rMqxK_j-Ew&s";
    case "amex":
      return "https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/16_Amex_Credit_Card_logo_logos-512.png";
    case "discover":
      return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvCTp-Y7Msyl9pmjaus8Hlcu99I9apoGx9aw&s";
    case "jcb":
      return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-TJ_yiPGULbS6OV-BcN3ZyVBcFscCPoMkYA&s";
    case "unionpay":
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/UnionPay_logo.svg/1280px-UnionPay_logo.svg.png";
    default:
      return "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg";
  }
};

export const getPlanStatus = (status?: string | null) => {
  switch (status) {
    case "active":
    case "paid":
    case "complete":
      return "Active";
    case "trialing":
      return "Trial";
    case "past_due":
      return "Past Due";
    case "canceled":
      return "Canceled";
    case "unpaid":
      return "Unpaid";
    case "paused":
      return "Paused";
    default:
      return "Unknown";
  }
};

export function capitalizeFirstChar(str: string): string {
  if (!str) return ""; // handle empty string
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const getInviteStatus = (status?: string | null) => {
  switch (status) {
    case "accepted":
      return "Accepted";
    case "expired":
      return "Expired";
    case "SENT":
      return "Approval Pending";
    default:
      return "Unknown";
  }
};

export const getInviteUserStatus = (status?: string | null) => {
  switch (status) {
    case "accepted":
      return "Accepted";
    case "expired":
      return "Expired";
    case "SENT":
      return "Awaiting Acceptance";
    default:
      return "Unknown";
  }
};

export const getInviteCompanyStatus = (status?: string | null) => {
  switch (status) {
    case "accepted":
      return "Accepted";
    case "expired":
      return "Expired";
    case "SENT":
      return "Awaiting request approval";
    default:
      return "Unknown";
  }
};

export const getPopupPositionClasses = (position: string) => {
  switch (position) {
    case "center_top":
      return "top-[109px] left-1/2 transform -translate-x-1/2";
    case "center_bottom":
      return "bottom-8 left-1/2 transform -translate-x-1/2";
    case "center_center":
      return "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2";
    default:
      return "top-4 left-1/2 transform -translate-x-1/2";
  }
};

export function getVisiblePages(current: number, total: number) {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | string)[] = [];

  pages.push(1, 2);

  if (current > 3) {
    pages.push("...");
  }

  for (let i = current - 1; i <= current + 1; i++) {
    if (i > 2 && i < total - 1) {
      pages.push(i);
    }
  }

  if (current < total - 2) {
    pages.push("...");
  }

  pages.push(total - 1, total);

  return pages;
}

export function shortenUrl(url: string) {
  const start = url.slice(0, 23);
  const end = url.slice(-4);
  return `${start}.....${end}`;
}

export function formatTime(timeStr: string): string {
  if (!timeStr) return "";
  // Split the input string into minutes and seconds
  const [minutes, seconds] = timeStr.split(":").map(Number);

  // Convert total minutes into hours, minutes, and seconds
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  const finalSeconds = seconds;

  // Format the result
  const formattedTime = `${hours > 0 ? `${hours}h ` : ""}${
    remainingMinutes > 0 ? `${remainingMinutes}m ` : ""
  }${finalSeconds > 0 ? `${finalSeconds}s` : ""}`;

  return formattedTime;
}

export function formatChannel(channel: string): string {
  if (!channel) return "";

  // Handle special case
  if (channel.toLowerCase() === "local service ads") {
    return "LSA";
  }

  // Check if channel includes "http"
  const formatted = channel.includes("http")
    ? channel
    : channel.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  // Truncate if longer than 30 characters
  return formatted.length > 30 ? `${formatted.slice(0, 30)}...` : formatted;
}

export function getBaseUrl(fullUrl: string): string {
  if (!fullUrl) return "";

  try {
    const url = new URL(fullUrl);
    return `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ""}`;
  } catch {
    return fullUrl ?? ""; // or return fullUrl if you prefer
  }
}

export function hexToRgba(
  hex: string | undefined,
  alpha = 1
): string | undefined {
  if (!hex || typeof hex !== "string") return undefined;
  let normalized = hex.replace("#", "");
  if (normalized.length === 3) {
    normalized = normalized
      .split("")
      .map((ch) => ch + ch)
      .join("");
  }
  if (normalized.length !== 6) return undefined;
  const r = parseInt(normalized.substring(0, 2), 16);
  const g = parseInt(normalized.substring(2, 4), 16);
  const b = parseInt(normalized.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function isNonEmptyObject(value: any): value is object {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length > 0
  );
}

export type GoogleBusinessAddress = {
  regionCode?: string | null;
  languageCode?: string | null;
  postalCode?: string | null;
  administrativeArea?: string | null; // State
  locality?: string | null; // City
  addressLines?: (string | null | undefined)[] | null;
};

export function formatAddress(
  addr: GoogleBusinessAddress | null | undefined
): string {
  if (!addr || !isNonEmptyObject(addr)) return "";

  const { addressLines, locality, administrativeArea, postalCode } = addr;

  const safeLines = Array.isArray(addressLines)
    ? addressLines.filter(Boolean)
    : [];

  const street = safeLines.join(", ");

  // Build city/state/postal section
  const cityStatePostal = [locality, administrativeArea, postalCode]
    .filter(Boolean)
    .join(" ");

  return [street, cityStatePostal]
    .filter((s) => s && s.trim() !== "")
    .join(", ");
}
