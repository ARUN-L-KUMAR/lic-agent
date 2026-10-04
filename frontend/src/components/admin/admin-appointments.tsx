"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/toaster";
import { appointmentsService } from "@/lib/appointments";
import { AppointmentTable } from "@/components/pages/appointment-table";

const FILTERS = ["", "REQUESTED", "CONFIRMED", "COMPLETED", "CANCELLED"];

export function AdminAppointments() {
  const toast = useToast();
  const qc = useQueryClient();
  const [filter, setFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-appointments", filter],
    queryFn: () => appointmentsService.list(filter || undefined),
  });

  const update = useMutation({
    mutationFn: ({ id, status, requested }: { id: string; status: string; requested?: string }) =>
      appointmentsService.update(id, { status, confirmed_date: status === "CONFIRMED" ? requested : undefined }),
    onSuccess: () => {
      toast.success("Appointment updated");
      qc.invalidateQueries({ queryKey: ["admin-appointments"] });
    },
    onError: () => toast.error("Could not update the appointment"),
  });

  const items = data?.items ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", alignItems: "center" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Appointments</h1>
        <select className="form-input" style={{ width: "auto" }} value={filter} onChange={(e) => setFilter(e.target.value)}>
          {FILTERS.map((f) => <option key={f} value={f}>{f || "All statuses"}</option>)}
        </select>
      </div>
      {isLoading ? (
        <div className="skeleton" style={{ height: 120 }} />
      ) : items.length === 0 ? (
        <div className="card" style={{ padding: "1.5rem", color: "var(--text-muted)" }}>No appointments found.</div>
      ) : (
        <AppointmentTable
          items={items}
          showCustomer
          renderActions={(a) => (
            <div style={{ display: "flex", gap: "0.375rem" }}>
              {a.status === "REQUESTED" && (
                <button className="btn btn-primary btn-sm" onClick={() => update.mutate({ id: a.id, status: "CONFIRMED", requested: a.requested_date })}>
                  Confirm
                </button>
              )}
              {a.status === "CONFIRMED" && (
                <button className="btn btn-secondary btn-sm" onClick={() => update.mutate({ id: a.id, status: "COMPLETED" })}>
                  Complete
                </button>
              )}
              {(a.status === "REQUESTED" || a.status === "CONFIRMED") && (
                <button className="btn btn-ghost btn-sm" onClick={() => update.mutate({ id: a.id, status: "CANCELLED" })}>
                  Cancel
                </button>
              )}
            </div>
          )}
        />
      )}
    </div>
  );
}
