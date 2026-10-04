"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useHydrated } from "@/lib/use-hydrated";
import { AgentPhoto } from "@/components/agent/agent-photo";
import { useAuthStore } from "@/stores/auth";
import { useSiteSettings, telHref } from "@/lib/use-site-settings";
import { useToast } from "@/components/ui/toaster";
import { appointmentsService } from "@/lib/appointments";
import { AppointmentTable } from "@/components/pages/appointment-table";

export function CustomerDashboard() {
  const router = useRouter();
  const site = useSiteSettings();
  const toast = useToast();
  const qc = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();
  const mounted = useHydrated();

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) router.push("/login");
    else if (user && user.role !== "CUSTOMER") router.push("/admin");
  }, [mounted, isAuthenticated, user, router]);

  const { data, isLoading } = useQuery({
    queryKey: ["my-appointments"],
    queryFn: () => appointmentsService.list(),
    enabled: mounted && isAuthenticated,
  });

  const cancel = useMutation({
    mutationFn: (id: string) => appointmentsService.update(id, { status: "CANCELLED" }),
    onSuccess: () => {
      toast.success("Appointment cancelled");
      qc.invalidateQueries({ queryKey: ["my-appointments"] });
    },
    onError: () => toast.error("Could not cancel the appointment"),
  });

  if (!mounted || !isAuthenticated || !user) return null;
  const items = data?.items ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div className="card" style={{ padding: "1.5rem", display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/about" aria-label="View agent profile">
            <AgentPhoto width={72} height={72} />
          </Link>
          <div>
            <h2 style={{ fontWeight: 700 }}>Welcome, {user.first_name}</h2>
            <p style={{ color: "var(--text-muted)" }}>
              Your LIC agent: {site.agent_name} · <Link href="/about">View profile</Link>
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link href="/book-appointment" className="btn btn-primary">Book Appointment</Link>
          <Link href="/chat" className="btn btn-secondary">Chat</Link>
          {site.phone && <a href={telHref(site.phone)} className="btn btn-ghost">Call Agent</a>}
        </div>
      </div>

      <div>
        <h3 style={{ fontWeight: 700, marginBottom: "1rem" }}>My Appointments</h3>
        {isLoading ? (
          <div className="skeleton" style={{ height: 120 }} />
        ) : items.length === 0 ? (
          <div className="card" style={{ padding: "1.5rem", color: "var(--text-muted)" }}>
            You have no appointments yet. <Link href="/book-appointment">Book one</Link>.
          </div>
        ) : (
          <AppointmentTable
            items={items}
            renderActions={(a) =>
              a.status === "REQUESTED" || a.status === "CONFIRMED" || a.status === "RESCHEDULED" ? (
                <button className="btn btn-ghost btn-sm" onClick={() => cancel.mutate(a.id)} disabled={cancel.isPending}>
                  Cancel
                </button>
              ) : null
            }
          />
        )}
      </div>
    </div>
  );
}
