"use client";

import { LogoMark } from "@/components/brand/logo";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutDashboard, Users, TrendingUp, Shield, Calendar,
  MessageSquare, Brain, FileText, Star, FolderOpen,
  BarChart2, Settings, LogOut, Bell, Search,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { authService } from "@/services/auth";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/leads", label: "Leads", icon: TrendingUp },
  { href: "/admin/plans", label: "Plans", icon: Shield },
  { href: "/admin/appointments", label: "Appointments", icon: Calendar },
  { href: "/admin/chats", label: "Live Chats", icon: MessageSquare },
  { href: "/admin/ai-knowledge", label: "AI Knowledge", icon: Brain },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/testimonials", label: "Testimonials", icon: Star },
  { href: "/admin/documents", label: "Documents", icon: FolderOpen },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, setLoading, logout } = useAuthStore();

  useEffect(() => {
    // Guard: must be AGENT or ADMIN
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (user && user.role === "CUSTOMER") {
      router.push("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      logout();
      router.push("/");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        {/* Logo */}
        <div
          style={{
            padding: "1.5rem 1.25rem 1.25rem",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Link
            href="/"
            style={{ textDecoration: "none" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <LogoMark size={38} variant="onDark" />
              <div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.9rem", lineHeight: 1.2 }}>
                  LIC Agent
                </div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem" }}>
                  Admin Dashboard
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ padding: "1rem 0", flex: 1 }}>
          <div style={{ marginBottom: "0.5rem" }}>
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`admin-nav-item ${isActive ? "active" : ""}`}
                >
                  <Icon size={17} />
                  {label}
                  {isActive && (
                    <ChevronRight size={14} style={{ marginLeft: "auto" }} />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User */}
        <div
          style={{
            padding: "1rem",
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.75rem",
              background: "rgba(255,255,255,0.06)",
              borderRadius: "var(--radius-md)",
              marginBottom: "0.75rem",
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "#FFCC00",
                color: "#172033",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.9rem",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {user?.first_name?.charAt(0) || "A"}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div
                style={{
                  color: "#fff",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  lineHeight: 1.2,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user?.first_name} {user?.last_name}
              </div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem" }}>
                {user?.role}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="admin-nav-item"
            style={{ width: "100%", border: "none", background: "none", cursor: "pointer" }}
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main
        style={{
          marginLeft: "260px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        {/* Topbar */}
        <header
          style={{
            background: "var(--surface)",
            borderBottom: "1px solid var(--border)",
            padding: "0 1.5rem",
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 30,
          }}
        >
          <div style={{ position: "relative", flex: "0 1 360px" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "0.875rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            />
            <input
              type="text"
              placeholder="Search..."
              className="form-input"
              style={{ paddingLeft: "2.5rem", fontSize: "0.875rem" }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-muted)",
                padding: "0.5rem",
                borderRadius: "var(--radius-md)",
                position: "relative",
              }}
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span
                style={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  width: "8px",
                  height: "8px",
                  background: "var(--danger)",
                  borderRadius: "50%",
                  border: "2px solid var(--surface)",
                }}
              />
            </button>
            <Link
              href="/"
              style={{
                fontSize: "0.8125rem",
                color: "var(--text-muted)",
                textDecoration: "none",
              }}
            >
              View Site
            </Link>
          </div>
        </header>

        {/* Page content */}
        <div style={{ flex: 1, padding: "2rem 1.5rem" }}>
          {children}
        </div>
      </main>

      <style jsx global>{`
        @media (max-width: 1024px) {
          .admin-sidebar { display: none; }
          main[style*="margin-left: 260px"] { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
}
