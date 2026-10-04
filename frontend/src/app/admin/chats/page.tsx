import type { Metadata } from "next";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminChats } from "@/components/admin/admin-chats";

export const metadata: Metadata = { title: "Live Chats | Admin" };

export default function AdminChatsPage() {
  return (
    <AdminLayout>
      <AdminChats />
    </AdminLayout>
  );
}
