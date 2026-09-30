"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { IndianRupee, Calculator, Info } from "lucide-react";

const schema = z.object({
  age: z.number({ required_error: "Age is required" }).int().min(1).max(70),
  sum_assured: z.number({ required_error: "Sum assured is required" }).min(50000),
  policy_term: z.number({ required_error: "Policy term is required" }).int().min(5).max(40),
  premium_frequency: z.enum(["Annual", "Semi-Annual", "Quarterly", "Monthly"]),
});

type FormData = z.infer<typeof schema>;

interface CalcResult {
  estimated_annual_premium: number;
  estimated_premium_per_frequency: number;
  premium_frequency: string;
  sum_assured: number;
  policy_term: number;
  note: string;
}

export function PremiumCalculator() {
  const [result, setResult] = useState<CalcResult | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      premium_frequency: "Annual",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: FormData) => {
      const { data: res } = await apiClient.post("/calculators/premium", data);
      return res as CalcResult;
    },
    onSuccess: (data) => setResult(data),
  });

  const frequencyLabels: Record<string, string> = {
    Annual: "/year",
    "Semi-Annual": "/half-year",
    Quarterly: "/quarter",
    Monthly: "/month",
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "2rem",
        alignItems: "start",
        maxWidth: "900px",
      }}
    >
      {/* Form */}
      <div className="card" style={{ padding: "2rem" }}>
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Calculator size={20} style={{ color: "#003B73" }} />
          Calculate Premium
        </h2>

        <form onSubmit={handleSubmit((data) => mutate(data))}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="age">
                Your Age <span className="required">*</span>
              </label>
              <input
                id="age"
                type="number"
                className={`form-input ${errors.age ? "error" : ""}`}
                placeholder="e.g. 30"
                {...register("age", { valueAsNumber: true })}
              />
              {errors.age && <span className="form-error">{errors.age.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="sum_assured">
                Sum Assured (₹) <span className="required">*</span>
              </label>
              <input
                id="sum_assured"
                type="number"
                className={`form-input ${errors.sum_assured ? "error" : ""}`}
                placeholder="e.g. 1000000"
                step={10000}
                {...register("sum_assured", { valueAsNumber: true })}
              />
              {errors.sum_assured && (
                <span className="form-error">{errors.sum_assured.message}</span>
              )}
              {watch("sum_assured") && (
                <span className="form-hint">
                  ₹{(watch("sum_assured") || 0).toLocaleString("en-IN")}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="policy_term">
                Policy Term (Years) <span className="required">*</span>
              </label>
              <input
                id="policy_term"
                type="number"
                className={`form-input ${errors.policy_term ? "error" : ""}`}
                placeholder="e.g. 20"
                {...register("policy_term", { valueAsNumber: true })}
              />
              {errors.policy_term && (
                <span className="form-error">{errors.policy_term.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="premium_frequency">
                Premium Frequency
              </label>
              <select
                id="premium_frequency"
                className="form-input"
                {...register("premium_frequency")}
              >
                <option value="Annual">Annual</option>
                <option value="Semi-Annual">Semi-Annual</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ justifyContent: "center" }}
              disabled={isPending}
            >
              {isPending ? "Calculating..." : "Calculate Premium"}
            </button>
          </div>
        </form>
      </div>

      {/* Result */}
      <div>
        {result ? (
          <div className="card" style={{ padding: "2rem" }}>
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: "1.5rem",
              }}
            >
              Illustrative Estimate
            </h3>

            <div
              style={{
                background: "#003B73",
                borderRadius: "var(--radius-lg)",
                padding: "1.75rem",
                marginBottom: "1.5rem",
                textAlign: "center",
              }}
            >
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.875rem", marginBottom: "0.375rem" }}>
                Estimated Annual Premium
              </div>
              <div
                style={{
                  fontSize: "2.25rem",
                  fontWeight: 800,
                  color: "#C9A227",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.25rem",
                }}
              >
                <IndianRupee size={28} />
                {result.estimated_annual_premium.toLocaleString("en-IN")}
              </div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", marginTop: "0.375rem" }}>
                per year (illustrative)
              </div>
            </div>

            {result.premium_frequency !== "Annual" && (
              <div
                style={{
                  padding: "1rem",
                  background: "var(--bg)",
                  borderRadius: "var(--radius-md)",
                  marginBottom: "1rem",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                  Estimated {result.premium_frequency} Premium
                </div>
                <div style={{ fontSize: "1.375rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  ₹{result.estimated_premium_per_frequency.toLocaleString("en-IN")}
                  <span style={{ fontSize: "0.875rem", fontWeight: 400, color: "var(--text-muted)" }}>
                    {frequencyLabels[result.premium_frequency]}
                  </span>
                </div>
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
                marginBottom: "1.5rem",
              }}
            >
              {[
                { label: "Sum Assured", value: `₹${result.sum_assured.toLocaleString("en-IN")}` },
                { label: "Policy Term", value: `${result.policy_term} years` },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    padding: "0.875rem",
                    background: "var(--bg)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{label}</div>
                  <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9375rem" }}>{value}</div>
                </div>
              ))}
            </div>

            <div className="disclaimer-box">
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                <Info size={14} style={{ flexShrink: 0, marginTop: "1px" }} />
                <span>
                  <strong>Illustrative estimate only.</strong> Actual premium depends on specific
                  policy terms, underwriting, applicable riders, and official LIC documentation.
                  Contact the agent for an accurate quote.
                </span>
              </div>
            </div>

            <div style={{ marginTop: "1.25rem" }}>
              <a href="/contact" className="btn btn-primary" style={{ display: "inline-flex", width: "100%", justifyContent: "center" }}>
                Get Accurate Quote from Agent
              </a>
            </div>
          </div>
        ) : (
          <div
            className="card"
            style={{
              padding: "2.5rem",
              textAlign: "center",
              border: "2px dashed var(--border)",
            }}
          >
            <Calculator size={48} style={{ color: "var(--border)", marginBottom: "1rem" }} />
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-muted)" }}>
              Fill in the details to see an estimate
            </h3>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
              Results are illustrative only
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @media (max-width: 700px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
