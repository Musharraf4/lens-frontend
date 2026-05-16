"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { PiWarningCircle } from "react-icons/pi";
import { ConfirmationModal } from "../ui/ConfirmationModal";
import { Info } from "lucide-react";
import { useApp } from "@/store/appStore";
import { fetchUserCompanies, useGetAwaitingUsers, useInvitationResponse } from "@/services/user.api";
import { AwaitingInvitation } from "@/types";
import { getInviteStatus } from "@/lib/utils";
import { showToast } from "../Toast";
import EmptyAccountCenter from "./EmptyAccountCenter";
import { useCompaniesStore } from "@/store/Companies";

interface AwaitingInviteCardProps {
  data?: AwaitingInvitation;
  isLoading?: boolean;
}


export default function AwaitingInviteApproval() {
  const { data: awaitingUsers, isLoading: isAwaitingUsersLoading } = useGetAwaitingUsers();

  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 6;
  const { sidebarOpen } = useApp();

  const totalPages = Math.ceil((awaitingUsers?.length || 0) / cardsPerPage);

  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = isAwaitingUsersLoading
    ? Array(cardsPerPage).fill({})
    : awaitingUsers?.slice(indexOfFirstCard, indexOfLastCard) || [];

  if (!isAwaitingUsersLoading && (awaitingUsers?.length ?? 0) === 0) {
    return (
      <EmptyAccountCenter activeTab='Awaiting' isAwait />
    )
  }
  return (
    <div className="container mx-auto p-2">
      <div
        className={`grid grid-cols-1 ${sidebarOpen ? "md:grid-cols-1" : "md:grid-cols-2"
          } ${sidebarOpen ? "lg:grid-cols-2" : "lg:grid-cols-3"} xl:grid-cols-3 gap-2`}
      >
        {currentCards.map((card, index) => (
          <AwaitingInviteCard
            key={index}
            data={card}
            isLoading={isAwaitingUsersLoading}
          />
        ))}
      </div>

      {!isAwaitingUsersLoading && (awaitingUsers?.length ?? 0) > cardsPerPage && (
        <div className="flex justify-center items-center mt-6 gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
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
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

function AwaitingInviteCard({ data, isLoading = false }: AwaitingInviteCardProps) {
  const loadingGradient =
    "bg-gradient-to-r from-[rgba(112,120,137,0.06)] to-[rgba(112,120,137,0.16)] animate-pulse";
  const [showConfirmationModal, setShowConfirmationModal] = useState<string | null>(null);
  const { mutateAsync: handleResponse, isPending: isResponsePending } = useInvitationResponse();
  const { setCompanies } = useCompaniesStore();

  return (
    <div className=" bg-white dark:bg-[#101014] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
      {/* TOP SECTION ONLY */}
      <div className="rounded-2xl -m-2 p-4 bg-gradient-to-b from-[rgba(183,203,255,0.08)] to-[rgba(70,120,251,0.2)] space-y-3">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-full ${isLoading ? loadingGradient : ""}`}>
            {!isLoading && (
              <p className="bg-black text-center rounded-xl text-white text-lg sm:text-xl">
                {data?.company_name?.charAt(0).toUpperCase()}
              </p>
            )}
          </div>
          <div className="-m-2 flex items-center justify-between w-full">
            <h2
              className={`text-sm font-semibold line-clamp-1 ${isLoading
                ? "w-24 h-4 rounded-full " + loadingGradient
                : "text-gray-900 dark:text-white"
                }`}
            >
              {!isLoading && (data?.company_name)}
            </h2>
            <div
              className={`flex items-center text-[12px] font-medium rounded-full px-1.5 py-0.5 whitespace-nowrap ${isLoading ? "w-16 h-6 " + loadingGradient : "text-[#719801] bg-white"
                }`}
            >
              {!isLoading && (
                <>
                  <div
                    className={`flex items-center justify-center mr-1 bg-[#719801] rounded-full w-3.5 h-3.5`}
                  >
                    <PiWarningCircle className="text-white w-2.5 h-2.5" />
                  </div>
                  {getInviteStatus(data?.status)}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            className={`rounded-full ${isLoading ? "opacity-0" : ""}`}
            disabled={isResponsePending}
            onClick={() => handleResponse({ data: { invitation_id: data?.invitation_id, is_invitation_response: true } }, {
              onSuccess: async () => {
                const companies = await fetchUserCompanies();
                setCompanies(companies);
                showToast({
                  title: `Invitation from ${data?.company_name} is accepted`,
                  description: `You can now manage Flexy’s tracking, reporting, and integrations from your dashboard.`,
                  type: "success",
                });
              },
              onError: () => {
                showToast({
                  title: "Error",
                  description: "There was an error accepting the invitation. Please try again.",
                  type: "error",
                });
              }
            })}
          >
            {isLoading ? (
              <div className={`w-full h-8 rounded-full ${loadingGradient}`} />
            ) : (
              "Accept Invitation"
            )}
          </Button>
          <Button
            variant="destructiveOutline"
            className={` ${isLoading ? "opacity-0" : ""
              }`}
            onClick={() => setShowConfirmationModal(data?.company_name as string)}
            disabled={isResponsePending}
          >
            {isLoading ? (
              <div className={`w-full h-8 rounded-full ${loadingGradient}`} />
            ) : (
              "Decline Invitation"
            )}
          </Button>
        </div>
      </div>
      <ConfirmationModal
        icon={<Info className="w-12 h-12" />}
        title={`Are you sure you want to decline the invitation from ${data?.company_name}?`}
        subTitle="If you decline, you won’t be able to access their account unless they send a new invitation."
        open={Boolean(showConfirmationModal)}
        onOpenChange={(setShowConfirmationModal)}
        actionButtonText="Decline"
        handleAction={() => {
          handleResponse({ data: { invitation_id: data?.invitation_id, is_invitation_response: false } },
            {
              onSuccess: () => {
                setShowConfirmationModal(null);
                showToast({
                  title: `Invitation from ${data?.company_name} is declined`,
                  type: "success",
                });
              },
              onError: () => {
                setShowConfirmationModal(null);
                showToast({
                  title: "Error",
                  description: "There was an error declining the invitation. Please try again.",
                  type: "error",
                });
              }
            });
        }}
      />
    </div>
  );
}
