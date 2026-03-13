"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTheme } from "@/providers/ThemeProvider";
import { useLocale } from "@/providers/LocaleProvider";
import { useTranslations } from "next-intl";
import type { HermesUser } from "@/lib/user";

interface NavbarProps {
  user?: HermesUser | null;
  onRefresh?: () => void;
  onLogout?: () => void;
  /** Optional left-side slot (e.g. back button + station name for the chat screen) */
  left?: React.ReactNode;
}

export default function Navbar({ user, onRefresh, onLogout, left }: NavbarProps) {
  const { theme, toggle } = useTheme();
  const { locale, setLocale } = useLocale();
  const t = useTranslations("home");
  const tTheme = useTranslations("theme");
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  return (
    <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 shrink-0">
      {/* Left side */}
      {left ?? (
        <div className="flex items-center gap-1">
          <Image src="/logo-hermes-500.png" alt="HERMES" width={78} height={66} className="dark:invert" />
          <span className="text-gray-500 dark:text-white font-semibold text-lg">Chat</span>
        </div>
      )}

      {/* Burger menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Open menu"
          aria-expanded={open}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
            aria-hidden="true"
          >
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
            {/* Username */}
            {user && (
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t("loggedInAs")}</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                  {user.name || user.email}
                </p>
              </div>
            )}

            {/* Theme toggle */}
            <button
              onClick={() => { toggle(); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="text-base" aria-hidden="true">{theme === "dark" ? "☀" : "⏾"}</span>
              {theme === "dark" ? tTheme("lightMode") : tTheme("darkMode")}
            </button>

            {/* Locale toggle */}
            <button
              onClick={() => { setLocale(locale === "pt" ? "en" : "pt"); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="text-base" aria-hidden="true">🌐</span>
              {locale === "pt" ? "English" : "Português"}
            </button>

            {/* Refresh */}
            {onRefresh && (
              <button
                onClick={() => { onRefresh(); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-base" aria-hidden="true">↻</span>
                {t("refresh")}
              </button>
            )}

            {/* Logout */}
            {onLogout && (
              <>
                <div className="border-t border-gray-100 dark:border-gray-700" />
                <button
                  onClick={() => { onLogout(); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <span className="text-base" aria-hidden="true">⎋</span>
                  {t("logout")}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
