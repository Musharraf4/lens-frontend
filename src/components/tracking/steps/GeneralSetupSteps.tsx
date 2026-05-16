import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNumberContext } from "@/store/CreateNumberContext";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { Step } from "@/components/ControlledAccordion";

const NUMBER_TYPES = [
  {
    key: "dynamic",
    title: "Dynamic Number Pool",
    description:
      "Multiple phone numbers are available, and a unique number is temporarily assigned to each visitor or session. This helps track user activity across different marketing channels, providing detailed insights.",
    // Placeholder image
    image: "/DynamicNumberPool.svg",
  },
  {
    key: "static",
    title: "Static Number",
    description:
      "One dedicated phone number is assigned permanently to a specific source (e.g., a specific ad campaign or webpage). All calls offer less detailed tracking compared to dynamic pools.",
    image: "/StaticNumber.svg",
  },
];

const POPULAR_TRAFFIC_SOURCES = [
  { key: "custom", label: "Custom Static Tracking", image: "/CustomStaticTrackingIcon.svg" },
  { key: "google_ads", label: "Google Ads", image: "/GoogleAdsIcon.svg" },
  { key: "google_my_business", label: "Google My Business", image: "/GoogleBusinessIcon.svg" },
  { key: "local_service_ads", label: "Local Service Ads", image: "/GoogleAdsIcon.svg" },
  { key: "bing_ads", label: "Microsoft Ads (Bing Ads)", image: "/MicrosoftAdsIcon.svg" },
  { key: "facebook", label: "Facebook", image: "/FacebookIcon.svg" },
  { key: "instagram", label: "Instagram", image: "/InstagramIcon.svg" },
  { key: "print_ad", label: "Print Ad", image: "/PrintAdIcon.svg" },
  { key: "tv", label: "TV", image: "/TVIcon.svg" },
  { key: "billboard", label: "Billboard", image: "/BillboardIcon.svg" },
  { key: "youtube", label: "YouTube", image: "/YouTubeIcon.svg" },
  { key: "linkedin", label: "LinkedIn", image: "/LinkedInIcon.svg" },
  { key: "x", label: "X", image: "/XIcon.svg" },
  { key: "tiktok", label: "TikTok", image: "/TiktokIcon.svg" },
];

const SOCIAL_MEDIA_TRAFFIC_SOURCES = [
  { key: "social_facebook", label: "Facebook", image: "/FacebookIcon.svg" },
  { key: "social_instagram", label: "Instagram", image: "/InstagramIcon.svg" },
  { key: "social_youtube", label: "YouTube", image: "/YouTubeIcon.svg" },
  { key: "social_linkedin", label: "LinkedIn", image: "/LinkedInIcon.svg" },
  { key: "social_x", label: "X", image: "/XIcon.svg" },
  { key: "social_tiktok", label: "TikTok", image: "/TiktokIcon.svg" },
];

const DYNAMIC_TRAFFIC_SOURCES = [
  {
    key: "all_traffic",
    label: "All Traffic",
    description: "The simplest way to track marketing data for every visitor from all sources.",
    image: "/dynamic-traffic-icons/AllTrafficIcon.svg",
    exclusions: [
      { key: "organic", label: "Exclude Organic Traffic" },
      { key: "paid", label: "Exclude Paid Traffic" },
      { key: "direct", label: "Exclude Direct Traffic" },
    ],
  },
  {
    key: "search",
    label: "Search",
    description:
      "Effortlessly track marketing data for visitors originating from specific search engines.",
    image: "/dynamic-traffic-icons/SearchIcon.svg",
  },
  {
    key: "web_referral",
    label: "Web Referral",
    description:
      "Track marketing data for leads arriving at your site through links on external websites.",
    image: "/dynamic-traffic-icons/WebReferralIcon.svg",
  },
  {
    key: "source_medium",
    label: "Source and Medium",
    description:
      "Track the source of your web visitors and the channels they used to reach your site.",
    image: "/dynamic-traffic-icons/SourceAndMediumIcon.svg",
  },
  {
    key: "direct_visit",
    label: "Direct Visit",
    description:
      "Track users who visit your site directly without clicking on a link from another site.",
    image: "/dynamic-traffic-icons/DirectVisitIcon.svg",
  },
];

export function useGeneralSetupSteps() {
  const {
    selectedNumberType,
    setSelectedNumberType,
    selectedTrafficSource,
    setSelectedTrafficSource,
    forwardingNumber,
    setForwardingNumber,
    excludedTrafficTypes,
    setActiveIds,
    setExcludedTrafficTypes,
  } = useNumberContext();
  // When a source is selected from either section, we'll clear previous selections
  const handleSourceSelection = (sourceKey: string) => {
    setSelectedTrafficSource([sourceKey]);
  };

  const handleExclusionChange = (key: string) => {
    setExcludedTrafficTypes((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };
  // Always include the number type selection
  const steps: Step[] = [
    {
      id: "1",
      label: "Select Number Type",
      body: (
        <div className="flex flex-col md:flex-row gap-6">
          {NUMBER_TYPES.map((type) => (
            <Card
              key={type.key}
              className={`flex-1 cursor-pointer border-2 transition-all ${selectedNumberType === type.key
                ? "border-primary shadow-md"
                : "border-gray-200 hover:border-primary/60"
                }`}
              onClick={() => {
                setSelectedNumberType(type.key);
                setActiveIds(["2"]);
              }}
            >
              <CardHeader className="flex flex-col items-center gap-2 relative">
                {/* Image as background */}
                <div
                  className="relative w-full flex justify-center items-center mb-10"
                  style={{ height: 250 }}
                >
                  <Image
                    src={type.image}
                    alt={type.title}
                    width={400}
                    height={250}
                    className="object-contain w-auto h-full"
                  />
                  {/* Text overlay */}
                  <div className="absolute inset-0 flex flex-col justify-center items-center z-10 translate-y-26">
                    <CardTitle className="text-lg leading-6 font-medium text-center text-black mb-2">
                      {type.title}
                    </CardTitle>
                    <CardDescription className="text-center text-base leading-5 font-normal text-black">
                      {type.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ),
    },
  ];

  // Conditionally add questions based on the selected type
  if (selectedNumberType === "dynamic") {
    steps.push({
      id: "2",
      disabled: !selectedNumberType,
      label: "Choose a traffic source to link with this number pool",
      body: (
        <div className="flex flex-col gap-4">
          {DYNAMIC_TRAFFIC_SOURCES.map((source) => (
            <div
              key={source.key}
              className={`rounded-lg border-2 p-4 mb-2 transition-all ${selectedTrafficSource.includes(source.key)
                ? "border-primary bg-primary/5"
                : "border-gray-200 hover:border-primary/60"
                }`}
            >
              <div
                className="flex items-center cursor-pointer"
                onClick={() => {
                  setSelectedTrafficSource([source.key]);
                  if (source.key !== "all_traffic") setExcludedTrafficTypes([]);
                }}
              >
                <Image
                  src={source.image}
                  alt={source.label}
                  width={48}
                  height={48}
                />
                <div className="ml-4">
                  <div className="font-medium">{source.label}</div>
                  <div className="text-sm text-gray-500">{source.description}</div>
                </div>
              </div>
              {source.key === "all_traffic" && selectedTrafficSource.includes("all_traffic") && (
                <div className="mt-4 flex flex-col gap-2 pl-12">
                  {source?.exclusions?.map((exclusion) => (
                    <label
                      key={exclusion.key}
                      className="flex items-center gap-2"
                    >
                      <Checkbox
                        checked={excludedTrafficTypes.includes(exclusion.key)}
                        onCheckedChange={() => handleExclusionChange(exclusion.key)}
                      />
                      {exclusion.label}
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ),
    });
    // No further questions for dynamic
  } else if (selectedNumberType === "static" || !selectedNumberType) {
    steps.push(
      {
        id: "2",
        disabled: !selectedNumberType,
        label: "Choose a traffic source to link with this number",
        body: (
          <>
            <h3 className="text-sm font-semibold text-neutral-500 my-2">Most Popular</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {POPULAR_TRAFFIC_SOURCES.map((source) => (
                <button
                  key={source.key}
                  type="button"
                  className={`flex items-center justify-start gap-2 p-4 rounded-3xl border-2 transition-all text-sm font-medium h-24 ${selectedTrafficSource.includes(source.key)
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-primary/60"
                    }`}
                  onClick={() => {
                    handleSourceSelection(source.key);
                    setActiveIds(["3"]);
                  }}
                >
                  <Image
                    src={source.image}
                    alt={source.label}
                    width={48}
                    height={48}
                  />
                  {source.label}
                </button>
              ))}
            </div>
            <h3 className="text-sm font-semibold text-neutral-500 mb-2 mt-4">Social Media</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {SOCIAL_MEDIA_TRAFFIC_SOURCES.map((source) => (
                <button
                  key={source.key}
                  type="button"
                  className={`flex items-center justify-start gap-2 p-4 rounded-3xl border-2 transition-all text-sm font-medium h-24 ${selectedTrafficSource.includes(source.key)
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-primary/60"
                    }`}
                  onClick={() => {
                    handleSourceSelection(source.key);
                    setActiveIds(["3"]);
                  }}
                >
                  <Image
                    src={source.image}
                    alt={source.label}
                    width={48}
                    height={48}
                  />
                  {source.label}
                </button>
              ))}
            </div>
          </>
        ),
      },
      {
        id: "3",
        disabled: !selectedNumberType,
        label: "Choose where to direct the calls",
        body: (
          <div className="max-w-md">
            <Input
              label="Enter existing phone number"
              placeholder="Phone number"
              value={forwardingNumber}
              onChange={(e) => setForwardingNumber(e.target.value)}
              type="tel"
            />
          </div>
        ),
      }
    );
  }

  return steps;
}
