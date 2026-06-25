// app/components/ChatInput.tsx
"use client";

import { useState, useRef, KeyboardEvent } from "react";

interface Props {
  onSend: (text: string) => void;
  onStop: () => void;
  isStreaming: boolean;
}

const CHIPS = [
  "What is Sitecore XM Cloud?",
  "How does Experience Edge work?",
  "Explain Headless SXA",
  "What is Sitecore Search?",
];

export default function ChatInput({ onSend, onStop, isStreaming }: Props) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    const t = value.trim();
    if (!t || isStreaming) return;
    onSend(t);
    setValue("");
    if (ref.current) ref.current.style.height = "auto";
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
  };

  const autoResize = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  return (
    <div className="chat-input-area">
      {!isStreaming && (
        <div className="suggested-prompts">
          {CHIPS.map((c) => (
            <button key={c} className="prompt-chip" onClick={() => onSend(c)}>
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="input-row">
        <div className="input-wrapper">
          <textarea
            ref={ref}
            rows={1}
            className="chat-textarea"
            placeholder={isStreaming ? "Generating…" : "Ask anything — I remember our conversation…"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKey}
            onInput={autoResize}
            disabled={isStreaming}
          />

          {isStreaming ? (
            <button className="send-button stop-btn-inline" onClick={onStop} title="Stop">
              <svg viewBox="0 0 16 16" fill="none">
                <rect x="3" y="3" width="10" height="10" rx="2" fill="currentColor" />
              </svg>
            </button>
          ) : (
            <button
              className={`send-button ${value.trim() ? "active" : ""}`}
              onClick={submit}
              disabled={!value.trim()}
              aria-label="Send"
            >
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>

        <p className="input-hint">
          <kbd>Enter</kbd> send · <kbd>Shift+Enter</kbd> newline
          · no conversation data stored locally
        </p>
      </div>
    </div>
  );
}
