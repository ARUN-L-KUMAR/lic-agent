"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Send, Bot, User, Phone, Info, RefreshCw } from "lucide-react";
import apiClient from "@/lib/api-client";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";

const AI_DISCLAIMER =
  "AI-generated information is for general informational purposes only. Please consult the LIC agent and official policy documents before making decisions.";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  sources?: { title: string; source_type: string }[];
  suggestions?: { text: string }[];
  timestamp: Date;
}

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hello! I'm the LIC AI assistant. I can answer general questions about LIC insurance plans and help you understand policy features.\n\nPlease note: I provide general information only. For specific advice, premium quotes, or policy decisions, please consult the LIC agent directly.\n\nHow can I help you today?",
  timestamp: new Date(),
};

export function ChatInterface() {
  const [mode, setMode] = useState<"ai" | "agent">("ai");
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [sessionId] = useState(() => uuidv4());
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to top of page on initial mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


  const { mutate: sendToAI, isPending: aiLoading } = useMutation({
    mutationFn: async (message: string) => {
      const { data } = await apiClient.post("/ai/chat", {
        session_id: sessionId,
        message,
      });
      return data;
    },
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: "assistant",
          content: data.message,
          sources: data.sources,
          suggestions: data.suggestions,
          timestamp: new Date(),
        },
      ]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: "assistant",
          content:
            "I'm sorry, I encountered an error. Please try again or contact the agent directly.",
          timestamp: new Date(),
        },
      ]);
    },
  });

  // Scroll only the message container when new messages arrive
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, aiLoading]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || aiLoading) return;

    setMessages((prev) => [
      ...prev,
      {
        id: uuidv4(),
        role: "user",
        content: text,
        timestamp: new Date(),
      },
    ]);
    setInput("");

    if (mode === "ai") {
      sendToAI(text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (text: string) => {
    setInput(text);
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 300px",
        gap: "1.5rem",
        maxWidth: "1100px",
      }}
    >
      {/* Main chat area */}
      <div className="card" style={{ display: "flex", flexDirection: "column", height: "70vh", overflow: "hidden" }}>
        {/* Header */}
        <div
          style={{
            background: "#003B73",
            padding: "1rem 1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              onClick={() => setMode("ai")}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "var(--radius-md)",
                border: "none",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 600,
                background: mode === "ai" ? "#C9A227" : "rgba(255,255,255,0.1)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
              }}
            >
              <Bot size={15} />
              AI Assistant
            </button>
            <button
              onClick={() => setMode("agent")}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "var(--radius-md)",
                border: "none",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 600,
                background: mode === "agent" ? "#C9A227" : "rgba(255,255,255,0.1)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
              }}
            >
              <User size={15} />
              Live Agent
            </button>
          </div>
          <button
            onClick={() => { setMessages([WELCOME_MESSAGE]); }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "rgba(255,255,255,0.6)",
              padding: "0.25rem",
            }}
            title="New conversation"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Disclaimer for AI mode */}
        {mode === "ai" && (
          <div
            style={{
              padding: "0.625rem 1rem",
              background: "var(--warning-light)",
              borderBottom: "1px solid #fcd34d",
              fontSize: "0.75rem",
              color: "#92400e",
              display: "flex",
              gap: "0.5rem",
              alignItems: "flex-start",
              flexShrink: 0,
            }}
          >
            <Info size={12} style={{ marginTop: "1px", flexShrink: 0 }} />
            {AI_DISCLAIMER}
          </div>
        )}

        {mode === "agent" ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: "1.5rem",
              padding: "2rem",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                background: "#003B73",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#C9A227",
              }}
            >
              <User size={36} />
            </div>
            <div>
              <h3 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Connect with LIC Agent</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                Connect with a licensed LIC agent for personalized assistance.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%", maxWidth: "260px" }}>
              <a
                href="tel:+919876543210"
                className="btn btn-primary"
                style={{ justifyContent: "center" }}
              >
                <Phone size={16} />
                Call Agent
              </a>
              <Link href="/book-appointment" className="btn btn-secondary" style={{ justifyContent: "center" }}>
                Book Appointment
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div
              ref={messagesContainerRef}
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                    gap: "0.375rem",
                  }}
                >
                  {msg.role !== "user" && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.375rem",
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      <Bot size={13} style={{ color: "#003B73" }} />
                      AI Assistant
                    </div>
                  )}
                  <div
                    className={
                      msg.role === "user" ? "chat-bubble chat-bubble-customer" : "chat-bubble chat-bubble-ai"
                    }
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {msg.content}
                  </div>

                  {/* Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
                      {msg.sources.map((s, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: "0.7rem",
                            padding: "0.2rem 0.5rem",
                            background: "var(--bg)",
                            border: "1px solid var(--border)",
                            borderRadius: "100px",
                            color: "var(--text-muted)",
                          }}
                        >
                          {s.title}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Suggestions */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
                      {msg.suggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestion(s.text)}
                          style={{
                            fontSize: "0.8125rem",
                            padding: "0.375rem 0.75rem",
                            background: "var(--surface)",
                            border: "1px solid var(--primary-200)",
                            borderRadius: "100px",
                            color: "#003B73",
                            cursor: "pointer",
                            fontWeight: 500,
                          }}
                        >
                          {s.text}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {aiLoading && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                  <div className="chat-bubble chat-bubble-ai" style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                    <span className="skeleton" style={{ width: 8, height: 8, borderRadius: "50%", display: "inline-block", animationDelay: "0ms" }} />
                    <span className="skeleton" style={{ width: 8, height: 8, borderRadius: "50%", display: "inline-block", animationDelay: "150ms" }} />
                    <span className="skeleton" style={{ width: 8, height: 8, borderRadius: "50%", display: "inline-block", animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div
              style={{
                padding: "1rem",
                borderTop: "1px solid var(--border)",
                display: "flex",
                gap: "0.75rem",
                flexShrink: 0,
              }}
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your question here... (Enter to send)"
                rows={2}
                className="form-input"
                style={{ resize: "none", flex: 1, lineHeight: 1.5, fontFamily: "inherit" }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || aiLoading}
                className="btn btn-primary"
                style={{ alignSelf: "flex-end", flexShrink: 0 }}
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Sidebar */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div className="card" style={{ padding: "1.25rem" }}>
          <h4 style={{ fontSize: "0.875rem", fontWeight: 700, marginBottom: "0.875rem", color: "var(--text-primary)" }}>
            Quick Questions
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {[
              "What is term insurance?",
              "Which plan is best for child education?",
              "How much life cover do I need?",
              "Explain endowment plans",
              "What are LIC pension plans?",
            ].map((q) => (
              <button
                key={q}
                onClick={() => handleSuggestion(q)}
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.625rem 0.875rem",
                  fontSize: "0.8125rem",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s ease",
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: "1.25rem", background: "#003B73" }}>
          <h4 style={{ fontSize: "0.875rem", fontWeight: 700, marginBottom: "0.75rem", color: "#C9A227" }}>
            Need Expert Advice?
          </h4>
          <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.7)", marginBottom: "1rem", lineHeight: 1.6 }}>
            The AI provides general information. For personalized advice and accurate premiums, consult the agent.
          </p>
          <a
            href="tel:+919876543210"
            className="btn btn-gold btn-sm"
            style={{ display: "flex", justifyContent: "center", textDecoration: "none" }}
          >
            <Phone size={14} />
            Call Agent
          </a>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          div[style*="grid-template-columns: 1fr 300px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
