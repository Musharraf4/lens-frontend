"use client";

import ComparePlansModal from "@/components/on-boarding/ComparePlansModal";
import { Button } from "@/components/ui/button";
import CompanySizeSelect from "@/components/ui/CompanySizeSelect";
import IndustrySelect from "@/components/ui/IndustrySelect";
import { User } from "@/services/auth.api";
import AuthService from "@/services/auth.service";
import { fetchUserCompanies } from "@/services/user.api";
import { useAuth } from "@/store/AuthContext";
import { useCompaniesStore } from "@/store/Companies";
import { useSelectedCompanyStore } from "@/store/SelectedCompany";
import { Plan } from "@/types";
import { ArrowLeft, ArrowRight, Rocket } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa";
import logo from "../../../assets/LenzPixelFullIcon.svg";
import iconStep2 from "../../../assets/on-boarding/growth-icon-step2.svg";
import iconStep3 from "../../../assets/on-boarding/growth-icon-step3.svg";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import PaymentForm from "@/components/payment/PaymentForm";
import { DISCOUNTED_PRICE } from "@/utils/pricingDetails";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '');
// API base URL - adjust this to match your actual API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export default function Onboarding() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createMaster = searchParams.get("create_master");
  const { user, isLoading, setUser } = useAuth();
  const { setCompanies, companies } = useCompaniesStore();
  const { setSelectedCompany } = useSelectedCompanyStore();
  const { logout } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<null | "starter" | "growth">(null);
  const [selectedPriceKey, setSelectedPriceKey] = useState<string | null>(null);
  const [acceptTrial, setAcceptTrial] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [plansError, setPlansError] = useState("");
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [company_size, setCompanySize] = useState("");
  const [isDisabled, setIsDisabled] = useState(true);
  const [isUrlValid, setIsUrlValid] = useState(true);
  const [InvalidUrlError, setInvalidUrlError] = useState("");

  const [paymentState, setPaymentState] = useState<{ pending?: boolean; touched: boolean; valid: boolean; token?: string }>({
    touched: false,
    pending: false,
    valid: false,
  });

  const [isYearly, setIsYearly] = useState(false);
  const [yearlySelected, setYearlySelected] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const fetchPlans = async () => {
    setIsLoadingPlans(true);
    setPlansError("");
    try {
      const accessToken = AuthService.getAccessToken();

      const response = await fetch(`${API_BASE_URL}/api/v1/billing/plans`, {
        headers: {
          Accept: "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch plans: ${response.status}`);
      }

      const plansData: Plan[] = await response.json();
      setPlans(plansData);
    } catch (error) {
      console.error("Error fetching plans:", error);
      setPlansError("Failed to load plans. Please try again.");
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const validateUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const { token } = useAuth();

  const handleStartTrial = async () => {
    try {
      if (!token) throw new Error("No access token found");
      if (paymentState.touched && !paymentState.valid) {
        setSubmitError("Please fix card details before proceeding.");
        return;
      }


      const subscriptionPlanId = selectedPriceKey || plans?.[0]?.plan_id || null;
      if (!subscriptionPlanId) {
        throw new Error("No subscription plan available");
      }

      setIsSubmitting(true);
      setSubmitError("");

      const payload: {
        name: string;
        website: string;
        industry: string;
        company_size: string;
        subscription_plan_id: string; stripe_token?: string, billing_cycle: string
      } = {
        name,
        website,
        industry,
        company_size,
        subscription_plan_id: subscriptionPlanId,
        billing_cycle: yearlySelected ? 'yearly' : 'monthly'
      };
      if (paymentState.token) {
        payload.stripe_token = paymentState.token;
      }
      const response = await fetch(`${API_BASE_URL}/api/v1/companies/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errMsg = "Failed to start trial";
        try {
          const errorData = await response.json();
          if (errorData?.detail) {
            errMsg = errorData.detail;
          }
        } catch { }
        throw new Error(errMsg);
      }

      const data = await response.json();

      // Update user in context
      const updatedUser = { ...user, master_agency_id: data?.id };
      setUser(updatedUser as User);

      // Update cookies
      document.cookie = `user_data=${JSON.stringify(updatedUser)}; path=/; max-age=${60 * 60 * 24 * 7
        }; secure=${process.env.NODE_ENV === "production"}; samesite=lax`;

      const companies = await fetchUserCompanies();
      setCompanies(companies);
      setSelectedCompany(companies[0] ?? null);
      const fromCreatePassword = localStorage.getItem("from-create-password");
      if (fromCreatePassword) {
        localStorage.removeItem("from-create-password");
        router.replace("/accounts?awaiting-approval=true");
        return;
      }
      router.replace("/home");
    } catch (error: any) {
      console.error("Error starting trial:", error);
      setSubmitError(error.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to format price from cents to dollars
  const formatPrice = (cents: number) => {
    const divisor = isYearly ? 12 : 1;
    return `$${((cents / 100) / divisor).toFixed(0)}`;
  };
  const sortPlans = (plans: Plan[]) => {
    const order = ['Starter', 'Growth'];
    return plans.sort((a, b) => order.indexOf(a.plan_name) - order.indexOf(b.plan_name));
  };

  // Helper function to get monthly plans
  const getMonthlyPlans = () => {
    return sortPlans(plans.filter((plan) => plan.interval === "month"));
  };

  // Helper function to get yearly plans
  const getYearlyPlans = () => {
    return sortPlans(plans.filter((plan) => plan.interval === "year"));
  };

  // Get the currently displayed plans based on isYearly toggle
  const getDisplayedPlans = () => {
    return isYearly ? getYearlyPlans() : getMonthlyPlans();
  };

  // Handle plan selection
  const handlePlanSelect = (planKey: string, priceKey: string, planId: string) => {
    setSelectedPlan(planKey as "starter" | "growth");
    setSelectedPriceKey(planId);
    setAcceptTrial(true);
  };

  useEffect(() => {
    if (!isLoading && !user?.email_verified) {
      const verifyUrl = new URL("/verify-email", window.location.origin);
      verifyUrl.searchParams.set("email", user?.email || "");
      router.push(verifyUrl.toString());
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    const allFilled = name.trim() && website.trim() && industry && company_size;
    const allValid = allFilled && isUrlValid;
    setIsDisabled(!allValid);
  }, [name, website, industry, company_size, isUrlValid]);
  const selectedYearPlanDetails = plans?.find(item => item.plan_name?.toLowerCase() === selectedPlan?.split('_')[0]?.toLowerCase() && item.interval === 'year')
  const selectedPlanDetails = plans?.find(item => item.plan_id === selectedPriceKey)
  return (
    <div className="bg-neutral-25 min-h-screen">
      <div className="pr-8 pt-3 flex gap-2 justify-end">
        {createMaster && (
          <Button
            variant='outline'
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        )}
        <Button
          onClick={logout}
          size={"default"}
        >
          Logout
        </Button>
      </div>
      <div className=" flex items-center justify-center bg-neutral-25 p-4 sm:p-6 mt-5">
        <div className="bg-white rounded-xl container min-h-[70vh] p-6 sm:p-8 flex flex-col justify-between gap-5">
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className=" flex flex-col justify-start overflow-visible items-start">
                <div>
                  <img
                    src={logo.src}
                    alt="LENZ"
                    className="h-8 w-auto mb-4 sm:mb-6"
                  />
                  <p className="text-xs sm:text-[12px] leading-4 font-semibold text-black mb-3 sm:mb-4 bg-neutral-25 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full inline-block font-sfpro">
                    Step 1 / 3
                  </p>
                  <h2 className="text-3xl font-semibold text-black mb-3 sm:mb-4">
                    Tell us about yourself
                  </h2>
                  <p className="text-sm text-neutral-500 font-medium mb-3 sm:mb-4">
                    This information helps us:
                  </p>
                </div>
                <ul className="text-left text-sm text-black pl-0 -ml-1 space-y-2">
                  {[
                    "Personalize your account setup",
                    "Easily connect marketing tools like Google Ads",
                    "Integrate faster with case management platforms like Clio",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center"
                    >
                      <span className="inline-flex items-center justify-center w-4 h-4 mr-2 mt-px bg-green-500 rounded-full flex-shrink-0">
                        <FaCheck className="text-white text-[10px]" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className=" flex flex-col justify-start">
                <div className="bg-neutral-25 p-4 sm:p-6 rounded-lg space-y-4 sm:space-y-5">
                  <div>
                    <label className="block text-neutral-500 text-left mb-1">Company name</label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2 sm:p-2.5 pr-6 border border-neutral-100 rounded-full text-sm"
                        placeholder="Enter"
                        required
                      />
                      <span className="absolute right-3 text-neutral-500 text-sm">*</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-neutral-500 text-left mb-1">Website URL</label>
                    <div className="relative flex items-center">
                      <input
                        type="url"
                        value={website}
                        onChange={(e) => {
                          const value = e.target.value;
                          setWebsite(value);
                          if (!value) {
                            setInvalidUrlError("Website URL is required");
                            setIsUrlValid(false);
                          } else if (!validateUrl(value)) {
                            setInvalidUrlError(
                              "Website format is incorrect. Please use the format: https://websitename.com"
                            );
                            setIsUrlValid(false);
                          } else {
                            setInvalidUrlError("");
                            setIsUrlValid(true);
                          }
                        }}
                        className={`w-full p-2 sm:p-2.5 pr-7 rounded-full text-sm border ${InvalidUrlError ? "border-red-500 bg-red-50" : "border-neutral-100 "
                          }`}
                        placeholder="Enter"
                        required
                      />
                      <span className="absolute right-3 text-neutral-500 text-sm">*</span>
                    </div>
                    {InvalidUrlError && (
                      <p className="text-red-600 text-xs mt-1 ml-2">{InvalidUrlError}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-neutral-500 text-left mb-1">Industry</label>
                    <IndustrySelect
                      value={industry}
                      onChange={setIndustry}
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-500 text-left mb-1">Company size</label>
                    <CompanySizeSelect
                      value={company_size}
                      onChange={setCompanySize}
                    />
                  </div>
                </div>
                {submitError && (
                  <div className="mt-4 p-2 bg-red-100 text-red-700 rounded-md">{submitError}</div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className=" flex flex-col h-auto">
                <div>
                  <img
                    src={logo.src}
                    alt="LENZ"
                    className="h-8 w-auto mb-4 sm:mb-6"
                  />
                  <p className="text-xs sm:text-[12px] leading-4 font-semibold text-black mb-3 sm:mb-4 bg-neutral-25 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full inline-block font-sfpro">
                    Step 2 / 3
                  </p>
                  <h2 className="text-3xl font-semibold text-black mb-3 sm:mb-4">
                    Start your 14-day free trial!
                  </h2>
                  <p className="text-sm text-neutral-500 font-medium mb-3 sm:mb-4">
                    Lenz special offer:
                  </p>
                  <p className="text-xs sm:text-sm font-normal text-black mb-2 bg-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 shadow-[0px_4px_16px_-2px_rgba(0,0,0,0.06)] inline-block">
                    🎉 First 50 customers get 20% off for 6 months!
                  </p>
                </div>
              </div>

              <div className=" flex flex-col">
                <div className="flex items-center justify-between mb-3 sm:mb-4 relative z-10 w-full">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-normal text-neutral-500 whitespace-nowrap">
                      Pay Monthly
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={isYearly}
                        onChange={() => {
                          setIsYearly((prev) => !prev)
                          setYearlySelected((prev) => !prev)
                          setSelectedPriceKey(null);
                          setSelectedPlan(null);
                        }}
                      />
                      <div className="w-10 h-5 bg-black peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-success-400"></div>
                    </label>
                    <label className="text-xs font-normal text-neutral-500 whitespace-nowrap">
                      Pay Yearly
                    </label>
                    <label className="text-xs font-medium text-success-400 bg-success-100 rounded-full px-2 py-1 whitespace-nowrap">
                      -{DISCOUNTED_PRICE}%
                    </label>
                  </div>
                  <ComparePlansModal plans={sortPlans(plans as Plan[]) || []} />
                </div>

                {isLoadingPlans ? (
                  <div className="flex-grow flex items-center justify-center">
                    <p>Loading plans...</p>
                  </div>
                ) : plansError ? (
                  <div className="flex-grow flex flex-col items-center justify-center">
                    <p className="text-red-500 mb-2">{plansError}</p>
                    <button
                      onClick={fetchPlans}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <div className="flex-grow space-y-3">
                    {getDisplayedPlans().map((plan) => (
                      <div
                        key={plan.price_key}
                        className={`bg-neutral-25 p-1 rounded-lg border-2 ${selectedPlan === plan.plan_key ? "border-black" : "border-[#E6E9EE]"
                          } cursor-pointer transition-all`}
                        onClick={() =>
                          handlePlanSelect(plan.plan_key, plan.price_key, plan.plan_id)
                        }
                      >
                        <div className="flex flex-col bg-white rounded-[16px] p-3 mb-4">
                          <div className="flex items-center">
                            <button
                              type="button"
                              className={`${plan.plan_name === "Starter" ? "bg-[#ACDF18]" : "bg-[#4678FB]"
                                } text-white rounded-full px-3 py-1.5 flex items-center justify-start space-x-2`}
                            >
                              {plan.plan_name === "Starter" ? (
                                <Rocket
                                  color="white"
                                  size={18}
                                />
                              ) : (
                                <img
                                  src={iconStep2.src}
                                  alt="Growth Icon"
                                  className="w-4 h-4"
                                />
                              )}
                              <span className="font-semibold text-white">{plan.plan_name}</span>
                            </button>
                          </div>
                          <div>
                            <p className="text-2xl font-semibold text-black mt-3">
                              {formatPrice(plan.amount_cents)}/mo,{" "}
                              {plan.nickname?.toLowerCase()}
                              {/* early offer */}
                              {plan.compare_at_cents && (
                                <span className="text-neutral-500 text-sm font-normal line-through ml-2">
                                  {plan.compare_at_cents / (isYearly ? 12 : 1) / 100}/mo
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          <ul className="space-y-2 p-2 text-sm">
                            <li className="flex items-center text-black">
                              <span className="inline-flex items-center justify-center w-4 h-4 mr-2 mt-px bg-green-500 rounded-full flex-shrink-0">
                                <FaCheck className="text-white text-[10px]" />
                              </span>
                              {plan.limits.tracking_numbers} tracking numbers
                            </li>
                            <li className="flex items-center text-black">
                              <span className="inline-flex items-center justify-center w-4 h-4 mr-2 mt-px bg-green-500 rounded-full flex-shrink-0">
                                <FaCheck className="text-white text-[10px]" />
                              </span>
                              {plan.limits.call_minutes.toLocaleString()} call minutes
                            </li>
                            <li className="flex items-center text-black">
                              <span className="inline-flex items-center justify-center w-4 h-4 mr-2 mt-px bg-green-500 rounded-full flex-shrink-0">
                                <FaCheck className="text-white text-[10px]" />
                              </span>
                              {plan.limits.roi === "by_campaign"
                                ? "ROI by campaign/keyword"
                                : "Advanced ROI reports"}
                            </li>
                          </ul>
                          <ul className="space-y-2 p-2 text-sm">
                            <li className="flex itemsCenter text-black">
                              <span className="inline-flex items-center justify-center w-4 h-4 mr-2 mt-px bg-green-500 rounded-full flex-shrink-0">
                                <FaCheck className="text-white text-[10px]" />
                              </span>
                              {plan.limits.multiple_integrations
                                ? "Multiple integrations"
                                : "1 integration"}
                            </li>
                            <li className="flex items-center text-black">
                              <span className="inline-flex items-center justify-center w-4 h-4 mr-2 mt-px bg-green-500 rounded-full flex-shrink-0">
                                <FaCheck className="text-white text-[10px]" />
                              </span>
                              Google Ads optimization
                            </li>
                            <li className="flex items-center text-black">
                              <span className="inline-flex items-center justify-center w-4 h-4 mr-2 mt-px bg-green-500 rounded-full flex-shrink-0">
                                <FaCheck className="text-white text-[10px]" />
                              </span>
                              {plan.limits.crm === "basic"
                                ? "Basic CRM, email support"
                                : "Advanced CRM, priority support"}
                            </li>
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col justify-start overflow-visible items-start">
                <div>
                  <img
                    src={logo.src}
                    alt="LENZ"
                    className="h-8 w-auto mb-4 sm:mb-6"
                  />
                  <p className="text-xs sm:text-[12px] leading-4 font-semibold text-black mb-3 sm:mb-4 bg-neutral-25 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full inline-block font-sfpro">
                    Step 3 / 3
                  </p>
                  <h2 className="text-xl sm:text-2xl font-semibold text-[#000000] mb-3 sm:mb-4">
                    Get Started Your Way
                  </h2>
                  <p className="text-sm sm:text-[14px] max-w-md font-medium text-neutral-500 mb-4">
                    Choose how you want to begin — start your 14-day trial with no commitment, or
                    add a card now to unlock automatic billing and savings later.
                  </p>
                </div>
              </div>

              <div className="flex flex-col justify-start">
                <div className="bg-neutral-25 border-1 bordrer-[#E6E9EE] rounded-lg space-y-2 p-1">
                  <div
                    style={{
                      border: (!paymentState.valid)
                        ? "2px solid #D8F990"
                        : "none",
                    }}
                    className="bg-white pl-0 pr-3 py-3 rounded-lg flex items-center"
                  >
                    <div className="w-12 h-12 rounded-full flex items-center justify-center">
                      <img
                        src={iconStep3.src}
                        className="w-30 h-30"
                        alt="Logo"
                      />
                    </div>
                    <span className="text-black font-semibold">
                      Start 14-day trial with no credit card
                    </span>
                    {(!paymentState.valid) ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-success-400 text-white rounded-full ml-auto">
                        <FaCheck className="w-2.5 h-2.5" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-5 h-5 ml-auto"></span>
                    )}
                  </div>

                  <div className="flex items-center justify-center my-4">
                    <div className="flex-grow border-t border-[#E6E9EE]"></div>
                    <p className="mx-4 text-xs sm:text-[12px] text-black font-medium">
                      {(!paymentState.valid)
                        ? "Or add a card now to avoid interruption after 14 days"
                        : "Or add a card now"}
                    </p>
                    <div className="flex-grow border-t border-[#E6E9EE]"></div>
                  </div>
                  <Elements stripe={stripePromise}>
                    <PaymentForm onChange={setPaymentState} />
                  </Elements>

                </div>
                {(!yearlySelected && !isYearly) && (
                  <div className="flex items-center justify-between text-black text-[10px] gap-2 font-semibold mt-4">
                    <div className="flex gap-2 items-center">
                      <span>Switch to Yearly ({(selectedYearPlanDetails?.amount_cents || 0) / 1200}/mo instead of {formatPrice(selectedPlanDetails?.amount_cents as number)}/mo) and Save</span>
                      <label className="text-xs font-medium text-success-400 bg-success-100 rounded-full px-2 py-1 whitespace-nowrap">
                        -{DISCOUNTED_PRICE}%
                      </label>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        onChange={() => {
                          const planChange = plans?.filter(item => item.plan_name?.toLowerCase() === selectedPlan?.split('_')[0]?.toLowerCase() && item.interval === 'year')[0]
                          setIsYearly((prev) => !prev)
                          setSelectedPriceKey(planChange?.plan_id || null);
                          setSelectedPlan(planChange?.plan_key as "starter" | "growth" || null);
                        }}
                        type="checkbox"
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-black peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-success-400"></div>
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}
          <div>
            {step === 1 && (
              <div className=" sm:mt-auto flex items-center">
                <button
                  type="button"
                  className={`px-4 py-2 rounded-full flex items-center gap-2 transition ${isDisabled
                    ? "bg-neutral-100 text-white cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-900 cursor-pointer"
                    }`}
                  onClick={() => setStep(2)}
                  disabled={isDisabled}
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="flex items-center">
                <button
                  type="button"
                  className="text-gray-600 hover:text-gray-800 text-base mr-4 w-9 h-9 flex items-center justify-center border border-[#B5BAC4] rounded-full cursor-pointer"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded-full flex items-center gap-2 transition ${!selectedPlan || !acceptTrial
                    ? "bg-neutral-100 text-white cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-900 cursor-pointer"
                    }`}
                  onClick={() => setStep(3)}
                  disabled={!selectedPlan || !acceptTrial}
                >
                  Continue with<span className="capitalize">{selectedPlan?.split("_")[0] || "..."}</span>{" "}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {step === 3 && (
              <>
                <div className="flex items-center">
                  <button
                    type="button"
                    className="text-gray-600 hover:text-gray-800 text-base mr-4 w-9 h-9 flex items-center justify-center border border-[#B5BAC4] rounded-full cursor-pointer"
                    onClick={() => setStep(2)}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-full flex items-center gap-2 text-white cursor-pointer ${(isSubmitting ||
                      paymentState.pending || // while tokenizing
                      (paymentState.touched && !paymentState.valid)) ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-900"
                      }`}
                    onClick={handleStartTrial}
                    disabled={isSubmitting ||
                      paymentState.pending || // while tokenizing
                      (paymentState.touched && !paymentState.valid) // invalid payment
                    }
                  >
                    {isSubmitting ? "Processing..." : (!paymentState.valid) ? "Start Trial" : 'Get Started'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                {submitError && (
                  <div className="mt-4 p-2 bg-red-100 text-red-700 rounded-md">{submitError}</div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
