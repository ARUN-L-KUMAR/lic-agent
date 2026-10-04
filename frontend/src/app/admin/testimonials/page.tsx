import type { Metadata } from "next";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminTestimonials } from "@/components/admin/admin-content";

export const metadata: Metadata = { title: "Testimonials | Admin" };

export default function AdminTestimonialsPage() {
  return (
    <AdminLayout>
      <AdminTestimonials />
    </AdminLayout>
  );
}
