// app/page.tsx — Marketing landing page (AddSearch-style)
"use client";
import { useState } from "react";
import ChatWidget from "./components/ChatWidget";

export default function HomePage() {
  const [widgetOpen, setWidgetOpen] = useState(false);

  return (
    <div className="lp-root">
      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <div className="lp-logo">
            <svg viewBox="0 0 28 28" fill="none" className="lp-logo-icon">
              <rect width="28" height="28" rx="7" fill="#EF4135" />
              <path
                d="M7 14c0-3.9 3.1-7 7-7s7 3.1 7 7-3.1 7-7 7"
                stroke="#fff"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <circle cx="14" cy="14" r="2.5" fill="#fff" />
            </svg>
            <span className="lp-logo-name">Espire</span>
            <span className="lp-logo-tag">AI Conversations</span>
          </div>
          <div className="lp-nav-links">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#faq">FAQ</a>
          </div>
          <button
            className="lp-btn-primary"
            onClick={() => setWidgetOpen(true)}
          >
            Try it now →
          </button>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="lp-hero">
        <div className="lp-hero-eyebrow">
          Powered by GPT-4o + Sitecore Search
        </div>
        <h1 className="lp-hero-h1">
          Your content.
          <br />
          <em>Conversations that find it.</em>
        </h1>
        <p className="lp-hero-sub">
          Let visitors ask follow-up questions, dive deeper, and discover
          information naturally — all grounded exclusively in your Sitecore
          content. No hallucinations. No third-party data.
        </p>
        <div className="lp-hero-actions">
          <button
            className="lp-btn-primary lp-btn-lg"
            onClick={() => setWidgetOpen(true)}
          >
            Start a conversation
          </button>
          <a href="#how" className="lp-btn-ghost">
            See how it works
          </a>
        </div>

        {/* Simulated chat preview */}
        <div className="lp-hero-preview">
          <div className="lp-preview-bar">
            <div className="lp-preview-dots">
              <span />
              <span />
              <span />
            </div>
            <span className="lp-preview-title">AI Conversations</span>
          </div>
          <div className="lp-preview-body">
            <div className="lp-preview-msg assistant">
              <div className="lp-preview-avatar">
                <svg viewBox="0 0 20 20" fill="none">
                  <rect
                    x="2"
                    y="5"
                    width="16"
                    height="11"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                  <circle cx="7" cy="10.5" r="1.3" fill="currentColor" />
                  <circle cx="13" cy="10.5" r="1.3" fill="currentColor" />
                  <path
                    d="M7 4V2.5M13 4V2.5"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="lp-preview-bubble">
                Hi! Ask me anything about your Sitecore platform. I only answer
                from your actual content.
              </div>
            </div>
            <div className="lp-preview-msg user">
              <div className="lp-preview-bubble user">
                How does Experience Edge publishing work?
              </div>
            </div>
            <div className="lp-preview-msg assistant">
              <div className="lp-preview-avatar">
                <svg viewBox="0 0 20 20" fill="none">
                  <rect
                    x="2"
                    y="5"
                    width="16"
                    height="11"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                  <circle cx="7" cy="10.5" r="1.3" fill="currentColor" />
                  <circle cx="13" cy="10.5" r="1.3" fill="currentColor" />
                  <path
                    d="M7 4V2.5M13 4V2.5"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="lp-preview-bubble">
                Experience Edge uses a GraphQL delivery layer that caches
                published Sitecore items at the edge. When you publish in XM
                Cloud, items propagate to Edge within seconds…
                <div className="lp-preview-source">
                  [Source 1] XM Cloud Publishing Guide
                </div>
              </div>
            </div>
            <div className="lp-preview-msg user">
              <div className="lp-preview-bubble user">
                And what about ISR revalidation?
              </div>
            </div>
            <div className="lp-preview-msg assistant typing">
              <div className="lp-preview-avatar">
                <svg viewBox="0 0 20 20" fill="none">
                  <rect
                    x="2"
                    y="5"
                    width="16"
                    height="11"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                  <circle cx="7" cy="10.5" r="1.3" fill="currentColor" />
                  <circle cx="13" cy="10.5" r="1.3" fill="currentColor" />
                  <path
                    d="M7 4V2.5M13 4V2.5"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="lp-preview-bubble">
                <span className="lp-typing-dot" />
                <span className="lp-typing-dot" />
                <span className="lp-typing-dot" />
              </div>
            </div>
          </div>
          <div className="lp-preview-input">
            <span className="lp-preview-placeholder">Ask a follow-up…</span>
            <div className="lp-preview-send">
              <svg viewBox="0 0 20 20" fill="none">
                <path
                  d="M18 2L9 11"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <path
                  d="M18 2l-5 16-4-7-7-4 16-5z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust bar ─────────────────────────────────────────────────────── */}
      <div className="lp-trust">
        <span className="lp-trust-label">Trusted by teams at</span>
        {[
          "XM Cloud",
          "Headless SXA",
          "Content Hub",
          "Experience Edge",
          "Coveo",
          "Sitecore CDP",
        ].map((b) => (
          <span key={b} className="lp-trust-brand">
            {b}
          </span>
        ))}
      </div>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="lp-section" id="features">
        <div className="lp-section-inner">
          <div className="lp-section-eyebrow">What makes it different</div>
          <h2 className="lp-section-h2">
            Built for accuracy. Designed for conversation.
          </h2>
          <div className="lp-features-grid">
            {[
              {
                icon: "🔒",
                title: "Zero hallucinations",
                body: "Every answer is grounded exclusively in your Sitecore-indexed content. If the answer isn't there, the AI says so honestly.",
              },
              {
                icon: "🧠",
                title: "Full conversation memory",
                body: "Each turn remembers what came before. Follow-ups like &lsquo;tell me more&rsquo; and &lsquo;what about that?&rsquo; resolve naturally without re-explaining.",
              },
              {
                icon: "⚡",
                title: "Streams word-by-word",
                body: "Responses stream token-by-token via SSE — no waiting for a wall of text. The cursor tells the user the AI is working.",
              },
              {
                icon: "🔍",
                title: "Smart search intent",
                body: "A lightweight classifier decides per-turn whether a fresh Sitecore Search query is needed — follow-ups skip it, saving latency.",
              },
              {
                icon: "📌",
                title: "Cited sources",
                body: "Every answer links back to the exact Sitecore content pages it drew from, so users can verify and read more.",
              },
              {
                icon: "🛡️",
                title: "No storage anywhere",
                body: "Conversation history lives only in the browser tab for the session. Nothing is written to localStorage, cookies, or any server.",
              },
            ].map((f) => (
              <div key={f.title} className="lp-feature-card">
                <div className="lp-feature-icon">{f.icon}</div>
                <h3 className="lp-feature-title">{f.title}</h3>
                <p className="lp-feature-body">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="lp-section lp-section-alt" id="how">
        <div className="lp-section-inner">
          <div className="lp-section-eyebrow">Under the hood</div>
          <h2 className="lp-section-h2">How every conversation works</h2>
          <div className="lp-how-steps">
            {[
              {
                n: "1",
                title: "User sends a message",
                body: "The full conversation history is sent from the client to the stateless API on every turn — nothing stored server-side.",
              },
              {
                n: "2",
                title: "Intent classification",
                body: "GPT-4o-mini decides in milliseconds whether the message needs a fresh Sitecore Search query or is a pure follow-up.",
              },
              {
                n: "3",
                title: "Content retrieval",
                body: "If needed, Sitecore Search fetches the top 5 most relevant documents from your indexed content as RAG context.",
              },
              {
                n: "4",
                title: "Grounded generation",
                body: "GPT-4o streams an answer using only the retrieved context, citing sources inline. No external data is used.",
              },
            ].map((s) => (
              <div key={s.n} className="lp-step">
                <div className="lp-step-num">{s.n}</div>
                <div>
                  <h3 className="lp-step-title">{s.title}</h3>
                  <p className="lp-step-body">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="lp-section" id="faq">
        <div className="lp-section-inner lp-faq-inner">
          <div className="lp-section-eyebrow">Common questions</div>
          <h2 className="lp-section-h2">FAQ</h2>
          <div className="lp-faq-list">
            {[
              {
                q: "Does it use information outside my Sitecore content?",
                a: "No. The system prompt explicitly instructs the AI to answer only from the retrieved Sitecore Search context. If context is empty, the AI says it doesn't know.",
              },
              {
                q: "What is stored between sessions?",
                a: "Nothing. Conversation history lives only in React state for the duration of your browser tab session. Refreshing the page clears it completely.",
              },
              {
                q: "How is it different from a regular chatbot?",
                a: "Regular chatbots use generic AI training data. This assistant only knows what's in your Sitecore index — giving accurate, on-brand answers without hallucinations.",
              },
              {
                q: "Can I control which content it can access?",
                a: "Yes — through Sitecore Search source configuration. Only content in your configured Search sources will be retrieved as context.",
              },
              {
                q: "What if the user asks something the content doesn't cover?",
                a: "The AI responds honestly that it doesn't have that information from your content, and can suggest contacting support or refining the question.",
              },
            ].map((f, i) => (
              <FaqItem key={i} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="lp-cta">
        <h2 className="lp-cta-h2">See it answer with your content.</h2>
        <p className="lp-cta-sub">
          No demo request needed. Open the widget and start asking about your
          Sitecore setup right now.
        </p>
        <button
          className="lp-btn-primary lp-btn-lg"
          onClick={() => setWidgetOpen(true)}
        >
          Open AI Conversations →
        </button>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-logo">
            <svg viewBox="0 0 28 28" fill="none" className="lp-logo-icon">
              <rect width="28" height="28" rx="7" fill="#EF4135" />
              <path
                d="M7 14c0-3.9 3.1-7 7-7s7 3.1 7 7-3.1 7-7 7"
                stroke="#fff"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <circle cx="14" cy="14" r="2.5" fill="#fff" />
            </svg>
            <span className="lp-logo-name">Espire AI Conversations</span>
          </div>
          <p className="lp-footer-copy">
            Built with Next.js 14, OpenAI GPT-4o, and Sitecore Search SDK
          </p>
        </div>
      </footer>

      {/* ── Floating chat widget ──────────────────────────────────────────── */}
      <ChatWidget open={widgetOpen} onClose={() => setWidgetOpen(false)} />

      {/* Floating trigger button */}
      {!widgetOpen && (
        <button
          className="lp-widget-fab"
          onClick={() => setWidgetOpen(true)}
          aria-label="Open AI chat"
        >
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
              fill="currentColor"
            />
            <circle cx="8.5" cy="11" r="1" fill="white" />
            <circle cx="12" cy="11" r="1" fill="white" />
            <circle cx="15.5" cy="11" r="1" fill="white" />
          </svg>
          <span>Ask AI</span>
        </button>
      )}
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`lp-faq-item ${open ? "open" : ""}`}>
      <button className="lp-faq-q" onClick={() => setOpen((v) => !v)}>
        {q}
        <span className="lp-faq-chevron">{open ? "−" : "+"}</span>
      </button>
      {open && <p className="lp-faq-a">{a}</p>}
    </div>
  );
}
