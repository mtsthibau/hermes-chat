"use client";

import { useRef, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, Lock, Paperclip, Send, X } from "lucide-react";

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
              <EyeOff className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Eye className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            onClick={handleRemovePass}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
            aria-label={t("removePass")}
          >
            <X className="w-4 h-4" aria-hidden="true" />
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
          <Paperclip className="w-5 h-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => setShowPass((v) => !v)}
          disabled={sending}
          className={`transition-colors disabled:opacity-50 p-1 ${pass || showPass ? "text-orange-500" : "text-gray-400 hover:text-orange-500"}`}
          aria-label={t("togglePass")}
        >
          <Lock className="w-5 h-5" aria-hidden="true" />
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
          <Send className="w-5 h-5" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
