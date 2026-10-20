import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ChatInterface } from "@/components/chat/chat-interface";

export const metadata: Metadata = {
  title: "Chat with LIC Advisor | LIC Agent Platform",
  description:
    "Connect with a licensed LIC insurance advisor. Ask questions about LIC plans, get guidance, and request personalized support.",
};

export default function ChatPage() {
  return (
    <>
      <Header />
      <main
        style={{
          minHeight: "calc(100vh - 140px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="container-site" style={{ flex: 1, padding: "2rem 1.5rem" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              Chat with LIC Advisor
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              Start a conversation. You can also try our AI assistant for quick answers.
            </p>
          </div>
          <ChatInterface />
        </div>
      </main>
      <Footer />
    </>
  );
}
