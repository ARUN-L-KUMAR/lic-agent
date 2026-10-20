import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import { Scene } from "@/components/layout/scene";
import { PointerGlow } from "@/components/layout/pointer-glow";
import { getSiteSettings } from "@/lib/agent-info";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const display = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display-face",
});

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  const title = `${site.agent_name} — LIC Agent, ${site.service_locations ?? ""}`.replace(/, $/, "");
  const description =
    "Guidance on LIC insurance plans from an LIC agent. This is not the official LIC website.";
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:5000"),
    title: { default: title, template: `%s | ${site.agent_name}` },
    description,
    keywords: [
      "LIC insurance",
      "LIC agent",
      "LIC agent Ranipet",
      "LIC agent Vellore",
      "term insurance",
      "life insurance",
      "LIC plans",
      "pension plans",
      "child plans",
    ],
    authors: [{ name: site.agent_name }],
    openGraph: { type: "website", locale: "en_IN", siteName: site.business_name, title, description },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const site = await getSiteSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:5000";
  // Only verified fields from the database are included; no ratings, addresses or IDs are invented.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "InsuranceAgency",
    name: site.business_name,
    url: siteUrl,
    telephone: site.phone,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ranipet",
      addressRegion: "Tamil Nadu",
      addressCountry: "IN",
    },
    employee: { "@type": "Person", name: site.agent_name, jobTitle: "LIC Agent" },
  };
  return (
    <html lang="en" className={`${inter.variable} ${display.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Scene />
        <PointerGlow />
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
