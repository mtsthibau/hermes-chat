"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface DeleteMessageButtonProps {
  messageId: number;
  onDeleted: () => void;
  onError: (msg: string) => void;
  label: string;
}

export default function DeleteMessageButton({ messageId, onDeleted, onError, label }: DeleteMessageButtonProps) {
  const t = useTranslations("chat");
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch("/api/messages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: messageId }),
      });
      if (!res.ok) {
        const data = await res.json();
        onError(data?.message ?? t("deleteError"));
      } else {
        onDeleted();
      }
    } catch {
      onError(t("deleteError"));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 disabled:opacity-30 mb-1 shrink-0"
      aria-label={label}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
        <path d="M9 3v1H4v2h1v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1V4h-5V3H9zm0 5h2v9H9V8zm4 0h2v9h-2V8z" />
      </svg>
    </button>
  );
}
