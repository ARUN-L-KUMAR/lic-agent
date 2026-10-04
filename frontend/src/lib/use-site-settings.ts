"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { SiteSettings } from "@/types";

export { DEFAULT_SETTINGS, OFFICIAL_DISCLAIMER } from "@/lib/agent-info";
import { DEFAULT_SETTINGS } from "@/lib/agent-info";

export function telHref(phone?: string | null) {
  return `tel:${(phone || DEFAULT_SETTINGS.phone || "").replace(/[^\d+]/g, "")}`;
}

export function useSiteSettings(): SiteSettings {
  const { data } = useQuery<SiteSettings>({
    queryKey: ["site-settings"],
    queryFn: async () => (await apiClient.get("/site/settings")).data,
    staleTime: 10 * 60 * 1000,
  });
  return { ...DEFAULT_SETTINGS, ...(data ?? {}) };
}
