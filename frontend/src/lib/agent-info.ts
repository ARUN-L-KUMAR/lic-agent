import type { SiteSettings } from "@/types";

export const OFFICIAL_DISCLAIMER =
  "This website is operated by an LIC agent for informational and customer-service purposes. It is not the official LIC website. Policy information is subject to official LIC policy documents, terms, conditions and applicable rules.";

// Server-safe fallback used only until the /site/settings API responds (or if it is unreachable).
export const DEFAULT_SETTINGS: SiteSettings = {
  business_name: "LAKSHMI NARAYANAN S — LIC Agent",
  agent_name: "LAKSHMI NARAYANAN S",
  agent_code: "3572",
  phone: "+91 9787445506",
  whatsapp: "919787445506",
  email: "laxamans1980@gmail.com",
  office_address: "Ranipet, Vellore, Tamil Nadu, India",
  profile_image_url: "/profile.png",
  hero_image_url: "/agent.png",
  service_locations: "Ranipet, Vellore",
  main_disclaimer: OFFICIAL_DISCLAIMER,
};

/** Server-side fetch of the site settings (used for SEO metadata and JSON-LD). */
export async function getSiteSettings(): Promise<SiteSettings> {
  const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";
  try {
    const res = await fetch(`${api}/site/settings`, { next: { revalidate: 600 } });
    if (!res.ok) return DEFAULT_SETTINGS;
    const data = await res.json();
    return { ...DEFAULT_SETTINGS, ...data };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
