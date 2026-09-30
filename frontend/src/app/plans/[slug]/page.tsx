import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PlanDetail } from "@/components/plans/plan-detail";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `LIC Plan — ${slug.replace(/-/g, " ")}`,
    description: "Explore this LIC insurance plan. View features, eligibility, and benefits.",
  };
}

export default async function PlanDetailPage({ params }: Props) {
  const { slug } = await params;
  return (
    <>
      <Header />
      <main>
        <PlanDetail slug={slug} />
      </main>
      <Footer />
    </>
  );
}
