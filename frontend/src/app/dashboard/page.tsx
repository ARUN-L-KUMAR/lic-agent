import type { Metadata } from "next";
import { PageShell } from "@/components/pages/page-shell";
import { CustomerDashboard } from "@/components/pages/customer-dashboard";

export const metadata: Metadata = { title: "My Dashboard" };

export default function DashboardPage() {
  return (
    <PageShell title="My Dashboard" subtitle="Your appointment requests and quick links">
      <CustomerDashboard />
    </PageShell>
  );
}
