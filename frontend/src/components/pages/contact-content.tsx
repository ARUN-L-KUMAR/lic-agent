"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import apiClient from "@/lib/api-client";
import { useSiteSettings, telHref } from "@/lib/use-site-settings";
import { useToast } from "@/components/ui/toaster";

export function ContactContent() {
  const site = useSiteSettings();
  const toast = useToast();
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = useMutation({
    mutationFn: async () =>
      apiClient.post("/leads", {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        message: form.message.trim() || undefined,
        source: "WEBSITE",
      }),
    onSuccess: () => {
      toast.success("Message sent", "The agent will contact you soon.");
      setForm({ name: "", phone: "", email: "", message: "" });
    },
    onError: () => toast.error("Could not send your message", "Please check the details or call directly."),
  });

  const wa = (site.whatsapp || "").replace(/\D/g, "");
  const items = [
    site.phone && { icon: Phone, label: "Call", text: site.phone, href: telHref(site.phone) },
    wa && { icon: MessageCircle, label: "WhatsApp", text: "Chat on WhatsApp", href: `https://wa.me/${wa}` },
    site.email && { icon: Mail, label: "Email", text: site.email, href: `mailto:${site.email}` },
    site.office_address && { icon: MapPin, label: "Location", text: site.office_address, href: undefined },
  ].filter(Boolean) as { icon: typeof Phone; label: string; text: string; href?: string }[];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", alignItems: "start" }}>
      <div className="card" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <h2 style={{ fontWeight: 700 }}>{site.agent_name}</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "-0.75rem" }}>LIC Agent</p>
        {items.map(({ icon: Icon, label, text, href }) => (
          <div key={label} style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <Icon size={18} style={{ color: "#004B87", flexShrink: 0 }} />
            {href ? (
              <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{text}</a>
            ) : (
              <span>{text}</span>
            )}
          </div>
        ))}
        <p className="disclaimer-box" style={{ fontSize: "0.8125rem", lineHeight: 1.6 }}>{site.main_disclaimer}</p>
      </div>

      <form
        className="card"
        style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}
        onSubmit={(e) => {
          e.preventDefault();
          submit.mutate();
        }}
      >
        <h2 style={{ fontWeight: 700 }}>Send a message</h2>
        <div className="form-group">
          <label className="form-label" htmlFor="c-name">Name <span className="required">*</span></label>
          <input id="c-name" className="form-input" required minLength={2} value={form.name} onChange={set("name")} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="c-phone">Phone <span className="required">*</span></label>
          <input id="c-phone" className="form-input" type="tel" required minLength={10} value={form.phone} onChange={set("phone")} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="c-email">Email</label>
          <input id="c-email" className="form-input" type="email" value={form.email} onChange={set("email")} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="c-msg">Message</label>
          <textarea id="c-msg" className="form-input" rows={4} maxLength={1000} value={form.message} onChange={set("message")} />
        </div>
        <button className="btn btn-primary" type="submit" disabled={submit.isPending}>
          {submit.isPending ? "Sending…" : "Send Message"}
        </button>
      </form>
    </div>
  );
}
