// app/components/ChatMessage.tsx
"use client";

import { SitecoreSearchResult } from "@/lib/sitecoreSearch";

export interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: SitecoreSearchResult[];
  isStreaming?: boolean;
}

interface Props {
  message: Message;
}

// ── Lightweight markdown renderer (bold + inline code) ────────────────────────
function renderText(text: string) {
  return text.split("\n").map((line, li, lines) => (
    <span key={li}>
      {line.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((seg, si) => {
        if (seg.startsWith("**") && seg.endsWith("**"))
          return <strong key={si}>{seg.slice(2, -2)}</strong>;
        if (seg.startsWith("`") && seg.endsWith("`"))
          return <code key={si} className="inline-code">{seg.slice(1, -1)}</code>;
        return <span key={si}>{seg}</span>;
      })}
      {li < lines.length - 1 && <br />}
    </span>
  ));
}

export default function ChatMessage({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={`chat-message ${isUser ? "user" : "assistant"}`}>
      {/* Avatar */}
      <div className={`avatar ${isUser ? "user-avatar" : "ai-avatar"}${message.isStreaming ? " streaming" : ""}`}>
        {isUser ? (
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" fill="currentColor" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none">
            <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="8.5" cy="12.5" r="1.5" fill="currentColor" />
            <circle cx="15.5" cy="12.5" r="1.5" fill="currentColor" />
            <path d="M8 5V3M16 5V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="message-content-wrapper">
        <div className="message-label">{isUser ? "You" : "AI Assistant"}</div>

        {/* Typing indicator — empty assistant message that is streaming */}
        {!message.content && message.isStreaming ? (
          <div className="message-bubble ai-bubble">
            <div className="typing-indicator"><span /><span /><span /></div>
          </div>
        ) : (
          <div className={`message-bubble ${isUser ? "user-bubble" : "ai-bubble"}`}>
            {renderText(message.content)}
            {message.isStreaming && <span className="cursor-blink">▋</span>}
          </div>
        )}

        {/* Source citations */}
        {message.sources && message.sources.length > 0 && (
          <div className="sources-panel">
            <div className="sources-header">
              <svg viewBox="0 0 20 20" fill="none" className="sources-icon">
                <path d="M10 1L12.39 6.26L18 7.27L14 11.14L14.76 16.73L10 14.27L5.24 16.73L6 11.14L2 7.27L7.61 6.26L10 1Z"
                  stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
              <span>Sources from Sitecore ({message.sources.length})</span>
            </div>
            <div className="sources-list">
              {message.sources.map((src, i) => (
                <a key={src.id || i} href={src.url} target="_blank" rel="noopener noreferrer" className="source-card">
                  <div className="source-index">{i + 1}</div>
                  <div className="source-info">
                    <div className="source-title">{src.title}</div>
                    {src.description && (
                      <div className="source-desc">
                        {src.description.slice(0, 120)}{src.description.length > 120 ? "…" : ""}
                      </div>
                    )}
                    <div className="source-meta">
                      {src.type && <span className="source-tag">{src.type}</span>}
                      {src.date && <span className="source-date">{new Date(src.date).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <svg className="source-arrow" viewBox="0 0 16 16" fill="none">
                    <path d="M4 8h8M9 5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
