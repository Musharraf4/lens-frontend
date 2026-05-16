import React from "react";

function EmptyAccountCenter({ activeTab, isAwait }: { activeTab: string, isAwait?: boolean }) {
    return <div className="flex flex-col justify-between items-center">
        <img src='/EmptyAccount.svg' alt="No Data" className="h-[250px]" />
        <div className="relative z-10 flex flex-col items-center">
            <p className="font-semibold capitalize text-lg text-gray-900 mb-1">
                No {activeTab} {!isAwait ? "Accounts" : "Invites"} Yet
            </p>
            <p className="text-sm text-gray-500 text-center">
                Start setting up new client accounts to manage their data, <br />
                campaigns, and integrations in one place.
            </p>
        </div>
    </div>;
}

export default EmptyAccountCenter;
