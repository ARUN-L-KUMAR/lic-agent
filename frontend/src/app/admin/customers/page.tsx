import type { Metadata } from "next";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminCustomers } from "@/components/admin/admin-customers";

export const metadata: Metadata = { title: "Customers | Admin" };

export default function AdminCustomersPage() {
  return (
    <AdminLayout>
      <AdminCustomers />
    </AdminLayout>
  );
}
