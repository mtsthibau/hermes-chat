"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useTranslations } from "next-intl";
import Navbar from "@/components/Navbar";
import type { Message } from "@/lib/message";
import { buildConversations } from "@/lib/conversation";

interface Station {
  name: string;
  alias: string;
}

export default function NewChatPage() {
  useAuthGuard();
  const t = useTranslations("newChat");
  const router = useRouter();

  const [stations, setStations] = useState<Station[]>([]);
  const [existingStations, setExistingStations] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [stationsRes, inboxRes, sentRes] = await Promise.all([
        fetch("/api/stations"),
        fetch("/api/messages/inbox"),
        fetch("/api/messages/sent"),
      ]);

      const stationList: Station[] = stationsRes.ok ? await stationsRes.json() : [];
      const inbox: Message[] = inboxRes.ok ? await inboxRes.json() : [];
      const sent: Message[] = sentRes.ok ? await sentRes.json() : [];

      const conversations = buildConversations(inbox, sent);
      setExistingStations(new Set(conversations.map((c) => c.station)));
      setStations(Array.isArray(stationList) ? stationList : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = stations.filter((s) => {
    if (existingStations.has(s.name)) return false;
    const q = search.toLowerCase();
    return s.alias.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
  });

  function handleSelect(name: string) {
    router.push(`/home/chat/${encodeURIComponent(name)}`);
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar
        left={
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/home"
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={t("back", { defaultValue: "Back" })}
            >
              く
            </Link>
            <span className="text-gray-900 dark:text-white font-semibold text-base">
              {t("selectStation")}
            </span>
          </div>
        }
      />

      <div className="px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shrink-0">
        <input
          autoFocus
          type="text"
          placeholder={t("stationSearchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm placeholder-gray-400 outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
            {t("loading")}
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="flex items-center justify-center h-32 text-gray-400 dark:text-gray-500 text-sm">
            {t("noStations")}
          </div>
        )}
        {!loading &&
          filtered.map((s) => (
            <button
              key={s.name}
              onClick={() => handleSelect(s.name)}
              className="w-full flex items-center px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700/60 border-b border-gray-100 dark:border-gray-800 transition-colors text-left"
            >
              <div className="w-12 h-12 shrink-0 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-lg mr-3 uppercase">
                {(s.alias || s.name).split("", 2)}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-gray-900 dark:text-white font-medium truncate block">
                  {s.alias || s.name}
                </span>
                {s.alias && (
                  <span className="text-xs text-gray-400 dark:text-gray-500 truncate block">
                    {s.name}
                  </span>
                )}
              </div>
            </button>
          ))}
      </div>
    </div>
  );
}
