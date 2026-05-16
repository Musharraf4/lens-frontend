// authcontext.tsx
"use client";

import {
  LoginPayload,
  RegisterPayload,
  useLogin,
  User,
  useRefreshToken,
  useRegister,
} from "@/services/auth.api";
import AuthService from "@/services/auth.service";
import { fetchUserCompanies } from "@/services/user.api";
import { useRouter } from "next/navigation";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useCompaniesStore } from "./Companies";
import { useSelectedCompanyStore } from "./SelectedCompany";

interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  error: string | null;
  token: string | null;
  login: (credentials: LoginPayload) => Promise<any>;
  register: (data: RegisterPayload) => Promise<any>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string>;
  setChangeCompanyLoading: React.Dispatch<React.SetStateAction<boolean>>;
  changeCompanyLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [changeCompanyLoading, setChangeCompanyLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { setCompanies } = useCompaniesStore();

  const { setSelectedCompany, selectedCompany, hasHydrated } = useSelectedCompanyStore();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const refreshTokenMutation = useRefreshToken();

  const router = useRouter();
  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const validAccessToken = AuthService.getAccessToken();
      const refreshTokenValue = AuthService.getRefreshToken();
      const userData = AuthService.getUser();

      if (validAccessToken) {
        setIsAuthenticated(true);
        setUser(userData);
        setIsLoading(false);
        const companies = await fetchUserCompanies();
        setCompanies(companies);
        // Only set selectedCompany if store has hydrated and no company is currently selected
        if (hasHydrated && !selectedCompany) {
          setSelectedCompany(companies?.find(c => c.company?.id === userData?.master_agency_id) ?? companies[0]);
        }
        return;
      }

      if (refreshTokenValue) {
        try {
          const response = await refreshTokenMutation.mutateAsync({
            refresh_token: refreshTokenValue,
          });
          AuthService.setTokens(response.access_token, response.refresh_token);
          setIsAuthenticated(true);
          setUser(userData);
          const companies = await fetchUserCompanies();
          setCompanies(companies);
          // Only set selectedCompany if store has hydrated and no company is currently selected
          if (hasHydrated && !selectedCompany) {
            setSelectedCompany(companies?.find(c => c.company?.id === userData?.master_agency_id) ?? null);
          }
        } catch (error) {
          console.error("Failed to refresh token on mount:", error);
          AuthService.clearTokens();
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [hasHydrated, selectedCompany, setSelectedCompany, setCompanies]);

  const login = useCallback(
    async (credentials: LoginPayload) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await loginMutation.mutateAsync(credentials);
        AuthService.setAuthData(response);
        setIsAuthenticated(true);
        setUser(response.user);

        // fetch companies only if email is verified and have master agency
        if (response.user?.email_verified && Boolean(response.user.master_agency_id || response.is_company_member)) {
          localStorage.removeItem("from-create-password");
          const companies = await fetchUserCompanies();
          setCompanies(companies);
          setSelectedCompany(companies?.find(c => c.company?.id === response.user.master_agency_id) ?? companies[0]);
        }

        return response;
      } catch (err: any) {
        setIsLoading(false);
        const errorMessage = err?.response?.data?.message || err.message || "Login failed";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [loginMutation, setCompanies, setSelectedCompany]
  );

  const register = useCallback(
    async (data: RegisterPayload) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await registerMutation.mutateAsync(data);
        AuthService.setAuthData(response);
        setIsAuthenticated(true);
        setUser(response.user);
        if (response.user?.email_verified && !!response.user.master_agency_id) {
          const companies = await fetchUserCompanies();
          setCompanies(companies);
          setSelectedCompany(companies?.find(c => c.company?.id === response.user.master_agency_id) ?? companies[0]);
        }
        return response;
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message || error.message || "Registration failed";
        setError(errorMessage);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [registerMutation, setCompanies, setSelectedCompany]
  );

  const refreshToken = useCallback(async () => {
    const refresh_token = AuthService.getRefreshToken();
    if (!refresh_token) {
      throw new Error("No refresh token available");
    }

    try {
      const response = await refreshTokenMutation.mutateAsync({ refresh_token });
      AuthService.setTokens(response.access_token, response.refresh_token);
      return response.access_token;
    } catch (err) {
      AuthService.clearTokens();
      setIsAuthenticated(false);
      setUser(null);
      throw err;
    }
  }, [refreshTokenMutation]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      AuthService.clearTokens();
      setIsAuthenticated(false);
      setUser(null);
      setError(null);
      setSelectedCompany(null);
      setCompanies([]);
      localStorage.removeItem("from-create-password");

      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const token = AuthService.getAccessToken();

  const contextValue: AuthContextType = {
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending,
    isAuthenticated,
    user,
    error,
    login,
    token,
    register,
    logout,
    setUser,
    refreshToken,
    setChangeCompanyLoading,
    changeCompanyLoading
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
