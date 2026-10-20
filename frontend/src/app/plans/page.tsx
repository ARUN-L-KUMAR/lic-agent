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
        <section className="page-hero">
          <div className="container-site">
            <h1>LIC Insurance Plans</h1>
            <p>Explore the complete range of plans. Filter, compare, and save plans of interest.</p>
            <div className="disclaimer-box" style={{ marginTop: "1rem", display: "inline-block" }}>
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
