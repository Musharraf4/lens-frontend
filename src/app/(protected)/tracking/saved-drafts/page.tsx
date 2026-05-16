"use client";

import React from "react";
import PageHeader from "@/components/PageHeader";
import DraftsTable from "@/components/tracking/saved-drafts/DraftsTable";
import CreateNumberModal from "@/components/tracking/CreateNumberModal";
import { useNumberContext } from "@/store/CreateNumberContext";

export default function SavedDraftsPage() {
  const { createNumberModalOpen } = useNumberContext();

  return (
    <>
      {createNumberModalOpen ? (
        <CreateNumberModal />
      ) : (
        <>
          <PageHeader
            title="Saved Drafts"
            description="Manage your drafts to finalize creation."
          />
          <div className="mt-8">
            <DraftsTable />
          </div>
        </>
      )}
    </>
  );
}
