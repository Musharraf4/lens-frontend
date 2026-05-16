"use client";

import { showToast } from "@/components/Toast";
import { usePasswordResetRequest } from "@/services/auth.api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import logo from "../../assets/LenzPixelFullIcon.svg";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");

    const resetRequestMutation = usePasswordResetRequest({
        onSuccess: () => {
            showToast({
                title: "Email Sent",
                description: "Please check your inbox for reset instructions.",
                type: "success",
            });
            router.push("/login");
        },
        onError: (err: any) => {
            console.error("Reset request error:", err?.response?.data);

            let message = "Something went wrong";
            const detail = err?.response?.data?.detail || err?.response?.data;

            if (Array.isArray(detail)) {
                message = detail[0]?.msg || message;
            } else if (typeof detail === "string") {
                message = detail;
            }

            showToast({
                title: "Reset Failed",
                description: message,
                type: "error",
            });
        },
    });


    const handleSendInstructions = () => {
        if (!email.trim()) {
            setEmailError("Email address is required");
            return;
        }
        setEmailError("");
        resetRequestMutation.mutate({ email });
    };


    const handleCancel = () => {
        router.push("/login");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F7F9FB] px-4 py-6 sm:p-4">
            <div className="bg-white rounded-xl shadow-md w-full max-w-md px-4 py-6 sm:px-6 sm:py-8">
                <div className="flex justify-center mb-3 mt-2">
                    <img
                        src={logo.src}
                        className="w-[60px] h-[17px] sm:w-[75px] sm:h-[22px] md:w-[90px] md:h-[26px]"
                        alt="Lenz Logo"
                    />
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-center text-gray-700 mb-4">
                    Forgot Password
                </h2>
                <p className="text-sm sm:text-base text-center text-[#707889] font-normal mb-4 sm:mb-6">
                    Enter the email address you registered with and we'll send you instructions.
                </p>

                <form className="space-y-4 sm:space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-[#707889] mb-1 ml-1">
                            Email address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full p-2 sm:p-3 rounded-full text-sm border ${emailError
                                ? "border-[#FBA1AA] bg-[#FFF0F1]"
                                : "border-[#CDD2DA]"
                                }`}
                            placeholder="Enter email address"
                            required
                        />
                        {emailError && (
                            <p className="text-xs text-[#F3293E] mt-1 ml-1">{emailError}</p>
                        )}
                    </div>

                    <div className="space-y-3">
                        <button
                            type="button"
                            disabled={resetRequestMutation.isPending}
                            className="w-full bg-black text-sm sm:text-base font-medium text-white p-2 sm:p-2.5 rounded-full hover:bg-gray-800 h-10 sm:h-11 cursor-pointer"
                            onClick={handleSendInstructions}
                        >
                            {resetRequestMutation.isPending ? "Sending..." : "Send instructions"}
                        </button>
                        <button
                            type="button"
                            className="w-full bg-white text-[#030C23] text-sm sm:text-base font-medium border border-[#B5BAC4] p-2 sm:p-2.5 rounded-full h-10 sm:h-11 cursor-pointer hover:bg-gray-50"
                            onClick={handleCancel}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}