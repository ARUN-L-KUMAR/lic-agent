"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { plansService } from "@/services/plans";
import { ArrowRight, Clock, IndianRupee } from "lucide-react";
import type { Plan } from "@/types";

function PlanCard({ plan }: { plan: Plan }) {
  const categoryColors: Record<string, string> = {
    Protection: "#004B87",
    Savings: "#198754",
    Endowment: "#0066B3",
    "Money Back": "#7c3aed",
    "Whole Life": "#0066B3",
    Pension: "#7c3aed",
    "Child Plans": "#0066B3",
    ULIP: "#FFCC00",
    Health: "#D92D20",
    "Micro Insurance": "#667085",
  };
  const color = categoryColors[plan.category] || "#004B87";

  return (
    <div className="plan-card">
      {/* Category bar */}
      <div
        style={{
          background: color,
          padding: "0.875rem 1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "rgba(255,255,255,0.8)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {plan.category}
        </span>
        <span
          style={{
            fontSize: "0.75rem",
            color: "rgba(255,255,255,0.6)",
            fontWeight: 500,
          }}
        >
          {plan.plan_code}
        </span>
      </div>

      <div style={{ padding: "1.5rem" }}>
        <h3
          style={{
            fontSize: "1.0625rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "0.5rem",
            lineHeight: 1.3,
          }}
        >
          {plan.name}
        </h3>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--text-muted)",
            lineHeight: 1.6,
            marginBottom: "1.25rem",
          }}
        >
          {plan.short_description || "Explore this LIC insurance plan for complete details."}
        </p>

        {/* Meta */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            marginBottom: "1.25rem",
          }}
        >
          {plan.minimum_entry_age !== undefined && plan.maximum_entry_age !== undefined && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                fontSize: "0.8125rem",
                color: "var(--text-muted)",
                background: "var(--bg)",
                padding: "0.375rem 0.75rem",
                borderRadius: "100px",
              }}
            >
              Age: {plan.minimum_entry_age}–{plan.maximum_entry_age} yrs
            </div>
          )}
          {plan.minimum_term !== undefined && plan.maximum_term !== undefined && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                fontSize: "0.8125rem",
                color: "var(--text-muted)",
                background: "var(--bg)",
                padding: "0.375rem 0.75rem",
                borderRadius: "100px",
              }}
            >
              <Clock size={12} />
              {plan.minimum_term}–{plan.maximum_term} yrs
            </div>
          )}
          {plan.minimum_premium !== undefined && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                fontSize: "0.8125rem",
                color: "var(--text-muted)",
                background: "var(--bg)",
                padding: "0.375rem 0.75rem",
                borderRadius: "100px",
              }}
            >
              <IndianRupee size={12} />
              From ₹{plan.minimum_premium.toLocaleString("en-IN")}/yr
            </div>
          )}
        </div>

        {/* Features preview */}
        {plan.features && plan.features.length > 0 && (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: "0 0 1.25rem 0",
              display: "flex",
              flexDirection: "column",
              gap: "0.375rem",
            }}
          >
            {plan.features.slice(0, 3).map((feat: any, i: number) => (
              <li
                key={i}
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--text-secondary)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.5rem",
                }}
              >
                <span style={{ color: "#198754", marginTop: "2px", flexShrink: 0 }}>✓</span>
                {typeof feat === "string" ? feat : feat.text || feat.feature || ""}
              </li>
            ))}
          </ul>
        )}

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link
            href={`/plans/${plan.slug}`}
            className="btn btn-primary btn-sm"
            style={{ flex: 1, justifyContent: "center" }}
          >
            View Details
          </Link>
          <Link
            href={`/plans?compare=${plan.id}`}
            className="btn btn-secondary btn-sm"
            style={{ flexShrink: 0 }}
          >
            Compare
          </Link>
        </div>
      </div>

      {/* Disclaimer */}
      <div
        style={{
          padding: "0.625rem 1.25rem",
          background: "var(--bg)",
          borderTop: "1px solid var(--border)",
          fontSize: "0.7rem",
          color: "var(--text-muted)",
          borderRadius: "0 0 var(--radius-lg) var(--radius-lg)",
        }}
      >
        Subject to policy terms. Consult agent for complete details.
      </div>
    </div>
  );
}

function PlanCardSkeleton() {
  return (
    <div className="plan-card">
      <div className="skeleton" style={{ height: 52, borderRadius: 0 }} />
      <div style={{ padding: "1.5rem" }}>
        <div className="skeleton" style={{ height: 22, width: "80%", marginBottom: "0.75rem" }} />
        <div className="skeleton" style={{ height: 14, marginBottom: "0.375rem" }} />
        <div className="skeleton" style={{ height: 14, width: "70%", marginBottom: "1.25rem" }} />
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
          <div className="skeleton" style={{ height: 28, width: 100, borderRadius: "100px" }} />
          <div className="skeleton" style={{ height: 28, width: 80, borderRadius: "100px" }} />
        </div>
        <div className="skeleton" style={{ height: 36, borderRadius: "var(--radius-md)" }} />
      </div>
    </div>
  );
}

export function FeaturedPlansSection() {
  const { data: plans, isLoading } = useQuery({
    queryKey: ["featured-plans"],
    queryFn: () => plansService.getFeatured(6),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <section
      className="section"
      style={{ background: "var(--surface)", borderTop: "1px solid var(--border)" }}
    >
      <div className="container-site">
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "2.5rem",
          }}
        >
          <div>
            <div className="section-label">Featured Plans</div>
            <h2 className="section-title">Popular LIC Insurance Plans</h2>
            <p
              style={{
                fontSize: "1rem",
                color: "var(--text-muted)",
                marginTop: "0.5rem",
              }}
            >
              Explore commonly enquired insurance plans.
            </p>
          </div>
          <Link href="/plans" className="btn btn-secondary btn-sm">
            View All Plans <ArrowRight size={16} />
          </Link>
        </div>

        {isLoading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <PlanCardSkeleton key={i} />
            ))}
          </div>
        ) : plans && plans.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {(plans as Plan[]).map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "4rem 2rem",
              background: "var(--bg)",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--border)",
            }}
          >
            <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
              No featured plans available yet. Contact the agent for plan information.
            </p>
            <Link href="/contact" className="btn btn-primary btn-sm">
              Contact Agent
            </Link>
          </div>
        )}

        {/* Disclaimer */}
        <div className="disclaimer-box" style={{ marginTop: "2rem" }}>
          <strong>Important:</strong> Insurance products and benefits are subject to the terms,
          conditions, exclusions, and rules applicable to the policy. Please refer to the official
          LIC policy documents for complete details. The above information is for general reference only.
        </div>
      </div>
    </section>
  );
}
