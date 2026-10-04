"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import apiClient from "@/lib/api-client";
import { useToast } from "@/components/ui/toaster";

interface Doc {
  id: string;
  original_filename: string;
  title?: string | null;
  doc_type: string;
  size_bytes: number;
  visibility: string;
  include_in_ai: boolean;
  processing_status: string;
  created_at: string;
}

const size = (b: number) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

export function AdminDocuments() {
  const toast = useToast();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ title: "", visibility: "INTERNAL", include_in_ai: false });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-documents"],
    queryFn: async () => (await apiClient.get("/admin/documents", { params: { per_page: 100 } })).data as { items: Doc[] },
  });

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const body = new FormData();
      body.append("file", file);
      body.append("title", form.title);
      body.append("visibility", form.visibility);
      body.append("include_in_ai", String(form.include_in_ai));
      return apiClient.post("/admin/documents", body, { headers: { "Content-Type": "multipart/form-data" } });
    },
    onSuccess: () => {
      toast.success("Document uploaded");
      setForm({ title: "", visibility: "INTERNAL", include_in_ai: false });
      if (fileRef.current) fileRef.current.value = "";
      qc.invalidateQueries({ queryKey: ["admin-documents"] });
    },
    onError: (e) => {
      const d = isAxiosError(e) ? e.response?.data?.detail : null;
      toast.error("Upload failed", typeof d === "string" ? d : "Only PDF, DOCX and TXT files are allowed.");
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/documents/${id}`),
    onSuccess: () => {
      toast.success("Document removed");
      qc.invalidateQueries({ queryKey: ["admin-documents"] });
    },
    onError: () => toast.error("Could not remove the document"),
  });

  const items = data?.items ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Documents</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Upload PDF, DOCX or TXT files such as brochures and policy documents.</p>
      </div>

      <form
        className="card"
        style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", maxWidth: 560 }}
        onSubmit={(e) => {
          e.preventDefault();
          const file = fileRef.current?.files?.[0];
          if (file) upload.mutate(file);
        }}
      >
        <div className="form-group">
          <label className="form-label" htmlFor="d-file">File <span className="required">*</span></label>
          <input id="d-file" ref={fileRef} type="file" required accept=".pdf,.docx,.txt" className="form-input" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="d-title">Title</label>
          <input id="d-title" className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="d-vis">Visibility</label>
          <select id="d-vis" className="form-input" value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })}>
            <option value="INTERNAL">Internal (agent only)</option>
            <option value="PUBLIC">Public (customers can see)</option>
            <option value="AI_ONLY">AI only</option>
          </select>
        </div>
        <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <input type="checkbox" checked={form.include_in_ai} onChange={(e) => setForm({ ...form, include_in_ai: e.target.checked })} />
          Allow the AI assistant to use this document
        </label>
        <button className="btn btn-primary" type="submit" disabled={upload.isPending}>{upload.isPending ? "Uploading…" : "Upload"}</button>
      </form>

      {isLoading ? (
        <div className="skeleton" style={{ height: 100 }} />
      ) : items.length === 0 ? (
        <div className="card" style={{ padding: "1.5rem", color: "var(--text-muted)" }}>No documents uploaded yet.</div>
      ) : (
        <div className="table-container">
          <table style={{ width: "100%" }}>
            <thead><tr><th>Document</th><th>Type</th><th>Size</th><th>Visibility</th><th>AI</th><th>Uploaded</th><th /></tr></thead>
            <tbody>
              {items.map((d) => (
                <tr key={d.id}>
                  <td><strong>{d.title || d.original_filename}</strong>{d.title && <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{d.original_filename}</div>}</td>
                  <td>{d.doc_type}</td>
                  <td>{size(d.size_bytes)}</td>
                  <td>{d.visibility}</td>
                  <td>{d.include_in_ai ? "Allowed" : "No"}</td>
                  <td>{new Date(d.created_at).toLocaleDateString("en-IN")}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => { if (window.confirm("Remove this document?")) remove.mutate(d.id); }}>Remove</button>
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
