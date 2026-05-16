// services/auth.service.ts
import { LoginResponse, RegisterResponse, User } from "./auth.api";

class AuthService {
  private static readonly ACCESS_TOKEN_KEY = "access_token";
  private static readonly REFRESH_TOKEN_KEY = "refresh_token";
  private static readonly USER_KEY = "user_data";

  // Get token from cookies (for middleware) or localStorage (for client-side)
  static getAccessToken(): string | null {
    if (typeof window === "undefined") return null;

    // First try to get from cookie (for middleware compatibility)
    const cookieToken = this.getCookie(this.ACCESS_TOKEN_KEY);
    if (cookieToken) return cookieToken;

    // Fall back to localStorage
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;

    const cookieToken = this.getCookie(this.REFRESH_TOKEN_KEY);
    if (cookieToken) return cookieToken;

    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === "undefined") return;

    // Set in both localStorage and cookies
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }

    // Also set cookies for middleware
    this.setCookie(this.ACCESS_TOKEN_KEY, accessToken, 1);
    if (refreshToken) {
      this.setCookie(this.REFRESH_TOKEN_KEY, refreshToken, 7);
    }
  }

  static getUser(): User | null {
    if (typeof window === "undefined") return null;

    // Try cookie first
    const cookieUser = this.getCookie(this.USER_KEY);
    if (cookieUser) {
      try {
        return JSON.parse(decodeURIComponent(cookieUser));
      } catch (e) {
        console.warn("Failed to parse user cookie", e);
      }
    }

    // Fall back to localStorage
    const localUser = localStorage.getItem(this.USER_KEY);
    return localUser ? JSON.parse(localUser) : null;
  }

  static setUser(user: User): void {
    if (typeof window === "undefined") return;

    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.setCookie(this.USER_KEY, encodeURIComponent(JSON.stringify(user)), 7);
  }

  static setAuthData(response: LoginResponse | RegisterResponse): void {
    this.setTokens(response.token.access_token, response.token.refresh_token);
    this.setUser({
      ...response.user,
      is_company_member: response?.is_company_member || false,
    });
  }

  static clearTokens(): void {
    if (typeof window === "undefined") return;

    // Clear localStorage
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);

    // Clear cookies
    this.deleteCookie(this.ACCESS_TOKEN_KEY);
    this.deleteCookie(this.REFRESH_TOKEN_KEY);
    this.deleteCookie(this.USER_KEY);
  }

  // Verification Methods
  static isEmailVerified(): boolean {
    const user = this.getUser();
    return user?.email_verified || false;
  }

  static async resendVerificationEmail(
    email: string
  ): Promise<{ success: boolean }> {
    try {
      // Your API call implementation
      return { success: true };
    } catch (error) {
      console.error("Resend verification email failed:", error);
      throw error;
    }
  }

  static async verifyEmail(token: string): Promise<boolean> {
    try {
      // Your API call implementation
      return true;
    } catch (error) {
      console.error("Verification failed:", error);
      throw error;
    }
  }

  // Token Validation
  static isTokenExpired(token: string | null): boolean {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp < Math.floor(Date.now() / 1000);
    } catch {
      return true;
    }
  }

  static shouldRefreshToken(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp < Math.floor(Date.now() / 1000) + 300;
    } catch {
      return false;
    }
  }

  static isAuthenticated(): boolean {
    return !!(this.getAccessToken() || this.getRefreshToken());
  }

  // Cookie utilities
  private static getCookie(name: string): string | null {
    if (typeof window === "undefined") return null;

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(";").shift();
      return cookieValue ? decodeURIComponent(cookieValue) : null;
    }
    return null;
  }

  private static setCookie(
    name: string,
    value: string,
    days: number = 1
  ): void {
    if (typeof window === "undefined") return;

    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    const secure = process.env.NODE_ENV === "production" ? "secure;" : "";
    const sameSite = "samesite=lax";

    document.cookie = `${name}=${encodeURIComponent(
      value
    )}; path=/; ${expires}; ${secure}${sameSite}`;
  }

  private static deleteCookie(name: string): void {
    if (typeof window === "undefined") return;

    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }

  // Helper to check if we're in a browser context
  static isBrowser(): boolean {
    return typeof window !== "undefined";
  }
}

export default AuthService;
