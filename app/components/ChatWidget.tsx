// app/components/ChatWidget.tsx
// Floating chat widget — stateless conversational AI
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { ConversationTurn, SSEEvent } from "../api/chat/route";
import { SitecoreSearchResult } from "@/lib/sitecoreSearch";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: SitecoreSearchResult[];
  feedback?: "up" | "down" | null;
  isStreaming?: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

const STARTERS = [
  "What is Sitecore XM Cloud?",
  "How does Experience Edge work?",
  "Explain Headless SXA components",
  "How do I configure Sitecore Search?",
];

function renderMd(text: string) {
  return text.split("\n").map((line, li, arr) => (
    <span key={li}>
      {line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((seg, si) => {
        if (seg.startsWith("**") && seg.endsWith("**"))
          return <strong key={si}>{seg.slice(2, -2)}</strong>;
        if (seg.startsWith("`") && seg.endsWith("`"))
          return <code key={si} className="w-icode">{seg.slice(1, -1)}</code>;
        return <span key={si}>{seg}</span>;
      })}
      {li < arr.length - 1 && <br />}
    </span>
  ));
}

export default function ChatWidget({ open, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! Ask me anything about Sitecore — I'll answer only from your actual indexed content, with source citations." },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [tab, setTab] = useState<"chat" | "search">("chat");
  const [searchQuery, setSearchQuery] = useState("");
  const [useSearch, setUseSearch] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 100); }, [open]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setStreaming(false);
    setMessages(prev => prev.map((m, i) =>
      i === prev.length - 1 && m.isStreaming ? { ...m, isStreaming: false } : m
    ));
  }, []);

  const send = useCallback(async (text: string) => {
    if (streaming || !text.trim()) return;
    setInput("");
    setTab("chat");

    const history: ConversationTurn[] = messages
      .filter(m => m.content)
      .map(m => ({ role: m.role, content: m.content }));

    setMessages(prev => [
      ...prev,
      { role: "user", content: text },
      { role: "assistant", content: "", isStreaming: true },
    ]);
    setStreaming(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history, message: text, useSearch }),
        signal: ctrl.signal,
      });

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const evt: SSEEvent = JSON.parse(line.slice(6));
            if (evt.type === "token") {
              acc += evt.text;
              setMessages(prev => {
                const c = [...prev];
                c[c.length - 1] = { ...c[c.length - 1], content: acc };
                return c;
              });
            }
            if (evt.type === "sources") {
              setMessages(prev => {
                const c = [...prev];
                c[c.length - 1] = { ...c[c.length - 1], sources: evt.sources };
                return c;
              });
            }
            if (evt.type === "done" || evt.type === "error") {
              setMessages(prev => {
                const c = [...prev];
                c[c.length - 1] = { ...c[c.length - 1], isStreaming: false, feedback: null };
                return c;
              });
              setStreaming(false);
            }
          } catch { /* partial */ }
        }
      }
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        setMessages(prev => {
          const c = [...prev];
          if (c[c.length - 1]?.role === "assistant") {
            c[c.length - 1] = { ...c[c.length - 1], isStreaming: false, content: c[c.length - 1].content || "_(stopped)_" };
          }
          return c;
        });
      } else {
        setMessages(prev => prev.slice(0, -1));
      }
      setStreaming(false);
    }
  }, [streaming, messages, useSearch]);

  const setFeedback = (idx: number, val: "up" | "down") => {
    setMessages(prev => prev.map((m, i) => i === idx ? { ...m, feedback: val } : m));
  };

  const clear = () => {
    stop();
    setMessages([{ role: "assistant", content: "Conversation cleared. What would you like to know?" }]);
  };

  if (!open) return null;

  return (
    <div className="w-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-panel">
        {/* Header */}
        <div className="w-header">
          <div className="w-header-left">
            <div className="w-header-avatar">
              <svg viewBox="0 0 20 20" fill="none">
                <rect x="2" y="5" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                <circle cx="7" cy="10.5" r="1.3" fill="currentColor"/>
                <circle cx="13" cy="10.5" r="1.3" fill="currentColor"/>
                <path d="M7 4V2.5M13 4V2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <div className="w-header-title">AI Conversations</div>
              <div className="w-header-sub">
                <span className={`w-status-dot ${streaming ? "pulsing" : ""}`}/>
                {streaming ? "Generating…" : "Powered by Sitecore Search"}
              </div>
            </div>
          </div>
          <div className="w-header-actions">
            <button className="w-icon-btn" onClick={clear} title="New conversation">
              <svg viewBox="0 0 20 20" fill="none"><path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
            <label className="w-search-toggle" title={useSearch ? "Sitecore Search ON" : "Sitecore Search OFF"}>
              <input type="checkbox" checked={useSearch} onChange={e => setUseSearch(e.target.checked)} />
              <span className="w-toggle-pill" />
              <span className="w-toggle-label">Search</span>
            </label>
            <button className="w-icon-btn" onClick={onClose} title="Close">
              <svg viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="w-tabs">
          <button className={`w-tab ${tab === "chat" ? "active" : ""}`} onClick={() => setTab("chat")}>
            <svg viewBox="0 0 16 16" fill="none"><path d="M14 10a1 1 0 01-1 1H5l-3 3V3a1 1 0 011-1h10a1 1 0 011 1v7z" fill="currentColor" opacity={tab==="chat"?1:0.35}/></svg>
            Chat
          </button>
          <button className={`w-tab ${tab === "search" ? "active" : ""}`} onClick={() => setTab("search")}>
            <svg viewBox="0 0 16 16" fill="none"><circle cx="6.5" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.3" opacity={tab==="search"?1:0.45}/><path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity={tab==="search"?1:0.45}/></svg>
            Search results
          </button>
        </div>

        {/* Chat messages */}
        {tab === "chat" && (
          <div className="w-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`w-msg ${msg.role}`}>
                {msg.role === "assistant" && (
                  <div className={`w-msg-avatar ${msg.isStreaming ? "streaming" : ""}`}>
                    <svg viewBox="0 0 16 16" fill="none">
                      <rect x="1" y="4" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.1"/>
                      <circle cx="5.5" cy="8.5" r="1.1" fill="currentColor"/>
                      <circle cx="10.5" cy="8.5" r="1.1" fill="currentColor"/>
                      <path d="M5.5 3.5V2.5M10.5 3.5V2.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                    </svg>
                  </div>
                )}
                <div className="w-msg-col">
                  {!msg.content && msg.isStreaming ? (
                    <div className="w-bubble assistant">
                      <div className="w-typing"><span/><span/><span/></div>
                    </div>
                  ) : (
                    <div className={`w-bubble ${msg.role}`}>
                      {renderMd(msg.content)}
                      {msg.isStreaming && <span className="w-cursor">▋</span>}
                    </div>
                  )}

                  {/* Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="w-sources">
                      <div className="w-sources-label">Sources</div>
                      {msg.sources.map((s, si) => (
                        <a key={si} href={s.url} target="_blank" rel="noopener noreferrer" className="w-source">
                          <span className="w-source-num">{si + 1}</span>
                          <div className="w-source-info">
                            <div className="w-source-title">{s.title}</div>
                            {s.description && <div className="w-source-desc">{s.description.slice(0, 100)}…</div>}
                          </div>
                          <svg viewBox="0 0 12 12" fill="none" className="w-source-arrow"><path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Feedback */}
                  {msg.role === "assistant" && !msg.isStreaming && msg.content && msg.feedback !== undefined && (
                    <div className="w-feedback">
                      <span className="w-feedback-label">Was this helpful?</span>
                      <button className={`w-fb-btn ${msg.feedback === "up" ? "active" : ""}`} onClick={() => setFeedback(i, "up")}>
                        <svg viewBox="0 0 16 16" fill="none"><path d="M3 9h2V15H3zM5 9l3-6a2 2 0 012 2v2h3l-1 6H5V9z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" fill={msg.feedback==="up"?"currentColor":"none"}/></svg>
                      </button>
                      <button className={`w-fb-btn ${msg.feedback === "down" ? "active down" : ""}`} onClick={() => setFeedback(i, "down")}>
                        <svg viewBox="0 0 16 16" fill="none"><path d="M13 7h-2V1h2zM11 7L8 13a2 2 0 01-2-2v-2H3l1-6h7v4z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" fill={msg.feedback==="down"?"currentColor":"none"}/></svg>
                      </button>
                      {msg.feedback && (
                        <span className="w-fb-thanks">{msg.feedback === "up" ? "Thanks! 🎉" : "Got it, we'll improve."}</span>
                      )}
                    </div>
                  )}

                  {/* Switch to search */}
                  {msg.role === "assistant" && !msg.isStreaming && msg.content && (
                    <button className="w-switch-search" onClick={() => { setSearchQuery(messages.filter(m=>m.role==="user").slice(-1)[0]?.content || ""); setTab("search"); }}>
                      <svg viewBox="0 0 14 14" fill="none"><circle cx="5.5" cy="5.5" r="3.5" stroke="currentColor" strokeWidth="1.1"/><path d="M9 9l3 3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg>
                      View as search results
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef}/>
          </div>
        )}

        {/* Search results tab */}
        {tab === "search" && (
          <div className="w-search-tab">
            <div className="w-search-header">
              <input
                className="w-search-input"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search your Sitecore content…"
                onKeyDown={e => e.key === "Enter" && send(searchQuery)}
              />
              <button className="w-search-go" onClick={() => send(searchQuery)}>Search</button>
            </div>
            <div className="w-search-note">
              Results are grounded in your Sitecore index. Switch back to Chat to ask follow-up questions.
            </div>
            {messages.filter(m=>m.role==="assistant" && m.sources?.length).slice(-1).map((m,i) => (
              <div key={i} className="w-search-results">
                {m.sources!.map((s, si) => (
                  <a key={si} href={s.url} target="_blank" rel="noopener noreferrer" className="w-search-result">
                    {s.type && <span className="w-result-type">{s.type}</span>}
                    <div className="w-result-title">{s.title}</div>
                    {s.description && <div className="w-result-desc">{s.description.slice(0,160)}…</div>}
                    <div className="w-result-url">{s.url}</div>
                  </a>
                ))}
              </div>
            ))}
            {!messages.some(m=>m.sources?.length) && (
              <div className="w-search-empty">Ask a question in Chat first to see search results here.</div>
            )}
          </div>
        )}

        {/* Starters (only in chat, when just the welcome message) */}
        {tab === "chat" && messages.length === 1 && (
          <div className="w-starters">
            {STARTERS.map(s => (
              <button key={s} className="w-starter" onClick={() => send(s)}>{s}</button>
            ))}
          </div>
        )}

        {/* Input */}
        {tab === "chat" && (
          <div className="w-input-area">
            <div className="w-input-wrap">
              <textarea
                ref={inputRef}
                className="w-textarea"
                rows={1}
                placeholder={streaming ? "Generating…" : "Ask a question or follow up…"}
                value={input}
                disabled={streaming}
                onChange={e => setInput(e.target.value)}
                onInput={e => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
                }}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }}}
              />
              {streaming ? (
                <button className="w-send stop" onClick={stop} title="Stop">
                  <svg viewBox="0 0 16 16" fill="none"><rect x="3" y="3" width="10" height="10" rx="2" fill="currentColor"/></svg>
                </button>
              ) : (
                <button className={`w-send ${input.trim() ? "active" : ""}`} onClick={() => send(input)} disabled={!input.trim()}>
                  <svg viewBox="0 0 20 20" fill="none"><path d="M18 2L9 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M18 2l-5 16-4-7-7-4 16-5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>
                </button>
              )}
            </div>
            <div className="w-input-footer">
              No conversation data stored · grounded in your Sitecore content
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
