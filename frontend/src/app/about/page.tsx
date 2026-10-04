import type { Metadata } from "next";
import { PageShell } from "@/components/pages/page-shell";
import { AboutAgent } from "@/components/pages/about-agent";

export const metadata: Metadata = {
  title: "About the Agent",
  description: "About LAKSHMI NARAYANAN S, LIC agent in Ranipet, Vellore. This is not the official LIC website.",
};

export default function AboutPage() {
  return (
    <PageShell title="About Your LIC Agent" subtitle="Who operates this website and how to reach them">
      <AboutAgent />
    </PageShell>
  );
}
