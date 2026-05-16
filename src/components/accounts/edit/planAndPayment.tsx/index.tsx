import { Button } from "@/components/ui/button";
import { useApp } from "@/store/appStore";
import { CircleDollarSign } from "lucide-react";
import { PlanUpdateModal } from "./PlanUpdateModal";
import { useState } from "react";
import { AddEditBillingMethodModal } from "../../AddEditBillingMethod";
import { useSelectedCompanyStore } from "@/store/SelectedCompany";
import { Role } from "@/enums";
import { SubscriptionData } from "@/types";
import { CURRENCY_SYMBOL } from "@/constants";
import { getCardLogo, getPlanStatus } from "@/lib/utils";
import { fetchUserCompanies, useResumeAccount } from "@/services/user.api";
import { showToast } from "@/components/Toast";
import { useCompaniesStore } from "@/store/Companies";
import TooltipWrapper from "@/components/ui/TooltipWrapper";

export const ClientPlanAndPayment = ({
  companyId,
  paymentDetails,
}: {
  companyId: string;
  paymentDetails?: SubscriptionData;
}) => {
  const { sidebarOpen } = useApp();
  const { selectedCompany } = useSelectedCompanyStore();
  const [openPlanUpdateModal, setOpenPlanUpdateModal] = useState(false);
  const [openBillingMethodModal, setOpenBillingMethodModal] = useState(false);
  const last4Digits = paymentDetails?.stripe?.default_payment_method?.last4;
  const planName = paymentDetails?.plan?.name;
  const billingCycle = paymentDetails?.plan?.interval;
  const amountPerCycle = (paymentDetails?.plan?.amount_cents || 0) / 100;
  const finalAmount =
    billingCycle === "year" ? amountPerCycle / 12 : amountPerCycle;
  const billingStatus = getPlanStatus(paymentDetails?.status);
  const isPastDue = billingStatus !== "Active" && billingStatus !== "Trial";
  // && billingStatus !== "Paused";
  const { mutateAsync: resumeAccountMutate, isPending: isResuming } =
    useResumeAccount();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { companies, setCompanies } = useCompaniesStore();
  const isNotAdmin = ((selectedCompany?.role !== Role.Admin) && (selectedCompany?.role !== Role.Owner));
  const disabledActions = isNotAdmin || isResuming;
  const tooltipMessage = "You have no access for this action.";
  const activateSubscription = async (showPaymentModal: boolean) => {
    if (!showPaymentModal) {
      resumeAccountMutate(
        { companyId: companyId || "" },
        {
          onSuccess: async () => {
            const companies = await fetchUserCompanies();
            setCompanies(companies);

            showToast({
              type: "success",
              title: `Account has been reactivated`,
              description: "The account is now active.",
            });
          },
          onError: () => {
            showToast({
              type: "error",
              title: `Account could not be reactivated`,
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
    <div
      className={`grid grid-cols-1 ${sidebarOpen ? "md:grid-cols-1" : "md:grid-cols-2"
        } lg:grid-cols-2 gap-4`}
    >
      <div
        className={`border border-neutral-50 bg-neutral-25 rounded-3xl p-4 space-y-3 ${isPastDue ? "border-2 border-red-300" : ""
          }`}
      >
        <div className="flex justify-between gap-2">
          {planName ? (
            <div className="flex items-center flex-row gap-1">
              <img
                src={planName === "Starter" ? "/Rocket.svg" : "/Growth.svg"}
              />
              <p className="text-black fill-available  font-semibold">{`${paymentDetails?.plan?.name} Plan`}</p>
            </div>
          ) : (
            <p>No Plan Selected</p>
          )}
          {!paymentDetails?.plan?.is_custom && (
            <TooltipWrapper message={tooltipMessage} show={Boolean(isNotAdmin)}>
              <Button
                variant="dark"
                className="rounded-full"
                size="sm"
                onClick={() =>
                  isPastDue
                    ? activateSubscription(last4Digits ? false : true)
                    : setOpenPlanUpdateModal(true)
                }
                disabled={disabledActions}
              >
                {isPastDue
                  ? "Reactivate"
                  : isResuming
                    ? "Reactivating..."
                    : !planName
                      ? "Select Plan"
                      : planName === "Starter"
                        ? "Upgrade"
                        : "Downgrade"}
              </Button>
            </TooltipWrapper>

          )}
          {openPlanUpdateModal && (
            <PlanUpdateModal
              onOpenChange={setOpenPlanUpdateModal}
              open={openPlanUpdateModal}
              isUpgraded={Boolean(planName === "Starter")}
              companyId={companyId}
            />
          )}
        </div>
        {billingCycle ? (
          <div>
            <span className="text-black font-medium">
              Pay {billingCycle}ly - {CURRENCY_SYMBOL}
              {finalAmount}/ mo, {paymentDetails?.plan?.nickname?.toLowerCase() || 'early offer'}
            </span>
          </div>
        ) : (
          <p>No Payment Details Found</p>
        )}
      </div>
      <div className="border border-neutral-50 bg-neutral-25 rounded-3xl p-4 space-y-3">
        <div className="flex justify-between gap-2">
          <div className="flex gap-1">
            <CircleDollarSign />
            <p className="text-black font-semibold">Billing Method</p>
          </div>
          <TooltipWrapper message={tooltipMessage} show={Boolean(isNotAdmin)}>
            <Button
              variant="dark"
              className="rounded-full"
              size="sm"
              onClick={() => setOpenBillingMethodModal(true)}
              disabled={disabledActions}
            >
              {last4Digits ? "Edit" : "Add"}
            </Button>
          </TooltipWrapper>
        </div>
        {last4Digits && (
          <div className="flex items-center gap-2">
            <img
              src={getCardLogo(
                paymentDetails?.stripe?.default_payment_method?.brand ?? ""
              )}
              alt="Card Icon"
              className="w-7 rounded bg-white p-0.5 flex-shrink-0"
            />
            <span className=" text-black truncate">
              •••• •••• •••• {last4Digits}
            </span>
          </div>
        )}
      </div>
      {openBillingMethodModal && (
        <AddEditBillingMethodModal
          open={openBillingMethodModal}
          onOpenChange={setOpenBillingMethodModal}
          companyId={companyId}
          edit={last4Digits ? true : false}
        />
      )}
      {showPaymentModal && (
        <AddEditBillingMethodModal
          open={showPaymentModal}
          onOpenChange={setShowPaymentModal}
          companyId={companyId || ""}
          edit={last4Digits ? true : false}
          handleSubscription={() => activateSubscription(false)}
        />
      )}
    </div>
  );
};
