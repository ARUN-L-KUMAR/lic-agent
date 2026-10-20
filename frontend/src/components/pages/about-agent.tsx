"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Phone, Mail, MapPin } from "lucide-react";
import apiClient from "@/lib/api-client";
import { AgentPhoto } from "@/components/agent/agent-photo";
import { useSiteSettings, telHref } from "@/lib/use-site-settings";

interface AgentProfile {
  name?: string;
  agent_code?: string | null;
  experience_years?: number | null;
  bio?: string | null;
  specialization?: string[];
}

export function AboutAgent() {
  const site = useSiteSettings();
  const { data: profile } = useQuery<AgentProfile>({
    queryKey: ["agent-profile"],
    queryFn: async () => (await apiClient.get("/agents/profile")).data,
    staleTime: 10 * 60 * 1000,
  });

  const name = profile?.name || site.agent_name;
  const code = profile?.agent_code || site.agent_code;
  const bio = profile?.bio || site.about_text;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "2rem", alignItems: "stretch" }}>
      <div className="card" style={{ padding: 0, overflow: "hidden", textAlign: "center", display: "flex", flexDirection: "column" }}>
        {/* Banner behind the photo */}
        <div
          style={{
            height: 130,
            background: "linear-gradient(135deg, rgba(59,176,255,0.35) 0%, rgba(34,228,255,0.15) 55%, rgba(255,204,0,0.3) 130%)",
            borderBottom: "1px solid var(--border)",
          }}
        />
        <div style={{ padding: "0 2.5rem 2.5rem", display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
          <div
            style={{
              marginTop: -95,
              borderRadius: 28,
              boxShadow: "0 16px 44px -10px rgba(59, 176, 255, 0.55)",
            }}
          >
            <AgentPhoto width={240} height={290} radius="28px" border="4px solid rgba(255,255,255,0.9)" />
          </div>

          <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "1.5rem" }}>{name}</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center", margin: "0.75rem 0 1.5rem" }}>
            <span className="badge badge-primary" style={{ fontSize: "0.85rem" }}>LIC Agent</span>
            {code && <span className="badge badge-gold" style={{ fontSize: "0.85rem" }}>Agent Code: {code}</span>}
            {site.service_locations && <span className="badge badge-success" style={{ fontSize: "0.85rem" }}>{site.service_locations}</span>}
          </div>

          {bio && (
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, fontSize: "1.0625rem", maxWidth: 460, marginBottom: "1.5rem" }}>{bio}</p>
          )}
          {profile?.experience_years ? (
            <p style={{ marginBottom: "1.25rem" }}><strong>Experience:</strong> {profile.experience_years} years</p>
          ) : null}

          {profile?.specialization && profile.specialization.length > 0 && (
            <div style={{ width: "100%", borderTop: "1px solid var(--border)", paddingTop: "1.25rem", marginTop: "auto" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                Areas of guidance
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center" }}>
                {profile.specialization.map((sp) => (
                  <span key={sp} className="badge badge-primary">{sp}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h3 style={{ fontWeight: 700 }}>Get in touch</h3>
        {site.phone && (
          <a href={telHref(site.phone)} style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <Phone size={18} /> {site.phone}
          </a>
        )}
        {site.email && (
          <a href={`mailto:${site.email}`} style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <Mail size={18} /> {site.email}
          </a>
        )}
        {site.office_address && (
          <span style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <MapPin size={18} /> {site.office_address}
          </span>
        )}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
          <Link href="/book-appointment" className="btn btn-primary">Book Appointment</Link>
          <Link href="/contact" className="btn btn-secondary">Contact</Link>
        </div>
        <p className="disclaimer-box" style={{ fontSize: "0.8125rem", lineHeight: 1.6 }}>{site.main_disclaimer}</p>
      </div>
    </div>
  );
}
