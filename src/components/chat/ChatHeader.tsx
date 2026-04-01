"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import Navbar from "@/components/Navbar";

interface ChatHeaderProps {
  station: string;
  alias: string | null;
  onRefresh: () => void;
}

export default function ChatHeader({ station, alias, onRefresh }: ChatHeaderProps) {
  const t = useTranslations("chat");

  return (
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
            {(alias ?? station)[0]}
          </div>
          <div className="min-w-0">
            <p className="text-gray-900 dark:text-white font-semibold truncate">
              {alias ?? station}
            </p>
            {alias && (
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{station}</p>
            )}
          </div>
        </div>
      }
      onRefresh={onRefresh}
    />
  );
}
