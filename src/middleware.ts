import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { User } from "./services/auth.api";

export const unauthenticatedRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/oauth/callback",
  "/create-password",
];

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;
  const user = request.cookies.get("user_data")?.value;
  const myUser: User = user ? JSON.parse(decodeURIComponent(user)) : null;

  const refreshToken = request.cookies.get("refresh_token")?.value;
  const path = request.nextUrl.pathname;

  // Function to check if token is expired
  const isTokenExpired = (token: string): boolean => {
    try {
      const [, payloadBase64] = token.split(".");
      const payload = JSON.parse(atob(payloadBase64));
      return payload.exp ? Date.now() >= payload.exp * 1000 : true;
    } catch {
      return true;
    }
  };

  // Check tokens validity
  const hasValidAccessToken = accessToken && !isTokenExpired(accessToken);
  const hasValidRefreshToken = refreshToken && !isTokenExpired(refreshToken);
  const isAuthenticated = hasValidAccessToken || hasValidRefreshToken;

  function isUnauthenticatedRoute(path: string) {
    return unauthenticatedRoutes.some((route) => path.startsWith(route));
  }

  // ======================
  // Authenticated user logic
  // ======================
  if (isAuthenticated) {
    // 1️⃣ Email verification takes highest priority
    if (myUser && myUser.email_verified === false) {
      if (!path.startsWith("/verify-email")) {
        const verifyEmailUrl = new URL("/verify-email", request.url);
        // Preserve query parameters from the original request
        request.nextUrl.searchParams.forEach((value, key) => {
          verifyEmailUrl.searchParams.set(key, value);
        });
        return NextResponse.redirect(verifyEmailUrl);
      }
    }

    // 2️⃣ Onboarding only if verified but no agency
    else if (myUser?.master_agency_id === null && !myUser?.is_company_member) {
      if (!path.startsWith("/onboarding")) {
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }
    }

    // 3️⃣ Block unauth routes for logged-in users
    else if (isUnauthenticatedRoute(path)) {
      // Special-case: If hitting create-password with token while authenticated,
      // redirect to home with a cp_warn flag to show a toast there.
      if (path.startsWith("/create-password")) {
        const token = request.nextUrl.searchParams.get("token");
        if (token) {
          const url = new URL("/home", request.url);
          url.searchParams.set("cp_warn", "1");
          return NextResponse.redirect(url);
        }
      }
      return NextResponse.redirect(new URL("/home", request.url));
    }

    // 4️⃣ Block /verify-email once already verified
    if (myUser?.email_verified && path.startsWith("/verify-email")) {
      return NextResponse.redirect(new URL("/home", request.url));
    }

    // 5️⃣ Block /onboarding once agency exists
    if (
      (myUser?.master_agency_id ||
        (myUser?.is_company_member &&
          request.nextUrl.searchParams.get("create_master") !== "1")) &&
      path.startsWith("/onboarding")
    ) {
      return NextResponse.redirect(new URL("/home", request.url));
    }
  }
  // ======================
  // Unauthenticated user logic
  // ======================
  else {
    if (!isUnauthenticatedRoute(path)) {
      // Preserve intended destination with query string
      const url = new URL("/login", request.url);
      const intended =
        request.nextUrl.pathname + (request.nextUrl.search || "");
      // Avoid setting next for root to prevent post-login double redirect
      if (intended && intended !== "/") {
        url.searchParams.set("next", intended);
      }
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
