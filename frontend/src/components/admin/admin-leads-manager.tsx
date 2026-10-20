"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import {
  Phone, Mail, MapPin, Clock, Filter, Search, X,
  TrendingUp, Check, AlertCircle, User,
} from "lucide-react";
import type { Lead } from "@/types";

const STATUS_OPTIONS = ["All", "NEW", "CONTACTED", "QUALIFIED", "APPOINTMENT", "CONVERTED", "CLOSED"];
const PRIORITY_COLORS: Record<string, string> = {
  LOW: "var(--text-muted)",
  MEDIUM: "var(--info)",
  HIGH: "var(--warning)",
  URGENT: "var(--danger)",
};
const STATUS_COLORS: Record<string, string> = {
  NEW: "badge-danger",
  CONTACTED: "badge-warning",
  QUALIFIED: "badge-primary",
  APPOINTMENT: "badge-primary",
  CONVERTED: "badge-success",
  CLOSED: "badge-primary",
};

export function AdminLeadsManager() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-leads", { search, status: statusFilter, page }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), per_page: "20" });
      if (search) params.set("search", search);
      if (statusFilter !== "All") params.set("status", statusFilter);
      const { data } = await apiClient.get(`/leads?${params}`);
      return data;
    },
    staleTime: 30 * 1000,
  });

  const updateLeadMutation = useMutation({
    mutationFn: async ({ leadId, updates }: { leadId: string; updates: Partial<Lead> }) => {
      const { data } = await apiClient.patch(`/leads/${leadId}`, updates);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-leads"] }),
  });

  const leads: Lead[] = data?.items || [];
  const total = data?.total || 0;

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)" }}>
            Leads Management
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            {total} total leads
          </p>
        </div>
      </div>

      {/* Filters */}
      <div
        className="card"
        style={{
          padding: "1rem 1.25rem",
          marginBottom: "1.5rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.875rem",
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", flex: "1 1 240px" }}>
          <Search size={15} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search by name, phone, email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="form-input"
            style={{ paddingLeft: "2.25rem", fontSize: "0.875rem" }}
          />
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              style={{
                padding: "0.4rem 0.875rem",
                borderRadius: "100px",
                border: "1.5px solid",
                fontSize: "0.8125rem",
                fontWeight: 500,
                cursor: "pointer",
                background: statusFilter === s ? "linear-gradient(135deg, #36A6FF, #1B6BE0)" : "var(--surface)",
                borderColor: statusFilter === s ? "rgba(255,255,255,0.25)" : "var(--border)",
                color: statusFilter === s ? "#fff" : "var(--text-secondary)",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Source</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Received</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j}>
                      <div className="skeleton" style={{ height: 16, borderRadius: "var(--radius-sm)" }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                  No leads found
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{lead.name}</div>
                    {lead.city && (
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.25rem", marginTop: "0.25rem" }}>
                        <MapPin size={11} />{lead.city}
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontSize: "0.875rem" }}>
                      <a href={`tel:${lead.phone}`} style={{ color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                        <Phone size={13} /> {lead.phone}
                      </a>
                      {lead.email && (
                        <a href={`mailto:${lead.email}`} style={{ color: "var(--text-muted)", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.25rem", marginTop: "0.25rem" }}>
                          <Mail size={11} /> {lead.email}
                        </a>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-primary" style={{ fontSize: "0.7rem" }}>
                      {lead.source}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, fontSize: "0.8125rem", color: PRIORITY_COLORS[lead.priority] || "var(--text-muted)" }}>
                      {lead.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${STATUS_COLORS[lead.status] || "badge-primary"}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                    {new Date(lead.created_at).toLocaleDateString("en-IN")}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={() => updateLeadMutation.mutate({ leadId: lead.id, updates: { status: "CONTACTED" } })}
                        className="btn btn-primary btn-sm"
                        title="Mark as Contacted"
                        style={{ padding: "0.375rem 0.625rem" }}
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: "0.375rem 0.625rem" }}
                        title="View Details"
                      >
                        <User size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1.5rem" }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</button>
          <span style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
            Page {page} of {data.pages}
          </span>
          <button className="btn btn-secondary btn-sm" onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page === data.pages}>Next</button>
        </div>
      )}

      {/* Lead detail modal */}
      {selectedLead && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(2,4,12,0.72)",
            backdropFilter: "blur(6px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={() => setSelectedLead(null)}
        >
          <div
            className="card card-solid"
            style={{ width: "100%", maxWidth: "520px", padding: "2rem" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>{selectedLead.name}</h2>
              <button onClick={() => setSelectedLead(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                { label: "Phone", value: selectedLead.phone, icon: Phone },
                { label: "Email", value: selectedLead.email || "—", icon: Mail },
                { label: "City", value: selectedLead.city || "—", icon: MapPin },
                { label: "Requirement", value: selectedLead.requirement || "—", icon: TrendingUp },
                { label: "Budget", value: selectedLead.budget || "—", icon: TrendingUp },
                { label: "Contact Preference", value: selectedLead.preferred_contact_time || "—", icon: Clock },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} style={{ display: "flex", gap: "0.75rem" }}>
                  <Icon size={16} style={{ color: "var(--text-muted)", flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{label}</div>
                    <div style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>{value}</div>
                  </div>
                </div>
              ))}

              {selectedLead.message && (
                <div style={{ padding: "0.875rem", background: "var(--bg)", borderRadius: "var(--radius-md)", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                  {selectedLead.message}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
              {STATUS_OPTIONS.filter(s => s !== "All").map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    updateLeadMutation.mutate({ leadId: selectedLead.id, updates: { status: status as any } });
                    setSelectedLead(null);
                  }}
                  style={{
                    padding: "0.5rem 0.875rem",
                    borderRadius: "var(--radius-md)",
                    border: "1.5px solid var(--border)",
                    fontSize: "0.8125rem",
                    cursor: "pointer",
                    fontWeight: 500,
                    background: selectedLead.status === status ? "linear-gradient(135deg, #36A6FF, #1B6BE0)" : "var(--surface)",
                    color: selectedLead.status === status ? "#fff" : "var(--text-secondary)",
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
