"use client";

import { useCallback, useEffect, useState } from "react";
import { MapPin, RefreshCw, Sun, Moon, ExternalLink, Clock } from "lucide-react";
import { useTheme } from "@hermes/ui";
import { useTranslations } from "next-intl";

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
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchCoords();
  }, [fetchCoords]);

  // Auto-refresh timer
  useEffect(() => {
    const interval = setInterval(fetchCoords, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchCoords]);

  // Countdown tick
  useEffect(() => {
    if (loading) return;
    const tick = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(tick);
  }, [loading]);

  const lat = coords?.latitude ?? null;
  const lon = coords?.longitude ?? null;

  const mapsUrl =
    lat && lon
      ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=12/${lat}/${lon}`
      : null;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground">
      {/* Header */}
      <div className="w-full max-w-md flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <MapPin className="w-6 h-6 text-emerald-500" />
          <span className="text-lg font-semibold tracking-wide">HERMES GPS</span>
        </div>
        <button
          onClick={toggle}
          aria-label={t("toggleTheme")}
          className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      {/* Card */}
      <div className="w-full max-w-md rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-gray-900 shadow-xl overflow-hidden">
        {/* Card header */}
        <div className="bg-emerald-600 dark:bg-emerald-700 px-6 py-4 flex items-center gap-3">
          <MapPin className="w-5 h-5 text-white" />
          <h1 className="text-white font-semibold text-base tracking-wide">
            {t("cardTitle")}
          </h1>
        </div>

        <div className="px-6 py-6 space-y-5">
          {/* Error state */}
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700/50 px-4 py-3 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Coordinate rows */}
          <CoordRow
            label={t("latitude")}
            raw={lat}
            dms={lat ? formatCoord(lat, "N", "S") : null}
            loading={loading && !coords}
          />
          <CoordRow
            label={t("longitude")}
            raw={lon}
            dms={lon ? formatCoord(lon, "E", "W") : null}
            loading={loading && !coords}
          />

          {/* Divider */}
          <div className="border-t border-black/10 dark:border-white/10" />

          {/* Footer: last updated + actions */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {lastUpdated ? (
                <span>
                  {t("updated", { time: lastUpdated.toLocaleTimeString(), countdown })}
                </span>
              ) : (
                <span>{t("fetching")}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {t("map")}
                </a>
              )}
              <button
                onClick={fetchCoords}
                disabled={loading}
                aria-label={t("refresh")}
                className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                {t("refresh")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-8 text-xs text-gray-400 dark:text-gray-600">
        {t("footer")}
      </p>
    </main>
  );
}

function CoordRow({
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
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-widest text-gray-400 dark:text-gray-500">
        {label}
      </p>
      {loading ? (
        <div className="h-7 w-3/4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
      ) : raw ? (
        <>
          <p className="text-2xl font-mono font-semibold text-foreground">{raw}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{dms}</p>
        </>
      ) : (
        <p className="text-2xl font-mono font-semibold text-gray-300 dark:text-gray-600">—</p>
      )}
    </div>
  );
}
