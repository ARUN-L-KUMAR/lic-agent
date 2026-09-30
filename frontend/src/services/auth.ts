/**
 * Auth service
 */
import apiClient from "@/lib/api-client";
import type { User } from "@/types";

export const authService = {
  async register(payload: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
  }): Promise<{ message: string }> {
    const { data } = await apiClient.post("/auth/register", payload);
    return data;
  },

  async login(email: string, password: string): Promise<{
    access_token: string;
    role: string;
    user_id: string;
  }> {
    const { data } = await apiClient.post("/auth/login", { email, password });
    return data;
  },

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  },

  async refresh(refreshToken: string): Promise<{ access_token: string }> {
    const { data } = await apiClient.post("/auth/refresh", { refresh_token: refreshToken });
    return data;
  },

  async me(): Promise<User> {
    const { data } = await apiClient.get("/auth/me");
    return data;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const { data } = await apiClient.post("/auth/forgot-password", { email });
    return data;
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const { data } = await apiClient.post("/auth/reset-password", {
      token,
      new_password: newPassword,
    });
    return data;
  },

  async verifyEmail(token: string): Promise<{ message: string }> {
    const { data } = await apiClient.get(`/auth/verify-email/${token}`);
    return data;
  },
};
