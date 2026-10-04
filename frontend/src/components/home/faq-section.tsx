"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

const DEFAULT_FAQS = [
  {
    id: "1",
    question: "What is this website? Is this the official LIC website?",
    answer:
      "This website is operated by an LIC agent for informational and customer-service purposes. It is not the official LIC website. The official LIC website is www.licindia.in. Policy information here is for general understanding only.",
  },
  {
    id: "2",
    question: "What is the difference between term insurance and endowment plans?",
    answer:
      "Term insurance provides pure life cover for a specific period — no maturity benefit if the insured survives. Endowment plans combine insurance with savings — they pay a maturity benefit if the insured survives the policy term, in addition to death benefits. Terms vary by specific policy.",
  },
  {
    id: "3",
    question: "What documents are required to buy an LIC policy?",
    answer:
      "Commonly required documents include: identity proof (Aadhaar, PAN, Passport), address proof, date of birth proof, income proof for certain plans, and recent photographs. Requirements may vary by specific plan and circumstances.",
  },
  {
    id: "4",
    question: "Can I get a loan against my LIC policy?",
    answer:
      "LIC offers policy loans against certain eligible policies (such as endowment and whole life plans) after they acquire surrender value. Loan terms and eligibility are subject to specific policy conditions. Please consult for details.",
  },
];

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(null);

  const { data: faqs } = useQuery<FAQ[]>({
    queryKey: ["faqs"],
    queryFn: async () => {
      const { data } = await apiClient.get("/faqs?limit=8&is_published=true");
      return data.items || DEFAULT_FAQS;
    },
    placeholderData: DEFAULT_FAQS,
    staleTime: 10 * 60 * 1000,
  });

  const items = faqs || DEFAULT_FAQS;

  return (
    <section className="section" style={{ background: "var(--bg)" }}>
      <div className="container-site">
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div className="section-label">FAQ</div>
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p
            style={{
              fontSize: "1rem",
              color: "var(--text-muted)",
              maxWidth: "500px",
              margin: "0 auto",
            }}
          >
            Common questions about LIC plans and services.
          </p>
        </div>

        <div
          style={{
            maxWidth: "780px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          {items.map((faq) => (
            <div
              key={faq.id}
              className="card"
              style={{ overflow: "hidden" }}
            >
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "1.25rem 1.5rem",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  gap: "1rem",
                }}
              >
                <span
                  style={{
                    fontSize: "0.9375rem",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    lineHeight: 1.4,
                  }}
                >
                  {faq.question}
                </span>
                {openId === faq.id ? (
                  <ChevronUp size={18} style={{ color: "#004B87", flexShrink: 0 }} />
                ) : (
                  <ChevronDown size={18} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                )}
              </button>
              {openId === faq.id && (
                <div
                  style={{
                    padding: "0 1.5rem 1.25rem",
                    fontSize: "0.9rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.7,
                    borderTop: "1px solid var(--border)",
                    paddingTop: "1rem",
                    marginTop: "0.125rem",
                  }}
                  className="animate-fade-in"
                >
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
          <p style={{ color: "var(--text-muted)", marginBottom: "1rem", fontSize: "0.9rem" }}>
            Have more questions? Chat with the advisor.
          </p>
          <a href="/chat" className="btn btn-primary">
            Ask a Question
          </a>
        </div>
      </div>
    </section>
  );
}
