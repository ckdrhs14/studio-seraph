"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import styles from "./ChatBot.module.css";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 300);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!isLoading && open && !closing) {
      inputRef.current?.focus();
    }
  }, [isLoading, open, closing]);

  const sendMessage = async (text?: string) => {
    const value = text ?? input.trim();
    if (!value || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: value,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
      };
      setMessages((prev) => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === "text-delta") {
                assistantMessage.content += data.delta;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMessage.id
                      ? { ...m, content: assistantMessage.content }
                      : m
                  )
                );
              }
            } catch {
              // skip non-JSON lines
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <>
      {/* Floating trigger button */}
      {!open && (
        <button className={styles.trigger} onClick={() => setOpen(true)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}

      {/* Chat modal */}
      {open && (
        <div className={`${styles.overlay} ${closing ? styles.overlayClosing : ""}`} onClick={handleClose}>
          <div className={`${styles.modal} ${closing ? styles.modalClosing : ""}`} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.avatar}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div className={styles.headerInfo}>
                <h3>AI Chat</h3>
                <p className={styles.headerStatus}>
                  {isLoading ? "답변 중..." : "온라인"}
                </p>
              </div>
              {error && <span className={styles.error}>{error}</span>}
              <div className={styles.headerActions}>
                {messages.length > 0 && (
                  <button
                    className={styles.closeBtn}
                    onClick={() => { setMessages([]); setError(null); }}
                    title="대화 초기화"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="1 4 1 10 7 10" />
                      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                    </svg>
                  </button>
                )}
                <button className={styles.closeBtn} onClick={handleClose}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className={styles.messages}>
              {messages.length === 0 && (
                <div className={styles.empty}>
                  <div className={styles.emptyIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z" />
                      <path d="M8 9h0" strokeWidth="2.5" />
                      <path d="M16 9h0" strokeWidth="2.5" />
                      <path d="M9 14c.5 1 1.5 2 3 2s2.5-1 3-2" />
                    </svg>
                  </div>
                  <p className={styles.emptyTitle}>안녕하세요!</p>
                  <p className={styles.emptyDesc}>궁금한 것이 있다면 무엇이든 물어보세요.</p>
                  <div className={styles.suggestions}>
                    {["자기소개 해줘", "어떤 기술을 쓸 수 있어?", "프로젝트 경험이 있어?"].map(
                      (s) => (
                        <button key={s} className={styles.suggestion} onClick={() => sendMessage(s)}>
                          {s}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`${styles.messageRow} ${
                    msg.role === "user" ? styles.messageRowUser : styles.messageRowAssistant
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className={styles.assistantAvatar}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z" />
                        <path d="M8 9h0" strokeWidth="3" />
                        <path d="M16 9h0" strokeWidth="3" />
                        <path d="M9 14c.5 1 1.5 2 3 2s2.5-1 3-2" />
                      </svg>
                    </div>
                  )}
                  <div className={`${styles.bubble} ${
                    msg.role === "user" ? styles.bubbleUser : styles.bubbleAssistant
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className={`${styles.messageRow} ${styles.messageRowAssistant}`}>
                  <div className={styles.assistantAvatar}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z" />
                      <path d="M8 9h0" strokeWidth="3" />
                      <path d="M16 9h0" strokeWidth="3" />
                      <path d="M9 14c.5 1 1.5 2 3 2s2.5-1 3-2" />
                    </svg>
                  </div>
                  <div className={styles.loading}>
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={styles.inputArea}>
              <form onSubmit={onSubmit} className={styles.inputForm}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="메시지를 입력하세요..."
                  className={styles.input}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className={styles.sendBtn}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
