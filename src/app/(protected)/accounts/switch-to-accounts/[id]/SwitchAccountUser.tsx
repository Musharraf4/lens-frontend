"use client";

import React, { use, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CopyToClipboard } from "@/components/ui/CopyToClipboard";
import Link from "next/link";
import { IoArrowBack, IoReturnUpBack } from "react-icons/io5";
import { PlanAndPayment } from "./PlanAndPayment";
import { UsersTable } from "./UsersTable";
import { useGetSingleCompanyDetail } from "@/services/home.api";
import { formatString } from "@/lib/utils";
import { useSelectedCompanyStore } from "@/store/SelectedCompany";
import { useCompaniesStore } from "@/store/Companies";
import { useAuth } from "@/store/AuthContext";
import { CompanyType, CompanyUser } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlanUsage } from "@/store/PlanUsageContext";

function SwitchAccountUser({ id }: { id: string }) {
    const router = useRouter();
    const { data: planUsageData, isLoading: isPlanLoading } = usePlanUsage();

    const searchParams = useSearchParams();
    const { data: userData, isLoading: userLoading } =
        useGetSingleCompanyDetail(id);
    const { data: companyDetails } = userData || {};
    const { setSelectedCompany } = useSelectedCompanyStore();
    const { companies } = useCompaniesStore();
    const { user, setChangeCompanyLoading } = useAuth();
    const masterCompany = companies?.find(
        (item) => item.company?.id === user?.master_agency_id
    );
    const openAccount = searchParams.get("openAccount");
    useEffect(() => {
        setChangeCompanyLoading(false);
    }, []);
    if (userLoading || isPlanLoading) {
        return (
            <div className="gap-2">
                {[0, 1, 2]?.map((item) => (
                    <Skeleton key={item} className="w-full mb-3 h-48" />
                ))}
            </div>
        );
    }
    return (
        <div className="space-y-4">
            <button
                className="flex items-center gap-3"
                onClick={() => {
                    !openAccount && setSelectedCompany(masterCompany as CompanyType);
                    router.back();
                }}
            >
                <IoArrowBack /> Go Back
            </button>
            <div className="bg-white p-3 sm:p-6 rounded-3xl space-y-4">
                <div className="space-y-1">
                    <div className="flex justify-between sm:flex-row flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <div className={`w-10 h-10 rounded-full`}>
                                <p className="bg-black h-10 w-10 pt-[6px] text-center rounded-4xl text-white text-lg sm:text-xl">
                                    {companyDetails?.name?.charAt(0).toUpperCase() || "U"}
                                </p>
                            </div>
                            <h2 className="text-black text-3xl font-semibold">
                                {companyDetails?.name}
                            </h2>
                        </div>
                        {user?.master_agency_id !== companyDetails?.id && !openAccount ? (
                            <Link href={`/accounts`}>
                                <Button
                                    variant="dark"
                                    size="sm"
                                    className={"px-2"}
                                    onClick={() => {
                                        setSelectedCompany(masterCompany as CompanyType);
                                    }}
                                >
                                    <IoReturnUpBack />
                                    Switch back to {"Master Agency"}
                                </Button>
                            </Link>
                        ) : null}
                    </div>
                    <div className="flex items-center gap-1">
                        <p className="text-neutral-500">{companyDetails?.website}</p>
                        <CopyToClipboard text={companyDetails?.website} />
                    </div>
                </div>

                {/* summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    <div className="lg:border-r">
                        <h3 className="text-2xl text-black font-semibold">
                            {formatString(companyDetails?.industry ?? "")}
                        </h3>
                        <p className="text-neutral-500">Industry</p>
                    </div>
                    <div className="lg:border-r">
                        <h3 className="text-2xl text-black font-semibold">
                            {`${planUsageData?.usage?.users_active ?? 3}/${planUsageData?.limits?.users}`}
                        </h3>
                        <p className="text-neutral-500">Users</p>
                    </div>
                    <div className="lg:border-r">
                        <h3 className="text-2xl text-black font-semibold">
                            {companyDetails?.company_size?.replace(/_/g, "-")}
                        </h3>
                        <p className="text-neutral-500">Company Size</p>
                    </div>
                    <div className="lg:border-r">
                        <h3 className="text-2xl text-black font-semibold">{planUsageData?.usage?.tracking_numbers_used}</h3>
                        <p className="text-neutral-500">Tracking Numbers</p>
                    </div>
                    <div>
                        <h3 className="text-2xl text-black font-semibold">{planUsageData?.usage?.call_minutes_used}</h3>
                        <p className="text-neutral-500">Call minutes</p>
                    </div>
                </div>
            </div>

            <UsersTable
                users={companyDetails?.users as CompanyUser[]}
                companyId={id}
            />
            <PlanAndPayment companyId={id} paymentDetails={companyDetails?.billing} />
        </div>
    );
}

export default SwitchAccountUser;
