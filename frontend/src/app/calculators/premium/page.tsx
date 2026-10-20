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
        <section className="page-hero">
          <div className="container-site">
            <h1>Premium Calculator</h1>
            <p>Get an illustrative estimate of your insurance premium.</p>
          </div>
        </section>
        <section style={{ padding: "3rem 0" }}>
          <div className="container-site">
            <PremiumCalculator />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
