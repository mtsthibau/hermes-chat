"use client";

import { useTranslations } from "next-intl";
import { FileText, X } from "lucide-react";

interface AttachmentPreviewProps {
  file: File;
  pass: string;
  onRemove: () => void;
}

export default function AttachmentPreview({ file, onRemove }: AttachmentPreviewProps) {
  const t = useTranslations("chat");

  return (
    <div className="bg-white dark:bg-gray-800 px-4 py-2 border-t border-gray-200 dark:border-gray-700 shrink-0">
      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm">
        {file.type.startsWith("image/") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={URL.createObjectURL(file)}
            alt=""
            className="w-8 h-8 object-cover rounded shrink-0"
          />
        ) : (
          <FileText className="w-5 h-5 shrink-0 text-gray-400" aria-hidden="true" />
        )}
        <span className="flex-1 truncate text-gray-800 dark:text-gray-200 text-sm">{file.name}</span>
        <button
          type="button"
          onClick={onRemove}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
          aria-label={t("removeFile")}
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
