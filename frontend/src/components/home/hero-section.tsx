"use client";

import Link from "next/link";
import { MessageCircle, Phone, ChevronRight, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section
      style={{
        background: "#003B73",
        color: "#ffffff",
        padding: "5rem 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle background pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(201,162,39,0.06) 0%, transparent 50%), " +
            "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.03) 0%, transparent 50%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: "40%",
          background: "rgba(255,255,255,0.02)",
          borderLeft: "1px solid rgba(255,255,255,0.05)",
          clipPath: "polygon(10% 0%, 100% 0%, 100% 100%, 0% 100%)",
        }}
      />

      <div className="container-site" style={{ position: "relative" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "3rem",
            alignItems: "center",
            maxWidth: "760px",
          }}
        >
          {/* Badge */}
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "rgba(201,162,39,0.15)",
                border: "1px solid rgba(201,162,39,0.3)",
                borderRadius: "100px",
                padding: "0.375rem 0.875rem",
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "#C9A227",
                marginBottom: "1.5rem",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  background: "#C9A227",
                  borderRadius: "50%",
                  display: "inline-block",
                }}
              />
              Licensed LIC Insurance Agent — Chennai, Tamil Nadu
            </div>

            {/* Headline */}
            <h1
              style={{
                fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
                fontWeight: 800,
                lineHeight: 1.15,
                color: "#ffffff",
                marginBottom: "1.25rem",
                letterSpacing: "-0.03em",
              }}
            >
              Plan Today.{" "}
              <span style={{ color: "#C9A227" }}>Protect</span>{" "}
              Tomorrow.
            </h1>

            {/* Subtext */}
            <p
              style={{
                fontSize: "1.125rem",
                color: "rgba(255,255,255,0.75)",
                lineHeight: 1.7,
                marginBottom: "2rem",
                maxWidth: "580px",
              }}
            >
              Expert guidance on LIC insurance plans for financial protection,
              family security, child education planning, and retirement.
              Connect with a licensed advisor for personalized support.
            </p>

            {/* Value props */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "1rem",
                marginBottom: "2.5rem",
              }}
            >
              {[
                "Term Insurance",
                "Child Plans",
                "Pension Plans",
                "Endowment",
                "Tax Benefits",
              ].map((tag) => (
                <div
                  key={tag}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    fontSize: "0.875rem",
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  <ChevronRight size={14} style={{ color: "#C9A227" }} />
                  {tag}
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div
              style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}
            >
              <Link href="/chat" className="btn btn-gold btn-lg">
                <MessageCircle size={18} />
                Talk to an LIC Advisor
              </Link>
              <Link
                href="/plans"
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
                Explore Plans
                <ArrowRight size={18} />
              </Link>
            </div>

            {/* Trust badges */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "1.5rem",
                marginTop: "2.5rem",
                paddingTop: "2rem",
                borderTop: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {[
                { label: "LIC Agent", value: "Licensed" },
                { label: "Experience", value: "10+ Years" },
                { label: "Clients Served", value: "500+" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div
                    style={{
                      fontSize: "1.375rem",
                      fontWeight: 800,
                      color: "#C9A227",
                      lineHeight: 1,
                    }}
                  >
                    {value}
                  </div>
                  <div
                    style={{
                      fontSize: "0.8125rem",
                      color: "rgba(255,255,255,0.55)",
                      marginTop: "0.25rem",
                    }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
