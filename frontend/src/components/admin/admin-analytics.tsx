"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import apiClient from "@/lib/api-client";

interface Group { name: string; count: number }
interface Analytics {
  total_customers: number;
  new_leads_today: number;
  new_leads_week: number;
  open_enquiries: number;
  appointments_today: number;
  unread_chats: number;
  calculator_usage: number;
  ai_sessions: number;
  leads_by_day: { date: string; count: number }[];
  leads_by_status: Group[];
  appointments_by_status: Group[];
  plans_by_status: Group[];
}

function GroupCard({ title, groups }: { title: string; groups: Group[] }) {
  return (
    <div className="card" style={{ padding: "1.25rem" }}>
      <h3 style={{ fontWeight: 700, marginBottom: "0.75rem" }}>{title}</h3>
      {groups.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No data yet.</p>
      ) : (
        groups.map((g) => (
          <div key={g.name} style={{ display: "flex", justifyContent: "space-between", padding: "0.25rem 0" }}>
            <span>{g.name}</span><strong>{g.count}</strong>
          </div>
        ))
      )}
    </div>
  );
}

export function AdminAnalytics() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => (await apiClient.get("/analytics/dashboard")).data as Analytics,
  });

  if (isLoading || !data) return <div className="skeleton" style={{ height: 240 }} />;

  const tiles = [
    ["Customers", data.total_customers],
    ["Leads today", data.new_leads_today],
    ["Leads this week", data.new_leads_week],
    ["Open enquiries", data.open_enquiries],
    ["Appointments today", data.appointments_today],
    ["Unread chats", data.unread_chats],
    ["Calculator uses", data.calculator_usage],
    ["AI sessions", data.ai_sessions],
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Analytics</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
        {tiles.map(([label, value]) => (
          <div key={label as string} className="card" style={{ padding: "1.25rem" }}>
            <div style={{ fontSize: "1.75rem", fontWeight: 800 }}>{value}</div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{label}</div>
          </div>
        ))}
      </div>
      <div className="card" style={{ padding: "1.25rem" }}>
        <h3 style={{ fontWeight: 700, marginBottom: "1rem" }}>Leads in the last 7 days</h3>
        <div style={{ width: "100%", height: 240 }}>
          <ResponsiveContainer>
            <BarChart data={data.leads_by_day}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(d) => String(d).slice(5)} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#0066B3" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
        <GroupCard title="Leads by status" groups={data.leads_by_status} />
        <GroupCard title="Appointments by status" groups={data.appointments_by_status} />
        <GroupCard title="Plans by status" groups={data.plans_by_status} />
      </div>
    </div>
  );
}
