"use client";

import { useRef, useEffect } from "react";
import { useTranslations } from "next-intl";

interface MessageInputProps {
  text: string;
  onTextChange: (text: string) => void;
  onFileSelect: (file: File) => void;
  onSubmit: (e: React.FormEvent) => void;
  sending: boolean;
  hasFile: boolean;
  station: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export default function MessageInput({
  text,
  onTextChange,
  onFileSelect,
  onSubmit,
  sending,
  hasFile,
  station,
  inputRef,
}: MessageInputProps) {
  const t = useTranslations("chat");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clear the hidden file input whenever the parent removes the selected file
  useEffect(() => {
    if (!hasFile && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [hasFile]);

  return (
    <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 shrink-0">
      <form onSubmit={onSubmit} className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              onFileSelect(f);
              onTextChange("");
            }
          }}
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
          onChange={(e) => onTextChange(e.target.value)}
          placeholder={hasFile ? t("captionPlaceholder") : t("messagePlaceholder", { station })}
          disabled={sending}
          className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-full px-4 py-2 text-sm placeholder-gray-400 outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={sending || (!text.trim() && !hasFile)}
          className="w-10 h-10 rounded-full bg-orange-500 hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white shrink-0 transition-colors"
          aria-label={t("send")}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 rotate-120">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </form>
    </div>
  );
}
