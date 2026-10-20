"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Users, TrendingUp, Calendar, MessageSquare,
  Shield, Brain, ArrowUpRight, Clock,
} from "lucide-react";
import apiClient from "@/lib/api-client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { chartTheme } from "@/components/admin/chart-theme";

interface DashboardData {
  total_customers: number;
  new_leads_today: number;
  new_leads_week: number;
  open_enquiries: number;
  appointments_today: number;
  unread_chats: number;
  popular_plans: { name: string; views: number }[];
  leads_by_day: { date: string; count: number }[];
  calculator_usage: number;
  ai_sessions: number;
}

const METRIC_CARDS = (data: DashboardData) => [
  {
    icon: Users,
    label: "Total Customers",
    value: data.total_customers.toLocaleString(),
    color: "#3BB0FF",
    bg: "var(--primary-50)",
  },
  {
    icon: TrendingUp,
    label: "New Leads Today",
    value: data.new_leads_today.toString(),
    sub: `${data.new_leads_week} this week`,
    color: "#34D399",
    bg: "var(--success-light)",
  },
  {
    icon: Calendar,
    label: "Appointments Today",
    value: data.appointments_today.toString(),
    color: "#22E4FF",
    bg: "rgba(34, 228, 255, 0.12)",
  },
  {
    icon: MessageSquare,
    label: "Unread Chats",
    value: data.unread_chats.toString(),
    color: data.unread_chats > 0 ? "var(--danger)" : "#34D399",
    bg: data.unread_chats > 0 ? "var(--danger-light)" : "var(--success-light)",
  },
  {
    icon: Brain,
    label: "AI Sessions",
    value: data.ai_sessions.toLocaleString(),
    color: "#A78BFA",
    bg: "rgba(167, 139, 250, 0.14)",
  },
  {
    icon: Shield,
    label: "Open Enquiries",
    value: data.open_enquiries.toString(),
    color: "#FFCC00",
    bg: "var(--warning-light)",
  },
];

const MOCK_DATA: DashboardData = {
  total_customers: 0,
  new_leads_today: 0,
  new_leads_week: 0,
  open_enquiries: 0,
  appointments_today: 0,
  unread_chats: 0,
  popular_plans: [],
  leads_by_day: [],
  calculator_usage: 0,
  ai_sessions: 0,
};

export function AdminOverview() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const { data } = await apiClient.get("/analytics/dashboard");
      return data;
    },
    placeholderData: MOCK_DATA,
    staleTime: 60 * 1000,
  });

  const stats = data || MOCK_DATA;

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)" }}>
          Dashboard Overview
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
          Welcome back. Here&apos;s what&apos;s happening with your platform.
        </p>
      </div>

      {/* Metric cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "1.25rem",
          marginBottom: "2rem",
        }}
      >
        {METRIC_CARDS(stats).map(({ icon: Icon, label, value, sub, color, bg }) => (
          <div
            key={label}
            className="card"
            style={{ padding: "1.5rem" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  background: bg,
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={20} style={{ color }} />
              </div>
              <ArrowUpRight size={16} style={{ color: "var(--text-muted)" }} />
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>
              {isLoading ? (
                <div className="skeleton" style={{ height: 28, width: 60 }} />
              ) : (
                value
              )}
            </div>
            <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: "0.375rem" }}>
              {label}
            </div>
            {sub && (
              <div style={{ fontSize: "0.75rem", color, marginTop: "0.25rem", fontWeight: 500 }}>
                {sub}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        {/* Leads trend */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: "1.5rem",
            }}
          >
            Leads This Week
          </h3>
          {stats.leads_by_day && stats.leads_by_day.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.leads_by_day}>
                <CartesianGrid {...chartTheme.grid} />
                <XAxis dataKey="date" {...chartTheme.axis} />
                <YAxis {...chartTheme.axis} />
                <Tooltip {...chartTheme.tooltip} />
                <Bar dataKey="count" fill={chartTheme.bar} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{
                height: 220,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-muted)",
                fontSize: "0.875rem",
              }}
            >
              No lead data yet
            </div>
          )}
        </div>

        {/* Popular plans */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: "1.5rem",
            }}
          >
            Popular Plans
          </h3>
          {stats.popular_plans && stats.popular_plans.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {stats.popular_plans.slice(0, 6).map((plan, i) => (
                <div
                  key={plan.name}
                  style={{ display: "flex", alignItems: "center", gap: "1rem" }}
                >
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      background: i === 0 ? "#FFCC00" : "var(--bg)",
                      border: i === 0 ? "none" : "1px solid var(--border)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: i === 0 ? "#1A1300" : "var(--text-muted)",
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span style={{ flex: 1, fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                    {plan.name}
                  </span>
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--text-muted)",
                      fontWeight: 600,
                    }}
                  >
                    {plan.views} views
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 200,
                color: "var(--text-muted)",
                fontSize: "0.875rem",
              }}
            >
              No plan view data yet
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="card" style={{ padding: "1.5rem" }}>
        <h3
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "1.25rem",
          }}
        >
          Quick Actions
        </h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
          {[
            { href: "/admin/leads?status=NEW", label: "Review New Leads", color: "btn-primary" },
            { href: "/admin/chats", label: "Open Chats", color: "btn-secondary" },
            { href: "/admin/plans/new", label: "Add Plan", color: "btn-secondary" },
            { href: "/admin/appointments", label: "Appointments", color: "btn-secondary" },
            { href: "/admin/analytics", label: "Full Analytics", color: "btn-secondary" },
          ].map(({ href, label, color }) => (
            <a key={href} href={href} className={`btn ${color} btn-sm`}>
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
