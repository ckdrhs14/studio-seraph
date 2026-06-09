"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import styles from "./ChatBot.module.css";

const ChatBotTrigger = dynamic(() => import("./ChatBotTrigger"), { ssr: false });

interface Attachment {
    name: string;
    type: string;
    url: string;
}

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    attachments?: Attachment[];
}

const EMOJI_LIST = [
    "😀",
    "😂",
    "🥹",
    "😍",
    "🤩",
    "😎",
    "🤔",
    "👍",
    "👏",
    "🙏",
    "🔥",
    "❤️",
    "💯",
    "✨",
    "🎉",
    "👋",
    "😊",
    "🥰",
    "😅",
    "🤣",
    "😢",
    "😤",
    "🫡",
    "💪"
];

export default function ChatBot() {
    const [open, setOpen] = useState(false);
    const [closing, setClosing] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showEmoji, setShowEmoji] = useState(false);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const emojiRef = useRef<HTMLDivElement>(null);

    const handleClose = useCallback(() => {
        setClosing(true);
        setTimeout(() => {
            setOpen(false);
            setClosing(false);
        }, 300);
    }, []);

    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (!isLoading && open && !closing) {
            textareaRef.current?.focus();
        }
    }, [isLoading, open, closing]);

    // auto-resize textarea
    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = Math.min(el.scrollHeight, 100) + "px";
    }, [input]);

    // close emoji picker on outside click
    useEffect(() => {
        if (!showEmoji) return;
        const handler = (e: MouseEvent) => {
            if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
                setShowEmoji(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [showEmoji]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        Array.from(files).forEach((file) => {
            const url = URL.createObjectURL(file);
            setAttachments((prev) => [...prev, { name: file.name, type: file.type, url }]);
        });
        e.target.value = "";
    };

    const removeAttachment = (index: number) => {
        setAttachments((prev) => {
            URL.revokeObjectURL(prev[index].url);
            return prev.filter((_, i) => i !== index);
        });
    };

    const sendMessage = async (text?: string) => {
        const value = text ?? input.trim();
        if ((!value && attachments.length === 0) || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: value,
            attachments: attachments.length > 0 ? [...attachments] : undefined
        };

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput("");
        setAttachments([]);
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: newMessages.map((m) => ({
                        role: m.role,
                        content: m.content
                    }))
                })
            });

            if (!res.ok) throw new Error(`API error: ${res.status}`);
            if (!res.body) throw new Error("No response body");

            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: ""
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
                                        m.id === assistantMessage.id ? { ...m, content: assistantMessage.content } : m
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
            {/* Floating 3D robot trigger — always mounted, hidden when modal open */}
            <ChatBotTrigger onClick={() => setOpen(true)} hidden={open || closing} />

            {/* Chat modal */}
            {open && (
                <div
                    className={`${styles.overlay} ${closing ? styles.overlayClosing : ""}`}
                    onClick={handleClose}
                    onWheel={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                >
                    <div
                        className={`${styles.modal} ${closing ? styles.modalClosing : ""}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className={styles.header}>
                            <div className={styles.avatar}>
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                            </div>
                            <div className={styles.headerInfo}>
                                <h3>STUDIO-SERAPH AI Chat</h3>
                                <p className={styles.headerStatus}>{isLoading ? "답변 중..." : "온라인"}</p>
                            </div>
                            {error && <span className={styles.error}>{error}</span>}
                            <div className={styles.headerActions}>
                                {messages.length > 0 && (
                                    <button
                                        className={styles.closeBtn}
                                        onClick={() => {
                                            setMessages([]);
                                            setError(null);
                                        }}
                                        title="대화 초기화"
                                    >
                                        <svg
                                            width="15"
                                            height="15"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <polyline points="1 4 1 10 7 10" />
                                            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                                        </svg>
                                    </button>
                                )}
                                <button className={styles.closeBtn} onClick={handleClose}>
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
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
                                        <svg
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z" />
                                            <path d="M8 9h0" strokeWidth="2.5" />
                                            <path d="M16 9h0" strokeWidth="2.5" />
                                            <path d="M9 14c.5 1 1.5 2 3 2s2.5-1 3-2" />
                                        </svg>
                                    </div>
                                    <p className={styles.emptyTitle}>안녕하세요!</p>
                                    <p className={styles.emptyDesc}>궁금한 것이 있다면 무엇이든 물어보세요.</p>
                                    <div className={styles.suggestions}>
                                        {[
                                            "영업시간이 어떻게 돼요?",
                                            "어떤 촬영이 가능한가요?",
                                            "예약은 어떻게 하나요?",
                                            "오시는길 알려주세요"
                                        ].map((s) => (
                                            <button
                                                key={s}
                                                className={styles.suggestion}
                                                onClick={() => sendMessage(s)}
                                            >
                                                {s}
                                            </button>
                                        ))}
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
                                            <svg
                                                width="12"
                                                height="12"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z" />
                                                <path d="M8 9h0" strokeWidth="3" />
                                                <path d="M16 9h0" strokeWidth="3" />
                                                <path d="M9 14c.5 1 1.5 2 3 2s2.5-1 3-2" />
                                            </svg>
                                        </div>
                                    )}
                                    <div
                                        className={`${styles.bubble} ${
                                            msg.role === "user" ? styles.bubbleUser : styles.bubbleAssistant
                                        }`}
                                    >
                                        {msg.attachments && msg.attachments.length > 0 && (
                                            <div className={styles.bubbleAttachments}>
                                                {msg.attachments.map((att, i) =>
                                                    att.type.startsWith("image/") ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img
                                                            key={i}
                                                            src={att.url}
                                                            alt={att.name}
                                                            className={styles.bubbleImage}
                                                        />
                                                    ) : (
                                                        <div key={i} className={styles.bubbleFile}>
                                                            <svg
                                                                width="14"
                                                                height="14"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            >
                                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                                <polyline points="14 2 14 8 20 8" />
                                                            </svg>
                                                            <span>{att.name}</span>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        )}
                                        {msg.content}
                                    </div>
                                </div>
                            ))}

                            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                                <div className={`${styles.messageRow} ${styles.messageRowAssistant}`}>
                                    <div className={styles.assistantAvatar}>
                                        <svg
                                            width="12"
                                            height="12"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
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
                            {/* Attachment preview */}
                            {attachments.length > 0 && (
                                <div className={styles.attachmentPreview}>
                                    {attachments.map((att, i) => (
                                        <div key={i} className={styles.attachmentItem}>
                                            {att.type.startsWith("image/") ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={att.url} alt={att.name} className={styles.attachmentThumb} />
                                            ) : (
                                                <div className={styles.attachmentFile}>
                                                    <svg
                                                        width="14"
                                                        height="14"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                        <polyline points="14 2 14 8 20 8" />
                                                    </svg>
                                                    <span>{att.name}</span>
                                                </div>
                                            )}
                                            <button
                                                className={styles.attachmentRemove}
                                                onClick={() => removeAttachment(i)}
                                            >
                                                <svg
                                                    width="10"
                                                    height="10"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="3"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <line x1="18" y1="6" x2="6" y2="18" />
                                                    <line x1="6" y1="6" x2="18" y2="18" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <form onSubmit={onSubmit} className={styles.inputForm}>
                                {/* Toolbar */}
                                <div className={styles.toolbar}>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept="image/*,.pdf,.doc,.docx,.txt"
                                        onChange={handleFileSelect}
                                        className={styles.fileInput}
                                    />
                                    <button
                                        type="button"
                                        className={styles.toolBtn}
                                        onClick={() => fileInputRef.current?.click()}
                                        title="파일 첨부"
                                    >
                                        <svg
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                                        </svg>
                                    </button>
                                    <div className={styles.emojiWrap} ref={emojiRef}>
                                        <button
                                            type="button"
                                            className={styles.toolBtn}
                                            onClick={() => setShowEmoji((v) => !v)}
                                            title="이모지"
                                        >
                                            <svg
                                                width="18"
                                                height="18"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <circle cx="12" cy="12" r="10" />
                                                <path d="M8 9h0" strokeWidth="2.5" />
                                                <path d="M16 9h0" strokeWidth="2.5" />
                                                <path d="M9 14c.5 1 1.5 2 3 2s2.5-1 3-2" />
                                            </svg>
                                        </button>
                                        {showEmoji && (
                                            <div className={styles.emojiPicker}>
                                                {EMOJI_LIST.map((emoji) => (
                                                    <button
                                                        key={emoji}
                                                        type="button"
                                                        className={styles.emojiBtn}
                                                        onClick={() => {
                                                            setInput((v) => v + emoji);
                                                            setShowEmoji(false);
                                                            textareaRef.current?.focus();
                                                        }}
                                                    >
                                                        {emoji}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Textarea + Send */}
                                <div className={styles.inputRow}>
                                    <textarea
                                        ref={textareaRef}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                                                e.preventDefault();
                                                sendMessage();
                                            }
                                        }}
                                        placeholder="메시지를 입력하세요... (Shift+Enter로 줄바꿈)"
                                        className={styles.textarea}
                                        disabled={isLoading}
                                        rows={1}
                                    />
                                    <button
                                        type="submit"
                                        disabled={isLoading || (!input.trim() && attachments.length === 0)}
                                        className={styles.sendBtn}
                                    >
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <line x1="22" y1="2" x2="11" y2="13" />
                                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                        </svg>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
