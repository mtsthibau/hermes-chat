"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import InfoList from "@/components/radio/InfoList";

interface SysStatus {
    status: boolean;
    nodename: string;
    domain: string;
    diskfree: string;
    gateway: boolean | string;
    interfaces: string[];
    ip: string[];
    network: string | null;
    piduuardop: string;
    wifiessid: string;
}

export default function SysInfo() {
    const t = useTranslations("radioInfo");
    const [info, setInfo] = useState<SysStatus | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/sys")
            .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
            .then((data: SysStatus) => setInfo(data))
            .catch(() => setError(t("loadError")))
    }, [t]);


    if (error) {
        return (
            <div className="flex items-center justify-center h-32 text-red-500 dark:text-red-400 text-sm">
                {error}
            </div>
        );
    }

    if (!info) return null;

    const na = t("na");

    const items = [
        {
            label: t("status"),
            value: (
                <span className={info.status
                    ? "text-green-600 dark:text-green-400 font-semibold"
                    : "text-red-500 dark:text-red-400 font-semibold"}>
                    {info.status ? t("statusOnline") : t("statusOffline")}
                </span>
            ),
        },
        { label: t("nodename"), value: info.nodename || na },
        { label: t("domain"), value: info.domain || na },
        { label: t("wifiessid"), value: info.wifiessid || na },
        {
            label: t("ip"),
            value: info.ip?.length ? (
                <ul className="space-y-0.5">
                    {info.ip.map((addr) => <li key={addr}>{addr}</li>)}
                </ul>
            ) : na,
        },
        {
            label: t("gateway"),
            value: info.gateway === false || info.gateway == null ? na : String(info.gateway),
        },
        { label: t("network"), value: info.network ?? na },
        {
            label: t("diskfree"),
            value: info.diskfree
                ? `${(parseInt(info.diskfree, 10) / 1024).toFixed(1)} MB`
                : na,
        },
        { label: t("piduuardop"), value: info.piduuardop || na },
        {
            label: t("interfaces"),
            value: info.interfaces?.length ? (
                <ul className="space-y-1">
                    {info.interfaces.map((iface, i) => (
                        <li key={i} className="font-mono text-xs bg-gray-50 dark:bg-gray-700 rounded px-2 py-1">
                            {iface.trim()}
                        </li>
                    ))}
                </ul>
            ) : na,
        },
    ];

    return <InfoList items={items} />;
}
