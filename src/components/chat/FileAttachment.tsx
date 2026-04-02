import { useTranslations } from "next-intl";
import { FileText } from "lucide-react";

interface FileAttachmentProps {
  file: string;
  fileid: string;
  mimetype: string;
  text: string | null;
  password?: string;
}

function getHermesBase(): string {
  return (process.env.NEXT_PUBLIC_HERMES_API_URL ?? "").replace(/\/$/, "") + "/api";
}

export default function FileAttachment({ file, fileid, mimetype, text, password }: FileAttachmentProps) {
  const t = useTranslations("chat");
  const base = `/api/files/${encodeURIComponent(fileid)}`;
  const fileUrl = password ? `${base}?pass=${encodeURIComponent(password)}` : base;

  if (mimetype.startsWith("image/")) {
    return (
      <a href={fileUrl} target="_blank" rel="noopener noreferrer" aria-label={t("openFile")}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fileUrl}
          alt={file}
          className="max-w-full rounded-lg mb-1"
          style={{ maxHeight: 200 }}
        />
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
