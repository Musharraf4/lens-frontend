"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/store/AuthContext";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import logo from "../../assets/LenzPixelFullIcon.svg"
import googleIcon from "../../assets/GoogleIcon.svg";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const getNextPath = () => {
    const raw = searchParams.get("next");
    if (!raw || raw === "/") return "/home";
    return raw.startsWith("/") ? raw : "/home";
  };
  const handleGoogleLogin = () => {
    const nextPath = encodeURIComponent(getNextPath());
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/google-login?next=${nextPath}`;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setEmailError("");
    setPasswordError("");
    setIsLoading(true)
    try {
      const user = await login({ email, password });

      // Check if the next path is verify-email with a token - this takes priority
      const nextPath = getNextPath();
      if (nextPath.startsWith("/verify-email") && nextPath.includes("token=")) {
        router.replace(nextPath);
      }
      // Onboarding takes priority for users without agency
      else if (user?.user?.master_agency_id === null) {
        router.replace("/onboarding");
      } else {
        router.replace(nextPath);
      }
    } catch (err: any) {
      setIsLoading(false)
      console.error("Login failed:", err);
      const errorMsg = err?.response?.data?.detail || "Invalid credentials";

      if (errorMsg.toLowerCase().includes("email")) {
        setEmailError(errorMsg);
      } else if (errorMsg.toLowerCase().includes("password")) {
        setPasswordError(errorMsg);
      } else {
        setFormError(errorMsg);
      }
    }
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
        <h2 className="text-lg font-semibold text-center text-gray-700 mb-4 sm:mb-6">
          Log in to your account
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-3 sm:space-y-4"
        >
          <div>
            {isLoading || loading ? (
              <div className="bg-gradient-to-r from-[#F7F9FB] to-[#E6E9EE] animate-pulse rounded-full h-4 w-24 mb-1" />
            ) : (
              <label className="block text-sm font-medium text-[#707889] mb-1">Email address</label>
            )}
            <div
              className={`${isLoading || loading ? "animate-pulse bg-gray-100 rounded-full h-[42px]" : ""}`}
            >
              {!isLoading && !loading && (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full p-2 sm:p-2.5 rounded-full text-sm border ${emailError || formError ? "border-[#FBA1AA] bg-[#FFF0F1]" : "border-[#CDD2DA]"
                    }`}
                  placeholder="Enter email address"
                  required
                />
              )}
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              {isLoading || loading ? (
                <div className="bg-gradient-to-r from-[#F7F9FB] to-[#E6E9EE] animate-pulse rounded-full h-4 w-20 mb-1" />
              ) : (
                <label className="block text-sm font-medium text-[#707889] mb-1">Password</label>
              )}
              <Link
                href="/forgot-password"
                className="text-xs text-[#707889] font-medium hover:text-gray-600"
              >
                Forgot password?
              </Link>
            </div>
            <div
              className={`relative w-full ${isLoading && !loading ? "animate-pulse bg-gray-100 rounded-full h-[42px]" : ""
                }`}
            >
              {!isLoading && !loading && (
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full p-2 sm:p-2.5 pl-3 pr-10 border rounded-full text-sm ${passwordError || formError
                    ? "border-[#FBA1AA] bg-[#FFF0F1]"
                    : "border-[#CDD2DA]"
                    }`}
                  placeholder="Enter password"
                  required
                />
              )}
              {!isLoading && !loading && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              )}
            </div>
          </div>
          {emailError && <p className="text-xs text-center text-[#F3293E]">{emailError}</p>}
          <button
            type="submit"
            disabled={isLoading || loading}
            className={`w-full bg-black text-white p-2 sm:p-2.5 rounded-full hover:bg-gray-800 mt-1 text-sm sm:text-base cursor-pointer`}
          >
            Login
          </button>
          {formError && (
            <div className="mt-1 p-1">
              <p className="text-xs text-[#F3293E]">{formError}</p>
            </div>
          )}
          <div className="text-xs sm:text-sm text-[#707889] flex justify-center items-center gap-1">
            <span>Don’t have an account?</span>
            <Link
              href="/register"
              className="text-[#030C23]"
            >
              Sign up
            </Link>
          </div>
          <div className="flex items-center my-2 sm:my-3">
            <hr className="flex-1 border-gray-300" />
            <span className="mx-2 text-sm text-gray-500">Or</span>
            <hr className="flex-1 border-gray-300" />
          </div>
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-white border border-gray-300 p-1 sm:p-1.5 rounded-2xl sm:rounded-3xl flex items-center justify-center gap-2 hover:bg-gray-50 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <img
              src={googleIcon.src}
              alt="Google"
              className="w-4 sm:w-5 h-4 sm:h-5"
            />
            Login with Google
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FB] px-4 py-6 sm:p-4">
        <div className="bg-white rounded-xl shadow-md w-full max-w-md px-4 py-6 sm:px-6 sm:py-8">
          <div className="flex justify-center mb-3 mt-2">
            <img
              src={logo.src}
              className="w-[60px] h-[17px] sm:w-[75px] sm:h-[22px] md:w-[90px] md:h-[26px]"
              alt="Lenz Logo"
            />
          </div>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded-full"></div>
              <div className="h-10 bg-gray-200 rounded-full"></div>
              <div className="h-10 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
