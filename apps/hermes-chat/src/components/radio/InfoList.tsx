"use client";

interface InfoItem {
    label: string;
    value: React.ReactNode;
}

interface InfoListProps {
    title?: string;
    items: InfoItem[];
}

function InfoRow({ label, value }: InfoItem) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
            <span className="sm:w-40 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 shrink-0">
                {label}
            </span>
            <span className="text-sm text-gray-800 dark:text-gray-100 break-all">{value}</span>
        </div>
    );
}

export default function InfoList({ title, items }: InfoListProps) {
    return (
        <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 px-5 py-2">
            {title && (
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 py-3 border-b border-gray-100 dark:border-gray-700">
                    {title}
                </p>
            )}
            {items.map((item, i) => (
                <InfoRow key={i} label={item.label} value={item.value} />
            ))}
        </div>
    );
}
