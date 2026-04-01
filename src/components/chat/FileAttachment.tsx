import { useTranslations } from "next-intl";

interface FileAttachmentProps {
  file: string;
  fileid: string;
  mimetype: string;
  text: string | null;
}

function getHermesBase(): string {
  return (process.env.NEXT_PUBLIC_HERMES_API_URL ?? "").replace(/\/$/, "") + "/api";
}

export default function FileAttachment({ file, fileid, mimetype, text }: FileAttachmentProps) {
  const t = useTranslations("chat");
  const fileUrl = `${getHermesBase()}/file/${fileid}`;

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
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z" />
      </svg>
      <span className="text-sm">{file}</span>
    </a>
  );
}
