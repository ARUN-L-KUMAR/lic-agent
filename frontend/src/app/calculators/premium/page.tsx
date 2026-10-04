import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PremiumCalculator } from "@/components/calculators/premium-calculator";

export const metadata: Metadata = {
  title: "LIC Premium Calculator — Illustrative Estimate",
  description:
    "Use our illustrative premium calculator to estimate LIC insurance premiums. Results are for reference only.",
};

export default function PremiumCalculatorPage() {
  return (
    <>
      <Header />
      <main>
        <section
          style={{ background: "#004B87", padding: "3rem 0 2rem", color: "#fff" }}
        >
          <div className="container-site">
            <h1 style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 800, color: "#fff", marginBottom: "0.5rem" }}>
              Premium Calculator
            </h1>
            <p style={{ color: "rgba(255,255,255,0.7)" }}>
              Get an illustrative estimate of your insurance premium.
            </p>
          </div>
        </section>
        <section style={{ padding: "3rem 0", background: "var(--bg)" }}>
          <div className="container-site">
            <PremiumCalculator />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
