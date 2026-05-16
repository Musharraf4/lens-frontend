"use client";

import { Button } from "@/components/ui/button";
import api from "@/services/api.service";
import { useAuth } from "@/store/AuthContext";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import logo from "../../../assets/LenzPixelFullIcon.svg";
import { showToast } from "@/components/Toast";

export default function VerifyEmail() {
  const router = useRouter();
  const { logout } = useAuth();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [isVerifying, setIsVerifying] = useState(!!token);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const hasVerified = useRef(false);

  // 🔹 If user lands with token, verify it immediately
  useEffect(() => {
    if (hasVerified.current || !token) return;

    (async () => {
      try {
        hasVerified.current = true;
        setIsVerifying(true);
        await api.post("/v1/auth/register/confirm", { token });
        logout();
        showToast({
          title: "Email verified Successfully",
          description: "Please try logging in",
          type: "success",
        });
        router.push("/login");
      } catch (error: any) {
        console.error("❌ Error verifying token:", error);
        setVerifyError("Invalid or expired verification link");
        setIsVerifying(false);
      }
    })();
  }, [token]);

  const handleResendEmail = async () => {
    if (!email) {
      setResendError("Email address is missing");
      return;
    }

    setIsResending(true);
    setResendError("");
    setResendSuccess(false);

    try {
      await api.post("/v1/auth/register/resend", { email });
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (error: any) {
      console.error("Error resending verification email:", error);
      setResendError(error.response?.data?.detail || "Failed to resend verification email");
    } finally {
      setIsResending(false);
    }
  };

  // 🔹 Case 1: user comes from email link with token
  if (token) {
    return (
      <div className="min-h-screen bg-neutral-25 p-4 flex flex-col">
        <div className="pr-8 pt-3 flex justify-end">
          <Button
            onClick={logout}
            size={"default"}
          >
            Logout
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-md w-full max-w-md px-6 py-10 text-center">
            <div className="flex justify-center mb-6">
              <img
                src={logo.src}
                className="w-[90px] h-[26px]"
                alt="Lenz Logo"
              />
            </div>

            {isVerifying ? (
              <div className="flex flex-col items-center">
                <Loader2 className="h-6 w-6 animate-spin text-black mb-3" />
                <p className="text-gray-700">Verifying your email...</p>
              </div>
            ) : verifyError ? (
              <p className="text-red-600">{verifyError}</p>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  // 🔹 Case 2: user comes right after signup (waiting + resend)
  return (
    <div className="min-h-screen bg-neutral-25 p-4 flex flex-col">
      {/* Top Bar with Logout */}
      <div className="pr-8 pt-3 flex justify-end">
        <Button
          onClick={logout}
          size={"default"}
        >
          Logout
        </Button>
      </div>

      {/* Centered Card */}
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md w-full max-w-md px-6 py-10 text-center">
          <div className="flex justify-center mb-6">
            <img
              src={logo.src}
              className="w-[90px] h-[26px]"
              alt="Lenz Logo"
            />
          </div>

          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3">
            Verify Your Email
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            We sent a verification link to{" "}
            <span className="font-medium">{email || "your email"}</span>. <br />
            Please check your inbox.
          </p>

          <button
            onClick={handleResendEmail}
            disabled={isResending}
            className={`w-full max-w-xs py-2 px-4 rounded-lg font-medium transition-colors ${
              isResending
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            {isResending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </span>
            ) : (
              "Resend Verification Email"
            )}
          </button>

          {resendSuccess && (
            <p className="mt-3 text-sm text-green-600">Verification email resent successfully.</p>
          )}
          {resendError && <p className="mt-3 text-sm text-red-600">{resendError}</p>}
        </div>
      </div>
    </div>
  );
}
