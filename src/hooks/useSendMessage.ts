import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

interface SendPayload {
  text: string;
  file: File | null;
  pass: string;
  orig: string;
}

interface UseSendMessageOptions {
  station: string;
  onSuccess: () => Promise<void>;
  setError: (msg: string | null) => void;
}

async function uploadFile(file: File, pass: string): Promise<{ id: string; filename?: string; mimetype?: string }> {
  const form = new FormData();
  form.append("fileup", file);
  if (pass) form.append("pass", pass);
  const res = await fetch("/api/ufile", { method: "POST", body: form });
  const data = await res.json();
  if (!res.ok || !data.id) throw new Error(data?.message ?? "");
  return data;
}

async function postMessage(body: Record<string, unknown>): Promise<void> {
  const res = await fetch("/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data?.message ?? "");
  }
}

export function useSendMessage({ station, onSuccess, setError }: UseSendMessageOptions) {
  const t = useTranslations("chat");
  const [sending, setSending] = useState(false);

  const sendMessage = useCallback(
    async ({ text, file, pass, orig }: SendPayload) => {
      if (sending) return;
      setSending(true);
      setError(null);

      try {
        const base = {
          orig,
          dest: [station],
          secure: !!pass,
          pass,
          sent_at: new Date().toISOString(),
        };

        if (file) {
          const upload = await uploadFile(file, pass);
          await postMessage({
            ...base,
            name: text.trim() || file.name,
            text: text.trim() || file.name,
            file: upload.filename ?? file.name,
            fileid: upload.id,
            mimetype: upload.mimetype ?? file.type ?? "application/octet-stream",
          });
        } else {
          const trimmed = text.trim();
          if (!trimmed) return;
          await postMessage({
            ...base,
            name: trimmed.length > 60 ? `${trimmed.substring(0, 57)}...` : trimmed,
            text: trimmed,
          });
        }

        await onSuccess();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        setError(msg || t(file ? "fileSendError" : "connectionError"));
      } finally {
        setSending(false);
      }
    },
    [station, sending, t, onSuccess, setError]
  );

  return { sendMessage, sending };
}
