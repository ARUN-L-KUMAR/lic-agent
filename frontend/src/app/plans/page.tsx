import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PlansExplorer } from "@/components/plans/plans-explorer";

export const metadata: Metadata = {
  title: "LIC Insurance Plans — Explore & Compare",
  description:
    "Browse all LIC insurance plans. Filter by category, age, premium, and purpose. Compare plans side by side.",
};

export default function PlansPage() {
  return (
    <>
      <Header />
      <main>
        <section
          style={{
            background: "#004B87",
            padding: "3rem 0 2rem",
            color: "#fff",
          }}
        >
          <div className="container-site">
            <h1
              style={{
                fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                fontWeight: 800,
                color: "#fff",
                marginBottom: "0.5rem",
              }}
            >
              LIC Insurance Plans
            </h1>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1rem" }}>
              Explore the complete range of plans. Filter, compare, and save plans of interest.
            </p>
            <div
              style={{
                marginTop: "1rem",
                padding: "0.75rem 1.125rem",
                background: "rgba(201,162,39,0.1)",
                border: "1px solid rgba(201,162,39,0.25)",
                borderRadius: "var(--radius-md)",
                fontSize: "0.8125rem",
                color: "rgba(255,255,255,0.65)",
                display: "inline-block",
              }}
            >
              ⚠️ Plan information is for general understanding only. Always refer to official LIC policy documents.
            </div>
          </div>
        </section>
        <PlansExplorer />
      </main>
      <Footer />
    </>
  );
}
