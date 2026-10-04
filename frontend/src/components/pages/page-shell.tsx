import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export function PageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main style={{ background: "var(--bg)", minHeight: "60vh" }}>
        <section
          style={{
            background: "linear-gradient(135deg, #004B87 0%, #0066B3 100%)",
            padding: "3rem 0 2rem",
            color: "#fff",
          }}
        >
          <div className="container-site">
            <h1 style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 800, color: "#fff", marginBottom: "0.5rem" }}>
              {title}
            </h1>
            {subtitle && <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1rem" }}>{subtitle}</p>}
          </div>
        </section>
        <div className="container-site" style={{ padding: "2.5rem 1rem 4rem" }}>
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
