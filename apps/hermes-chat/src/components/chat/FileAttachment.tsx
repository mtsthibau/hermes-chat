import { useTranslations } from "next-intl";
import { FileText } from "lucide-react";
import { useState } from "react";

interface FileAttachmentProps {
  file: string;
  fileid: string;
  mimetype: string;
  text: string | null;
  password?: string;
}

export default function FileAttachment({ file, fileid, mimetype, text, password }: FileAttachmentProps) {
  const t = useTranslations("chat");
  const base = `/api/files/${encodeURIComponent(fileid)}`;
  const fileUrl = password ? `${base}?pass=${encodeURIComponent(password)}` : base;
  const [loaded, setLoaded] = useState(false);

  if (mimetype.startsWith("image/")) {
    return (
      <a href={fileUrl} target="_blank" rel="noopener noreferrer" aria-label={t("openFile")}>
        <div className="relative rounded-lg mb-1 overflow-hidden" style={{ maxHeight: 200, minHeight: loaded ? undefined : 120, minWidth: 140 }}>
          {!loaded && (
            <div className="absolute inset-0 bg-gray-300 dark:bg-gray-600 animate-pulse rounded-lg" />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fileUrl}
            alt={file}
            className={`max-w-full rounded-lg transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
            style={{ maxHeight: 200 }}
            onLoad={() => setLoaded(true)}
          />
        </div>
        <p className="text-xs opacity-70 truncate">{file}</p>
        <p className="text-md opacity-100 truncate">{text}</p>
      </a>
    );
  }

  if (mimetype.startsWith("audio/")) {
    return (
      <div className="flex flex-col gap-1">
        <audio controls src={fileUrl} className="w-full rounded-lg" preload="metadata" />
        <p className="text-xs opacity-70 truncate">{file}</p>
      </div>
    );
  }

  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      download={file}
      className="flex items-center gap-2 underline underline-offset-2 break-all"
      aria-label={t("openFile")}
    >
      <FileText className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span className="text-sm">{file}</span>
    </a>
  );
}
