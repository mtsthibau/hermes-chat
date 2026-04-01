"use client";

import { useEffect, useState } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useTranslations } from "next-intl";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

interface SysStatus {
    status: boolean;
    uname: string;
    nodename: string;
    name: string;
    domain: string;
    diskfree: string;
    gateway: boolean | string;
    interfaces: string[];
    ip: string[];
    network: string | null;
    piduuardop: string;
    wifiessid: string;
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
            <span className="sm:w-40 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 shrink-0">
                {label}
            </span>
            <span className="text-sm text-gray-800 dark:text-gray-100 break-all">{children}</span>
        </div>
    );
}

export default function RadioInfoPage() {
    useAuthGuard();
    const t = useTranslations("radioInfo");

    const [info, setInfo] = useState<SysStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/sys")
            .then((r) => {
                if (!r.ok) throw new Error();
                return r.json();
            })
            .then((data: SysStatus) => setInfo(data))
            .catch(() => setError(t("loadError")))
            .finally(() => setLoading(false));
    }, [t]);

    const left = (
        <div className="flex items-center gap-3 min-w-0">
            <Link
                href="/home"
                className="text-orange-500 hover:text-orange-400 shrink-0"
                aria-label={t("back")}
            >
                <ChevronLeft className="w-6 h-6" aria-hidden="true" />
            </Link>
            <span className="text-gray-900 dark:text-white font-semibold text-base">
                {t("title")}
            </span>
        </div>
    );

    return (
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            <Navbar left={left} />

            <div className="flex-1 overflow-y-auto p-4">
                {loading && <LoadingSpinner className="py-10" />}

                {error && (
                    <div className="flex items-center justify-center h-32 text-red-500 dark:text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {info && (
                    <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 px-5 py-2">
                        <InfoRow label={t("status")}>
                            <span
                                className={
                                    info.status
                                        ? "text-green-600 dark:text-green-400 font-semibold"
                                        : "text-red-500 dark:text-red-400 font-semibold"
                                }
                            >
                                {info.status ? t("statusOnline") : t("statusOffline")}
                            </span>
                        </InfoRow>

                        <InfoRow label={t("nodename")}>{info.nodename || t("na")}</InfoRow>
                        <InfoRow label={t("domain")}>{info.domain || t("na")}</InfoRow>
                        <InfoRow label={t("wifiessid")}>{info.wifiessid || t("na")}</InfoRow>

                        <InfoRow label={t("ip")}>
                            {info.ip?.length ? (
                                <ul className="space-y-0.5">
                                    {info.ip.map((addr) => (
                                        <li key={addr}>{addr}</li>
                                    ))}
                                </ul>
                            ) : (
                                t("na")
                            )}
                        </InfoRow>

                        <InfoRow label={t("gateway")}>
                            {info.gateway === false || info.gateway == null
                                ? t("na")
                                : String(info.gateway)}
                        </InfoRow>

                        <InfoRow label={t("network")}>{info.network ?? t("na")}</InfoRow>

                        <InfoRow label={t("diskfree")}>
                            {info.diskfree
                                ? `${(parseInt(info.diskfree, 10) / 1024).toFixed(1)} MB`
                                : t("na")}
                        </InfoRow>

                        <InfoRow label={t("piduuardop")}>{info.piduuardop || t("na")}</InfoRow>

                        <InfoRow label={t("interfaces")}>
                            {info.interfaces?.length ? (
                                <ul className="space-y-1">
                                    {info.interfaces.map((iface, i) => (
                                        <li key={i} className="font-mono text-xs bg-gray-50 dark:bg-gray-700 rounded px-2 py-1">
                                            {iface.trim()}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                t("na")
                            )}
                        </InfoRow>
                    </div>
                )}
            </div>
        </div>
    );
}
