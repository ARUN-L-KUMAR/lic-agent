"use client";

import Link from "next/link";
import { MessageCircle, ArrowRight, Sparkles } from "lucide-react";
import { HeroCover } from "@/components/home/hero-cover";
import { useSiteSettings } from "@/lib/use-site-settings";

const TAGS = ["Term Insurance", "Child Plans", "Pension Plans", "Endowment", "Tax Benefits"];

export function HeroSection() {
  const site = useSiteSettings();

  // Only verified values stored in the database are shown; nothing is invented.
  const stats = [
    { label: "LIC Agent", value: site.agent_name },
    site.years_experience && { label: "Experience", value: `${site.years_experience} Years` },
    site.customers_served && { label: "Clients Served", value: site.customers_served },
  ].filter((x): x is { label: string; value: string } => Boolean(x));

  return (
    <section className="hero">
      <div className="hero-floor" aria-hidden="true" />

      <div className="container-site" style={{ position: "relative" }}>
        <div className="hero-layout">
          <div>
            <div className="rise rise-1">
              <span className="pill">
                <span className="pulse-dot" />
                LIC Agent — {site.service_locations || site.office_address}
              </span>
            </div>

            <h1 className="rise rise-2">
              Plan Today.
              <br />
              <span className="text-gradient">Protect</span> Tomorrow.
            </h1>

            <p className="hero-lead rise rise-3">
              Expert guidance on LIC insurance plans for financial protection, family security, child education
              planning, and retirement. Connect with a licensed advisor for personalized support.
            </p>

            <div className="hero-tags rise rise-3">
              {TAGS.map((tag) => (
                <span key={tag} className="hero-tag">
                  <Sparkles size={12} style={{ color: "var(--secondary)" }} />
                  {tag}
                </span>
              ))}
            </div>

            <div className="rise rise-4" style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
              <Link href="/chat" className="btn btn-gold btn-lg">
                <MessageCircle size={18} />
                Talk to an LIC Advisor
              </Link>
              <Link href="/plans" className="btn btn-secondary btn-lg">
                Explore Plans
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="hero-stats rise rise-5">
              {stats.map(({ label, value }) => (
                <div key={label}>
                  <div className="hero-stat-value">{value}</div>
                  <div className="hero-stat-label">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <HeroCover />
        </div>
      </div>
    </section>
  );
}
