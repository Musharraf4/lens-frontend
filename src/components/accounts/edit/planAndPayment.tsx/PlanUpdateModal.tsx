import { BulletPoint } from "@/components/ui/BulletPoint";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Rocket } from "lucide-react";
import { FC, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import AuthService from "@/services/auth.service";
import { Plan } from "@/types";
import { DISCOUNTED_PRICE } from "@/utils/pricingDetails";
import { useChangeCompanyPlan, useCheckPlanUsed } from "@/services/user.api";
import { showToast } from "@/components/Toast";
import { Skeleton } from "@/components/ui/skeleton";
import { CURRENCY_SYMBOL } from "@/constants";

type PlanUpdateModalProps = {
  open: boolean;
  isUpgraded: boolean;
  companyId: string
  onOpenChange: (open: boolean) => void;
};
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export const PlanUpdateModal: FC<PlanUpdateModalProps> = ({ onOpenChange, open, isUpgraded, companyId }) => {
  const [isYearly, setIsYearly] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [shownPlan, setShownPlan] = useState<Plan>()
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [plansError, setPlansError] = useState("");
  const { mutateAsync: changePlan, isPending } = useChangeCompanyPlan()
  const { data: planUsageData, isLoading: isPlanLoading } = useCheckPlanUsed(companyId);

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
      setPlans(plansData?.filter(item => item.plan_name === (isUpgraded ? 'Growth' : 'Starter')));

    } catch (error) {
      console.error("Error fetching plans:", error);
      setPlansError("Failed to load plans. Please try again.");
    } finally {
      setIsLoadingPlans(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);


  useEffect(() => {
    if (plans)
      setShownPlan(plans?.find(item => item.interval === (isYearly ? 'year' : 'month')))
  }, [isYearly, isLoadingPlans])

  const starterPlan = useMemo(() => {
    return plans?.find(p => p.plan_name === 'Starter' && p.interval === (isYearly ? 'year' : 'month')) || plans?.find(p => p.plan_name === 'Starter');
  }, [plans, isYearly]);

  const downgradeBlocked = useMemo(() => {
    if (isUpgraded) return false; // only enforce on downgrade
    if (!starterPlan || !planUsageData) return false; // wait until both present
    const limits = starterPlan.limits;
    const usage = planUsageData.usage;
    if (!limits || !usage) return false;
    const overTrackingNumbers = typeof usage.tracking_numbers_used === 'number' && typeof limits.tracking_numbers === 'number' && usage.tracking_numbers_used > limits.tracking_numbers;
    const overCallMinutes = typeof usage.call_minutes_used === 'number' && typeof limits.call_minutes === 'number' && usage.call_minutes_used > limits.call_minutes;
    const overUsers = typeof usage.users_active === 'number' && typeof limits.users === 'number' && usage.users_active > limits.users;
    const overIntegrations = limits.multiple_integrations ? false : (typeof usage.integrations_active === 'number' && usage.integrations_active > 1);
    return overTrackingNumbers || overCallMinutes || overUsers || overIntegrations;
  }, [isUpgraded, companyId, starterPlan, planUsageData]);
  const handleSubmit = () => {
    changePlan({ companyId, data: { plan_id: shownPlan?.plan_id, is_upgrade: isUpgraded } }, {
      onSuccess: () => {
        showToast({
          title: `Plan changed to ${isUpgraded ? 'Growth' : 'Starter'}`,
          description: 'The new plan will go live on 10.06.2025.',
          type: 'success'
        })
        onOpenChange(false)
      },
      onError: () => {
        showToast({
          title: `Plan unable to change to ${isUpgraded ? 'Growth' : 'Starter'}`,
          description: 'The new plan will go live on 10.06.2025.',
          type: 'error'
        })
      }
    })

  }

  const formatPrice = (cents: number) => {
    const divisor = isYearly ? 12 : 1;
    return `${CURRENCY_SYMBOL}${((cents / 100) / divisor).toFixed(0)}`;
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-xl p-8 rounded-2xl text-left max-h-[90vh] overflow-y-auto">
        <div>
          <DialogTitle className="text-2xl text-black">{isUpgraded ? 'Upgrade  to Growth' : 'Downgrade to Starter'}</DialogTitle>
          {(!isUpgraded && downgradeBlocked) || (isUpgraded === false && (isPlanLoading || isLoadingPlans)) ? null : (
            <div className="flex items-center gap-2">
              <label className="text-xs font-normal text-gray-700 whitespace-nowrap">
                Pay Monthly
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isYearly}
                  onChange={() => setIsYearly((prev) => !prev)}
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
          )}
        </div>

        <div className="border-t border-neutral-50 my-3" />

        {(!isUpgraded && (isPlanLoading || isLoadingPlans)) && (
          <div className="space-y-3">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {!isUpgraded && !isPlanLoading && !isLoadingPlans && downgradeBlocked && (
          <div className="bg-[#FFF0F1] border border-[#FBA1AA] text-[#7F1D1D] rounded-xl p-4 mb-3">
            <p className="text-sm font-semibold mb-2">Cannot downgrade to Starter</p>
            <p className="text-xs">Your current usage exceeds Starter plan limits. Please reduce usage to downgrade.</p>
            {starterPlan && planUsageData && (
              <div className="mt-3 grid grid-cols-1 gap-1 text-xs">
                {planUsageData.usage.tracking_numbers_used > starterPlan.limits.tracking_numbers && (
                  <div>Tracking numbers: {planUsageData.usage.tracking_numbers_used} / {starterPlan.limits.tracking_numbers}</div>
                )}
                {planUsageData.usage.call_minutes_used > starterPlan.limits.call_minutes && (
                  <div>Call minutes: {planUsageData.usage.call_minutes_used} / {starterPlan.limits.call_minutes}</div>
                )}
                {planUsageData.usage.users_active > starterPlan.limits.users && (
                  <div>Users: {planUsageData.usage.users_active} / {starterPlan.limits.users}</div>
                )}
                {!starterPlan.limits.multiple_integrations && planUsageData.usage.integrations_active > 1 && (
                  <div>Integrations: {planUsageData.usage.integrations_active} (max 1 allowed)</div>
                )}
              </div>
            )}
          </div>
        )}

        {isUpgraded && (!isPlanLoading && !isLoadingPlans) ? (
          <div className={`bg-neutral-25 p-1 rounded-lg border-2 cursor-pointer transition-all`}>
            <div className="flex flex-col bg-white rounded-[16px] p-3">
              <div className="flex items-center">
                <button
                  type="button"
                  className="bg-blue-400 text-white rounded-full px-3 py-1.5 flex items-center justify-start space-x-2"
                >
                  <img
                    src="/assets/on-boarding/growth-icon-step2.svg"
                    alt="Growth Icon"
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-semibold text-white">{shownPlan?.plan_name}</span>
                </button>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <h5 className="text-xl font-semibold text-black">
                  {isYearly
                    ? `${formatPrice(shownPlan?.amount_cents || 0)}/mo, ${shownPlan?.nickname?.toLowerCase()}`
                    : `${formatPrice(shownPlan?.amount_cents || 0)}/mo, ${shownPlan?.nickname?.toLowerCase()}`}
                </h5>
                <p className="text-neutral-500 text-base font-normal line-through ml-2">{formatPrice(shownPlan?.compare_at_cents || 0)}/mo</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4">
              <BulletPoint text={"25 tracking numbers"} />
              <BulletPoint text="2,500 call minutes" />
              <BulletPoint text="Advanced ROI reports" />
              <BulletPoint text="Multiple integrations" />
              <BulletPoint text="Automated revenue import" />
              <BulletPoint text="Priority support + AI insights" />
            </div>
          </div>

        ) : (!downgradeBlocked && (!isPlanLoading && !isLoadingPlans) && (
          <div className={`bg-[#F7F9FB] p-1 rounded-lg border-2 cursor-pointer transition-all`}>
            <div className="flex flex-col bg-white rounded-[16px] p-3">
              <div className="flex items-center">
                <button
                  type="button"
                  className="bg-[#ACDF18] text-white rounded-full px-3 py-1.5 flex items-center justify-start space-x-2"
                >
                  <Rocket
                    color="white"
                    size={18}
                  />
                  <span className="text-sm font-semibold text-white">{shownPlan?.plan_name}</span>
                </button>
              </div>
              <div className="flex mt-3 gap-2 items-center">
                <h5 className="text-xl font-semibold text-black">
                  {isYearly
                    ? `${formatPrice(shownPlan?.amount_cents || 0)}/mo, ${shownPlan?.nickname?.toLowerCase()}`
                    : `${formatPrice(shownPlan?.amount_cents || 0)}/mo, ${shownPlan?.nickname?.toLowerCase()}`}
                </h5>
                <p className="text-neutral-500 text-base font-normal line-through ml-2">{formatPrice(shownPlan?.compare_at_cents || 0)}/mo</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4">
              <BulletPoint text={"15 tracking numbers"} />
              <BulletPoint text="1,000 call minutes" />
              <BulletPoint text="ROI by campaign/keyword" />
              <BulletPoint text="1 integration" />
              <BulletPoint text="Google Ads optimization" />
              <BulletPoint text="Basic CRM, email support" />
            </div>
          </div>
        ))}

        {(!isUpgraded && downgradeBlocked) || (!isUpgraded && (isPlanLoading || isLoadingPlans)) ? null : (
          <span className="text-sm text-neutral-500">
            The new plan activates on {dayjs(new Date()).format("DD.MM.YYYY")}.
          </span>
        )}

        {(!isUpgraded && (isPlanLoading || isLoadingPlans || downgradeBlocked)) ? null : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="rounded-full"
              disabled={isPending}
              onClick={() => {
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleSubmit()}
              disabled={isPending}
              className="rounded-full"
            >
              Confirm
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
