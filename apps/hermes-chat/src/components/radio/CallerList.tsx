"use client";

import { useTranslations } from "next-intl";

export interface CallerEntry {
    id: number;
    title: string;
    stations: string[];
    starttime: string;
    stoptime: string;
    enable: number;
}

interface CallerListProps {
    callers: CallerEntry[];
}

export default function CallerList({ callers }: CallerListProps) {
    const t = useTranslations("radioInfo");

    return (
        <div className="max-w-lg mx-auto mt-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 px-5 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 py-3 border-b border-gray-100 dark:border-gray-700">
                {t("callerTitle")}
            </p>
            {callers.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 py-3">{t("callerEmpty")}</p>
            ) : (
                callers.map((c) => (
                    <div key={c.id} className="py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{c.title}</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                c.enable
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                                    : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                            }`}>
                                {c.enable ? t("callerEnabled") : t("callerDisabled")}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t("callerStart")}: {c.starttime} &nbsp;&mdash;&nbsp; {t("callerStop")}: {c.stoptime}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {t("callerStations")}: {c.stations.join(", ")}
                        </p>
                    </div>
                ))
            )}
        </div>
    );
}
