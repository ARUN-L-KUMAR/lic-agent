"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Trophy } from "lucide-react";
import { GalleryShowcase } from "@/components/pages/gallery-showcase";

export function VaultSection() {
  return (
    <section className="section relative overflow-hidden">
      {/* Ambient accents */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(59,176,255,0.2), transparent 70%)" }}
      />
      <div
        className="absolute top-1/3 -right-32 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(255,204,0,0.14), transparent 70%)" }}
      />

      <div className="container-site relative z-10">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="pill" style={{ color: "var(--secondary)", borderColor: "rgba(255,204,0,0.35)", background: "rgba(255,204,0,0.08)" }}>
            <Trophy className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider text-xs font-bold">Verified Career Honors &amp; Recognition</span>
          </div>

          <h2 className="section-title" style={{ fontSize: "clamp(2rem, 4.4vw, 3.4rem)", marginTop: "1rem" }}>
            Achievements <span className="text-gradient-gold">&amp; Rewards</span>
          </h2>

          <p className="mt-3 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto" style={{ color: "var(--text-muted)" }}>
            Explore authentic division trophies, national medals, and MDRT milestones awarded to licensed LIC Advisor{" "}
            <strong style={{ color: "var(--text-primary)" }}>LAKSHMI NARAYANAN S</strong>. Click any card to flip
            credentials or inspect high-resolution photographs.
          </p>
        </div>

        {/* 3D Vault Grid Embed (Strictly 3D Vault mode, hero metrics & tabs hidden) */}
        <GalleryShowcase lockedViewMode="grid" hideHeroMetrics={true} hideTabs={true} />

        {/* Bottom navigation CTA */}
        <div className="card mt-12 sm:mt-14 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 p-4 sm:p-5 text-center" style={{ borderRadius: "var(--radius-xl)" }}>
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
            <Sparkles className="w-4 h-4 flex-shrink-0" style={{ color: "var(--secondary)" }} />
            <span>Looking for the 3D Ring Orbit Carousel &amp; 360° Studio Turntable?</span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/gallery" className="btn btn-primary btn-sm">
              Explore Full 3D Gallery
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/chat" className="btn btn-secondary btn-sm">
              Chat with Advisor
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
