import { companySizeOptions, CURRENCY_SYMBOL, industries } from "@/constants";
import { Rocket } from "lucide-react";
import { FC, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { FaCheck } from "react-icons/fa";
import { BulletPoint } from "../ui/BulletPoint";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { FormInput } from "../ui/inputs/Input";
import { FormSelect } from "../ui/inputs/Select";
import {
  useCreateCompanyMutation,
  useGetBillingPlansQuery,
} from "@/services/home.api";
import ComparePlansModal from "../on-boarding/ComparePlansModal";
import { showToast } from "../Toast";
import { useCompaniesStore } from "@/store/Companies";
import { CompanyType, Plan } from "@/types";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import PaymentForm from "@/components/payment/PaymentForm";
import { DISCOUNTED_PRICE } from "@/utils/pricingDetails";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
);
type CreateClientModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export type CompanyInfoForm = {
  selectedPlan: string;
  companyName: string;
  websiteUrl: string;
  industry: string;
  companySize: string;
  comapanyId?: string | undefined;
  stripe_token?: string;
  billing_cycle?: string;
};

type PaymentForm = {
  cardNumber: string;
  expirationDate: string;
  cvv: string;
  billingZip: string;
};

export const CreateClientModal: FC<CreateClientModalProps> = ({
  onOpenChange,
  open,
}) => {
  const [step, setStep] = useState(1);
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<null | string>(null);
  const [noCreditCard, setNoCreditCard] = useState(false);
  const [paymentState, setPaymentState] = useState<{
    pending?: boolean;
    touched: boolean;
    valid: boolean;
    token?: string;
  }>({
    touched: false,
    pending: false,
    valid: false,
  });
  const { data } = useGetBillingPlansQuery();
  const { data: plans } = data || {};
  const sortPlans = (plans: Plan[]) => {
    const order = ["Starter", "Growth"];
    return plans.sort(
      (a, b) => order.indexOf(a.plan_name) - order.indexOf(b.plan_name)
    );
  };
  const displayedPlans = sortPlans(
    (plans || []).filter(
      (plan) => plan.interval === (isYearly ? "year" : "month")
    )
  );
  const selectedPlanName = plans?.find(item => item.plan_id === selectedPlan)?.plan_name
  const selectedYearPlanDetails = plans?.find(item => item.plan_name === selectedPlanName && item.interval === 'year')
  const selectedPlanDetails = plans?.find(item => item.plan_id === selectedPlan)

  const { mutateAsync, isPending } = useCreateCompanyMutation();
  const { setCompanies, companies } = useCompaniesStore();
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
    control,
  } = useForm<CompanyInfoForm>({
    mode: "all",
    defaultValues: {
      companyName: "",
      websiteUrl: "",
      industry: "",
      companySize: "",
    },
  });

  const {
    register: registerPayment,
    handleSubmit: handleSubmitPayment,
    formState: { errors: errorsPayment },
    reset: resetPaymentForm,
  } = useForm<PaymentForm>({
    mode: "all",
    defaultValues: { cardNumber: "", expirationDate: "" },
  });

  const formatPrice = (cents: number) => {
    const divisor = isYearly ? 12 : 1;
    return `$${(cents / 100 / divisor).toFixed(0)}`;
  };
  const onSubmit: SubmitHandler<CompanyInfoForm> = () => {
    setStep(step + 1);
  };

  const onSubmitPayment: SubmitHandler<PaymentForm> = (values) => {
    // Final create account logic
    const companyInfoFormValues = getValues();
    const payload: {
      selectedPlan: string;
      companyName: string;
      websiteUrl: string;
      industry: string;
      companySize: string;
      comapanyId?: string | undefined;
      stripe_token?: string;
      billing_cycle: string;
    } = {
      ...companyInfoFormValues,
      selectedPlan: plans?.find(item => item.plan_name === selectedPlanName && item.interval === (isYearly ? 'year' : 'month'))?.plan_id || '',
      billing_cycle: isYearly ? "yearly" : "monthly",
    };
    if (paymentState.token) {
      payload.stripe_token = paymentState.token;
    }
    selectedPlan &&
      mutateAsync(
        { ...payload },
        {
          onSuccess: (newCompany) => {
            showToast({ title: "Company Created Successfully", type: "success" });
            const updatedCompany: CompanyType = {
              company: {
                id: newCompany.id,
                name: newCompany.name,
                website: newCompany.website,
                created_at: newCompany.created_at,
              },
              role: "admin",
              association: "client",
              linked_at: newCompany.created_at, // using created_at as linked_at,
              subscription_status: 'trialing'
            };
            setCompanies([...companies, updatedCompany]);
            onOpenChange(false);
            setStep(1);
            reset();
            resetPaymentForm();
          },
          onError: (error: any) => {
            showToast({
              title: error?.response?.data?.detail || "Something went wrong. Please try again.",
              type: "error",
            });
          }
        }
      );
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-4 sm:p-8 rounded-2xl text-left max-h-[90vh] overflow-y-auto">
        <div className="flex-col flex sm:flex-row items-center gap-2">
          <DialogTitle className="text-2xl font-semibold text-black">
            Create Client Account{" "}
          </DialogTitle>
          <span className="text-xs font-semibold rounded-full bg-neutral-25 px-3 py-1">
            Step{step}/3
          </span>
        </div>

        <div className="border-t border-neutral-50 my-3" />
        {step === 1 && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormInput
              label="Company Name"
              name="companyName"
              register={register}
              rules={{
                required: "Company name is required",
                maxLength: { value: 120, message: "Max length is 120" },
              }}
              requiredMark
              errors={errors}
            />
            <FormInput
              label="Website URL"
              name="websiteUrl"
              register={register}
              rules={{
                required: "Website URL is required",
                pattern: {
                  value: /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\S*)?$/,
                  message: "Enter a valid URL",
                },
              }}
              requiredMark
              errors={errors}
            />

            <FormSelect
              label="Industry"
              name="industry"
              register={register}
              rules={{ required: "Industry is required" }}
              errors={errors}
              options={industries}
              placeholder="Select industry"
              requiredMark
              control={control}
            />
            <FormSelect
              label="Company Size"
              name="companySize"
              register={register}
              rules={{ required: "Company Size is required" }}
              errors={errors}
              options={companySizeOptions}
              placeholder="Select Company Size"
              requiredMark
              control={control}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  setStep(1);
                  onOpenChange(false);
                  reset();
                  resetPaymentForm();
                }}
              >
                Cancel
              </Button>
              <Button variant="dark" type="submit" className="rounded-full">
                Next
              </Button>
            </div>
          </form>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h5 className="text-xl text-black font-semibold">
              Select plan to start your 14-day free trial!
            </h5>

            <div className="flex justify-between gap-2">
              <div className="flex items-center gap-2">
                <label className="text-xs font-normal text-gray-700 whitespace-nowrap">
                  Pay Monthly
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isYearly}
                    onChange={() => {
                      setSelectedPlan(null);
                      setIsYearly((prev) => !prev)
                    }}
                  />
                  <div className="w-10 h-5 bg-black peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0CD074]"></div>
                </label>
                <label className="text-xs font-normal text-gray-700 whitespace-nowrap">
                  Pay Yearly
                </label>
                <label className="text-xs font-medium text-[#0CD074] bg-neutral-50 rounded-full px-2 py-1 whitespace-nowrap">
                  -{DISCOUNTED_PRICE}%
                </label>
              </div>

              <ComparePlansModal plans={sortPlans(plans as Plan[]) || []} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {displayedPlans.map((plan) => (
                <div
                  key={plan.plan_id + plan.interval}
                  className={`bg-[#F7F9FB] p-1 rounded-lg border-2 ${selectedPlan == plan.plan_id
                    ? "border-black"
                    : "border-neutral-50"
                    } cursor-pointer transition-all`}
                  onClick={() => setSelectedPlan(plan.plan_id)}
                >
                  <div className="flex flex-col bg-white rounded-[16px] p-3">
                    <div className="flex items-center">
                      <button
                        type="button"
                        className={`${plan.plan_name === "Starter"
                          ? "bg-[#ACDF18]"
                          : "bg-blue-400"
                          } text-white rounded-full px-3 py-1.5 flex items-center space-x-2`}
                      >
                        {plan.plan_name === "Starter" ? (
                          <Rocket size={18} color="white" />
                        ) : (
                          <img
                            src="/assets/on-boarding/growth-icon-step2.svg"
                            alt="Growth Icon"
                            className="w-4 h-4"
                          />
                        )}
                        <span className="text-sm font-semibold text-white">
                          {plan.plan_name}
                        </span>
                      </button>
                    </div>

                    {/* Price + compare_at */}
                    <div className="mt-3 flex items-center gap-2">
                      <h5 className="text-xl font-semibold text-black">
                        {formatPrice(plan.amount_cents)}/mo,{" "}
                        {plan.nickname?.toLowerCase()}
                      </h5>
                      {plan.compare_at_cents && (
                        <p className="text-neutral-500 text-base font-normal line-through ml-2">
                          {CURRENCY_SYMBOL}{((plan.compare_at_cents / (isYearly ? 12 : 1)) / 100).toFixed(0)}/mo
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2 p-4">
                    <BulletPoint
                      text={`${plan.limits.tracking_numbers} tracking numbers`}
                    />
                    <BulletPoint
                      text={`${plan.limits.call_minutes} call minutes`}
                    />
                    <BulletPoint
                      text={
                        plan.limits.roi === "by_campaign"
                          ? "ROI by campaign/keyword"
                          : "Advanced ROI reports"
                      }
                    />
                    <BulletPoint
                      text={
                        plan.limits.multiple_integrations
                          ? "Multiple integrations"
                          : "1 integration"
                      }
                    />
                    <BulletPoint
                      text={
                        plan.limits.ai_insights
                          ? "Priority support + AI insights"
                          : "Basic CRM, email support"
                      }
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  setStep(1);
                  onOpenChange(false);
                  reset();
                  resetPaymentForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!selectedPlan}
                className="rounded-full"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <>
            <div className="bg-neutral-25 rounded-2xl border border-neutral-50 p-1.5 !pb-5">
              <div
                className={`p-1 rounded-2xl bg-white cursor-pointer ${noCreditCard || (!paymentState.valid) ? "outline-2 outline-[#D8F990]" : ""
                  }`}
                onClick={() => setNoCreditCard(!noCreditCard)}
              >
                <div className="flex items-center gap-2">
                  <div className="flex flex-col sm:flex-row items-center flex-1">
                    <img
                      src="assets/on-boarding/growth-icon-step3.svg"
                      className="size-20"
                      alt="Logo"
                    />
                    <h5 className="text-black font-semibold text-xl text-center">
                      Start 14-day trial with no credit card
                    </h5>
                  </div>

                  {noCreditCard || (!paymentState.valid) && (
                    <div className="hidden sm:inline-flex items-center justify-center w-5 h-5 bg-[#0CD074] text-white rounded-full mx-3">
                      <FaCheck className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center w-full my-4">
                <div className="flex-grow border-t border-neutral-50" />
                <span className="mx-4 text-gray-600 text-center">
                  Or add a card now to avoid interruption after 14d
                </span>
                <div className="flex-grow border-t border-neutral-50" />
              </div>

              {/* form */}
              <Elements stripe={stripePromise}>
                <PaymentForm onChange={setPaymentState} />
              </Elements>
              <div className="flex items-center justify-between text-[#030C23] text-[10px] font-semibold mt-4 col-span-2">
                <div>
                  <span>Switch to Yearly ({(selectedYearPlanDetails?.amount_cents || 0) / 1200}/mo instead of {formatPrice(selectedPlanDetails?.amount_cents as number)}/mo) and Save</span>
                  <label className="ml-1 text-xs font-medium text-[#0CD074] bg-[#EAFFF5] rounded-full px-2 py-1 whitespace-nowrap">
                    -15%
                  </label>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isYearly}
                    onChange={() => setIsYearly((prev) => !prev)}
                  />
                  <div className="w-10 h-5 bg-[#030C23] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0CD074]"></div>
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => {
                    setStep(1);
                    onOpenChange(false);
                    reset();
                    resetPaymentForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="dark"
                  type="button"
                  className="rounded-full"
                  disabled={isPending || paymentState.pending ||
                    (paymentState.touched && !paymentState.valid)
                  }
                  onClick={() => {
                    handleSubmitPayment(onSubmitPayment)();
                  }}
                >
                  {isPending ? "Creating..." : "Create Account"}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
