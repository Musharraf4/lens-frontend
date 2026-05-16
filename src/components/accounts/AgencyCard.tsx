import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import {
  Copy,
  CreditCard,
  PauseCircle,
  Pencil,
  Plus,
  Users,
} from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { AiOutlineLink } from "react-icons/ai";
import { CiStar } from "react-icons/ci";
import { FiBriefcase } from "react-icons/fi";
import { LuSquareUser } from "react-icons/lu";
import { PiWarningCircle } from "react-icons/pi";
import { showToast } from "../Toast";
import { Button } from "../ui/button";
import { ConfirmationModal } from "../ui/ConfirmationModal";
import { ReviewBillingDetailsModal } from "./ReviewBillingDetailsModal";
import { CompanyType, SubscriptionData } from "@/types";
import { useCompaniesStore } from "@/store/Companies";
import { useSelectedCompanyStore } from "@/store/SelectedCompany";
import {
  formatString,
  getCardLogo,
  getPlanStatus,
  getTrialDaysLeft,
} from "@/lib/utils";
import { useRouter } from "next/navigation";
import { AddEditBillingMethodModal } from "./AddEditBillingMethod";
import { CURRENCY_SYMBOL } from "@/constants";
import { IoMdAlert } from "react-icons/io";
import {
  fetchUserCompanies,
  usePauseAccount,
  useResumeAccount,
} from "@/services/user.api";
import { useAuth } from "@/store/AuthContext";
import RoleBadge from "./RoleBadge";
import { Role } from "@/enums";

interface AgencyCardProps {
  data?: {
    name?: string;
    status?: string;
    website?: string;
    industry?: string;
    users?: number;
    company_size?: string;
    role?: string;
    plan?: string;
    billingCycle?: string;
    amount?: string;
    chargeDate?: string | null;
    isTrial?: boolean;
    isPastDue?: boolean;
    id?: string;
    currency: string;
    stripe_customer_id: string | null;
    created_at: string;
    updated_at: string;
    config: any[];
    user_links: any[];
    attachments: any[];
    billing: SubscriptionData;
  };
  setShowEditForm: Dispatch<SetStateAction<CompanyType | null>>;
  isLoading?: boolean;
  activeTab?: string;
  handleNavigateLoading?: (loading: boolean) => void;
  loadingChargeDate?: boolean
  index?: number;
}

interface InfoRowProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  copy?: boolean;
  badge?: boolean;
  noDivider?: boolean;
  isLast?: boolean;
  isStyled?: boolean;
  extraIcon?: React.ReactNode;
  isLoading?: boolean;
}

interface PlanRowProps {
  label: string;
  value: string;
  isLoading?: boolean;
}

export function AgencyCard({
  data,
  index,
  isLoading = false,
  activeTab = "active",
  setShowEditForm,
  handleNavigateLoading,
  loadingChargeDate
}: AgencyCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { companies, setCompanies } = useCompaniesStore();
  const { setSelectedCompany } = useSelectedCompanyStore();

  const [openPauseModal, setOpenPauseModal] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openReviewDetailsModal, setOpenReviewDetailsModal] = useState(false);
  const [openBillingMethodModal, setOpenBillingMethodModal] = useState(false);

  const { mutateAsync: pauseAccountMutate, isPending: isPausing } =
    usePauseAccount();
  const { mutateAsync: resumeAccountMutate, isPending: isResuming } =
    useResumeAccount();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const billingStatus = getPlanStatus(data?.billing?.status);
  const loadingGradient =
    "bg-gradient-to-r from-[rgba(112,120,137,0.06)] to-[rgba(112,120,137,0.16)] animate-pulse";
  const last4Digits = data?.billing?.stripe?.default_payment_method?.last4;
  const isTrial = billingStatus === "Trial";
  const isPastDue =
    billingStatus !== "Active" &&
    billingStatus !== "Trial" &&
    billingStatus !== "Paused";
  const userRole = data?.user_links?.find((link) => link.user_id === user?.id)?.role;



  const handleSwitch = () => {
    handleNavigateLoading?.(true);
    const switchedCompany = companies?.find(
      (item) => item.company?.id === data?.id
    );
    setSelectedCompany(switchedCompany as CompanyType);
    setTimeout(() => {
      router.push(`/accounts/switch-to-accounts/${data?.id}`);
    }, 50);
  };

  const activateSubscription = async (showPaymentModal: boolean) => {
    if (!showPaymentModal) {
      resumeAccountMutate(
        { companyId: data?.id || "" },
        {
          onSuccess: async () => {
            const companies = await fetchUserCompanies();
            setCompanies(companies);

            showToast({
              type: "success",
              title: `${data?.name || "Law Firm"
                }'s account has been reactivated`,
              description: "The account is now active.",
            });
          },
          onError: () => {
            showToast({
              type: "error",
              title: `${data?.name || "Law Firm"
                }'s account could not be reactivated`,
              description: "Please try again later.",
            });
          },
        }
      );
    } else {
      setShowPaymentModal(true);
    }
  };
  return (
    <div data-tour={index === 0 ? "accounts-content" : ''} className="bg-white  border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
      {/* TOP SECTION */}
      <div className="rounded-2xl -m-2 mb-4 p-4 bg-gradient-to-b from-[rgba(183,203,255,0.08)] to-[rgba(70,120,251,0.2)] space-y-3">
        <div className="flex items-center space-x-3">
          <div
            className={`w-8 h-8 rounded-full ${isLoading ? loadingGradient : ""
              }`}
          >
            {!isLoading && (
              <p className="bg-black text-center rounded-xl text-white text-lg sm:text-xl">
                {data?.name?.charAt(0).toUpperCase() || "U"}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between w-full">
            <h2
              className={`text-sm font-semibold line-clamp-1 ${isLoading
                ? "w-24 h-4 rounded-full " + loadingGradient
                : "text-gray-900"
                }`}
            >
              {!isLoading && (data?.name || "-")}
            </h2>
            <div
              className={`flex items-center text-xs font-medium rounded-full px-1.5 py-0.5 whitespace-nowrap ${isLoading
                ? "w-16 h-6 " + loadingGradient
                : activeTab === "trial"
                  ? "text-[#FF9500] bg-[#FFF4E5]"
                  : activeTab === "past"
                    ? "text-[#FF4D4F] bg-[#FFF1F0]"
                    : "text-[#0CD074] bg-[#EAFFF5]"
                }`}
            >
              {!isLoading && (
                <>
                  <div
                    className={`flex items-center justify-center mr-1 ${isTrial ? "bg-[#FF9500]" : isPastDue ? "" : "bg-[#0CD074]"
                      } rounded-full w-3.5 h-3.5`}
                  >
                    {isTrial ? (
                      <PiWarningCircle className="text-white w-2.5 h-2.5" />
                    ) : isPastDue ? (
                      <IoMdAlert className="text-red-500 w-3.5 h-3.5" />
                    ) : (
                      // <></>
                      // <AlertCircle />
                      <svg
                        className="text-white w-2 h-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  {isTrial
                    ? `Trial left ${getTrialDaysLeft(
                      data?.billing?.trial_end || ""
                    )}d`
                    : isPastDue
                      ? "Past due"
                      : billingStatus || "Active"}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center -mt-1">
          <Button
            variant="dark"
            size="sm"
            className={isLoading ? "opacity-0" : "px-2"}
            onClick={handleSwitch}
          >
            {isLoading ? (
              <div className={`w-20 h-8 rounded-md ${loadingGradient}`} />
            ) : (
              "Switch to Account"
            )}
          </Button>

          {!isLoading && (
            <>
              <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger>
                  <div
                    className={`w-8 h-8 cursor-pointer flex items-center justify-center rounded-full ${isLoading
                      ? loadingGradient
                      : "bg-white border border-neutral-200 hover:shadow-sm"
                      }`}
                  >
                    <img src="/Dots.svg" alt="dots-icon" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="text-left absolute -right-5 top-2 bg-white rounded-2xl border border-neutral-100 p-1 w-40 z-20">
                  <div
                    onClick={() => {
                      setDropdownOpen(false);
                      setShowEditForm({ ...data } as CompanyType);
                    }}
                    className="hover:bg-neutral-50 rounded-2xl border-0 outline-0 py-2 px-4 cursor-pointer flex items-center gap-2 text-black"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </div>
                  {data?.billing?.status === "active" && (
                    <DropdownMenuItem
                      className="hover:bg-neutral-50 rounded-2xl border-0 outline-0 py-2 px-4 cursor-pointer flex items-center gap-2 text-black"
                      onSelect={() => {
                        setDropdownOpen(false);
                        setOpenPauseModal(data?.id as string);
                      }}
                    >
                      <PauseCircle className="w-4 h-4" />
                      Pause
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <ConfirmationModal
                key={data?.name || "modal"}
                open={Boolean(openPauseModal)}
                onOpenChange={setOpenPauseModal}
                actionButtonText="Pause"
                title={`Are you sure you want to pause ${data?.name || "Law Firm"
                  }'s  account?`}
                subTitle="This action will temporarily disable tracking, reporting, and access for this client. You can reactivate the account at any time."
                handleAction={() => {
                  const options = {
                    onSuccess: async () => {
                      const companies = await fetchUserCompanies();
                      setCompanies(companies);
                      setOpenPauseModal(null);
                      showToast({
                        type: "success",
                        title: `${data?.name || "Law Firm"
                          }'s account has been paused`,
                        description:
                          "You can reactivate the account at any time.",
                      });
                    },
                    onError: (error: any) => {
                      showToast({
                        type: "error",
                        title: `Failed to pause ${data?.name} account`,
                        description: "Please try again later.",
                      });
                    },
                  };
                  pauseAccountMutate(
                    { companyId: data?.id as string },
                    options
                  );
                }}
                disabled={isPausing}
                icon={<PauseCircle className="w-12 h-12" />}
              />
            </>
          )}
        </div>
      </div>

      {/* MIDDLE SECTION: INFO */}
      <div className="space-y-3 text-xs text-[#707889] font-light relative">
        <InfoRow
          label="Website"
          value={`${data?.website}`}
          icon={<AiOutlineLink size={18} className="text-[#707889]" />}
          copy
          noDivider
          isLoading={isLoading}
        />
        <InfoRow
          label="Industry"
          value={formatString(data?.industry || "") || "Law Firm"}
          icon={<FiBriefcase size={18} className="text-[#707889]" />}
          isStyled={true}
          isLoading={isLoading}
        />
        <InfoRow
          label="Users"
          value={String(data?.user_links?.filter(item => !item.is_hidden)?.length) || "3"}
          icon={<LuSquareUser size={18} className="text-[#707889]" />}
          isStyled={true}
          isLoading={isLoading}
        />
        <InfoRow
          label="Company Size"
          value={
            `${data?.company_size?.replace(/_/g, "-")} employees` ||
            "4–10 employees"
          }
          icon={<Users size={18} className="text-[#707889]" />}
          isStyled={true}
          isLoading={isLoading}
        />
        <InfoRow
          label="Access Type"
          value={userRole || "Admin"}
          icon={<Users size={18} className="text-[#707889]" />}
          extraIcon={<CiStar size={18} className="text-[#0CD074]" />}
          isLast
          isLoading={isLoading}
        />
      </div>

      {/* BOTTOM SECTION: PLAN + PAYMENT */}
      <div className="space-y-3">
        <div
          className={`p-4 rounded-lg border ${activeTab === "past"
            ? "bg-[#FFF1F0] border-[#FFCCC7]"
            : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800"
            } text-sm text-gray-600 dark:text-gray-300 space-y-3`}
        >
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg space-y-1 -m-3.5 mb-4">
            <PlanRow
              label="Plan selected"
              value={data?.billing?.plan?.name || "-"}
              isLoading={isLoading}
            />
            <PlanRow
              label="Billing cycle"
              value={
                data?.billing?.plan?.interval
                  ? `${data?.billing?.plan?.interval}ly`
                  : "-"
              }
              isLoading={isLoading}
            />
            <PlanRow
              label="Amount"
              value={
                isTrial
                  ? "-"
                  : `${CURRENCY_SYMBOL}${String(
                    (data?.billing?.plan?.amount_cents || 0) / 100
                  )}` || "-"
              }
              isLoading={isLoading}
            />
            <PlanRow
              label="Charge date"
              value={isTrial ? "-" : data?.chargeDate || "-"}
              isLoading={loadingChargeDate || isLoading}
            />
          </div>
          <div className="flex items-center justify-between whitespace-nowrap overflow-hidden">
            {!isLoading && (
              <>
                {isPastDue ? (
                  <>
                    <div className="flex items-center gap-2">
                      <CreditCard className="text-[#030C23] w-4 h-4" />
                      <span className="text-[#030C23] text-xs font-medium">
                        Payment Failed
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className={`cursor-pointer text-xs font-medium ml-2 ${isLoading
                          ? "w-20 h-4 rounded-4xl " + loadingGradient
                          : "text-neutral-500"
                          }`}
                        onClick={() => setOpenReviewDetailsModal(true)}
                      >
                        {!isLoading && "Review Details"}
                      </button>
                      <Button
                        variant="dark"
                        className="rounded-full text-xs"
                        onClick={() =>
                          activateSubscription(last4Digits ? false : true)
                        }
                      >
                        {isResuming ? "Reactivating..." : "Reactivate"}
                      </Button>
                    </div>
                  </>
                ) : data?.billing?.stripe?.default_payment_method?.last4 ? (
                  <>
                    <div className="flex items-center gap-2">
                      <img
                        src={getCardLogo(
                          data?.billing?.stripe?.default_payment_method?.brand
                        )}
                        alt="Card Icon"
                        className="w-7 rounded bg-white p-0.5 flex-shrink-0"
                      />
                      <span className="text-xs text-[#030C23] truncate">
                        •••• •••• ••••{" "}
                        {data?.billing?.stripe?.default_payment_method?.last4}
                      </span>
                    </div>
                    <button
                      className={`cursor-pointer text-xs font-medium ml-2 ${isLoading
                        ? "w-20 h-4 rounded-full " + loadingGradient
                        : "text-neutral-500"
                        }`}
                      onClick={() => setOpenReviewDetailsModal(true)} // Add for debugging
                    >
                      {!isLoading && "Review Details"}
                    </button>
                  </>
                ) : (
                  <div className="flex align-center justify-between w-full">
                    <div className="flex align-center gap-2">
                      <img src="/Card Alert.svg" alt="No Card" />
                      <p className="text-black">No Card added</p>
                    </div>
                    <div
                      onClick={() => setOpenBillingMethodModal(true)}
                      className="flex align-center gap-2"
                    >
                      <Plus className="text-neutral-500" />
                      <button className="text-neutral-500">Add</button>
                    </div>
                    {openBillingMethodModal && (
                      <AddEditBillingMethodModal
                        open={openBillingMethodModal}
                        onOpenChange={setOpenBillingMethodModal}
                        companyId={data?.id as string}
                      />
                    )}
                  </div>
                )}
                {openReviewDetailsModal && (
                  <ReviewBillingDetailsModal
                    open={openReviewDetailsModal}
                    onOpenChange={setOpenReviewDetailsModal}
                    companyId={data?.id as string}
                    billing={data?.billing}
                  />
                )}
                {showPaymentModal && (
                  <>
                    <AddEditBillingMethodModal
                      open={showPaymentModal}
                      onOpenChange={setShowPaymentModal}
                      companyId={data?.id || ""}
                      edit={last4Digits ? true : false}
                      handleSubscription={() => activateSubscription(false)}
                    />
                  </>
                )}
              </>
            )}
            {isLoading && (
              <div className="flex items-center gap-2 w-full">
                <div className={`w-16 h-4 rounded-full ${loadingGradient}`} />
                <div className={`w-20 h-4 rounded-full ${loadingGradient}`} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  icon,
  copy = false,
  badge = false,
  noDivider = false,
  isLast = false,
  isStyled = false,
  extraIcon,
  isLoading = false,
}: InfoRowProps) {
  const loadingGradient =
    "bg-gradient-to-r from-[rgba(112,120,137,0.06)] to-[rgba(112,120,137,0.16)] animate-pulse";

  return (
    <div className="relative flex items-start">
      {!isLast && (
        <div className="absolute left-[11px] top-[24px] bottom-[-16px] w-px bg-[#E6E9EE] z-0" />
      )}

      <div
        className={`relative z-10 w-6 h-6 p-1 flex items-center justify-center rounded-full ${isLoading
          ? loadingGradient
          : "bg-white dark:bg-zinc-900 border border-gray-300"
          } mt-[2px] mr-2`}
      >
        {!isLoading && icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline w-full">
          <div className="w-[110px] flex-shrink-0 pr-2">
            <span
              className={`text-xs font-light whitespace-nowrap ${isLoading
                ? "w-16 h-3 rounded-full " + loadingGradient
                : "text-[#707889]"
                }`}
            >
              {!isLoading && `${label}:`}
            </span>
          </div>

          <div className="flex-1 min-w-0 flex items-center justify-between">
            <div className="min-w-0 flex items-center">
              {isLoading ? (
                <div className={`w-24 h-6 rounded-full ${loadingGradient}`} />
              ) : extraIcon ? (
                <RoleBadge role={value as Role} />
              ) : badge ? (
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-md text-xs">
                  {value}
                </span>
              ) : (
                <div
                  className={`px-2 py-1 rounded-full truncate max-w-[140px] ${isStyled
                    ? "bg-[#F7F9FB] text-[#030C23] text-xs font-normal"
                    : "text-[#707889] font-light"
                    }`}
                >
                  {value}
                </div>
              )}
            </div>
            {!isLoading && copy && (
              <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
                {!noDivider && (
                  <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
                )}
                <Copy
                  className="w-4 h-4 cursor-pointer text-gray-400 hover:text-gray-600 flex-shrink-0 z-10"
                  onClick={() => {
                    navigator.clipboard.writeText(value);
                    showToast({
                      title: "The link has been copied to your clipboard",
                      description: "You can paste it wherever needed.",
                      type: "success",
                    });
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanRow({ label, value, isLoading = false }: PlanRowProps) {
  const loadingGradient =
    "bg-gradient-to-r from-[rgba(112,120,137,0.06)] to-[rgba(112,120,137,0.16)] animate-pulse";

  return (
    <div className="flex justify-between">
      <span
        className={`whitespace-nowrap ${isLoading ? "w-16 h-4 rounded-full " + loadingGradient : ""
          }`}
      >
        {!isLoading && label}
      </span>
      <span
        className={`capitalize whitespace-nowrap ${isLoading
          ? "w-16 h-4 rounded-full " + loadingGradient
          : "font-medium text-gray-800 dark:text-white"
          }`}
      >
        {!isLoading && value}
      </span>
    </div>
  );
}
