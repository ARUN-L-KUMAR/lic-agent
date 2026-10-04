"use client";

import { Users, Award, BarChart2, MapPin } from "lucide-react";
import { useSiteSettings } from "@/lib/use-site-settings";

export function TrustSection() {
  const settings = useSiteSettings();

  // Only verified values stored in the database are shown; nothing is invented.
  const stats = [
    !!settings.years_experience && { icon: Award, label: "Years of Experience", value: settings.years_experience, color: "#FFCC00" },
    !!settings.customers_served && { icon: Users, label: "Clients Served", value: settings.customers_served, color: "#0066B3" },
    !!settings.plans_supported && { icon: BarChart2, label: "Plans Supported", value: settings.plans_supported, color: "#198754" },
    !!settings.service_locations && { icon: MapPin, label: "Service Locations", value: settings.service_locations, color: "#004B87" },
  ].filter((x): x is Exclude<typeof x, false> => x !== false);

  if (stats.length === 0) return null;

  return (
    <section
      style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        padding: "2.5rem 0",
      }}
    >
      <div className="container-site">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "2rem",
          }}
        >
          {stats.map(({ icon: Icon, label, value, color }) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: "1.25rem",
                background: "var(--bg)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "var(--radius-md)",
                  background: `${color}15`,
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
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    lineHeight: 1,
                    marginBottom: "0.25rem",
                  }}
                >
                  {value}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>
                  {label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
