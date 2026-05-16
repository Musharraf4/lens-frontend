"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/AuthContext";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import logo from "../../assets/LenzPixelFullIcon.svg";
import googleIcon from "../../assets/GoogleIcon.svg";

export default function Register() {
  const router = useRouter();
  const { register, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [strength, setStrength] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [formError, setFormError] = useState("");

  const handleGoogleLogin = () => {
    const next = encodeURIComponent("/home");
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/google-login?next=${next}`;
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  useEffect(() => {
    if (email && !validateEmail(email)) {
      setEmailError("Email format is incorrect. Please use the format: name@example.com.");
    } else {
      setEmailError("");
    }
  }, [email]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setEmailError("");
    setPasswordError("");

    if (emailError) {
      return;
    }

    if (password !== repeatPassword) {
      setPasswordError("Passwords do not match!");
      return;
    }

    if (!email || !password || !repeatPassword || !first_name || !last_name) {
      setFormError("All fields are required!");
      return;
    }
    if (strength !== "Strong") {
      setPasswordError("Please try creating strong password");
      return;
    }

    try {
      const response = await register({
        email,
        password,
        repeatPassword,
        first_name,
        last_name,
      });

      if (!response.user.email_verified) {
        // Redirect to verify-email with email param
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      } else if (!response.user.master_agency) {
        // Redirect to onboarding if no master agency
        router.replace("/onboarding");
      } else {
        router.replace("/home");
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      if (err.response?.data?.detail) {
        const errorMsg = err.response.data.detail;
        if (errorMsg.toLowerCase().includes("email")) {
          setEmailError(errorMsg);
        } else if (errorMsg.toLowerCase().includes("password")) {
          setPasswordError(errorMsg);
        } else {
          setFormError(errorMsg);
        }
      } else {
        setFormError("Registration failed. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9FB] p-2 sm:p-4 md:p-6">
      <div className="bg-white rounded-lg shadow-md w-full max-w-full sm:max-w-md md:max-w-lg px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex justify-center mb-3 mt-2">
          <img
            src={logo.src}
            className="w-[60px] h-[17px] sm:w-[75px] sm:h-[22px] md:w-[90px] md:h-[26px]"
            alt="Lenz Logo"
          />
        </div>
        <h2 className="text-base lg:text-2xl md:text-xl sm:text-lg font-semibold text-center text-gray-700 mb-2">
          Create an account
        </h2>
        <p className="text-xs sm:text-sm text-center text-gray-500 mb-3">
          Password must have 8 characters, a mix of upper and lower case, number, and a special
          character.
        </p>
        <form
          onSubmit={handleSubmit}
          className="space-y-3 sm:space-y-4"
          autoComplete="off"
        >
          <div>
            <div
              className={`mb-2 ${isLoading
                  ? "bg-gradient-to-r from-[#F7F9FB] to-[#E6E9EE] animate-pulse rounded-sm h-6 w-24"
                  : ""
                }`}
            >
              {!isLoading && (
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  First name
                </label>
              )}
            </div>
            <div
              className={`mt-1 ${isLoading
                  ? "bg-gradient-to-r from-[#F7F9FB] to-[#E6E9EE] animate-pulse rounded-2xl sm:rounded-3xl h-[38px] sm:h-[42px]"
                  : ""
                }`}
            >
              {!isLoading && (
                <input
                  type="text"
                  value={first_name}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl shadow-sm text-sm sm:text-base border border-[#E6E9EE]"
                  placeholder="Enter first name"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  name="new-first-name"
                  required
                />
              )}
            </div>
          </div>
          <div>
            <div
              className={`mb-2 ${isLoading
                  ? "bg-gradient-to-r from-[#F7F9FB] to-[#E6E9EE] animate-pulse rounded-sm h-6 w-24"
                  : ""
                }`}
            >
              {!isLoading && (
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Last name
                </label>
              )}
            </div>
            <div
              className={`mt-1 ${isLoading
                  ? "bg-gradient-to-r from-[#F7F9FB] to-[#E6E9EE] animate-pulse rounded-2xl sm:rounded-3xl h-[38px] sm:h-[42px]"
                  : ""
                }`}
            >
              {!isLoading && (
                <input
                  type="text"
                  value={last_name}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl shadow-sm text-sm sm:text-base border border-[#E6E9EE]"
                  placeholder="Enter last name"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  name="new-last-name"
                  required
                />
              )}
            </div>
          </div>
          <div>
            <div
              className={`mb-2 ${isLoading
                  ? "bg-gradient-to-r from-[#F7F9FB] to-[#E6E9EE] animate-pulse rounded-sm h-6 w-24"
                  : ""
                }`}
            >
              {!isLoading && (
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Email address
                </label>
              )}
            </div>
            <div
              className={`mt-1 ${isLoading
                  ? "bg-gradient-to-r from-[#F7F9FB] to-[#E6E9EE] animate-pulse rounded-2xl sm:rounded-3xl h-[38px] sm:h-[42px]"
                  : ""
                }`}
            >
              {!isLoading && (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl shadow-sm text-sm sm:text-base ${emailError
                      ? "border-2 border-[#FBA1AA] bg-[#FFF0F1]"
                      : "border border-[#E6E9EE]"
                    }`}
                  placeholder="Enter email address"
                  autoComplete="off"
                  inputMode="email"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  name="new-email"
                  required
                />
              )}
            </div>
            {emailError && <p className="mt-1 text-xs sm:text-sm text-[#F3293E]">{emailError}</p>}
          </div>
          <div>
            <div
              className={`mb-2 ${isLoading
                  ? "bg-gradient-to-r from-[#F7F9FB] to-[#E6E9EE] animate-pulse rounded-lg h-6 w-24"
                  : ""
                }`}
            >
              {!isLoading && (
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Create Password
                </label>
              )}
            </div>
            <div
              className={`mt-1 ${isLoading
                  ? "bg-gradient-to-r from-[#F7F9FB] to-[#E6E9EE] animate-pulse rounded-2xl sm:rounded-3xl h-[38px] sm:h-[42px] relative"
                  : ""
                }`}
            >
              {!isLoading && (
                <div className="relative w-full">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    className={`w-full p-1.5 sm:p-2 pl-3 pr-10 border ${passwordError ? "border-2 border-[#FBA1AA] bg-[#FFF0F1]" : "border-[#E6E9EE]"
                      } rounded-2xl sm:rounded-3xl shadow-sm text-sm sm:text-base`}
                    placeholder="Enter password"
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    name="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 p-2.5 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
              )}
            </div>
            {passwordError && (
              <p className="mt-1 text-xs sm:text-sm text-[#F3293E]">{passwordError}</p>
            )}
          </div>
          <div>
            <div
              className={`mb-2 ${isLoading
                  ? "bg-gradient-to-r from-[#F7F9FB] to-[#E6E9EE] animate-pulse rounded-lg h-6 w-24"
                  : ""
                }`}
            >
              {!isLoading && (
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Repeat Password
                </label>
              )}
            </div>
            <div
              className={`mt-1 ${isLoading
                  ? "bg-gradient-to-r from-[#F7F9FB] to-[#E6E9EE] animate-pulse rounded-2xl sm:rounded-3xl h-[38px] sm:h-[42px] relative"
                  : ""
                }`}
            >
              {!isLoading && (
                <div className="relative w-full">
                  <input
                    type={showRepeatPassword ? "text" : "password"}
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    className="w-full p-1.5 sm:p-2 pl-3 pr-10 border border-[#E6E9EE] rounded-2xl sm:rounded-3xl shadow-sm text-sm sm:text-base"
                    placeholder="Enter your password again"
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    name="new-password-confirm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                    className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 p-2.5 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
                  >
                    {showRepeatPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
              )}
            </div>
          </div>
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
          <button
            type="submit"
            className="w-full bg-black text-white p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl hover:bg-gray-800 mt-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Sign up
          </button>
          {formError && (
            <div className="mt-2 p-2 bg-[#FFF0F1] border-2 border-[#FBA1AA] rounded-lg">
              <p className="text-xs sm:text-sm text-[#F3293E]">{formError}</p>
            </div>
          )}
          <div className="text-xs sm:text-sm text-[#707889] flex justify-center items-center gap-1">
            <span>Already have an account?</span>
            <Link
              href="/login"
              className="text-[#030C23] hover:underline"
            >
              Log in
            </Link>
          </div>
          <div className="flex items-center my-3">
            <hr className="flex-1 border-gray-300" />
            <span className="mx-2 text-xs sm:text-sm text-gray-500">Or</span>
            <hr className="flex-1 border-gray-300" />
          </div>
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-white border border-gray-300 p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl flex items-center justify-center gap-2 hover:bg-gray-50 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <img
              src={googleIcon.src}
              alt="Google"
              className="w-4 sm:w-5 h-4 sm:h-5"
            />
            Sign up with Google
          </button>
        </form>
      </div>
    </div>
  );
}
