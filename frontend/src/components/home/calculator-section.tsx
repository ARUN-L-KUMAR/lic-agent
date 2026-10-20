"use client";

import Link from "next/link";
import { Calculator, TrendingUp, GraduationCap, HandCoins } from "lucide-react";

const calculators = [
  {
    icon: Calculator,
    title: "Premium Calculator",
    description: "Estimate your insurance premium based on age, sum assured, and policy term.",
    href: "/calculators/premium",
    color: "#3BB0FF",
  },
  {
    icon: TrendingUp,
    title: "Retirement Planner",
    description: "Plan your retirement corpus with projected savings estimates.",
    href: "/calculators/retirement",
    color: "#34D399",
  },
  {
    icon: GraduationCap,
    title: "Child Education Planner",
    description: "Estimate how much to save for your child's education goals.",
    href: "/calculators/child-education",
    color: "#22E4FF",
  },
  {
    icon: HandCoins,
    title: "Maturity Calculator",
    description: "Get an illustrative estimate of maturity benefits.",
    href: "/calculators/maturity",
    color: "#A78BFA",
  },
];

export function CalculatorSection() {
  return (
    <section
      className="section"
      style={{
        background:
          "linear-gradient(180deg, transparent, rgba(59,176,255,0.06) 20%, rgba(59,176,255,0.06) 80%, transparent)",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="container-site">
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div className="section-label">Insurance Calculators</div>
          <h2 className="section-title">
            Plan Your <span className="text-gradient">Financial Future</span>
          </h2>
          <p className="section-subtitle" style={{ margin: "0 auto" }}>
            Use our illustrative calculators to explore potential coverage and savings. Results are estimates only.
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
            <Link key={calc.href} href={calc.href} style={{ textDecoration: "none" }} className="reveal">
              <div className="card card-interactive" style={{ padding: "1.75rem", height: "100%" }}>
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: "var(--radius-md)",
                    background: `linear-gradient(135deg, ${calc.color}33, ${calc.color}0D)`,
                    border: `1px solid ${calc.color}66`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1.1rem",
                  }}
                >
                  <calc.icon size={22} style={{ color: calc.color }} />
                </div>
                <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                  {calc.title}
                </h3>
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{calc.description}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="disclaimer-box" style={{ textAlign: "center" }}>
          ⚠️ <strong>Disclaimer:</strong> All calculator results are illustrative estimates only. Actual policy values
          depend on specific policy terms, underwriting, and official LIC documentation. Consult the agent for accurate
          information.
        </div>
      </div>
    </section>
  );
}
