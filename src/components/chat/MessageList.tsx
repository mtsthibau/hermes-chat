"use client";

import { useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import type { Message } from "@/lib/message";
import { isSameDay } from "@/lib/formatting";
import DateDivider from "./DateDivider";
import MessageBubble from "./MessageBubble";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  sentIds: Set<number>;
  syncedIds: Set<number>;
  onDeleted: (id: number) => void;
  onError: (msg: string) => void;
}

export default function MessageList({
  messages,
  loading,
  sentIds,
  syncedIds,
  onDeleted,
  onError,
}: MessageListProps) {
  const t = useTranslations("chat");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
      {loading && <LoadingSpinner className="py-10" />}
      {!loading && messages.length === 0 && (
        <div className="flex justify-center text-gray-400 dark:text-gray-500 text-sm py-10">
          {t("noMessages")}
        </div>
      )}
      {!loading &&
        messages.map((msg, i) => {
          const showDivider = i === 0 || !isSameDay(messages[i - 1].sent_at, msg.sent_at);
          return (
            <div key={msg.id} className="group">
              {showDivider && <DateDivider dateStr={msg.sent_at} />}
              <MessageBubble
                msg={msg}
                sentIds={sentIds}
                syncedIds={syncedIds}
                onDeleted={onDeleted}
                onError={onError}
                deleteLabel={t("deleteMessage")}
              />
            </div>
          );
        })}
      <div ref={bottomRef} />
    </div>
  );
}
