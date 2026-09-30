import type { Metadata } from "next";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminLeadsManager } from "@/components/admin/admin-leads-manager";

export const metadata: Metadata = { title: "Manage Leads | Admin" };

export default function AdminLeadsPage() {
  return (
    <AdminLayout>
      <AdminLeadsManager />
    </AdminLayout>
  );
}
