"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useHydrated } from "@/lib/use-hydrated";
import { useAuthStore } from "@/stores/auth";
import { useSiteSettings, telHref } from "@/lib/use-site-settings";
import { useToast } from "@/components/ui/toaster";
import { appointmentsService, MEETING_TYPES } from "@/lib/appointments";

export function BookAppointment() {
  const site = useSiteSettings();
  const toast = useToast();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const mounted = useHydrated();
  const [minWhen] = useState(() =>
    new Date(Date.now() + 60 * 60 * 1000 - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  );
  const [form, setForm] = useState({ when: "", meeting_type: "PHONE", purpose: "", notes: "" });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const book = useMutation({
    mutationFn: () =>
      appointmentsService.create({
        requested_date: new Date(form.when).toISOString(),
        meeting_type: form.meeting_type,
        purpose: form.purpose.trim() || undefined,
        notes: form.notes.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Appointment requested", "The agent will confirm your appointment.");
      router.push("/dashboard");
    },
    onError: (err) => {
      const detail = isAxiosError(err) ? err.response?.data?.detail : null;
      toast.error("Could not book appointment", typeof detail === "string" ? detail : "Please try again.");
    },
  });

  if (!mounted) return null;

  if (!isAuthenticated) {
    return (
      <div className="card" style={{ padding: "2rem", maxWidth: 560, display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h2 style={{ fontWeight: 700 }}>Please sign in to book</h2>
        <p style={{ color: "var(--text-muted)" }}>
          Sign in or create a free account so you can track your appointment. You can also call {site.agent_name} directly.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link href="/login" className="btn btn-primary">Sign In</Link>
          <Link href="/register" className="btn btn-secondary">Register</Link>
          {site.phone && <a href={telHref(site.phone)} className="btn btn-ghost">Call {site.phone}</a>}
        </div>
      </div>
    );
  }

  return (
    <form
      className="card"
      style={{ padding: "2rem", maxWidth: 560, display: "flex", flexDirection: "column", gap: "1rem" }}
      onSubmit={(e) => {
        e.preventDefault();
        book.mutate();
      }}
    >
      <div className="form-group">
        <label className="form-label" htmlFor="a-when">Preferred date &amp; time <span className="required">*</span></label>
        <input id="a-when" type="datetime-local" className="form-input" required min={minWhen} value={form.when} onChange={set("when")} />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="a-type">Meeting type</label>
        <select id="a-type" className="form-input" value={form.meeting_type} onChange={set("meeting_type")}>
          {MEETING_TYPES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="a-purpose">Purpose</label>
        <input id="a-purpose" className="form-input" maxLength={500} placeholder="e.g. Term insurance enquiry" value={form.purpose} onChange={set("purpose")} />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="a-notes">Notes</label>
        <textarea id="a-notes" className="form-input" rows={3} maxLength={2000} value={form.notes} onChange={set("notes")} />
      </div>
      <button className="btn btn-primary" type="submit" disabled={book.isPending}>
        {book.isPending ? "Requesting…" : "Request Appointment"}
      </button>
      <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{site.main_disclaimer}</p>
    </form>
  );
}
