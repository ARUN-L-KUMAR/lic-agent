"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Trophy } from "lucide-react";
import { GalleryShowcase } from "@/components/pages/gallery-showcase";

export function VaultSection() {
  return (
    <section className="py-14 sm:py-20 bg-gradient-to-b from-[#F2F7FC] via-white to-[#EEF5FB] border-b border-slate-200/80 relative overflow-hidden">
      {/* Ambient background accents */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-amber-100/60 rounded-full blur-3xl pointer-events-none" />

      <div className="container-site relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-amber-50 border border-amber-300 text-amber-800 shadow-sm mb-3">
            <Trophy className="w-3.5 h-3.5 text-amber-600 animate-bounce" style={{ animationDuration: "3s" }} />
            <span>Verified Career Honors & Recognition</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Achivements & Rewards
          </h2>

          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Explore authentic division trophies, national medals, and MDRT milestones
            awarded to licensed LIC Advisor <strong className="text-slate-900 font-bold">LAKSHMI NARAYANAN S</strong>.
            Click any card to flip credentials or inspect high-resolution photographs.
          </p>
        </div>

        {/* 3D Vault Grid Embed (Strictly 3D Vault mode, hero metrics & tabs hidden) */}
        <GalleryShowcase lockedViewMode="grid" hideHeroMetrics={true} hideTabs={true} />

        {/* Bottom Navigation CTA Banner */}
        <div className="mt-12 sm:mt-14 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-white border border-blue-100 shadow-lg text-center">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
            <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>Looking for the 3D Ring Orbit Carousel & 360° Studio Turntable?</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/gallery"
              style={{ color: "#FFFFFF" }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0066B3] to-[#004B87] hover:from-[#005299] hover:to-[#003866] !text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
            >
              <span style={{ color: "#FFFFFF" }}>Explore Full 3D Gallery</span>
              <ArrowRight className="w-4 h-4 text-white" style={{ color: "#FFFFFF" }} />
            </Link>

            <Link
              href="/chat"
              style={{ color: "#1e293b" }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 !text-slate-800 font-bold text-xs sm:text-sm transition-all cursor-pointer border border-slate-200"
            >
              <span style={{ color: "#1e293b" }}>Chat with Advisor</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
