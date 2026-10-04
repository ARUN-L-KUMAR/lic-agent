import type { Metadata } from "next";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminKnowledge } from "@/components/admin/admin-content";

export const metadata: Metadata = { title: "AI Knowledge | Admin" };

export default function AdminKnowledgePage() {
  return (
    <AdminLayout>
      <AdminKnowledge />
    </AdminLayout>
  );
}
