"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { MapPin, RefreshCw, Sun, Moon, Clock } from "lucide-react";
import { useTheme } from "@hermes/ui";
import { useTranslations } from "next-intl";
import { useLocale } from "@/providers/LocaleProvider";

// SSR-disabled import: MapLibre GL JS requires browser APIs
const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

interface Coordinates {
  latitude: string;
  longitude: string;
}

const REFRESH_INTERVAL_MS = 30_000;

function formatCoord(value: string, posLabel: string, negLabel: string): string {
  const n = parseFloat(value);
  if (isNaN(n)) return value;
  const abs = Math.abs(n);
  const deg = Math.floor(abs);
  const minFull = (abs - deg) * 60;
  const min = Math.floor(minFull);
  const sec = ((minFull - min) * 60).toFixed(2);
  const dir = n >= 0 ? posLabel : negLabel;
  return `${deg}° ${min}' ${sec}" ${dir}`;
}

export default function GpsPage() {
  const { theme, toggle } = useTheme();
  const t = useTranslations("gps");
  const { locale, setLocale } = useLocale();
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL_MS / 1000);

  const fetchCoords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/gps");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { message?: string }).message ?? `HTTP ${res.status}`);
      }
      const data: Coordinates = await res.json();
      setCoords(data);
      setLastUpdated(new Date());
      setCountdown(REFRESH_INTERVAL_MS / 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("unknownError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { fetchCoords(); }, [fetchCoords]);

  useEffect(() => {
    const interval = setInterval(fetchCoords, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchCoords]);

  useEffect(() => {
    if (loading) return;
    const tick = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(tick);
  }, [loading]);

  const lat = coords ? parseFloat(coords.latitude) : null;
  const lon = coords ? parseFloat(coords.longitude) : null;

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Full-screen map */}
      <MapView lat={lat} lon={lon} dark={theme === "dark"} />

      {/* ── Bottom panel ── */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-t border-black/10 dark:border-white/10 px-4 pt-3 pb-4">

        {/* Row 1: title + controls */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-500" />
            <span className="font-semibold tracking-wide text-sm">HERMES GPS</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setLocale(locale === "en" ? "pt" : "en")}
              aria-label={t("toggleLocale")}
              className="px-2 py-1 rounded-lg text-xs font-medium hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              {locale === "en" ? "PT" : "EN"}
            </button>
            <button
              onClick={toggle}
              aria-label={t("toggleTheme")}
              className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Row 2: coordinates */}
        {error ? (
          <p className="text-xs text-red-600 dark:text-red-400 mb-2">{error}</p>
        ) : (
          <div className="flex gap-8 mb-2">
            <CoordItem
              label={t("latitude")}
              raw={coords?.latitude ?? null}
              dms={coords ? formatCoord(coords.latitude, "N", "S") : null}
              loading={loading && !coords}
            />
            <CoordItem
              label={t("longitude")}
              raw={coords?.longitude ?? null}
              dms={coords ? formatCoord(coords.longitude, "E", "W") : null}
              loading={loading && !coords}
            />
          </div>
        )}

        {/* Row 3: status + refresh */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            {lastUpdated
              ? t("updated", { time: lastUpdated.toLocaleTimeString(), countdown })
              : t("fetching")}
          </div>
          <button
            onClick={fetchCoords}
            disabled={loading}
            aria-label={t("refresh")}
            className="flex items-center gap-1 text-orange-600 dark:text-orange-400 hover:underline disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            {t("refresh")}
          </button>
        </div>
      </div>
    </div>
  );
}

function CoordItem({
  label,
  raw,
  dms,
  loading,
}: {
  label: string;
  raw: string | null;
  dms: string | null;
  loading: boolean;
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400 dark:text-gray-500">
        {label}
      </p>
      {loading ? (
        <div className="h-5 w-28 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
      ) : raw ? (
        <>
          <p className="text-base font-mono font-semibold leading-tight">{raw}</p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">{dms}</p>
        </>
      ) : (
        <p className="text-base font-mono font-semibold text-gray-300 dark:text-gray-600">—</p>
      )}
    </div>
  );
}
