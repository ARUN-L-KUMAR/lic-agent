"use client";

import { LogoMark } from "@/components/brand/logo";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Share2,
} from "lucide-react";
import { useSiteSettings, telHref } from "@/lib/use-site-settings";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const site = useSiteSettings();
  const waNumber = (site.whatsapp || "").replace(/\D/g, "");

  return (
    <footer
      style={{
        background: "#004B87",
        color: "rgba(255,255,255,0.85)",
        paddingTop: "3.5rem",
      }}
    >
      <div className="container-site">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "2.5rem",
            paddingBottom: "3rem",
          }}
        >
          {/* Brand */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                marginBottom: "1rem",
              }}
            >
              <LogoMark size={44} variant="onDark" />
              <div>
                <div style={{ fontSize: "1.125rem", fontWeight: 700, color: "#fff" }}>
                  {site.agent_name}
                </div>
                <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)" }}>
                  LIC Agent
                </div>
              </div>
            </div>
            <p
              style={{
                fontSize: "0.875rem",
                lineHeight: 1.7,
                marginBottom: "1.25rem",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              Helping families and individuals plan their financial future through
              the right LIC insurance solutions.
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              {[
                { label: "FB", href: "#" },
                { label: "TW", href: "#" },
                { label: "YT", href: "#" },
                { label: "IN", href: "#" },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  style={{
                    width: 36,
                    height: 36,
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: "var(--radius-md)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(255,255,255,0.7)",
                    transition: "all 0.15s ease",
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              style={{
                color: "#FFCC00",
                fontSize: "0.8125rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "1.25rem",
              }}
            >
              Insurance Plans
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {[
                { href: "/plans?category=Protection", label: "Protection Plans" },
                { href: "/plans?category=Savings", label: "Savings Plans" },
                { href: "/plans?category=Endowment", label: "Endowment Plans" },
                { href: "/plans?category=Money Back", label: "Money Back Plans" },
                { href: "/plans?category=Pension", label: "Pension Plans" },
                { href: "/plans?category=Child Plans", label: "Child Plans" },
                { href: "/plans?category=ULIP", label: "ULIP Plans" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="footer-link"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h4
              style={{
                color: "#FFCC00",
                fontSize: "0.8125rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "1.25rem",
              }}
            >
              Tools & Resources
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {[
                { href: "/calculators/premium", label: "Premium Calculator" },
                { href: "/calculators/maturity", label: "Maturity Calculator" },
                { href: "/calculators/retirement", label: "Retirement Planner" },
                { href: "/calculators/child-education", label: "Child Education Planner" },
                { href: "/plans/compare", label: "Compare Plans" },
                { href: "/blog", label: "Blog & Articles" },
                { href: "/faq", label: "FAQ" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="footer-link"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              style={{
                color: "#FFCC00",
                fontSize: "0.8125rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "1.25rem",
              }}
            >
              Contact
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                !!site.phone && { icon: Phone, text: site.phone, href: telHref(site.phone) },
                !!waNumber && { icon: MessageCircle, text: "WhatsApp", href: `https://wa.me/${waNumber}` },
                !!site.email && { icon: Mail, text: site.email, href: `mailto:${site.email}` },
                !!site.office_address && { icon: MapPin, text: site.service_locations || site.office_address || "", href: "#" },
              ].filter((x): x is Exclude<typeof x, false> => x !== false).map(({ icon: Icon, text, href }) => (
                <a
                  key={text}
                  href={href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "0.9rem",
                    textDecoration: "none",
                  }}
                >
                  <Icon size={16} style={{ color: "#FFCC00", flexShrink: 0 }} />
                  {text}
                </a>
              ))}
            </div>

            <div style={{ marginTop: "1.5rem" }}>
              <Link
                href="/book-appointment"
                className="btn btn-gold btn-sm"
                style={{ display: "inline-flex" }}
              >
                Book Appointment
              </Link>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            padding: "1.25rem 0",
          }}
        >
          <p
            style={{
              fontSize: "0.8rem",
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.6,
              marginBottom: "1rem",
            }}
          >
            <strong style={{ color: "rgba(255,255,255,0.7)" }}>Disclaimer:</strong>{" "}
            {site.main_disclaimer} Please read all policy-related documents carefully.
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.45)" }}>
              © {currentYear} {site.agent_name}, LIC Agent. All rights reserved.
            </p>
            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
              {[
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms" },
                { href: "/disclaimer", label: "Disclaimer" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  style={{
                    fontSize: "0.8rem",
                    color: "rgba(255,255,255,0.5)",
                    textDecoration: "none",
                  }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
