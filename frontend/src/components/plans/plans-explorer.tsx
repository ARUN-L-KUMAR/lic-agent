"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { plansService, PlanFilters } from "@/services/plans";
import { Search, Filter, X, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import type { PlanSummary } from "@/types";

const CATEGORIES = [
  "All",
  "Protection",
  "Savings",
  "Endowment",
  "Money Back",
  "Whole Life",
  "Pension",
  "Child Plans",
  "ULIP",
  "Health",
];

const SORT_OPTIONS = [
  { label: "Display Order", value: "display_order" },
  { label: "Name A-Z", value: "name" },
  { label: "Newest First", value: "created_at" },
];

function PlanListCard({ plan }: { plan: PlanSummary }) {
  return (
    <div
      className="card"
      style={{
        padding: "1.5rem",
        display: "flex",
        gap: "1.25rem",
        alignItems: "flex-start",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-lg)";
        (e.currentTarget as HTMLElement).style.borderColor = "var(--primary-200)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)";
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
      }}
    >
      {/* Category indicator */}
      <div
        style={{
          width: 6,
          alignSelf: "stretch",
          background: "#004B87",
          borderRadius: "3px",
          flexShrink: 0,
        }}
      />

      <div style={{ flex: 1 }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            marginBottom: "0.5rem",
            alignItems: "center",
          }}
        >
          <span className="badge badge-primary">{plan.category}</span>
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
            }}
          >
            Code: {plan.plan_code}
          </span>
          {plan.is_featured && (
            <span className="badge badge-gold">Featured</span>
          )}
        </div>

        <h3
          style={{
            fontSize: "1.0625rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "0.375rem",
          }}
        >
          {plan.name}
        </h3>

        {plan.short_description && (
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--text-muted)",
              lineHeight: 1.6,
              marginBottom: "1rem",
            }}
          >
            {plan.short_description}
          </p>
        )}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1.25rem",
            marginBottom: "1rem",
          }}
        >
          {plan.minimum_entry_age !== undefined && (
            <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
              <strong style={{ color: "var(--text-secondary)" }}>Entry Age:</strong>{" "}
              {plan.minimum_entry_age}–{plan.maximum_entry_age} yrs
            </div>
          )}
          {plan.minimum_term !== undefined && (
            <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
              <strong style={{ color: "var(--text-secondary)" }}>Term:</strong>{" "}
              {plan.minimum_term}–{plan.maximum_term} yrs
            </div>
          )}
          {plan.minimum_premium !== undefined && (
            <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
              <strong style={{ color: "var(--text-secondary)" }}>Premium from:</strong>{" "}
              ₹{plan.minimum_premium.toLocaleString("en-IN")}/yr
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link href={`/plans/${plan.slug}`} className="btn btn-primary btn-sm">
            View Details
          </Link>
          <Link href={`/plans/compare?add=${plan.id}`} className="btn btn-secondary btn-sm">
            + Compare
          </Link>
        </div>
      </div>
    </div>
  );
}

export function PlansExplorer() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("display_order");
  const [page, setPage] = useState(1);

  const filters: PlanFilters = {
    page,
    per_page: 12,
    search: search || undefined,
    category: category === "All" ? undefined : category,
    status: "PUBLISHED",
    sort_by: sortBy,
  };

  const { data, isLoading } = useQuery({
    queryKey: ["plans", filters],
    queryFn: () => plansService.list(filters),
    staleTime: 2 * 60 * 1000,
  });

  return (
    <section style={{ padding: "2.5rem 0" }}>
      <div className="container-site">
        {/* Filters */}
        <div
          className="card"
          style={{
            padding: "1.25rem 1.5rem",
            marginBottom: "1.5rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            alignItems: "center",
          }}
        >
          {/* Search */}
          <div style={{ position: "relative", flex: "1 1 280px" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "0.875rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            />
            <input
              type="text"
              placeholder="Search plans..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="form-input"
              style={{ paddingLeft: "2.5rem" }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="form-input"
            style={{ flex: "0 1 auto", width: "auto" }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Category tabs */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
            marginBottom: "1.5rem",
          }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setPage(1); }}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "100px",
                border: "1.5px solid",
                fontSize: "0.875rem",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.15s ease",
                background: category === cat ? "#004B87" : "var(--surface)",
                borderColor: category === cat ? "#004B87" : "var(--border)",
                color: category === cat ? "#fff" : "var(--text-secondary)",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results */}
        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 140, borderRadius: "var(--radius-lg)" }} />
            ))}
          </div>
        ) : data && data.items.length > 0 ? (
          <>
            <div
              style={{
                fontSize: "0.875rem",
                color: "var(--text-muted)",
                marginBottom: "1rem",
              }}
            >
              Showing {data.items.length} of {data.total} plans
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {data.items.map((plan) => (
                <PlanListCard key={plan.id} plan={plan} />
              ))}
            </div>

            {/* Pagination */}
            {data.pages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "0.5rem",
                  marginTop: "2rem",
                }}
              >
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <span
                  style={{
                    padding: "0.5rem 1rem",
                    fontSize: "0.875rem",
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  Page {page} of {data.pages}
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                  disabled={page === data.pages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "4rem 2rem",
              background: "var(--surface)",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--border)",
            }}
          >
            <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
              {search || category !== "All"
                ? "No plans match your current filters."
                : "No plans available at this time. Please contact the agent."}
            </p>
            {(search || category !== "All") && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => { setSearch(""); setCategory("All"); }}
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Disclaimer */}
        <div className="disclaimer-box" style={{ marginTop: "2rem" }}>
          <strong>Disclaimer:</strong> Plan information is for general reference only. Insurance products
          and benefits are subject to the terms, conditions, exclusions, and rules applicable to the
          specific policy. Please refer to official LIC policy documents for complete and accurate details.
        </div>
      </div>
    </section>
  );
}
