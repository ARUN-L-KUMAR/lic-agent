"use client";

import { LogoMark } from "@/components/brand/logo";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, ChevronDown, MessageCircle, LayoutDashboard, LogOut, UserRound } from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { authService } from "@/services/auth";
import { usePathname, useRouter } from "next/navigation";
import { useSiteSettings } from "@/lib/use-site-settings";

type NavLink = { href: string; label: string };
type NavItem = { label: string; href?: string; children?: NavLink[] };

const navLinks: NavItem[] = [
  { href: "/", label: "Home" },
  {
    label: "Plans",
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
    children: [
      { href: "/calculators/premium", label: "Premium Calculator" },
      { href: "/calculators/maturity", label: "Maturity Calculator" },
      { href: "/calculators/retirement", label: "Retirement Calculator" },
      { href: "/calculators/child-education", label: "Child Education" },
    ],
  },
  {
    label: "About",
    children: [
      { href: "/about", label: "About the Agent" },
      { href: "/blog", label: "Blog" },
      { href: "/contact", label: "Contact" },
    ],
  },
  { href: "/gallery", label: "Gallery" },
];

/** Path part of an href, without the query string. */
const pathOf = (href: string) => href.split("?")[0];

function isActive(item: NavItem, pathname: string) {
  if (item.href) return item.href === "/" ? pathname === "/" : pathname.startsWith(pathOf(item.href));
  return !!item.children?.some((c) => pathname === pathOf(c.href) || pathname.startsWith(pathOf(c.href) + "/"));
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const site = useSiteSettings();

  // Menus remember the route they were opened on, so navigating closes them without an effect.
  const [mobileFor, setMobileFor] = useState<string | null>(null);
  const [dropdown, setDropdown] = useState<{ name: string; path: string } | null>(null);
  const mobileOpen = mobileFor === pathname;
  const activeDropdown = dropdown?.path === pathname ? dropdown.name : null;
  const setMobileOpen = (open: boolean) => setMobileFor(open ? pathname : null);
  const setActiveDropdown = (name: string | null) => setDropdown(name ? { name, path: pathname } : null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-nav-dropdown]")) setDropdown(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDropdown(null);
        setMobileFor(null);
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Lock page scroll behind the mobile drawer
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      logout();
      router.push("/");
    }
  };

  const isStaff = user?.role === "AGENT" || user?.role === "ADMIN";

  return (
    <>
      {/* ── Disclaimer strip ── */}
      <div className="topbar">
        This website is operated by {site.agent_name}, LIC Agent. It is not the official LIC website.{" "}
        <Link href="/disclaimer">Learn more</Link>
      </div>

      {/* ── Main top navigation ── */}
      <header className={`site-header${scrolled ? " scrolled" : ""}`}>
        <div className="container-site">
          <div className="header-inner">
            {/* Brand */}
            <Link href="/" className="brand" aria-label={`${site.agent_name} — home`}>
              <LogoMark size={44} full />
              <div>
                <div className="brand-name">{site.agent_name}</div>
                <div className="brand-role">LIC Agent</div>
              </div>
            </Link>

            {/* Primary nav */}
            <nav className="nav desktop-only" aria-label="Primary">
              {navLinks.map((item) =>
                item.children ? (
                  <div
                    key={item.label}
                    data-nav-dropdown
                    className="nav-item"
                    onMouseEnter={() => setActiveDropdown(item.label)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button
                      type="button"
                      aria-haspopup="menu"
                      aria-expanded={activeDropdown === item.label}
                      className={`nav-trigger${isActive(item, pathname) ? " active" : ""}`}
                      onClick={() => setActiveDropdown(activeDropdown === item.label ? null : item.label)}
                    >
                      {item.label}
                      <ChevronDown size={14} className="chev" />
                    </button>
                    {activeDropdown === item.label && (
                      <div className="nav-menu-wrap">
                        <div role="menu" className="nav-menu">
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              role="menuitem"
                              onClick={() => setActiveDropdown(null)}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href!}
                    className={`nav-link${isActive(item, pathname) ? " active" : ""}`}
                    aria-current={isActive(item, pathname) ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                )
              )}
            </nav>

            {/* Actions */}
            <div className="header-actions desktop-only">
              <Link href="/chat" className="btn btn-secondary btn-sm">
                <MessageCircle size={16} />
                <span>Chat<span className="chat-long"> with Advisor</span></span>
              </Link>
              {isAuthenticated ? (
                <div
                  data-nav-dropdown
                  className="nav-item"
                  onMouseEnter={() => setActiveDropdown("user")}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={activeDropdown === "user"}
                    className="user-chip"
                    onClick={() => setActiveDropdown(activeDropdown === "user" ? null : "user")}
                  >
                    <UserRound size={15} />
                    {user?.first_name}
                    <ChevronDown size={14} />
                  </button>
                  {activeDropdown === "user" && (
                    <div className="nav-menu-wrap right">
                      <div role="menu" className="nav-menu" style={{ minWidth: 200, transformOrigin: "top right" }}>
                        {isStaff && (
                          <Link href="/admin" role="menuitem">
                            <LayoutDashboard size={15} />
                            Admin Dashboard
                          </Link>
                        )}
                        <Link href="/dashboard" role="menuitem">
                          <UserRound size={15} />
                          My Dashboard
                        </Link>
                        <button type="button" role="menuitem" className="danger" onClick={handleLogout}>
                          <LogOut size={15} />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" className="btn btn-primary btn-sm">
                  Login / Register
                </Link>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="mobile-toggle"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      {mobileOpen && <div className="mobile-scrim" onClick={() => setMobileOpen(false)} />}
      <aside className={`mobile-panel${mobileOpen ? " open" : ""}`} aria-hidden={!mobileOpen} aria-label="Menu">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <div className="brand-name" style={{ fontSize: "1.0625rem" }}>
            {site.agent_name}
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="mobile-toggle"
            style={{ display: "inline-flex" }}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {navLinks.map((item) =>
          item.children ? (
            <div key={item.label}>
              <div className="mobile-group-title">{item.label}</div>
              {item.children.map((child) => (
                <Link key={child.href} href={child.href} className="mobile-link" tabIndex={mobileOpen ? 0 : -1}>
                  {child.label}
                </Link>
              ))}
            </div>
          ) : (
            <Link
              key={item.href}
              href={item.href!}
              className={`mobile-link${isActive(item, pathname) ? " active" : ""}`}
              tabIndex={mobileOpen ? 0 : -1}
            >
              {item.label}
            </Link>
          )
        )}

        <div style={{ marginTop: "auto", paddingTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <Link href="/chat" className="btn btn-gold" style={{ justifyContent: "center" }} tabIndex={mobileOpen ? 0 : -1}>
            <MessageCircle size={16} />
            Chat with Advisor
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                href={isStaff ? "/admin" : "/dashboard"}
                className="btn btn-secondary"
                style={{ justifyContent: "center" }}
                tabIndex={mobileOpen ? 0 : -1}
              >
                {isStaff ? "Admin Dashboard" : "My Dashboard"}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-ghost"
                style={{ justifyContent: "center", color: "var(--danger)" }}
                tabIndex={mobileOpen ? 0 : -1}
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="btn btn-primary" style={{ justifyContent: "center" }} tabIndex={mobileOpen ? 0 : -1}>
              Login / Register
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
