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
      <main style={{ minHeight: "60vh" }}>
        <section className="page-hero">
          <div className="container-site">
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
        </section>
        <div className="container-site" style={{ paddingTop: "2.5rem", paddingBottom: "4rem" }}>
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
