"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface ScheduleData {
  next?: string;      // ISO timestamp of next sync
  interval?: number;  // interval in seconds
}

function formatCountdown(targetIso: string): string | null {
  const diff = Math.floor((new Date(targetIso).getTime() - Date.now()) / 1000);
  if (isNaN(diff)) return null;
  if (diff <= 0) return null;
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m`;
  if (m > 0) return `${m}m ${s.toString().padStart(2, "0")}s`;
  return `${s}s`;
}

export default function NextSyncBadge() {
  const t = useTranslations("chat");
  const [schedule, setSchedule] = useState<ScheduleData | null>(null);
  const [countdown, setCountdown] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchSchedule() {
      try {
        const res = await fetch("/api/schedule");
        if (res.ok) {
          const data: ScheduleData = await res.json();
          if (!cancelled) setSchedule(data);
        }
      } catch {
        // silently ignore — badge simply won't show
      }
    }

    fetchSchedule();
    const refetch = setInterval(fetchSchedule, 60_000);
    return () => { cancelled = true; clearInterval(refetch); };
  }, []);

  useEffect(() => {
    if (!schedule?.next) { setCountdown(null); return; }

    function tick() {
      setCountdown(schedule!.next ? formatCountdown(schedule!.next) : null);
    }

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [schedule]);

  if (!countdown) return null;

  return (
    <div className="flex justify-center px-4 pt-2 shrink-0">
      <span className="inline-flex items-center gap-1.5 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 text-xs font-medium px-3 py-1 rounded-full">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 shrink-0" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        {t("nextSync", { countdown })}
      </span>
    </div>
  );
}
