import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import api from "./api.service";

// --- Types ---
export interface LoginPayload {
  email: string;
  password: string;
}
export interface User {
  email: string;
  first_name: string;
  last_name: string;
  profile_picture: string | null;
  role: string;
  id: string;
  company_id: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  last_login_at: string | null;
  email_verified: boolean;
  master_agency_id: any | null;
  is_company_member?: boolean;
}
export interface Token {
  access_token: string;
  refresh_token: string;
  token_type: string;
}
export interface LoginResponse {
  token: Token;
  user: User;
  is_company_member?: boolean;
}
export interface RegisterPayload {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  repeatPassword: string;
}
export interface RegisterResponse {
  token: Token;
  user: User;
  is_company_member?: boolean;
}
export interface RefreshTokenPayload {
  refresh_token: string;
}
export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}
export interface ProviderLoginParams {
  integration_id: string;
  company_id: string;
}

// --- Auth APIs ---
const login = async (data: LoginPayload): Promise<LoginResponse> => {
  const response = await api.post("/v1/auth/login", data);
  return response.data;
};

const register = async (data: RegisterPayload): Promise<RegisterResponse> => {
  const response = await api.post("/v1/auth/register", data);
  return response.data;
};

const refreshToken = async (
  data: RefreshTokenPayload
): Promise<RefreshTokenResponse> => {
  const response = await api.post("/v1/auth/token/refresh", data);
  return response.data;
};

const providerLogin = async (params: ProviderLoginParams): Promise<void> => {
  return new Promise((resolve, reject) => {
    const baseUrl = api.defaults.baseURL || "";
    const url = `${baseUrl}/v1/auth/${params.integration_id}/login?company_id=${params.company_id}&path=integrations`;

    const parentOrigin = window.location.origin;
    const popup = window.open(
      url,
      "oauth",
      "width=500,height=600,scrollbars=yes,resizable=yes"
    );

    if (!popup) {
      reject(new Error("Popup blocked by browser"));
      return;
    }

    const checkStatus = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(checkStatus);
          resolve();
          return;
        }
        if (popup.location.href.includes(parentOrigin)) {
          clearInterval(checkStatus);
          popup.close();
          resolve();
          return;
        }
      } catch {
        if (popup.closed) {
          clearInterval(checkStatus);
          resolve();
        }
      }
    }, 1000);

    setTimeout(() => {
      if (!popup.closed) {
        clearInterval(checkStatus);
        popup.close();
        reject(new Error("OAuth timeout"));
      }
    }, 300000);
  });
};

// --- Email Verification ---
export const useVerifyEmail = (
  options?: UseMutationOptions<{ success: boolean }, AxiosError, string>
) => {
  return useMutation<{ success: boolean }, AxiosError, string>({
    mutationFn: async (token: string) => {
      const response = await api.get(`/v1/auth/verify-email?token=${token}`);
      return response.data;
    },
    ...options,
  });
};

export const useResendVerificationEmail = (
  options?: UseMutationOptions<{ success: boolean }, AxiosError, string>
) => {
  return useMutation<{ success: boolean }, AxiosError, string>({
    mutationFn: async (email: string) => {
      const response = await api.post("/v1/auth/register/resend", { email });
      return response.data;
    },
    ...options,
  });
};

// --- Forgot / Reset Password ---
interface PasswordResetRequestPayload {
  email: string;
}

export const usePasswordResetRequest = (
  options?: UseMutationOptions<any, AxiosError, { email: string }>
) => {
  return useMutation<any, AxiosError, { email: string }>({
    mutationFn: async ({ email }) => {
      // ✅ send email as query param instead of JSON body
      const response = await api.post(
        `/v1/auth/password-reset/request?email=${encodeURIComponent(email)}`
      );
      return response.data;
    },
    ...options,
  });
};

export const passwordResetRequest = async (data: { email: string }) => {
  const response = await api.post(
    `/v1/auth/password-reset/request?email=${encodeURIComponent(data.email)}`
  );
  return response.data;
};

// 2. Verify reset token
interface PasswordResetVerifyPayload {
  token: string;
}

export const usePasswordResetVerify = (
  options?: UseMutationOptions<
    { valid: boolean },
    AxiosError,
    PasswordResetVerifyPayload
  >
) => {
  return useMutation<
    { valid: boolean },
    AxiosError,
    PasswordResetVerifyPayload
  >({
    mutationFn: async ({ token }) => {
      const response = await api.get(
        `/v1/auth/password-reset/verify-token?token=${encodeURIComponent(
          token
        )}`
      );
      return response.data;
    },
    ...options,
  });
};

export const usePasswordResetVerifyToken = (
  options?: UseMutationOptions<any, AxiosError, { token: string }>
) => {
  return useMutation<any, AxiosError, { token: string }>({
    mutationFn: async ({ token }) => {
      const response = await api.post("/v1/auth/password-reset/verify-token", {
        token,
      });
      return response.data;
    },
    ...options,
  });
};

// 3. Confirm reset
export interface PasswordResetConfirmPayload {
  token: string;
  new_password: string;
}
export const usePasswordResetConfirm = (
  options?: UseMutationOptions<any, AxiosError, PasswordResetConfirmPayload>
) => {
  return useMutation<any, AxiosError, PasswordResetConfirmPayload>({
    mutationFn: async (data) => {
      const response = await api.post("/v1/auth/password-reset/confirm", data);
      return response.data;
    },
    ...options,
  });
};

export interface PasswordCreateConfirmPayload {
  token: string;
  password: string;
}
export const usePasswordCreateConfirm = (
  options?: UseMutationOptions<any, AxiosError, PasswordCreateConfirmPayload>
) => {
  return useMutation<any, AxiosError, PasswordCreateConfirmPayload>({
    mutationFn: async (data) => {
      const response = await api.post("/v1/users/create-password", data);
      return response.data;
    },
    ...options,
  });
};

// --- TanStack Query Hooks ---
export const useLogin = (
  options?: UseMutationOptions<LoginResponse, AxiosError, LoginPayload>
) => {
  const queryClient = useQueryClient();
  return useMutation<LoginResponse, AxiosError, LoginPayload>({
    mutationFn: login,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    ...options,
  });
};

export const useRegister = (
  options?: UseMutationOptions<RegisterResponse, AxiosError, RegisterPayload>
) => {
  const queryClient = useQueryClient();
  return useMutation<RegisterResponse, AxiosError, RegisterPayload>({
    mutationFn: register,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    ...options,
  });
};

export const useRefreshToken = (
  options?: UseMutationOptions<
    RefreshTokenResponse,
    AxiosError,
    RefreshTokenPayload
  >
) => {
  return useMutation<RefreshTokenResponse, AxiosError, RefreshTokenPayload>({
    mutationFn: refreshToken,
    ...options,
  });
};

export const useProviderLogin = (
  options?: UseMutationOptions<void, Error, ProviderLoginParams>
) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, ProviderLoginParams>({
    mutationFn: providerLogin,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["checkPlanUsed"] });
    },
    ...options,
  });
};
