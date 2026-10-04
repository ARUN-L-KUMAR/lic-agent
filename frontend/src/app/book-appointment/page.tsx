import type { Metadata } from "next";
import { PageShell } from "@/components/pages/page-shell";
import { BookAppointment } from "@/components/pages/book-appointment";

export const metadata: Metadata = {
  title: "Book Appointment",
  description: "Request an appointment with LAKSHMI NARAYANAN S, LIC agent in Ranipet, Vellore.",
};

export default function BookAppointmentPage() {
  return (
    <PageShell title="Book an Appointment" subtitle="Request a time to talk about LIC plans. The agent will confirm it.">
      <BookAppointment />
    </PageShell>
  );
}
