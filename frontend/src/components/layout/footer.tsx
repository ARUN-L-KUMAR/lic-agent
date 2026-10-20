"use client";

import { LogoMark } from "@/components/brand/logo";
import Link from "next/link";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { useSiteSettings, telHref } from "@/lib/use-site-settings";

const planLinks = [
  { href: "/plans?category=Protection", label: "Protection Plans" },
  { href: "/plans?category=Savings", label: "Savings Plans" },
  { href: "/plans?category=Endowment", label: "Endowment Plans" },
  { href: "/plans?category=Money Back", label: "Money Back Plans" },
  { href: "/plans?category=Pension", label: "Pension Plans" },
  { href: "/plans?category=Child Plans", label: "Child Plans" },
  { href: "/plans?category=ULIP", label: "ULIP Plans" },
];

const toolLinks = [
  { href: "/calculators/premium", label: "Premium Calculator" },
  { href: "/calculators/maturity", label: "Maturity Calculator" },
  { href: "/calculators/retirement", label: "Retirement Planner" },
  { href: "/calculators/child-education", label: "Child Education Planner" },
  { href: "/plans/compare", label: "Compare Plans" },
  { href: "/blog", label: "Blog & Articles" },
  { href: "/faq", label: "FAQ" },
];

const listStyle = { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.65rem" } as const;

export function Footer() {
  const currentYear = new Date().getFullYear();
  const site = useSiteSettings();
  const waNumber = (site.whatsapp || "").replace(/\D/g, "");

  const contacts = [
    !!site.phone && { icon: Phone, text: site.phone, href: telHref(site.phone) },
    !!waNumber && { icon: MessageCircle, text: "WhatsApp", href: `https://wa.me/${waNumber}` },
    !!site.email && { icon: Mail, text: site.email, href: `mailto:${site.email}` },
    !!site.office_address && { icon: MapPin, text: site.service_locations || site.office_address || "", href: "#" },
  ].filter((x): x is Exclude<typeof x, false> => x !== false);

  return (
    <footer className="site-footer">
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
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <LogoMark size={40} />
              <div>
                <div className="brand-name" style={{ fontSize: "1.0625rem" }}>{site.agent_name}</div>
                <div className="brand-role">LIC Agent</div>
              </div>
            </div>
            <p style={{ fontSize: "0.875rem", lineHeight: 1.7, marginBottom: "1.25rem", color: "var(--text-muted)" }}>
              Helping families and individuals plan their financial future through the right LIC insurance solutions.
            </p>
            <div style={{ display: "flex", gap: "0.65rem" }}>
              {["FB", "TW", "YT", "IN"].map((label) => (
                <a key={label} href="#" aria-label={label} className="social-btn">
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Plans */}
          <div>
            <h4 className="footer-heading">Insurance Plans</h4>
            <ul style={listStyle}>
              {planLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="footer-link">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h4 className="footer-heading">Tools &amp; Resources</h4>
            <ul style={listStyle}>
              {toolLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="footer-link">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="footer-heading">Contact</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {contacts.map(({ icon: Icon, text, href }) => (
                <a
                  key={text}
                  href={href}
                  className="footer-link"
                  style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
                >
                  <Icon size={16} style={{ color: "var(--cyan)", flexShrink: 0 }} />
                  {text}
                </a>
              ))}
            </div>

            <div style={{ marginTop: "1.5rem" }}>
              <Link href="/book-appointment" className="btn btn-gold btn-sm" style={{ display: "inline-flex" }}>
                Book Appointment
              </Link>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{ borderTop: "1px solid var(--border)", padding: "1.5rem 0 2rem" }}>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "1rem" }}>
            <strong style={{ color: "var(--text-secondary)" }}>Disclaimer:</strong>{" "}
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
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              © {currentYear} {site.agent_name}, LIC Agent. All rights reserved.
            </p>
            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
              {[
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms" },
                { href: "/disclaimer", label: "Disclaimer" },
              ].map(({ href, label }) => (
                <Link key={href} href={href} className="footer-link" style={{ fontSize: "0.8rem" }}>
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
