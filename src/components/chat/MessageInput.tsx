"use client";

import { useRef, useEffect, useState } from "react";
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
  pass: string;
  onPassChange: (pass: string) => void;
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
  pass,
  onPassChange,
}: MessageInputProps) {
  const t = useTranslations("chat");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPass, setShowPass] = useState(false);
  const [passVisible, setPassVisible] = useState(false);

  // Clear the hidden file input whenever the parent removes the selected file
  useEffect(() => {
    if (!hasFile && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [hasFile]);

  // Hide password row when pass is cleared externally (e.g. after send)
  useEffect(() => {
    if (!pass) {
      setShowPass(false);
      setPassVisible(false);
    }
  }, [pass]);

  function handleRemovePass() {
    onPassChange("");
    setPassVisible(false);
    setShowPass(false);
  }

  return (
    <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 shrink-0">
      {showPass && (
        <div className="flex items-center gap-2 mb-2">
          <input
            type={passVisible ? "text" : "password"}
            value={pass}
            onChange={(e) => onPassChange(e.target.value)}
            placeholder={t("passPlaceholder")}
            className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-full px-4 py-2 text-sm placeholder-gray-400 outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            type="button"
            onClick={() => setPassVisible((v) => !v)}
            className="text-gray-400 hover:text-orange-500 transition-colors p-1"
            aria-label={t(passVisible ? "hidePass" : "showPass")}
          >
            {passVisible ? (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
                <path d="M11.83 9 15 12.16V12a3 3 0 0 0-3-3h-.17m-4.3.8 1.55 1.55A4.9 4.9 0 0 0 7 12c0 2.76 2.24 5 5 5a4.9 4.9 0 0 0 .65-.06l1.55 1.55C13.45 18.8 12.74 19 12 19c-3.87 0-7-3.13-7-7 0-.74.2-1.45.53-2.09M2 4.27l2.28 2.28.46.46A10.95 10.95 0 0 0 2 12c1.73 4.39 6 7.5 10.5 7.5 1.55 0 3.03-.3 4.38-.84l.43.42L19.73 22 21 20.73 3.27 3 2 4.27m10.5 7.5-3.5-3.5c.12-.02.24-.02.36-.02a3.5 3.5 0 0 1 3.5 3.5c0 .12 0 .24-.02.36L12.5 11.77z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
              </svg>
            )}
          </button>
          <button
            type="button"
            onClick={handleRemovePass}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none px-1"
            aria-label={t("removePass")}
          >
            ×
          </button>
        </div>
      )}
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
        <button
          type="button"
          onClick={() => setShowPass((v) => !v)}
          disabled={sending}
          className={`transition-colors disabled:opacity-50 p-1 ${pass || showPass ? "text-orange-500" : "text-gray-400 hover:text-orange-500"}`}
          aria-label={t("togglePass")}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
            <path d="M12 1C8.676 1 6 3.676 6 7v1H4v15h16V8h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v1H8V7c0-2.276 1.724-4 4-4zm0 9a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />
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
