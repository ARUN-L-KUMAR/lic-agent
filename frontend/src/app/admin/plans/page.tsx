import type { Metadata } from "next";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminPlans } from "@/components/admin/admin-content";

export const metadata: Metadata = { title: "Plans | Admin" };

export default function AdminPlansPage() {
  return (
    <AdminLayout>
      <AdminPlans />
    </AdminLayout>
  );
}
