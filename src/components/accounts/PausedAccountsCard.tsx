import { CompanyDetail } from "@/types";
import React from "react";
import { IoIosAlert } from "react-icons/io";

function PausedAccountsCard({ company }: { company: CompanyDetail }) {
    return (
        <div className="max-w-md p-4 rounded-2xl  bg-white">
            <div className="max-w-md p-4 bg-gradient-to-b from-[rgba(183,203,255,0.08)] to-[rgba(70,120,251,0.2)] rounded-2xl shadow-md ">
                {/* Left Section: Logo + Text */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        {/* Logo Circle */}
                        <div className="bg-black text-white font-bold rounded-full w-10 h-10 flex items-center justify-center text-lg">
                            {company.name.charAt(0)}
                        </div>

                        {/* Firm Name */}
                        <div className="text-sm font-medium text-gray-800">
                            {company.name}
                        </div>
                    </div>
                    {/* Status Badge */}
                    <div className="flex items-center space-x-1 text-xs text-black bg-white px-2 py-1 rounded-full">
                        <IoIosAlert className="text-black" />
                        <span>Access Paused</span>
                    </div>
                </div>

                {/* Right Section: Access Info + Button */}
                <div className="flex flex-col items-start space-y-2 mt-4">
                    {/* Request Access Button */}
                    <button className="bg-black text-white text-sm px-4 py-1.5 rounded-full hover:bg-gray-800 transition">
                        Request Access
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PausedAccountsCard;
