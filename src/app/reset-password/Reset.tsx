"use client";

import { showToast } from "@/components/Toast";
import { usePasswordResetConfirm, usePasswordResetVerify } from "@/services/auth.api";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import logo from "../../assets/LenzPixelFullIcon.svg";

export default function ResetPassword({ token }: { token?: string }) {
  const router = useRouter();
  const [strength, setStrength] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [repeatPasswordError, setRepeatPasswordError] = useState("");
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [error, setError] = useState("");
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  const verifyMutation = usePasswordResetVerify();
  const confirmMutation = usePasswordResetConfirm({
    onSuccess: () => {
      showToast({
        title: "Password Reset Successful",
        description: "Your password has been updated. Please log in.",
        type: "success",
      });
      router.push("/login");
    },
    onError: (err: any) => {
      console.error("Password reset confirm error:", err?.response?.data || err);
      showToast({
        title: "Reset Failed",
        description:
          err?.response?.data?.detail || err?.response?.data?.message || "Something went wrong",
        type: "error",
      });
    },
  });

  // Verify token on mount
  useEffect(() => {
    if (token) {
      verifyMutation.mutate(
        { token },
        {
          onSettled: () => {
            setIsVerifying(false);
          },
        }
      );
    } else {
      setIsVerifying(false);
    }
  }, [token]);

  // Password strength calculation
  useEffect(() => {
    const passwordLength = password.length;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (passwordLength > 0 && passwordLength < 8) {
      setPasswordError("Your new password must be at least 8 characters long.");
      setStrength("Too Weak");
    } else if (passwordLength >= 8 && !(hasUpperCase && hasLowerCase && hasNumber)) {
      setPasswordError(
        "Password must contain at least one uppercase letter, one lowercase letter, and one number."
      );
      setStrength("Weak");
    } else if (
      passwordLength >= 8 &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumber &&
      !hasSpecialChar
    ) {
      setPasswordError("");
      setStrength("Moderate");
    } else if (passwordLength >= 8 && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar) {
      setPasswordError("");
      setStrength("Strong");
    } else {
      setPasswordError("");
      setStrength("");
    }
  }, [password]);

  const handleReset = () => {
    // Clear previous errors
    setError("");
    setPasswordError("");
    setRepeatPasswordError("");

    if (!password || !repeatPassword) {
      setError("Both fields are required");
      return;
    }

    if (password !== repeatPassword) {
      setRepeatPasswordError("Passwords do not match!");
      return;
    }

    // Check if password meets strength requirements
    if (strength !== "Strong") {
      setPasswordError("Please try creating strong password");
      return;
    }

    setError("");
    token &&
      confirmMutation.mutate({
        token,
        new_password: password,
      });
  };

  // Show loading state while verifying token
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FB]">
        <div className="text-center">
          <div className="inline-flex items-center">
            <div className="w-5 h-5 mr-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Verifying reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FB]">
        <div className="text-center">
          <p className="text-red-500">Invalid reset link</p>
        </div>
      </div>
    );
  }

  if (verifyMutation.isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FB]">
        <div className="text-center">
          <p className="text-red-500">Invalid or expired link</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9FB] px-4 py-6 sm:p-4">
      <div className="bg-white rounded-xl shadow-md w-full max-w-md px-5 py-6 sm:px-6 sm:py-8">
        <div className="flex justify-center mb-3 mt-2">
          <img
            src={logo.src}
            className="w-[60px] h-[17px] sm:w-[75px] sm:h-[22px] md:w-[90px] md:h-[26px]"
            alt="Lenz Logo"
          />
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold text-center text-gray-700 mb-4">
          Reset Password
        </h2>
        <p className="text-xs sm:text-sm text-center text-gray-500 mb-4">
          Password must have 8 characters, a mix of upper and lower case, number, and a special
          character.
        </p>

        <form className="space-y-4 sm:space-y-5">
          {/* Password */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              className={`w-full p-2 pl-3 pr-10 border ${
                passwordError ? "border-2 border-[#FBA1AA] bg-[#FFF0F1]" : "border-[#E6E9EE]"
              } rounded-full text-sm`}
              placeholder="Enter new password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 transform -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
            {passwordError && <p className="mt-1 text-xs text-[#F3293E]">{passwordError}</p>}
          </div>

          {/* Password Strength Indicator */}
          {password.length > 0 && (
            <div className="strength-bar mt-1 sm:mt-2">
              <div
                className={`strength-segment 
        ${strength === "Too Weak" ? "too-weak" : ""} 
        ${["Weak", "Moderate", "Strong"].includes(strength) ? "weak" : ""} 
        ${["Moderate", "Strong"].includes(strength) ? "moderate" : ""} 
        ${strength === "Strong" ? "strong" : ""}`}
                style={{
                  width:
                    strength === "Too Weak"
                      ? "25%"
                      : strength === "Weak"
                      ? "50%"
                      : strength === "Moderate"
                      ? "75%"
                      : "100%",
                }}
              ></div>
              <div
                className={`strength-segment 
        ${["Weak", "Moderate", "Strong"].includes(strength) ? "weak" : ""} 
        ${["Moderate", "Strong"].includes(strength) ? "moderate" : ""} 
        ${strength === "Strong" ? "strong" : ""}`}
                style={{
                  width:
                    strength === "Weak"
                      ? "25%"
                      : strength === "Moderate"
                      ? "50%"
                      : strength === "Strong"
                      ? "75%"
                      : "0%",
                }}
              ></div>
              <div
                className={`strength-segment 
        ${["Moderate", "Strong"].includes(strength) ? "moderate" : ""} 
        ${strength === "Strong" ? "strong" : ""}`}
                style={{
                  width: strength === "Moderate" ? "25%" : strength === "Strong" ? "50%" : "0%",
                }}
              ></div>
              <div
                className={`strength-segment ${strength === "Strong" ? "strong" : ""}`}
                style={{
                  width: strength === "Strong" ? "25%" : "0%",
                }}
              ></div>
              <span className="text-xs sm:text-sm text-gray-600 ml-1 sm:ml-2">
                {strength || "Enter password to check strength"}
              </span>
            </div>
          )}

          {/* Repeat Password */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">Repeat Password</label>
            <input
              type={showRepeatPassword ? "text" : "password"}
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              className={`w-full p-2 pl-3 pr-10 border ${
                repeatPasswordError ? "border-2 border-[#FBA1AA] bg-[#FFF0F1]" : "border-[#E6E9EE]"
              } rounded-full text-sm`}
              placeholder="Repeat new password"
            />
            <button
              type="button"
              onClick={() => setShowRepeatPassword(!showRepeatPassword)}
              className="absolute right-3 top-9 transform -translate-y-1/2 text-gray-500"
            >
              {showRepeatPassword ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
            {repeatPasswordError && (
              <p className="mt-1 text-xs text-red-500">{repeatPasswordError}</p>
            )}
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="button"
            disabled={confirmMutation.isPending || strength === "Too Weak" || strength === "Weak"}
            className="w-full bg-black text-sm sm:text-base font-medium text-white p-2 sm:p-2.5 rounded-full hover:bg-gray-800 mt-1 h-10 sm:h-11 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleReset}
          >
            {confirmMutation.isPending ? "Resetting..." : "Reset"}
          </button>
        </form>
      </div>
    </div>
  );
}
