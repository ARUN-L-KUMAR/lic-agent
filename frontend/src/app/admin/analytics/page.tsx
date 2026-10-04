import type { Metadata } from "next";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminAnalytics } from "@/components/admin/admin-analytics";

export const metadata: Metadata = { title: "Analytics | Admin" };

export default function AdminAnalyticsPage() {
  return (
    <AdminLayout>
      <AdminAnalytics />
    </AdminLayout>
  );
}
