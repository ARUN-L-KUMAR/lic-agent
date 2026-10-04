import type { Metadata } from "next";
import { PageShell } from "@/components/pages/page-shell";
import { ContactContent } from "@/components/pages/contact-content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact LAKSHMI NARAYANAN S, LIC agent in Ranipet, Vellore.",
};

export default function ContactPage() {
  return (
    <PageShell title="Contact" subtitle="Call, email or send a message and the agent will get back to you">
      <ContactContent />
    </PageShell>
  );
}
