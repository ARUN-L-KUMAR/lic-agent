import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/home/hero-section";
import { VaultSection } from "@/components/home/vault-section";
import { TrustSection } from "@/components/home/trust-section";
import { PlanCategoriesSection } from "@/components/home/plan-categories";
import { FeaturedPlansSection } from "@/components/home/featured-plans";
import { CalculatorSection } from "@/components/home/calculator-section";
import { WhyChooseSection } from "@/components/home/why-choose";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { FaqSection } from "@/components/home/faq-section";
import { CtaSection } from "@/components/home/cta-section";

export const metadata: Metadata = {
  title: "Plan Today. Protect Tomorrow.",
  description:
    "Expert guidance on LIC insurance plans. Explore term insurance, endowment plans, pension plans, child plans, and more. Connect with LAKSHMI NARAYANAN S, LIC agent in Ranipet, Vellore.",
  openGraph: {
    title: "Plan Today. Protect Tomorrow.",
    description: "Insurance guidance from an LIC agent. Explore, compare, and understand LIC plans.",
  },
};

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <TrustSection />
        <VaultSection />
        <PlanCategoriesSection />
        <FeaturedPlansSection />
        <CalculatorSection />
        <WhyChooseSection />
        <TestimonialsSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
