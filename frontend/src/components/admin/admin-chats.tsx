"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { useToast } from "@/components/ui/toaster";

interface Conversation {
  id: string;
  customer_name: string;
  customer_phone?: string | null;
  status: string;
  source: string;
  customer_goal?: string | null;
  ai_summary?: string | null;
  agent_unread: number;
  last_message_at?: string | null;
  created_at: string;
}

interface ChatMessage {
  id: string;
  from_customer: boolean;
  content?: string | null;
  created_at: string;
}

const STATUSES = ["ACTIVE", "PENDING", "RESOLVED", "CLOSED"];
const fmt = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }) : "—";

export function AdminChats() {
  const toast = useToast();
  const qc = useQueryClient();
  const [filter, setFilter] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [reply, setReply] = useState("");

  const list = useQuery({
    queryKey: ["admin-chats", filter],
    queryFn: async () => {
      const { data } = await apiClient.get("/admin/conversations", { params: { status: filter || undefined, per_page: 100 } });
      return data as { items: Conversation[]; total: number };
    },
    refetchInterval: 15000,
  });

  const messages = useQuery({
    queryKey: ["admin-chat-messages", openId],
    queryFn: async () => (await apiClient.get(`/admin/conversations/${openId}/messages`)).data as { items: ChatMessage[] },
    enabled: !!openId,
    refetchInterval: 10000,
  });

  const send = useMutation({
    mutationFn: () => apiClient.post(`/admin/conversations/${openId}/messages`, { content: reply }),
    onSuccess: () => {
      setReply("");
      qc.invalidateQueries({ queryKey: ["admin-chat-messages", openId] });
      qc.invalidateQueries({ queryKey: ["admin-chats"] });
    },
    onError: () => toast.error("Could not send the message"),
  });

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => apiClient.patch(`/admin/conversations/${id}`, { status }),
    onSuccess: () => {
      toast.success("Conversation updated");
      qc.invalidateQueries({ queryKey: ["admin-chats"] });
    },
    onError: () => toast.error("Could not update the conversation"),
  });

  const items = list.data?.items ?? [];
  const open = items.find((c) => c.id === openId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", alignItems: "center" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Live Chats</h1>
        <select className="form-input" style={{ width: "auto" }} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.25rem", alignItems: "start" }}>
        <div className="card" style={{ padding: "0.5rem", maxHeight: 560, overflowY: "auto" }}>
          {list.isLoading ? (
            <div className="skeleton" style={{ height: 100 }} />
          ) : items.length === 0 ? (
            <p style={{ padding: "1rem", color: "var(--text-muted)" }}>No conversations yet.</p>
          ) : (
            items.map((c) => (
              <button
                key={c.id}
                onClick={() => setOpenId(c.id)}
                style={{
                  display: "block", width: "100%", textAlign: "left", padding: "0.75rem 1rem", border: "none", cursor: "pointer",
                  borderBottom: "1px solid var(--border)", background: c.id === openId ? "var(--primary-50)" : "transparent",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
                  <strong>{c.customer_name}</strong>
                  {c.agent_unread > 0 && <span className="badge badge-danger">{c.agent_unread} new</span>}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  {c.status} · {c.source === "AI_HANDOFF" ? "From AI chat" : c.source} · {fmt(c.last_message_at ?? c.created_at)}
                </div>
              </button>
            ))
          )}
        </div>

        <div className="card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem", minHeight: 240 }}>
          {!open ? (
            <p style={{ color: "var(--text-muted)" }}>Select a conversation to read it.</p>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <h2 style={{ fontWeight: 700 }}>{open.customer_name}</h2>
                  {open.customer_phone && <a href={`tel:${open.customer_phone}`} style={{ fontSize: "0.85rem" }}>{open.customer_phone}</a>}
                </div>
                <select className="form-input" style={{ width: "auto" }} value={open.status} onChange={(e) => setStatus.mutate({ id: open.id, status: e.target.value })}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {open.ai_summary && <p className="disclaimer-box" style={{ fontSize: "0.85rem" }}><strong>AI summary:</strong> {open.ai_summary}</p>}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: 320, overflowY: "auto" }}>
                {(messages.data?.items ?? []).map((m) => (
                  <div
                    key={m.id}
                    style={{
                      alignSelf: m.from_customer ? "flex-start" : "flex-end", maxWidth: "80%", padding: "0.5rem 0.75rem",
                      borderRadius: 12, background: m.from_customer ? "var(--surface)" : "var(--primary-50)", border: "1px solid var(--border)",
                    }}
                  >
                    <div style={{ whiteSpace: "pre-wrap" }}>{m.content}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{fmt(m.created_at)}</div>
                  </div>
                ))}
                {messages.data && messages.data.items.length === 0 && <p style={{ color: "var(--text-muted)" }}>No messages.</p>}
              </div>
              <form
                style={{ display: "flex", gap: "0.5rem" }}
                onSubmit={(e) => { e.preventDefault(); if (reply.trim()) send.mutate(); }}
              >
                <input className="form-input" placeholder="Type a reply…" value={reply} onChange={(e) => setReply(e.target.value)} />
                <button className="btn btn-primary" type="submit" disabled={send.isPending || !reply.trim()}>Send</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
