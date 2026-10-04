import type { Metadata } from "next";
import { PageShell } from "@/components/pages/page-shell";
import { GalleryShowcase } from "@/components/pages/gallery-showcase";

export const metadata: Metadata = {
  title: "Honors & Awards 3D Showcase | LIC Advisor",
  description:
    "Explore the interactive 3D trophy hall and achievements gallery of your authorized LIC Advisor in Vellore Division. Official trophies, medals, and MDRT recognitions.",
};

export default function GalleryPage() {
  return (
    <PageShell
      title="Honors & Achievements 3D Showcase"
      subtitle="Interactive 3D exhibition of official LIC Vellore Division trophies, merit medals, and client protection milestones"
    >
      <GalleryShowcase />
    </PageShell>
  );
}
