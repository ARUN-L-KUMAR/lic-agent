"use client";

import { useQuery } from "@tanstack/react-query";
import { plansService } from "@/services/plans";
import Link from "next/link";
import {
  CheckCircle, AlertCircle, Calendar, IndianRupee,
  FileText, ArrowLeft, Phone, BookOpen,
} from "lucide-react";
import type { Plan } from "@/types";

export function PlanDetail({ slug }: { slug: string }) {
  const { data: plan, isLoading, error } = useQuery({
    queryKey: ["plan", slug],
    queryFn: () => plansService.getBySlug(slug),
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="container-site" style={{ padding: "3rem 1.5rem" }}>
        <div className="skeleton" style={{ height: 60, marginBottom: "1.5rem" }} />
        <div className="skeleton" style={{ height: 200, marginBottom: "1rem" }} />
        <div className="skeleton" style={{ height: 300 }} />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="container-site" style={{ padding: "3rem 1.5rem", textAlign: "center" }}>
        <AlertCircle size={48} style={{ color: "var(--text-muted)", marginBottom: "1rem" }} />
        <h2 style={{ marginBottom: "0.75rem" }}>Plan Not Found</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
          The plan you&apos;re looking for is not available.
        </p>
        <Link href="/plans" className="btn btn-primary">
          <ArrowLeft size={16} /> Back to Plans
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <div style={{ background: "#003B73", padding: "2.5rem 0", color: "#fff" }}>
        <div className="container-site">
          <Link
            href="/plans"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              color: "rgba(255,255,255,0.6)",
              fontSize: "0.875rem",
              textDecoration: "none",
              marginBottom: "1.25rem",
            }}
          >
            <ArrowLeft size={14} /> All Plans
          </Link>
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <span className="badge badge-gold">{plan.category}</span>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8125rem" }}>
              Code: {plan.plan_code}
            </span>
          </div>
          <h1 style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 800, color: "#fff", marginBottom: "0.75rem" }}>
            {plan.name}
          </h1>
          {plan.short_description && (
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1.0625rem", maxWidth: "620px", lineHeight: 1.6 }}>
              {plan.short_description}
            </p>
          )}
        </div>
      </div>

      <div className="container-site" style={{ padding: "2.5rem 1.5rem" }}>
        {/* Data verification notice */}
        {plan.data_status !== "verified" && (
          <div
            className="disclaimer-box"
            style={{ marginBottom: "1.5rem", display: "flex", gap: "0.5rem", alignItems: "flex-start" }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "1px" }} />
            <span>
              This plan information is <strong>pending verification</strong> against official LIC sources.
              Please verify all details from official LIC policy documents before making decisions.
              {plan.official_reference && (
                <>
                  {" "}
                  Reference:{" "}
                  <a
                    href={plan.official_reference}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#78350f" }}
                  >
                    Official Source
                  </a>
                </>
              )}
            </span>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem", alignItems: "start" }}>
          {/* Main content */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Key eligibility */}
            <div className="card" style={{ padding: "1.75rem" }}>
              <h2 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Calendar size={18} style={{ color: "#003B73" }} />
                Eligibility Overview
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "1rem" }}>
                {[
                  { label: "Entry Age", value: plan.minimum_entry_age !== undefined ? `${plan.minimum_entry_age}–${plan.maximum_entry_age} years` : "Contact agent" },
                  { label: "Policy Term", value: plan.minimum_term !== undefined ? `${plan.minimum_term}–${plan.maximum_term} years` : "Contact agent" },
                  { label: "Premium Frequency", value: plan.premium_frequency?.join(", ") || "Contact agent" },
                  { label: "Min Sum Assured", value: plan.minimum_sum_assured ? `₹${plan.minimum_sum_assured.toLocaleString("en-IN")}` : "Contact agent" },
                ].map(({ label, value }) => (
                  <div key={label} style={{ padding: "1rem", background: "var(--bg)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>{label}</div>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)" }}>{value}</div>
                  </div>
                ))}
              </div>
              {plan.eligibility && (
                <div style={{ marginTop: "1rem", fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>
                  {plan.eligibility}
                </div>
              )}
            </div>

            {/* Benefits sections */}
            {[
              { title: "Death Benefits", content: plan.death_benefits, icon: "🛡️" },
              { title: "Maturity Benefits", content: plan.maturity_benefits, icon: "💰" },
              { title: "Survival Benefits", content: plan.survival_benefits, icon: "✅" },
              { title: "Tax Benefits", content: plan.tax_benefits, icon: "📋" },
            ].filter(s => s.content).map(({ title, content, icon }) => (
              <div key={title} className="card" style={{ padding: "1.75rem" }}>
                <h2 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1rem" }}>
                  {icon} {title}
                </h2>
                <p style={{ fontSize: "0.9375rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>
                  {content}
                </p>
              </div>
            ))}

            {/* Features */}
            {plan.features && plan.features.length > 0 && (
              <div className="card" style={{ padding: "1.75rem" }}>
                <h2 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1.25rem" }}>Key Features</h2>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                  {plan.features.map((feat: any, i: number) => (
                    <li key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                      <CheckCircle size={17} style={{ color: "#198754", flexShrink: 0, marginTop: "2px" }} />
                      <span style={{ fontSize: "0.9375rem", color: "var(--text-secondary)" }}>
                        {typeof feat === "string" ? feat : feat.text || feat.feature || ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Documents required */}
            {plan.documents_required && plan.documents_required.length > 0 && (
              <div className="card" style={{ padding: "1.75rem" }}>
                <h2 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1.25rem", display: "flex", gap: "0.5rem" }}>
                  <FileText size={18} style={{ color: "#003B73" }} /> Documents Required
                </h2>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {plan.documents_required.map((doc, i) => (
                    <li key={i} style={{ display: "flex", gap: "0.625rem", alignItems: "flex-start", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                      <span style={{ color: "var(--text-muted)", marginTop: "2px" }}>•</span>
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Exclusions */}
            {plan.exclusions && (
              <div className="card" style={{ padding: "1.75rem" }}>
                <h2 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1rem", color: "var(--danger)" }}>
                  ⚠️ Exclusions
                </h2>
                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>
                  {plan.exclusions}
                </p>
              </div>
            )}

            {/* Main disclaimer */}
            <div className="disclaimer-box">
              <strong>Important Disclaimer:</strong> The information on this page is for general educational 
              purposes only. It may not reflect the most current policy terms. Premium amounts, benefits, 
              and eligibility are subject to the specific policy terms, conditions, exclusions, and rules 
              as defined in the official LIC policy document. Please refer to the official policy document 
              and consult the agent before making any insurance decisions.
              {plan.last_verified_date && (
                <div style={{ marginTop: "0.5rem", fontSize: "0.75rem" }}>
                  Last verified: {new Date(plan.last_verified_date).toLocaleDateString("en-IN")}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", position: "sticky", top: "80px" }}>
            <div className="card" style={{ padding: "1.75rem", borderTop: "4px solid #003B73" }}>
              <h3 style={{ fontWeight: 700, marginBottom: "1rem" }}>Enquire About This Plan</h3>
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "1.5rem", lineHeight: 1.6 }}>
                Get accurate details, premium quotes, and personalized advice from the agent.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <Link href="/chat" className="btn btn-primary" style={{ justifyContent: "center" }}>
                  Chat with Agent
                </Link>
                <a href="tel:+919876543210" className="btn btn-secondary" style={{ justifyContent: "center" }}>
                  <Phone size={16} /> Call Agent
                </a>
                <Link href="/calculators/premium" className="btn btn-ghost" style={{ justifyContent: "center" }}>
                  <IndianRupee size={15} /> Estimate Premium
                </Link>
              </div>
            </div>

            {plan.faq && plan.faq.length > 0 && (
              <div className="card" style={{ padding: "1.5rem" }}>
                <h4 style={{ fontWeight: 700, marginBottom: "1rem", display: "flex", gap: "0.5rem" }}>
                  <BookOpen size={16} style={{ color: "#003B73" }} /> FAQs
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                  {(plan.faq as any[]).slice(0, 3).map((item: any, i: number) => (
                    <div key={i}>
                      <div style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.25rem" }}>{item.question}</div>
                      <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{item.answer}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          div[style*="grid-template-columns: 2fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
