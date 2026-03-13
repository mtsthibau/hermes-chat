"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Message } from "@/lib/message";
import { filterConversation } from "@/lib/conversation";
import { formatTime, formatDateDivider, isSameDay } from "@/lib/formatting";
import Navbar from "@/components/Navbar";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useTranslations } from "next-intl";

export default function ChatScreen() {
  useAuthGuard();
  const t = useTranslations("chat");
  const params = useParams();
  const station = decodeURIComponent(params.station as string);
  const hermesBase = (process.env.NEXT_PUBLIC_HERMES_API_URL ?? "").replace(/\/$/, "") + "/api";

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orig, setOrig] = useState("chat");

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    fetch("/api/config")
      .then((r) => (r.ok ? r.json() : null))
      .then((cfg) => { if (cfg?.nodename) setOrig(cfg.nodename); })
      .catch(() => { });
  }, []);

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
    if (sending) return;

    if (selectedFile) {
      setSending(true);
      setError(null);
      try {
        const uploadForm = new FormData();
        uploadForm.append("fileup", selectedFile);
        if (pass) uploadForm.append("pass", pass);
        const uploadRes = await fetch("/api/ufile", { method: "POST", body: uploadForm });
        if (!uploadRes.ok) {
          const data = await uploadRes.json();
          setError(data?.message ?? t("fileSendError"));
          return;
        }
        const uploadData = await uploadRes.json();
        const fileid: string = uploadData.id;
        if (!fileid) { setError(t("fileSendError")); return; }

        const msgRes = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orig,
            dest: [station],
            name: text.trim() || selectedFile.name,
            text: text.trim() || selectedFile.name,
            file: uploadData.filename ?? selectedFile.name,
            fileid,
            mimetype: uploadData.mimetype ?? selectedFile.type ?? "application/octet-stream",
          }),
        });
        if (!msgRes.ok) {
          const data = await msgRes.json();
          setError(data?.message ?? t("fileSendError"));
          return;
        }
        setText("");
        setSelectedFile(null);
        setPass("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        await fetchMessages();
        inputRef.current?.focus();
      } catch {
        setError(t("connectionError"));
      } finally {
        setSending(false);
      }
      return;
    }

    const trimmed = text.trim();
    if (!trimmed) return;

    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orig,
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
      <Navbar
        left={
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/home"
              className="text-orange-500 hover:text-orange-400 text-xl leading-none shrink-0"
              aria-label={t("back")}
            >
              く
            </Link>
            <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold uppercase shrink-0">
              {station[0]}
            </div>
            <div className="min-w-0">
              <p className="text-gray-900 dark:text-white font-semibold truncate">{station}</p>
            </div>
          </div>
        }
        onRefresh={fetchMessages}
      />

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
                    className={`${
                      msg.file && msg.fileid && msg.mimetype?.startsWith("audio/")
                        ? "w-[90%] sm:w-[70%]"
                        : "max-w-[75%] sm:max-w-[60%]"
                    } rounded-2xl px-4 py-2 shadow ${isMine
                      ? "bg-blue-900 text-white rounded-br-sm"
                      : "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white rounded-bl-sm"
                      }`}
                  >
                    <p className="text-md opacity-100 truncate">{msg.name}</p>

                    {msg.file && msg.fileid ? (
                      msg.mimetype?.startsWith("image/") ? (
                        <a
                          href={`${hermesBase}/file/${msg.fileid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={t("openFile")}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`${hermesBase}/file/${msg.fileid}`}
                            alt={msg.file}
                            className="max-w-full rounded-lg mb-1"
                            style={{ maxHeight: 200 }}
                          />
                          <p className="text-xs opacity-70 truncate">{msg.file}</p>
                          <p className="text-md opacity-100 truncate">{msg.text}</p>
                        </a>
                      ) : msg.mimetype?.startsWith("audio/") ? (
                        <div className="flex flex-col gap-1">
                          <audio
                            controls
                            src={`${hermesBase}/file/${msg.fileid}`}
                            className="w-full rounded-lg"
                            preload="metadata"
                          />
                          <p className="text-xs opacity-70 truncate">{msg.file}</p>
                        </div>
                      ) : (
                        <a
                          href={`${hermesBase}/file/${msg.fileid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={msg.file}
                          className="flex items-center gap-2 underline underline-offset-2 break-all"
                          aria-label={t("openFile")}
                        >
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0" aria-hidden="true">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z" />
                          </svg>
                          <span className="text-sm">{msg.file}</span>
                        </a>
                      )
                    ) : (
                      <>
                        {msg.name && msg.text && msg.name !== msg.text && (
                          <p className="text-xs font-semibold opacity-70 mb-1">{msg.name}</p>
                        )}
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {msg.text || msg.name}
                        </p>
                      </>
                    )}
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

      {/* Attachment preview strip */}
      {selectedFile && (
        <div className="bg-white dark:bg-gray-800 px-4 py-2 border-t border-gray-200 dark:border-gray-700 shrink-0">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm">
            {selectedFile.type.startsWith("image/") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={URL.createObjectURL(selectedFile)} alt="" className="w-8 h-8 object-cover rounded shrink-0" />
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0 text-gray-400" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z" />
              </svg>
            )}
            <span className="flex-1 truncate text-gray-800 dark:text-gray-200 text-sm">{selectedFile.name}</span>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder={t("passPlaceholder")}
              className="w-28 bg-white dark:bg-gray-600 text-gray-900 dark:text-white rounded px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-orange-500 border border-gray-300 dark:border-gray-500"
            />
            <button
              type="button"
              onClick={() => { setSelectedFile(null); setPass(""); if (fileInputRef.current) fileInputRef.current.value = ""; }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none px-1"
              aria-label={t("removeFile")}
            >×</button>
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 shrink-0">
        <form onSubmit={sendMessage} className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) { setSelectedFile(f); setText(""); } }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending}
            className="text-gray-400 hover:text-orange-500 transition-colors disabled:opacity-50 p-1"
            aria-label={t("attachFile")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.41 17.41a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </button>
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={selectedFile ? t("captionPlaceholder") : t("messagePlaceholder", { station })}
            disabled={sending}
            className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-full px-4 py-2 text-sm placeholder-gray-400 outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={sending || (!text.trim() && !selectedFile)}
            className="w-10 h-10 rounded-full bg-orange-500 hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white shrink-0 transition-colors"
            aria-label={t("send")}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 rotate-120">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
