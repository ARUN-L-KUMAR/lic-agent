"use client";

import Image from "next/image";
import Link from "next/link";
import { useSiteSettings } from "@/lib/use-site-settings";

/** Large cover picture on the right side of the homepage hero (falls back to nothing if no image is set). */
export function HeroCover() {
  const site = useSiteSettings();
  const src = site.hero_image_url;
  if (!src) return null;

  return (
    <Link href="/about" aria-label={`View ${site.agent_name} profile`} className="hero-cover">
      <Image
        src={src}
        alt={`${site.agent_name}, LIC Agent`}
        fill
        priority
        sizes="(min-width: 1024px) 45vw, 100vw"
        style={{ objectFit: "cover", objectPosition: "center top" }}
      />
      {/* Blend the left edge into the hero background and darken the bottom for the caption */}
      <div className="hero-cover-fade" />
      <div className="hero-cover-caption">
        <div style={{ fontWeight: 800, fontSize: "1.375rem", color: "#fff" }}>{site.agent_name}</div>
        <div style={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.85)" }}>
          LIC Agent{site.agent_code ? ` · Agent Code ${site.agent_code}` : ""}
        </div>
        <div style={{ fontSize: "0.875rem", color: "#FFCC00", marginTop: "0.25rem", fontWeight: 600 }}>View profile →</div>
      </div>
    </Link>
  );
}
