"use client";

import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, MapPin } from "lucide-react";
import { useSiteSettings } from "@/lib/use-site-settings";

/** Holographic portrait panel on the right of the homepage hero (renders nothing if no image is set). */
export function HeroCover() {
  const site = useSiteSettings();
  const src = site.hero_image_url;
  if (!src) return null;

  return (
    <div className="hero-visual rise rise-3">
      <div className="hero-ring" aria-hidden="true" />

      {site.agent_code && (
        <div className="float-chip" style={{ top: "9%", left: "-9%" }}>
          <BadgeCheck size={16} style={{ color: "var(--cyan)" }} />
          Agent Code {site.agent_code}
        </div>
      )}
      {site.service_locations && (
        <div className="float-chip" style={{ bottom: "20%", right: "-7%", animationDelay: "-3s" }}>
          <MapPin size={16} style={{ color: "var(--secondary)" }} />
          {site.service_locations}
        </div>
      )}

      <div className="hud-frame">
        <Link href="/about" aria-label={`View ${site.agent_name} profile`} className="hero-portrait">
          <Image
            src={src}
            alt={`${site.agent_name}, LIC Agent`}
            fill
            priority
            sizes="(min-width: 1024px) 430px, 90vw"
            style={{ objectFit: "cover", objectPosition: "center top" }}
          />
          <div className="hero-portrait-fade" />
          <div className="hero-portrait-scan" aria-hidden="true" />
          <div className="hero-portrait-caption">
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.375rem", color: "#fff" }}>
              {site.agent_name}
            </div>
            <div style={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.8)" }}>
              LIC Agent{site.agent_code ? ` · Agent Code ${site.agent_code}` : ""}
            </div>
            <div style={{ fontSize: "0.875rem", color: "var(--secondary)", marginTop: "0.25rem", fontWeight: 600 }}>
              View profile →
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
