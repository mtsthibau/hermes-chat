"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Message } from "@/lib/message";
import { filterConversation } from "@/lib/conversation";
import { formatTime, formatDateDivider, isSameDay } from "@/lib/formatting";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useTheme } from "@/providers/ThemeProvider";
import { useTranslations } from "next-intl";

export default function ChatScreen() {
  useAuthGuard();
  const { theme, toggle } = useTheme();
  const t = useTranslations("chat");
  const tTheme = useTranslations("theme");
  const params = useParams();
  const station = decodeURIComponent(params.station as string);

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const [inboxRes, sentRes] = await Promise.all([
        fetch("/api/messages/inbox"),
        fetch("/api/messages/sent"),
      ]);
      const inbox: Message[] = inboxRes.ok ? await inboxRes.json() : [];
      const sent: Message[] = sentRes.ok ? await sentRes.json() : [];
      setMessages(filterConversation(inbox, sent, station));
    } catch {
      setError(t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [station, t]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10_000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orig: "chat",
          dest: [station],
          name: trimmed.length > 60 ? trimmed.substring(0, 57) + "..." : trimmed,
          text: trimmed,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data?.message ?? t("sendError"));
        return;
      }

      setText("");
      await fetchMessages();
      inputRef.current?.focus();
    } catch {
      setError(t("connectionError"));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center border-b border-gray-200 dark:border-gray-700 shrink-0">
        <Link
          href="/home"
          className="text-orange-500 hover:text-orange-400 mr-3 text-xl leading-none"
          aria-label={t("back")}
        >
          ←
        </Link>
        <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold uppercase mr-3 shrink-0">
          {station[0]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-gray-900 dark:text-white font-semibold truncate">{station}</p>
        </div>
        <button
          onClick={toggle}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-lg px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ml-2"
          title={tTheme("toggle")}
          aria-label={tTheme("toggle")}
        >
          {theme === "dark" ? "☀" : "🌙"}
        </button>
        <button
          onClick={fetchMessages}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ml-2"
          title={t("refresh")}
        >
          ↻
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {loading && (
          <div className="flex justify-center text-gray-500 dark:text-gray-400 py-10">{t("loading")}</div>
        )}
        {!loading && messages.length === 0 && (
          <div className="flex justify-center text-gray-400 dark:text-gray-500 text-sm py-10">
            {t("noMessages")}
          </div>
        )}
        {!loading &&
          messages.map((msg, i) => {
            const showDivider =
              i === 0 || !isSameDay(messages[i - 1].sent_at, msg.sent_at);
            const isMine = !msg.inbox;

            return (
              <div key={msg.id}>
                {showDivider && (
                  <div className="flex items-center gap-2 my-4">
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                    <span className="text-gray-400 dark:text-gray-500 text-xs shrink-0">
                      {formatDateDivider(msg.sent_at)}
                    </span>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                  </div>
                )}
                <div className={`flex mb-1 ${isMine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] sm:max-w-[60%] rounded-2xl px-4 py-2 shadow ${
                      isMine
                        ? "bg-orange-500 text-white rounded-br-sm"
                        : "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white rounded-bl-sm"
                    }`}
                  >
                    {msg.name && msg.text && msg.name !== msg.text && (
                      <p className="text-xs font-semibold opacity-70 mb-1">{msg.name}</p>
                    )}
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {msg.text || msg.name}
                    </p>
                    <p className={`text-xs mt-1 opacity-60 ${isMine ? "text-right" : "text-left"}`}>
                      {formatTime(msg.sent_at)}
                      {msg.secure && " 🔒"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        <div ref={bottomRef} />
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-300 text-sm text-center px-4 py-2 shrink-0">
          {error}
        </div>
      )}

      {/* Input bar */}
      <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 shrink-0">
        <form onSubmit={sendMessage} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("messagePlaceholder", { station })}
            disabled={sending}
            className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-full px-4 py-2 text-sm placeholder-gray-400 outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="w-10 h-10 rounded-full bg-orange-500 hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white shrink-0 transition-colors"
            aria-label={t("send")}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 rotate-90">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
