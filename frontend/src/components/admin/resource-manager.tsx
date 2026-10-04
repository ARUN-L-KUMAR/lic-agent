"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import apiClient from "@/lib/api-client";
import { useToast } from "@/components/ui/toaster";

export type FieldType = "text" | "textarea" | "number" | "checkbox" | "select";

export interface Field {
  name: string;
  label: string;
  type?: FieldType;
  options?: { value: string; label: string }[];
  required?: boolean;
  hint?: string;
}

export interface Column {
  key: string;
  label: string;
  render?: (row: Record<string, unknown>) => React.ReactNode;
}

interface Props {
  title: string;
  description?: string;
  queryKey: string;
  /** Endpoints. Defaults follow /admin/<resource>. */
  api: {
    list: string;
    create: string;
    update: (id: string) => string;
    updateMethod?: "put" | "patch";
    remove: (id: string) => string;
  };
  columns: Column[];
  fields: Field[];
  defaults?: Record<string, unknown>;
  itemName: string;
  removeLabel?: string;
  searchable?: boolean;
}

function errorMessage(err: unknown) {
  if (isAxiosError(err)) {
    const d = err.response?.data?.detail;
    if (typeof d === "string") return d;
    if (Array.isArray(d) && d[0]?.msg) return d[0].msg;
  }
  return "Please try again.";
}

export function ResourceManager({
  title, description, queryKey, api, columns, fields, defaults = {}, itemName, removeLabel = "Delete", searchable = true,
}: Props) {
  const toast = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [isNew, setIsNew] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: [queryKey, search],
    queryFn: async () => {
      const { data } = await apiClient.get(api.list, { params: { search: search || undefined, per_page: 100 } });
      return data as { items: Record<string, unknown>[]; total: number };
    },
  });

  const refresh = () => qc.invalidateQueries({ queryKey: [queryKey] });

  const save = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      const body: Record<string, unknown> = {};
      fields.forEach((f) => (body[f.name] = values[f.name]));
      if (isNew) return apiClient.post(api.create, body);
      return apiClient[api.updateMethod ?? "put"](api.update(String(values.id)), body);
    },
    onSuccess: () => {
      toast.success(`${itemName} saved`);
      setEditing(null);
      refresh();
    },
    onError: (e) => toast.error(`Could not save ${itemName.toLowerCase()}`, errorMessage(e)),
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiClient.delete(api.remove(id)),
    onSuccess: () => {
      toast.success(`${itemName} ${removeLabel.toLowerCase()}d`);
      refresh();
    },
    onError: (e) => toast.error(`Could not ${removeLabel.toLowerCase()} ${itemName.toLowerCase()}`, errorMessage(e)),
  });

  const items = data?.items ?? [];
  const set = (name: string, value: unknown) => setEditing((e) => ({ ...(e ?? {}), [name]: value }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>{title}</h1>
          {description && <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{description}</p>}
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          {searchable && (
            <input className="form-input" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 200 }} />
          )}
          <button className="btn btn-primary" onClick={() => { setIsNew(true); setEditing({ ...defaults }); }}>
            Add {itemName}
          </button>
        </div>
      </div>

      {editing && (
        <form
          className="card"
          style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}
          onSubmit={(e) => { e.preventDefault(); save.mutate(editing); }}
        >
          <h2 style={{ fontWeight: 700 }}>{isNew ? `New ${itemName}` : `Edit ${itemName}`}</h2>
          {fields.map((f) => {
            const value = editing[f.name];
            const id = `f-${f.name}`;
            if (f.type === "checkbox") {
              return (
                <label key={f.name} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <input type="checkbox" checked={Boolean(value)} onChange={(e) => set(f.name, e.target.checked)} /> {f.label}
                </label>
              );
            }
            return (
              <div className="form-group" key={f.name}>
                <label className="form-label" htmlFor={id}>{f.label}{f.required && <span className="required"> *</span>}</label>
                {f.type === "textarea" ? (
                  <textarea id={id} className="form-input" rows={5} required={f.required} value={String(value ?? "")} onChange={(e) => set(f.name, e.target.value)} />
                ) : f.type === "select" ? (
                  <select id={id} className="form-input" value={String(value ?? "")} onChange={(e) => set(f.name, e.target.value)}>
                    {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : (
                  <input
                    id={id}
                    className="form-input"
                    type={f.type === "number" ? "number" : "text"}
                    required={f.required}
                    value={Array.isArray(value) ? value.join(", ") : String(value ?? "")}
                    onChange={(e) => set(f.name, f.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)}
                  />
                )}
                {f.hint && <span className="form-hint">{f.hint}</span>}
              </div>
            );
          })}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button className="btn btn-primary" type="submit" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save"}</button>
            <button className="btn btn-ghost" type="button" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="skeleton" style={{ height: 120 }} />
      ) : items.length === 0 ? (
        <div className="card" style={{ padding: "1.5rem", color: "var(--text-muted)" }}>
          No {itemName.toLowerCase()} entries yet. Use “Add {itemName}” to create the first one.
        </div>
      ) : (
        <div className="table-container">
          <table style={{ width: "100%" }}>
            <thead>
              <tr>
                {columns.map((c) => <th key={c.key}>{c.label}</th>)}
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={String(row.id)}>
                  {columns.map((c) => (
                    <td key={c.key}>{c.render ? c.render(row) : String(row[c.key] ?? "—")}</td>
                  ))}
                  <td style={{ whiteSpace: "nowrap" }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => { setIsNew(false); setEditing({ ...row }); }}>Edit</button>{" "}
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => { if (window.confirm(`${removeLabel} this ${itemName.toLowerCase()}?`)) remove.mutate(String(row.id)); }}
                    >
                      {removeLabel}
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

export const yesNo = (v: unknown) => (
  <span className={`badge ${v ? "badge-success" : "badge-warning"}`}>{v ? "Yes" : "No"}</span>
);

export const trunc = (v: unknown, n = 80) => {
  const s = String(v ?? "");
  return s.length > n ? s.slice(0, n) + "…" : s || "—";
};
