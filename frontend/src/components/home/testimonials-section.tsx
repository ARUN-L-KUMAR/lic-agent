"use client";

import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import apiClient from "@/lib/api-client";

interface Testimonial {
  id: string;
  name: string;
  location?: string;
  content: string;
  rating: number;
  plan_name?: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          fill={i < rating ? "#FFCC00" : "none"}
          stroke={i < rating ? "#FFCC00" : "#D9E2EC"}
        />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  const { data: testimonials, isLoading } = useQuery<Testimonial[]>({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const { data } = await apiClient.get("/testimonials?is_published=true&limit=6");
      return data.items || [];
    },
    staleTime: 10 * 60 * 1000,
  });

  if (!isLoading && (!testimonials || testimonials.length === 0)) {
    return null;
  }

  return (
    <section
      className="section"
      style={{ background: "var(--surface)", borderTop: "1px solid var(--border)" }}
    >
      <div className="container-site">
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div className="section-label">Client Testimonials</div>
          <h2 className="section-title">What Clients Say</h2>
          <p
            style={{
              fontSize: "1rem",
              color: "var(--text-muted)",
              maxWidth: "500px",
              margin: "0 auto",
            }}
          >
            Real feedback from clients who have worked with the agent.
          </p>
        </div>

        {isLoading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card">
                <div style={{ padding: "1.5rem" }}>
                  <div className="skeleton" style={{ height: 14, width: "60%", marginBottom: "1rem" }} />
                  <div className="skeleton" style={{ height: 14, marginBottom: "0.5rem" }} />
                  <div className="skeleton" style={{ height: 14, marginBottom: "0.5rem" }} />
                  <div className="skeleton" style={{ height: 14, width: "80%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {testimonials?.map((t) => (
              <div key={t.id} className="card" style={{ padding: "1.75rem" }}>
                <StarRating rating={t.rating} />
                <p
                  style={{
                    fontSize: "0.9375rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.7,
                    margin: "1rem 0 1.25rem",
                    fontStyle: "italic",
                  }}
                >
                  &ldquo;{t.content}&rdquo;
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    borderTop: "1px solid var(--border)",
                    paddingTop: "1rem",
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "#004B87",
                      color: "#FFCC00",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "1rem",
                      flexShrink: 0,
                    }}
                  >
                    {t.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        fontSize: "0.9rem",
                      }}
                    >
                      {t.name}
                    </div>
                    {t.location && (
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        {t.location}
                        {t.plan_name && ` · ${t.plan_name}`}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
