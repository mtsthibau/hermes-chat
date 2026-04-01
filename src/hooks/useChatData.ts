import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import type { Message } from "@/lib/message";
import { filterConversation } from "@/lib/conversation";

interface UseChatDataResult {
  messages: Message[];
  sentIds: Set<number>;
  syncedIds: Set<number>;
  loading: boolean;
  error: string | null;
  fetchMessages: () => Promise<void>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export function useChatData(station: string, aliasMap: Map<string, string> = new Map()): UseChatDataResult {
  const t = useTranslations("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [sentIds, setSentIds] = useState<Set<number>>(new Set());
  const [syncedIds, setSyncedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const [msgRes, sentRes, uulsRes] = await Promise.all([
        fetch("/api/messages"),
        fetch("/api/messages/sent"),
        fetch("/api/sys/uuls"),
      ]);

      const allMessages: Message[] = msgRes.ok ? await msgRes.json() : [];
      setMessages(filterConversation(allMessages, station, aliasMap));

      if (sentRes.ok && uulsRes.ok) {
        const sentData: unknown = await sentRes.json();
        const uulsData: unknown = await uulsRes.json();

        const newSentIds = new Set<number>(
          Array.isArray(sentData)
            ? (sentData as Message[]).map((m) => m.id)
            : []
        );

        const uulsPendingIds = new Set<number>(
          Array.isArray(uulsData)
            ? (uulsData as unknown[]).flatMap((entry) => {
                const e = entry as Record<string, unknown>;
                return typeof e.messageId === "number" ? [e.messageId] : [];
              })
            : []
        );

        setSentIds(newSentIds);

        const synced = new Set<number>();
        for (const id of newSentIds) {
          if (!uulsPendingIds.has(id)) synced.add(id);
        }
        setSyncedIds(synced);
      }
    } catch {
      setError(t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [station, t, aliasMap]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10_000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  return { messages, sentIds, syncedIds, loading, error, fetchMessages, setMessages };
}
