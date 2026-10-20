"use client";

import { CheckCircle, HeadphonesIcon, FileSearch, Clock, Award } from "lucide-react";
import { AgentPhoto } from "@/components/agent/agent-photo";
import { useSiteSettings, telHref } from "@/lib/use-site-settings";

const reasons = [
  {
    icon: Award,
    title: "Personal LIC Agent Service",
    description:
      "An LIC agent helping families understand LIC plans and make informed insurance decisions.",
  },
  {
    icon: FileSearch,
    title: "Plan Expertise",
    description:
      "In-depth knowledge of LIC's diverse portfolio — from term insurance to pension plans, I help you understand your options.",
  },
  {
    icon: HeadphonesIcon,
    title: "Ongoing Support",
    description:
      "I am with you from plan selection through policy issuance, claims, and renewals — not just at the point of sale.",
  },
  {
    icon: Clock,
    title: "Responsive Service",
    description:
      "Quick responses to your queries via chat, call, WhatsApp, or in-person meetings at a time convenient to you.",
  },
  {
    icon: CheckCircle,
    title: "Transparent Information",
    description:
      "Clear, honest explanations without jargon. I present plan information accurately so you can decide with confidence.",
  },
];

export function WhyChooseSection() {
  const site = useSiteSettings();
  return (
    <section className="section">
      <div className="container-site">
        <div className="split">
          {/* Left */}
          <div>
            <div className="section-label left">Why Work With Me</div>
            <h2 className="section-title">
              Your Trusted LIC Insurance Partner
            </h2>
            <p
              style={{
                fontSize: "1rem",
                color: "var(--text-muted)",
                lineHeight: 1.7,
                marginBottom: "2rem",
              }}
            >
              Choosing the right insurance plan is an important financial decision.
              As your LIC agent, I am committed to providing accurate information,
              genuine service, and long-term support.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {reasons.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="card"
                  style={{ display: "flex", gap: "1rem", padding: "1.25rem" }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "var(--radius-md)",
                      background: "var(--primary-50)",
                      border: "1px solid rgba(59,176,255,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={20} style={{ color: "var(--primary-300)" }} />
                  </div>
                  <div>
                    <h4
                      style={{
                        fontSize: "0.9375rem",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        marginBottom: "0.375rem",
                      }}
                    >
                      {title}
                    </h4>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--text-muted)",
                        lineHeight: 1.6,
                      }}
                    >
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — agent info card */}
          <div className="show-md">
            <div
              className="glow-border"
              style={{ padding: "2rem" }}
            >
              <div style={{ marginBottom: "1.25rem" }}>
                <AgentPhoto width={96} height={96} />
              </div>
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: "0.375rem",
                }}
              >
                {site.agent_name}
              </h3>
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                LIC Agent{site.agent_code ? ` | Agent Code: ${site.agent_code}` : ""}
              </p>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.7,
                  marginBottom: "1.5rem",
                }}
              >
                {site.about_text}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <a href={telHref(site.phone)} className="btn btn-primary" style={{ justifyContent: "center" }}>
                  Call Now
                </a>
                <a href="/book-appointment" className="btn btn-secondary" style={{ justifyContent: "center", textDecoration: "none", display: "flex", alignItems: "center" }}>
                  Book Appointment
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
