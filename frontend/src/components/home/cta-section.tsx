"use client";

import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";

export function CtaSection() {
  return (
    <section style={{ padding: "4rem 0 5rem" }}>
      <div className="container-site">
        <div
          className="glow-border"
          style={{ padding: "4rem 2rem", textAlign: "center", position: "relative", overflow: "hidden" }}
        >
          {/* inner aurora */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "radial-gradient(600px 260px at 50% 0%, rgba(59,176,255,0.28), transparent 70%), radial-gradient(500px 240px at 90% 100%, rgba(255,204,0,0.14), transparent 70%)",
            }}
          />
          <div style={{ position: "relative" }}>
            <h2 style={{ fontSize: "clamp(1.9rem, 3.4vw, 2.75rem)", fontWeight: 700, marginBottom: "1rem" }}>
              Need help <span className="text-gradient">choosing a plan?</span>
            </h2>
            <p
              style={{
                fontSize: "1.0625rem",
                color: "var(--text-secondary)",
                maxWidth: "540px",
                margin: "0 auto 2.5rem",
                lineHeight: 1.7,
              }}
            >
              Talk to a licensed LIC advisor for personalized guidance on choosing the right insurance plan for your
              family&apos;s needs.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}>
              <Link href="/chat" className="btn btn-gold btn-lg">
                <MessageCircle size={20} />
                Chat with Advisor
              </Link>
              <Link href="/book-appointment" className="btn btn-secondary btn-lg">
                <Phone size={18} />
                Request Callback
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
