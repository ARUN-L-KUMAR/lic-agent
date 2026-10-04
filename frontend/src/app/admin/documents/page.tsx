import type { Metadata } from "next";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminDocuments } from "@/components/admin/admin-documents";

export const metadata: Metadata = { title: "Documents | Admin" };

export default function AdminDocumentsPage() {
  return (
    <AdminLayout>
      <AdminDocuments />
    </AdminLayout>
  );
}
