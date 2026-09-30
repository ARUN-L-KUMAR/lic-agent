"use client";

import { useQuery } from "@tanstack/react-query";
import { Users, Award, BarChart2, MapPin } from "lucide-react";
import apiClient from "@/lib/api-client";

const DEFAULT_STATS = [
  { icon: Award, label: "Years of Experience", value: "10+", color: "#C9A227" },
  { icon: Users, label: "Clients Served", value: "500+", color: "#0066B3" },
  { icon: BarChart2, label: "Plans Supported", value: "30+", color: "#198754" },
  { icon: MapPin, label: "Service Locations", value: "Chennai & Nearby", color: "#003B73" },
];

export function TrustSection() {
  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data } = await apiClient.get("/site/settings");
      return data;
    },
    staleTime: 10 * 60 * 1000,
  });

  const stats = settings
    ? [
        { icon: Award, label: "Years of Experience", value: settings.years_experience || "10+", color: "#C9A227" },
        { icon: Users, label: "Clients Served", value: settings.customers_served || "500+", color: "#0066B3" },
        { icon: BarChart2, label: "Plans Supported", value: settings.plans_supported || "30+", color: "#198754" },
        { icon: MapPin, label: "Service Locations", value: settings.service_locations || "Chennai & Nearby", color: "#003B73" },
      ]
    : DEFAULT_STATS;

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
