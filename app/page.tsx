// app/page.tsx — Espire.com themed landing page
"use client";
import { useState } from "react";
import Image from "next/image";
import ChatWidget from "./components/ChatWidget";

export default function HomePage() {
  const [widgetOpen, setWidgetOpen] = useState(false);

  return (
    <div className="lp-root">
      {/* ── Nav (dark navy — espire.com) ──────────────────────────────────── */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <div className="lp-logo">
            <Image
              src="/espire-logo.png"
              alt="Espire Infolabs"
              className="lp-logo-img"
              width={120}
              height={34}
              style={{ objectFit: "contain" }}
              priority
            />
            {/* <div className="lp-logo-divider" />
            <span className="lp-logo-tag">AI Conversations</span> */}
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

      {/* ── Hero (navy bg with diagonal clip) ────────────────────────────── */}
      <section className="lp-hero">
        <div className="lp-hero-inner">
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
                  Hi! Ask me anything about your Sitecore platform. I only
                  answer from your actual content.
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
        </div>
      </section>

      {/* ── Trust bar ─────────────────────────────────────────────────────── */}
      <div className="lp-trust">
        <span className="lp-trust-label">Trusted by teams using</span>
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
                body: "Each turn remembers what came before. Follow-ups like 'tell me more' resolve naturally without re-explaining.",
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
            <Image
              src="/espire-logo.png"
              alt="Espire Infolabs"
              width={100}
              height={28}
              style={{
                objectFit: "contain",
                filter: "brightness(0) invert(1)",
              }}
            />
          </div>
          <p className="lp-footer-copy">
            Built with Next.js, OpenAI GPT-4o, and Sitecore Search SDK
          </p>
        </div>
      </footer>

      {/* ── Floating chat widget ──────────────────────────────────────────── */}
      <ChatWidget open={widgetOpen} onClose={() => setWidgetOpen(false)} />

      {!widgetOpen && (
        <button
          className="lp-widget-fab"
          onClick={() => setWidgetOpen(true)}
          aria-label="Open AI chat"
        >
          <svg color="inherit" viewBox="0 0 32 32" className="css-1mpchac">
            <path
              fill="#FFFFFF"
              d="M12.63,26.46H8.83a6.61,6.61,0,0,1-6.65-6.07,89.05,89.05,0,0,1,0-11.2A6.5,6.5,0,0,1,8.23,3.25a121.62,121.62,0,0,1,15.51,0A6.51,6.51,0,0,1,29.8,9.19a77.53,77.53,0,0,1,0,11.2,6.61,6.61,0,0,1-6.66,6.07H19.48L12.63,31V26.46"
            ></path>
            <path
              fill="#0066FF"
              d="M19.57,21.68h3.67a2.08,2.08,0,0,0,2.11-1.81,89.86,89.86,0,0,0,0-10.38,1.9,1.9,0,0,0-1.84-1.74,113.15,113.15,0,0,0-15,0A1.9,1.9,0,0,0,6.71,9.49a74.92,74.92,0,0,0-.06,10.38,2,2,0,0,0,2.1,1.81h3.81V26.5Z"
              className="css-1w8g9rn eam5rsy0"
            ></path>
          </svg>
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
