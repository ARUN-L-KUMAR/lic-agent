"use client";

import Link from "next/link";
import { Calculator, TrendingUp, GraduationCap, HandCoins } from "lucide-react";

const calculators = [
  {
    icon: Calculator,
    title: "Premium Calculator",
    description: "Estimate your insurance premium based on age, sum assured, and policy term.",
    href: "/calculators/premium",
    color: "#003B73",
  },
  {
    icon: TrendingUp,
    title: "Retirement Planner",
    description: "Plan your retirement corpus with projected savings estimates.",
    href: "/calculators/retirement",
    color: "#198754",
  },
  {
    icon: GraduationCap,
    title: "Child Education Planner",
    description: "Estimate how much to save for your child's education goals.",
    href: "/calculators/child-education",
    color: "#0066B3",
  },
  {
    icon: HandCoins,
    title: "Maturity Calculator",
    description: "Get an illustrative estimate of maturity benefits.",
    href: "/calculators/maturity",
    color: "#7c3aed",
  },
];

export function CalculatorSection() {
  return (
    <section
      className="section"
      style={{ background: "#003B73" }}
    >
      <div className="container-site">
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div
            style={{
              display: "inline-block",
              fontSize: "0.8125rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#C9A227",
              marginBottom: "0.75rem",
            }}
          >
            Insurance Calculators
          </div>
          <h2
            style={{
              fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
              fontWeight: 800,
              color: "#ffffff",
              marginBottom: "0.75rem",
            }}
          >
            Plan Your Financial Future
          </h2>
          <p
            style={{
              fontSize: "1rem",
              color: "rgba(255,255,255,0.65)",
              maxWidth: "520px",
              margin: "0 auto",
            }}
          >
            Use our illustrative calculators to explore potential coverage and savings.
            Results are estimates only.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1.25rem",
            marginBottom: "2rem",
          }}
        >
          {calculators.map((calc) => (
            <Link key={calc.href} href={calc.href} style={{ textDecoration: "none" }}>
              <div
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "var(--radius-lg)",
                  padding: "1.75rem",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,162,39,0.4)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)";
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "var(--radius-md)",
                    background: "#C9A227",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <calc.icon size={22} style={{ color: "#fff" }} />
                </div>
                <h3
                  style={{
                    fontSize: "1.0625rem",
                    fontWeight: 700,
                    color: "#ffffff",
                    marginBottom: "0.5rem",
                  }}
                >
                  {calc.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "rgba(255,255,255,0.6)",
                    lineHeight: 1.6,
                  }}
                >
                  {calc.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div
          style={{
            background: "rgba(201,162,39,0.1)",
            border: "1px solid rgba(201,162,39,0.25)",
            borderRadius: "var(--radius-md)",
            padding: "0.875rem 1.25rem",
            fontSize: "0.8rem",
            color: "rgba(255,255,255,0.6)",
            textAlign: "center",
          }}
        >
          ⚠️ <strong style={{ color: "#C9A227" }}>Disclaimer:</strong>{" "}
          All calculator results are illustrative estimates only. Actual policy values depend on specific
          policy terms, underwriting, and official LIC documentation. Consult the agent for accurate information.
        </div>
      </div>
    </section>
  );
}
