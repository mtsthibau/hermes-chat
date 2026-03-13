"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Message } from "@/lib/message";
import { buildConversations, type Conversation } from "@/lib/conversation";
import { formatTimeOrDate } from "@/lib/formatting";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useTheme } from "@/providers/ThemeProvider";

export default function Home() {
  const user = useAuthGuard();
  const { theme, toggle } = useTheme();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [inboxRes, sentRes] = await Promise.all([
        fetch("/api/messages/inbox"),
        fetch("/api/messages/sent"),
      ]);
      const inbox: Message[] = inboxRes.ok ? await inboxRes.json() : [];
      const sent: Message[] = sentRes.ok ? await sentRes.json() : [];
      setConversations(buildConversations(inbox, sent));
    } catch {
      setError("Failed to load messages.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchMessages();
  }, [user, fetchMessages]);

  function logout() {
    localStorage.removeItem("hermes_user");
    window.location.replace("/");
  }

  const filtered = conversations.filter((c) =>
    c.station.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 shrink-0">
        <div className="flex items-center gap-3">
          <Image src="/logo-hermes-500.png" alt="HERMES" width={38} height={26} className="dark:invert" />
          <span className="text-gray-900 dark:text-white font-semibold text-lg">HERMES Chat</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-500 dark:text-gray-400 text-sm hidden sm:block">{user?.name || user?.email}</span>
          <button
            onClick={toggle}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-lg px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? "☀" : "🌙"}
          </button>
          <button
            onClick={fetchMessages}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Refresh"
          >
            ↻
          </button>
          <button
            onClick={logout}
            className="text-gray-500 dark:text-gray-400 hover:text-red-500 text-sm px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shrink-0">
        <input
          type="text"
          placeholder="Search conversations…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm placeholder-gray-400 outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
            Loading conversations…
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center h-32 text-red-500 dark:text-red-400 text-sm">{error}</div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex items-center justify-center h-32 text-gray-400 dark:text-gray-500 text-sm">
            No conversations yet.
          </div>
        )}
        {!loading &&
          filtered.map((conv) => (
            <Link
              key={conv.station}
              href={`/home/chat/${encodeURIComponent(conv.station)}`}
              className="flex items-center px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700/60 border-b border-gray-100 dark:border-gray-800 cursor-pointer transition-colors"
            >
              {/* Avatar */}
              <div className="w-12 h-12 shrink-0 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-lg mr-3 uppercase">
                {conv.station[0]}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="text-gray-900 dark:text-white font-medium truncate">{conv.station}</span>
                  <span className="text-gray-400 dark:text-gray-500 text-xs shrink-0 ml-2">
                    {formatTimeOrDate(conv.lastMessage.sent_at)}
                  </span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm truncate">
                  {conv.lastMessage.inbox ? "" : "You: "}
                  {conv.lastMessage.text || conv.lastMessage.name}
                </p>
              </div>
              {/* Unread badge */}
              {conv.unread > 0 && (
                <span className="ml-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                  {conv.unread > 9 ? "9+" : conv.unread}
                </span>
              )}
            </Link>
          ))}
      </div>
    </div>
  );
}
