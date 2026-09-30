"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Menu,
  X,
  Phone,
  ChevronDown,
  Shield,
  Calculator,
  MessageCircle,
  FileText,
  BookOpen,
  Info,
  Home,
  LayoutDashboard,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { authService } from "@/services/auth";
import { useRouter } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  {
    label: "Plans",
    icon: Shield,
    children: [
      { href: "/plans", label: "All Plans" },
      { href: "/plans?category=Protection", label: "Protection Plans" },
      { href: "/plans?category=Savings", label: "Savings Plans" },
      { href: "/plans?category=Child Plans", label: "Child Plans" },
      { href: "/plans?category=Pension", label: "Pension Plans" },
      { href: "/plans/compare", label: "Compare Plans" },
    ],
  },
  {
    label: "Calculators",
    icon: Calculator,
    children: [
      { href: "/calculators/premium", label: "Premium Calculator" },
      { href: "/calculators/maturity", label: "Maturity Calculator" },
      { href: "/calculators/retirement", label: "Retirement Calculator" },
      { href: "/calculators/child-education", label: "Child Education" },
    ],
  },
  { href: "/about", label: "About", icon: Info },
  { href: "/blog", label: "Blog", icon: BookOpen },
  { href: "/contact", label: "Contact", icon: Phone },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      logout();
      router.push("/");
    }
  };

  return (
    <>
      {/* ── Disclaimer Banner ── */}
      <div
        style={{
          background: "#003B73",
          color: "rgba(255,255,255,0.85)",
          fontSize: "0.75rem",
          textAlign: "center",
          padding: "0.375rem 1rem",
          lineHeight: 1.4,
        }}
      >
        This website is operated by an individual LIC agent. It is NOT the official LIC website.{" "}
        <Link
          href="/disclaimer"
          style={{ color: "#C9A227", textDecoration: "underline" }}
        >
          Learn more
        </Link>
      </div>

      {/* ── Main Header ── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "#ffffff",
          borderBottom: "1px solid var(--border)",
          boxShadow: scrolled ? "var(--shadow-md)" : "none",
          transition: "box-shadow 0.2s ease",
        }}
      >
        <div className="container-site">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: "72px",
            }}
          >
            {/* Logo */}
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                textDecoration: "none",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  background: "#003B73",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#C9A227",
                  fontWeight: 800,
                  fontSize: "1.125rem",
                }}
              >
                LIC
              </div>
              <div>
                <div
                  style={{
                    fontSize: "1.0625rem",
                    fontWeight: 700,
                    color: "#003B73",
                    lineHeight: 1.2,
                  }}
                >
                  LIC Agent
                </div>
                <div
                  style={{
                    fontSize: "0.6875rem",
                    color: "var(--text-muted)",
                    fontWeight: 500,
                  }}
                >
                  Insurance Advisor
                </div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
              className="desktop-nav"
            >
              {navLinks.map((link) =>
                link.children ? (
                  <div
                    key={link.label}
                    style={{ position: "relative" }}
                    onMouseEnter={() => setActiveDropdown(link.label)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        padding: "0.5rem 0.75rem",
                        fontSize: "0.9375rem",
                        fontWeight: 500,
                        color: "var(--text-primary)",
                        background: "none",
                        border: "none",
                        borderRadius: "var(--radius-md)",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {link.label}
                      <ChevronDown size={14} />
                    </button>
                    {activeDropdown === link.label && (
                      <div
                        style={{
                          position: "absolute",
                          top: "calc(100% + 4px)",
                          left: 0,
                          background: "#ffffff",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius-lg)",
                          boxShadow: "var(--shadow-xl)",
                          minWidth: "200px",
                          padding: "0.5rem",
                          zIndex: 100,
                        }}
                        className="animate-scale-in"
                      >
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            style={{
                              display: "block",
                              padding: "0.625rem 0.875rem",
                              fontSize: "0.9rem",
                              color: "var(--text-secondary)",
                              borderRadius: "var(--radius-md)",
                              transition: "all 0.15s ease",
                              textDecoration: "none",
                            }}
                            onMouseEnter={(e) => {
                              (e.target as HTMLElement).style.background = "var(--primary-50)";
                              (e.target as HTMLElement).style.color = "#003B73";
                            }}
                            onMouseLeave={(e) => {
                              (e.target as HTMLElement).style.background = "none";
                              (e.target as HTMLElement).style.color = "var(--text-secondary)";
                            }}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href!}
                    style={{
                      padding: "0.5rem 0.75rem",
                      fontSize: "0.9375rem",
                      fontWeight: 500,
                      color: "var(--text-primary)",
                      borderRadius: "var(--radius-md)",
                      transition: "all 0.15s ease",
                      textDecoration: "none",
                    }}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>

            {/* Desktop CTAs */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
              className="desktop-nav"
            >
              <Link href="/chat" className="btn btn-secondary btn-sm">
                <MessageCircle size={16} />
                Chat with Advisor
              </Link>
              {isAuthenticated ? (
                <div style={{ position: "relative" }}
                  onMouseEnter={() => setActiveDropdown("user")}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.5rem 0.875rem",
                      background: "var(--primary-50)",
                      border: "1.5px solid var(--primary-200)",
                      borderRadius: "var(--radius-md)",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      color: "#003B73",
                      cursor: "pointer",
                    }}
                  >
                    {user?.first_name}
                    <ChevronDown size={14} />
                  </button>
                  {activeDropdown === "user" && (
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 4px)",
                        right: 0,
                        background: "#ffffff",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-lg)",
                        boxShadow: "var(--shadow-xl)",
                        minWidth: "180px",
                        padding: "0.5rem",
                        zIndex: 100,
                      }}
                    >
                      {(user?.role === "AGENT" || user?.role === "ADMIN") && (
                        <Link
                          href="/admin"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            padding: "0.625rem 0.875rem",
                            fontSize: "0.9rem",
                            color: "var(--text-secondary)",
                            borderRadius: "var(--radius-md)",
                            textDecoration: "none",
                          }}
                        >
                          <LayoutDashboard size={15} />
                          Admin Dashboard
                        </Link>
                      )}
                      <Link
                        href="/dashboard"
                        style={{
                          display: "block",
                          padding: "0.625rem 0.875rem",
                          fontSize: "0.9rem",
                          color: "var(--text-secondary)",
                          borderRadius: "var(--radius-md)",
                          textDecoration: "none",
                        }}
                      >
                        My Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        style={{
                          display: "block",
                          width: "100%",
                          textAlign: "left",
                          padding: "0.625rem 0.875rem",
                          fontSize: "0.9rem",
                          color: "var(--danger)",
                          borderRadius: "var(--radius-md)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" className="btn btn-primary btn-sm">
                  Login / Register
                </Link>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                padding: "0.5rem",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-primary)",
              }}
              className="mobile-nav-btn"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      {mobileOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 49,
            background: "rgba(0,0,0,0.4)",
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "300px",
          background: "#003B73",
          color: "#fff",
          zIndex: 50,
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease",
          overflowY: "auto",
          padding: "1.5rem 1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.25rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ fontWeight: 700, fontSize: "1.125rem", color: "#C9A227" }}>
            LIC Agent
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}
          >
            <X size={22} />
          </button>
        </div>

        {navLinks.map((link) =>
          link.children ? (
            <div key={link.label} style={{ marginBottom: "0.25rem" }}>
              <div
                style={{
                  padding: "0.625rem 0.875rem",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                {link.label}
              </div>
              {link.children.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: "block",
                    padding: "0.625rem 1.25rem",
                    fontSize: "0.9375rem",
                    color: "rgba(255,255,255,0.8)",
                    textDecoration: "none",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          ) : (
            <Link
              key={link.href}
              href={link.href!}
              onClick={() => setMobileOpen(false)}
              style={{
                display: "block",
                padding: "0.75rem 0.875rem",
                fontSize: "0.9375rem",
                color: "rgba(255,255,255,0.85)",
                fontWeight: 500,
                textDecoration: "none",
                borderRadius: "var(--radius-md)",
              }}
            >
              {link.label}
            </Link>
          )
        )}

        <div style={{ marginTop: "auto", paddingTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <Link
            href="/chat"
            onClick={() => setMobileOpen(false)}
            className="btn btn-gold"
            style={{ justifyContent: "center" }}
          >
            <MessageCircle size={16} />
            Chat with Advisor
          </Link>
          {isAuthenticated ? (
            <button
              onClick={() => { handleLogout(); setMobileOpen(false); }}
              className="btn btn-secondary"
              style={{ justifyContent: "center", color: "#fff", borderColor: "rgba(255,255,255,0.4)" }}
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="btn btn-secondary"
              style={{ justifyContent: "center", color: "#fff", borderColor: "rgba(255,255,255,0.4)" }}
            >
              Login / Register
            </Link>
          )}
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
        }
        @media (min-width: 901px) {
          .mobile-nav-btn { display: none !important; }
        }
      `}</style>
    </>
  );
}
