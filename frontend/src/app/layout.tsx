import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "LIC Agent — Trusted Insurance Planning",
    template: "%s | LIC Agent",
  },
  description:
    "Expert guidance on LIC insurance plans. Explore term insurance, endowment, pension, child plans, and more. Connect with a licensed LIC agent.",
  keywords: [
    "LIC insurance",
    "LIC agent",
    "term insurance",
    "life insurance",
    "LIC plans",
    "insurance advisor",
    "pension plans",
    "child plans",
  ],
  authors: [{ name: "LIC Agent" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "LIC Agent Platform",
    title: "LIC Agent — Trusted Insurance Planning",
    description: "Expert guidance on LIC insurance plans from a licensed agent.",
  },
  twitter: {
    card: "summary_large_image",
    title: "LIC Agent — Trusted Insurance Planning",
    description: "Expert guidance on LIC insurance plans from a licensed agent.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
