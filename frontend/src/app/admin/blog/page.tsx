import type { Metadata } from "next";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminBlog } from "@/components/admin/admin-content";

export const metadata: Metadata = { title: "Blog | Admin" };

export default function AdminBlogPage() {
  return (
    <AdminLayout>
      <AdminBlog />
    </AdminLayout>
  );
}
