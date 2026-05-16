import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import AuthService from "./auth.service";

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL + "/api",
  timeout: 50000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  console.log("Processing queue:", { error, token });
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Skip auth for specific auth endpoints that don't need tokens
    const authEndpointsWithoutToken = [
      "/auth/login",
      "/auth/register",
      "/auth/token/refresh",
    ];
    if (
      authEndpointsWithoutToken.some((endpoint) =>
        config.url?.includes(endpoint)
      )
    ) {
      return config;
    }

    const token = AuthService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Check for 403 errors
    if (
      // error.response?.status === 401 ||
      error.response?.status === 403 &&
      originalRequest &&
      !(originalRequest as any)._retry
    ) {
      console.log("Authentication error detected, checking refresh token...");

      const refreshToken = AuthService.getRefreshToken();
      if (!refreshToken) {
        console.log("No refresh token available, redirecting to login");
        // Only clear tokens if we don't have a refresh token
        AuthService.clearTokens();
        if (typeof window !== "undefined") {
          // window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        console.log("Token refresh already in progress, queueing request");
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            console.log("Retrying queued request with new token");
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            console.error("Queued request failed:", err);
            return Promise.reject(err);
          });
      }

      (originalRequest as any)._retry = true;
      isRefreshing = true;

      try {
        console.log(" Attempting to refresh token...");

        // Get the expired access token (raw, without expiration check)
        const expiredAccessToken = AuthService.getAccessToken();

        // Call the refresh token API with both tokens
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/token/refresh`,
          { access_token: expiredAccessToken, refresh_token: refreshToken },
          {
            headers: {
              Authorization: `Bearer ${expiredAccessToken}`,
            },
          }
        );

        console.log("Token refresh successful");
        const { access_token, refresh_token: newRefreshToken } = response.data;

        // Update stored tokens
        AuthService.setTokens(access_token, newRefreshToken);

        // Update the failed request's authorization header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }

        processQueue(null, access_token);

        // Retry the failed request with new token
        console.log("Retrying original request with new token");
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        processQueue(refreshError, null);

        // Only clear tokens and redirect if refresh token is invalid/expired
        // if (refreshError.response?.status === 401 || refreshError.response?.status === 403) {
        //   console.log('Refresh token is invalid, redirecting to login...');
        //   AuthService.clearTokens();
        //   if (typeof window !== 'undefined') {
        // window.location.href = '/login';
        //   }
        // }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
