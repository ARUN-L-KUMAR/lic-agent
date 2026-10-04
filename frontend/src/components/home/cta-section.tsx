"use client";

import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";

export function CtaSection() {
  return (
    <section
      style={{
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        padding: "5rem 0",
      }}
    >
      <div className="container-site">
        <div
          style={{
            background: "#004B87",
            borderRadius: "var(--radius-xl)",
            padding: "3.5rem 2rem",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              fontWeight: 800,
              color: "#ffffff",
              marginBottom: "1rem",
            }}
          >
            Need help choosing a plan?
          </h2>
          <p
            style={{
              fontSize: "1.0625rem",
              color: "rgba(255,255,255,0.7)",
              maxWidth: "520px",
              margin: "0 auto 2.5rem",
              lineHeight: 1.7,
            }}
          >
            Talk to a licensed LIC advisor for personalized guidance on choosing
            the right insurance plan for your family&apos;s needs.
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              justifyContent: "center",
            }}
          >
            <Link href="/chat" className="btn btn-gold btn-lg">
              <MessageCircle size={20} />
              Chat with Advisor
            </Link>
            <Link
              href="/book-appointment"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.875rem 1.75rem",
                fontSize: "1rem",
                fontWeight: 600,
                color: "#fff",
                border: "2px solid rgba(255,255,255,0.3)",
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
            >
              <Phone size={18} />
              Request Callback
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
