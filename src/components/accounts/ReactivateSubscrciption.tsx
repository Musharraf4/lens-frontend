import React from "react";
import { Button } from "../ui/button";
import { useSelectedCompanyStore } from "@/store/SelectedCompany";
import { useGetSingleCompanyDetail } from "@/services/home.api";
import { fetchUserCompanies, useResumeAccount } from "@/services/user.api";
import { showToast } from "../Toast";
import { Skeleton } from "../ui/skeleton";
import { AddEditBillingMethodModal } from "./AddEditBillingMethod";
import { useCompaniesStore } from "@/store/Companies";

function ReactivateSubscrciption() {
    const [showPaymentModal, setShowPaymentModal] = React.useState(false);
    const { selectedCompany } = useSelectedCompanyStore();
    const { data: userData, isLoading: userLoading } = useGetSingleCompanyDetail(
        selectedCompany?.company?.id || ""
    );
    const { setCompanies, companies } = useCompaniesStore();
    const { setSelectedCompany } = useSelectedCompanyStore();
    const { data: companyDetails } = userData || {};
    const last4Digits =
        companyDetails?.billing?.stripe?.default_payment_method?.last4;
    const { mutateAsync: resumeAccountMutate, isPending: isResuming } =
        useResumeAccount();

    const activateSubscription = async (showPaymentModal: boolean) => {
        if (!showPaymentModal) {
            resumeAccountMutate(
                { companyId: selectedCompany?.company?.id || "" },
                {
                    onSuccess: async () => {
                        const companies = await fetchUserCompanies();
                        setCompanies(companies);
                        setSelectedCompany(companies[0] ?? null);

                        showToast({
                            type: "success",
                            title: `${selectedCompany?.company?.name || "Law Firm"
                                }'s account has been reactivated`,
                            description: "The account is now active.",
                        });
                    },
                    onError: () => {
                        showToast({
                            type: "error",
                            title: `${selectedCompany?.company?.name || "Law Firm"
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
        <div className="p-4 md:p-8">
            <div className="min-h-[calc(100vh-96px)] flex items-center justify-center">
                {userLoading ? (
                    <Skeleton className="h-12 w-48" />
                ) : (
                    <div className="w-full max-w-lg bg-white border border-neutral-200 rounded-2xl shadow p-6 text-center">
                        <h2 className="text-xl font-semibold mb-2">Account is inactive</h2>
                        <p className="text-neutral-600 mb-6">
                            Access denied. Please activate your subscription to continue.
                        </p>
                        <Button
                            onClick={() => activateSubscription(last4Digits ? false : true)}
                            disabled={isResuming}
                            className="bg-black hover:bg-green-700 text-white"
                        >
                            {isResuming ? "Activating..." : "Activate subscription"}
                        </Button>
                    </div>
                )}
            </div>
            {showPaymentModal && (
                <>
                    <AddEditBillingMethodModal
                        open={showPaymentModal}
                        onOpenChange={setShowPaymentModal}
                        companyId={selectedCompany?.company?.id || ""}
                        edit={last4Digits ? true : false}
                        handleSubscription={() => activateSubscription(false)}
                    />
                </>
            )}
        </div>
    );
}

export default ReactivateSubscrciption;
