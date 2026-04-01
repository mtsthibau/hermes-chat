"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import Navbar from "@/components/Navbar";
import { ChevronLeft } from "lucide-react";

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
            className="text-orange-500 hover:text-orange-400 shrink-0"
            aria-label={t("back")}
          >
            <ChevronLeft className="w-6 h-6" aria-hidden="true" />
          </Link>
          <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold uppercase shrink-0">
            {(alias ?? station)[0]}
          </div>
          <div className="min-w-0">
            <p className="text-gray-900 dark:text-white font-semibold truncate">
              {alias ?? station}
            </p>
          </div>
        </div>
      }
      onRefresh={onRefresh}
    />
  );
}
