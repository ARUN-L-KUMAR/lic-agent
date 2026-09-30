/**
 * Plans API service
 */
import apiClient from "@/lib/api-client";
import type { Plan, PlanSummary, PaginatedResponse } from "@/types";

export interface PlanFilters {
  page?: number;
  per_page?: number;
  category?: string;
  search?: string;
  status?: string;
  min_age?: number;
  max_age?: number;
  purpose?: string;
  is_featured?: boolean;
  sort_by?: string;
}

export const plansService = {
  async list(filters: PlanFilters = {}): Promise<PaginatedResponse<PlanSummary>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        params.set(k, String(v));
      }
    });
    const { data } = await apiClient.get(`/plans?${params}`);
    return data;
  },

  async getBySlug(slug: string): Promise<Plan> {
    const { data } = await apiClient.get(`/plans/${slug}`);
    return data;
  },

  async getFeatured(limit = 6): Promise<Plan[]> {
    const { data } = await apiClient.get(`/plans/featured?limit=${limit}`);
    return data;
  },

  async getCategories(): Promise<{ id: string; name: string; slug: string; description?: string }[]> {
    const { data } = await apiClient.get("/plans/categories");
    return data;
  },

  async compare(planIds: string[]): Promise<{ plans: Plan[]; disclaimer: string }> {
    const { data } = await apiClient.get(`/plans/compare?plan_ids=${planIds.join(",")}`);
    return data;
  },

  async create(payload: Partial<Plan>): Promise<Plan> {
    const { data } = await apiClient.post("/plans", payload);
    return data;
  },

  async update(planId: string, payload: Partial<Plan>): Promise<Plan> {
    const { data } = await apiClient.put(`/plans/${planId}`, payload);
    return data;
  },

  async updateStatus(planId: string, status: string): Promise<Plan> {
    const { data } = await apiClient.patch(`/plans/${planId}/status?new_status=${status}`);
    return data;
  },

  async delete(planId: string): Promise<void> {
    await apiClient.delete(`/plans/${planId}`);
  },
};
