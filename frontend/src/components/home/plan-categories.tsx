"use client";

import Link from "next/link";
import { Shield, PiggyBank, Baby, Wallet2, Heart, TrendingUp, ArrowUpRight } from "lucide-react";

const categories = [
  {
    icon: Shield,
    name: "Protection",
    description: "Term plans to protect your family's financial future",
    href: "/plans?category=Protection",
    color: "#3BB0FF",
  },
  {
    icon: PiggyBank,
    name: "Savings & Endowment",
    description: "Build wealth while staying protected with insurance",
    href: "/plans?category=Savings",
    color: "#34D399",
  },
  {
    icon: Baby,
    name: "Child Planning",
    description: "Secure your child's education and future goals",
    href: "/plans?category=Child Plans",
    color: "#22E4FF",
  },
  {
    icon: Wallet2,
    name: "Retirement & Pension",
    description: "Plan for a comfortable and financially secure retirement",
    href: "/plans?category=Pension",
    color: "#A78BFA",
  },
  {
    icon: TrendingUp,
    name: "Wealth / ULIP",
    description: "Market-linked insurance plans for wealth creation",
    href: "/plans?category=ULIP",
    color: "#FFCC00",
  },
  {
    icon: Heart,
    name: "Health",
    description: "Health and critical illness protection plans",
    href: "/plans?category=Health",
    color: "#FB7185",
  },
];

export function PlanCategoriesSection() {
  return (
    <section className="section">
      <div className="container-site">
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div className="section-label">Insurance Categories</div>
          <h2 className="section-title">Find the Right Plan for You</h2>
          <p className="section-subtitle" style={{ margin: "0 auto" }}>
            LIC offers a wide range of insurance solutions. Explore by category to find what matches your goals.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {categories.map((cat) => (
            <Link key={cat.name} href={cat.href} style={{ textDecoration: "none" }} className="reveal">
              <div className="card card-interactive" style={{ padding: "1.75rem", height: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: "var(--radius-lg)",
                      background: `${cat.color}1A`,
                      border: `1px solid ${cat.color}55`,
                      boxShadow: `0 0 28px -8px ${cat.color}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "1.25rem",
                    }}
                  >
                    <cat.icon size={26} style={{ color: cat.color }} />
                  </div>
                  <ArrowUpRight size={18} style={{ color: "var(--text-disabled)" }} />
                </div>
                <h3
                  style={{
                    fontSize: "1.1875rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    marginBottom: "0.5rem",
                  }}
                >
                  {cat.name}
                </h3>
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{cat.description}</p>
                <div
                  style={{
                    marginTop: "1.25rem",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: cat.color,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                  }}
                >
                  Explore plans →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
