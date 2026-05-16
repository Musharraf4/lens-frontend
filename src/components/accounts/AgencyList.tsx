"use client";

import { useApp } from "@/store/appStore";
import { Dispatch, SetStateAction, use, useEffect, useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { Button } from "../ui/button";
import { AgencyCard } from "./AgencyCard";
import { EditClientForm } from "./edit";
import EmptyAccountCenter from "./EmptyAccountCenter";
import { CompanyDetail, CompanyType } from "@/types";
import { useGetCompaniesChargeDate, useGetCompaniesDetails } from "@/services/user.api";
import { useAuth } from "@/store/AuthContext";
import { getPlanStatus } from "@/lib/utils";
import PausedAccountsCard from "./PausedAccountsCard";
import dayjs from "dayjs";


export default function AgencyCardList({
  activeTab = "active",
  isLoading = false,
  handleNavigateLoading,
  setActiveTab
}: {
  activeTab?: string;
  isLoading?: boolean;
  handleNavigateLoading: (loading: boolean) => void;
  setActiveTab: Dispatch<SetStateAction<string>>
}) {
  const { user } = useAuth();
  const { data: companies, isLoading: loadingCompanies } =
    useGetCompaniesDetails();
  const { data: companiesChargeDate, isLoading: loadingChargeDate } =
    useGetCompaniesChargeDate();
  const trialCompanies =
    companies?.filter(
      (item) => getPlanStatus(item?.billing?.status) === "Trial"
    ) ?? [];
  const activeCompanies =
    companies?.filter(
      (item) => getPlanStatus(item?.billing?.status) === "Active"
    ) ?? [];
  const pausedCompanies =
    companies?.filter(
      (item) => getPlanStatus(item?.billing?.status) === "Paused"
    ) ?? [];

  const pastDueCompanies =
    companies?.filter(
      (item) =>
        getPlanStatus(item?.billing?.status) !== "Active" &&
        getPlanStatus(item?.billing?.status) !== "Paused" &&
        getPlanStatus(item?.billing?.status) !== "Trial"
    ) ?? [];

  const [currentPage, setCurrentPage] = useState(1);
  const [showEditForm, setShowEditForm] = useState<CompanyType | null>(null);

  const cardsPerPage = 6;
  const { sidebarOpen } = useApp();

  const cards = (
    activeTab === "trial"
      ? trialCompanies
      : activeTab === "past"
        ? pastDueCompanies
        : activeTab === "paused"
          ? pausedCompanies
          : activeCompanies
  ).sort((a, b) => {
    if (a.id === user?.master_agency_id) return -1;
    if (b.id === user?.master_agency_id) return 1;
    return 0;
  });

  const totalPages = Math.ceil(cards.length / cardsPerPage);

  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = isLoading
    ? Array(cardsPerPage).fill({})
    : cards.slice(indexOfFirstCard, indexOfLastCard);

  useEffect(() => {
    if (showEditForm) {
      // First scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Then lock scroll after a short delay (so scroll finishes first)
      const timeout = setTimeout(() => {
        document.body.style.overflow = "hidden";
      }, 300);

      return () => {
        clearTimeout(timeout);
        document.body.style.overflow = "auto";
      };
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showEditForm, activeTab]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  useEffect(() => {
    if (activeCompanies.length === 0 && trialCompanies.length > 0 && activeTab === "active") {
      setActiveTab("trial")
    }
  }, [loadingCompanies, companies]);

  if (cards.length === 0 && !loadingCompanies) {
    return <EmptyAccountCenter activeTab={activeTab} />;
  }
  return (
    <div className="container mx-auto p-2">
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 ${sidebarOpen ? "md:grid-cols-1" : "md:grid-cols-2"
          }  ${sidebarOpen ? "lg:grid-cols-2" : "lg:grid-cols-3"
          } xl:grid-cols-3 gap-4`}
      >
        {activeTab === "paused" &&
          pausedCompanies.length > 0 &&
          !loadingCompanies && (
            <>
              {pausedCompanies?.map((company, index) => (
                <PausedAccountsCard key={index} company={company} />
              ))}
            </>
          )}
        {activeTab !== "paused" &&
          cards?.length > 0 &&
          currentCards.map((card, index) => {
            const chargeDate = companiesChargeDate?.find(c => c.company_id === card.id)?.charge_at;
            return (
              <AgencyCard
                key={index}
                index={index}
                data={{ ...card, chargeDate: chargeDate ? dayjs(chargeDate).format("MMMM D, YYYY") : '' }}
                isLoading={loadingCompanies}
                activeTab={activeTab}
                setShowEditForm={setShowEditForm}
                handleNavigateLoading={handleNavigateLoading}
                loadingChargeDate={loadingChargeDate}
              />
            )
          })}
        {loadingCompanies && (
          <>
            {[1, 2, 3].map((item, index) => (
              <AgencyCard
                index={index}
                key={item} // Add a unique key for each element
                isLoading={loadingCompanies}
                activeTab={activeTab}
                setShowEditForm={setShowEditForm}
              />
            ))}
          </>
        )}
      </div>

      {!loadingCompanies && companies && cards?.length > cardsPerPage && (
        <div className="flex justify-center items-center mt-6 gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <FaArrowLeft className="w-3 h-3" />
          </Button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i}
                variant={currentPage === i + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            <FaArrowRight className="w-3 h-3" />
          </Button>
        </div>
      )}
      {showEditForm && (
        <EditClientForm
          setShowEditForm={setShowEditForm}
          userDetails={showEditForm as unknown as CompanyDetail}
        />
      )}
    </div>
  );
}
