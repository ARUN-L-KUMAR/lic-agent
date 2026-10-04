"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import apiClient from "@/lib/api-client";
import { useToast } from "@/components/ui/toaster";

type Values = Record<string, string>;

const SECTIONS: { title: string; note?: string; fields: { name: string; label: string; textarea?: boolean; hint?: string }[] }[] = [
  {
    title: "Agent & business",
    fields: [
      { name: "agent_name", label: "Agent name" },
      { name: "business_name", label: "Business name" },
      { name: "profile_image_url", label: "Profile picture (round logo on profile, dashboard, cards)", hint: "Path or URL, e.g. /profile.png (files in frontend/public). Square close-up works best." },
      { name: "hero_image_url", label: "Homepage cover picture (large, right side of the homepage)", hint: "Path or URL, e.g. /agent.png. A tall portrait photo works best." },
      { name: "agent_code", label: "LIC agent code", hint: "Leave empty to hide it on the website" },
      { name: "license_number", label: "License number", hint: "Leave empty unless verified" },
    ],
  },
  {
    title: "Contact",
    fields: [
      { name: "phone", label: "Phone (e.g. +91 9787445506)" },
      { name: "whatsapp", label: "WhatsApp number (digits with country code)" },
      { name: "email", label: "Email" },
      { name: "office_address", label: "Location / address" },
      { name: "service_locations", label: "Service locations" },
      { name: "working_hours", label: "Working hours" },
    ],
  },
  {
    title: "Homepage content",
    fields: [
      { name: "tagline", label: "Tagline" },
      { name: "hero_headline", label: "Hero headline" },
      { name: "hero_subtext", label: "Hero text", textarea: true },
      { name: "about_text", label: "About text", textarea: true },
    ],
  },
  {
    title: "Homepage figures",
    note: "Shown only when filled in. Enter only verified figures.",
    fields: [
      { name: "years_experience", label: "Years of experience" },
      { name: "customers_served", label: "Customers served" },
      { name: "plans_supported", label: "Plans supported" },
    ],
  },
  {
    title: "SEO",
    fields: [
      { name: "site_title", label: "Site title" },
      { name: "site_description", label: "Site description", textarea: true },
      { name: "site_keywords", label: "Keywords" },
    ],
  },
  {
    title: "Disclaimers",
    fields: [
      { name: "main_disclaimer", label: "Main disclaimer", textarea: true },
      { name: "insurance_disclaimer", label: "Insurance disclaimer", textarea: true },
      { name: "ai_disclaimer", label: "AI disclaimer", textarea: true },
      { name: "calculator_disclaimer", label: "Calculator disclaimer", textarea: true },
    ],
  },
];

export function AdminSettings() {
  const { data } = useQuery({
    queryKey: ["admin-site-settings"],
    queryFn: async () => (await apiClient.get("/admin/site-settings")).data as Record<string, string | null>,
  });

  if (!data) return <div className="skeleton" style={{ height: 240 }} />;
  return <SettingsForm initial={Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v ?? ""]))} />;
}

function SettingsForm({ initial }: { initial: Values }) {
  const toast = useToast();
  const qc = useQueryClient();
  const [values, setValues] = useState<Values>(initial);

  const save = useMutation({
    mutationFn: () => apiClient.put("/admin/site-settings", values),
    onSuccess: () => {
      toast.success("Settings saved");
      qc.invalidateQueries({ queryKey: ["site-settings"] });
      qc.invalidateQueries({ queryKey: ["admin-site-settings"] });
    },
    onError: (e) => {
      const d = isAxiosError(e) ? e.response?.data?.detail : null;
      toast.error("Could not save settings", typeof d === "string" ? d : "Please try again.");
    },
  });

  return (
    <form
      style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: 720 }}
      onSubmit={(e) => { e.preventDefault(); save.mutate(); }}
    >
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Settings</h1>
      {SECTIONS.map((s) => (
        <div key={s.title} className="card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h2 style={{ fontWeight: 700 }}>{s.title}</h2>
          {s.note && <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "-0.5rem" }}>{s.note}</p>}
          {s.fields.map((f) => (
            <div className="form-group" key={f.name}>
              <label className="form-label" htmlFor={`s-${f.name}`}>{f.label}</label>
              {f.textarea ? (
                <textarea id={`s-${f.name}`} className="form-input" rows={3} value={values[f.name] ?? ""} onChange={(e) => setValues({ ...values, [f.name]: e.target.value })} />
              ) : (
                <input id={`s-${f.name}`} className="form-input" value={values[f.name] ?? ""} onChange={(e) => setValues({ ...values, [f.name]: e.target.value })} />
              )}
              {f.hint && <span className="form-hint">{f.hint}</span>}
            </div>
          ))}
        </div>
      ))}
      <div>
        <button className="btn btn-primary" type="submit" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save settings"}</button>
      </div>
    </form>
  );
}
