"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { useToast } from "@/components/ui/toaster";

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export function AdminCustomers() {
  const toast = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-customers", search],
    queryFn: async () => {
      const { data } = await apiClient.get("/admin/customers", { params: { search: search || undefined, per_page: 100 } });
      return data as { items: Customer[]; total: number };
    },
  });

  const toggle = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) => apiClient.patch(`/admin/customers/${id}`, { is_active }),
    onSuccess: () => {
      toast.success("Customer updated");
      qc.invalidateQueries({ queryKey: ["admin-customers"] });
    },
    onError: () => toast.error("Could not update the customer"),
  });

  const items = data?.items ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Customers</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{data?.total ?? 0} registered customers</p>
        </div>
        <input className="form-input" placeholder="Search name, email, phone…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 260 }} />
      </div>
      {isLoading ? (
        <div className="skeleton" style={{ height: 120 }} />
      ) : items.length === 0 ? (
        <div className="card" style={{ padding: "1.5rem", color: "var(--text-muted)" }}>No customers found.</div>
      ) : (
        <div className="table-container">
          <table style={{ width: "100%" }}>
            <thead>
              <tr><th>Name</th><th>Contact</th><th>Joined</th><th>Status</th><th /></tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.first_name} {c.last_name}</td>
                  <td>
                    <a href={`mailto:${c.email}`}>{c.email}</a>
                    {c.phone && <div><a href={`tel:${c.phone}`} style={{ fontSize: "0.8rem" }}>{c.phone}</a></div>}
                  </td>
                  <td>{new Date(c.created_at).toLocaleDateString("en-IN")}</td>
                  <td>
                    <span className={`badge ${c.is_active ? "badge-success" : "badge-danger"}`}>{c.is_active ? "Active" : "Disabled"}</span>{" "}
                    {!c.is_verified && <span className="badge badge-warning">Unverified</span>}
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => toggle.mutate({ id: c.id, is_active: !c.is_active })}>
                      {c.is_active ? "Disable" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
