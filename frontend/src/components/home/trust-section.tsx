"use client";

import { Users, Award, BarChart2, MapPin } from "lucide-react";
import { useSiteSettings } from "@/lib/use-site-settings";

export function TrustSection() {
  const settings = useSiteSettings();

  // Only verified values stored in the database are shown; nothing is invented.
  const stats = [
    !!settings.years_experience && { icon: Award, label: "Years of Experience", value: settings.years_experience, color: "#FFCC00" },
    !!settings.customers_served && { icon: Users, label: "Clients Served", value: settings.customers_served, color: "#3BB0FF" },
    !!settings.plans_supported && { icon: BarChart2, label: "Plans Supported", value: settings.plans_supported, color: "#34D399" },
    !!settings.service_locations && { icon: MapPin, label: "Service Locations", value: settings.service_locations, color: "#22E4FF" },
  ].filter((x): x is Exclude<typeof x, false> => x !== false);

  if (stats.length === 0) return null;

  return (
    <section style={{ padding: "1rem 0 3rem", position: "relative" }}>
      <div className="container-site">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {stats.map(({ icon: Icon, label, value, color }) => (
            <div
              key={label}
              className="card"
              style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1.25rem" }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: "var(--radius-md)",
                  background: `${color}1F`,
                  border: `1px solid ${color}4D`,
                  boxShadow: `0 0 24px -6px ${color}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={22} style={{ color }} />
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    lineHeight: 1.05,
                    marginBottom: "0.3rem",
                  }}
                >
                  {value}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
