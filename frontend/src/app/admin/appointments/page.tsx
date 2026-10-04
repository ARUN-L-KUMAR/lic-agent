import type { Metadata } from "next";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminAppointments } from "@/components/admin/admin-appointments";

export const metadata: Metadata = { title: "Appointments | Admin" };

export default function AdminAppointmentsPage() {
  return (
    <AdminLayout>
      <AdminAppointments />
    </AdminLayout>
  );
}
