// app/oauth/callback/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthService from "@/services/auth.service";

function b64urlToJson(b64: string) {
  try {
    const pad = "=".repeat((4 - (b64.length % 4)) % 4);
    const s = (b64 + pad).replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(s));
  } catch (error) {
    console.error("Failed to decode base64:", error);
    throw new Error("Invalid data format");
  }
}

export default function OAuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Check if we're in a popup for provider login
        const isPopup = window.opener && window.location.href.includes(window.location.origin);

        if (isPopup) {
          // Handle provider login popup
          window.opener.postMessage({ type: 'OAUTH_COMPLETE', success: true }, window.location.origin);
          window.close();
          return;
        }

        // Handle regular OAuth callback
        const hash = window.location.hash.slice(1);
        const params = new URLSearchParams(hash);
        const blob = params.get("data");

        if (!blob) {
          // Check if we have regular query parameters (for error cases)
          const error = new URLSearchParams(window.location.search).get("error");
          if (error) {
            throw new Error(`OAuth error: ${error}`);
          }
          throw new Error("Missing OAuth data");
        }

        const { token, user, next } = b64urlToJson(blob);

        if (token?.access_token) {
          // Set tokens in both cookies and localStorage
          AuthService.setTokens(token.access_token, token.refresh_token || "");

          // Set cookies explicitly for middleware compatibility
          const secure = process.env.NODE_ENV === 'production';
          const cookieOptions = `path=/; max-age=86400; ${secure ? 'secure;' : ''} samesite=lax`;

          document.cookie = `access_token=${token.access_token}; ${cookieOptions}`;

          if (token.refresh_token) {
            document.cookie = `refresh_token=${token.refresh_token}; path=/; max-age=604800; ${secure ? 'secure;' : ''} samesite=lax`;
          }
        }

        if (user) {
          AuthService.setUser(user);
          // Set user cookie for middleware - use the same format as middleware
          const secure = process.env.NODE_ENV === 'production';

          // Use the same approach as in middleware - don't double encode
          const userDataString = JSON.stringify(user);
          document.cookie = `user_data=${userDataString}; path=/; max-age=604800; ${secure ? 'secure;' : ''} samesite=lax`;

          if (!user.master_agency) {
            router.replace("/onboarding");
            return;
          }
        }

        // Clear the URL fragment and parameters
        window.history.replaceState(null, "", window.location.pathname);

        // Redirect to the intended destination
        const nextPath = next && next.startsWith("/") ? next : "/home";
        router.replace(nextPath);

      } catch (error) {
        console.error("OAuth callback error:", error);

        // Clear any partial authentication data
        AuthService.clearTokens();

        // Also clear cookies
        document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "user_data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

        // Redirect to login with error
        const errorMessage = error instanceof Error ? error.message : 'oauth_failed';
        router.replace(`/login?error=${encodeURIComponent(errorMessage)}`);
      }
    };

    // Listen for popup messages (for provider logins)
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === 'OAUTH_COMPLETE') {
        window.close();
      }
    };

    window.addEventListener('message', handleMessage);
    handleOAuthCallback();

    return () => window.removeEventListener('message', handleMessage);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-lg font-semibold text-gray-800">Completing Process</h2>
        <p className="text-sm text-gray-600 mt-1">Please wait while we secure your session...</p>
      </div>
    </div>
  );
}