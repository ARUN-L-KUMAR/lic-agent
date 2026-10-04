import type { Metadata } from "next";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminSettings } from "@/components/admin/admin-settings";

export const metadata: Metadata = { title: "Settings | Admin" };

export default function AdminSettingsPage() {
  return (
    <AdminLayout>
      <AdminSettings />
    </AdminLayout>
  );
}
