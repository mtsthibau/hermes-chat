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

export function useSendMessage({ station, onSuccess, setError }: UseSendMessageOptions) {
  const t = useTranslations("chat");
  const [sending, setSending] = useState(false);

  const sendMessage = useCallback(
    async ({ text, file, pass, orig }: SendPayload) => {
      if (sending) return;
      setSending(true);
      setError(null);

      try {
        if (file) {
          const uploadForm = new FormData();
          uploadForm.append("fileup", file);
          if (pass) uploadForm.append("pass", pass);

          const uploadRes = await fetch("/api/ufile", { method: "POST", body: uploadForm });
          if (!uploadRes.ok) {
            const data = await uploadRes.json();
            setError(data?.message ?? t("fileSendError"));
            return;
          }

          const uploadData = await uploadRes.json();
          const fileid: string = uploadData.id;
          if (!fileid) { setError(t("fileSendError")); return; }

          const msgRes = await fetch("/api/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orig,
              dest: [station],
              name: text.trim() || file.name,
              text: null,
              file: uploadData.filename ?? file.name,
              fileid,
              mimetype: uploadData.mimetype ?? file.type ?? "application/octet-stream",
              sent_at: new Date().toISOString(),
            }),
          });

          if (!msgRes.ok) {
            const data = await msgRes.json();
            setError(data?.message ?? t("fileSendError"));
            return;
          }

          await onSuccess();
          return;
        }

        const trimmed = text.trim();
        if (!trimmed) return;

        const res = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orig,
            dest: [station],
            name: trimmed.length > 60 ? trimmed.substring(0, 57) + "..." : trimmed,
            text: trimmed,
            sent_at: new Date().toISOString(),
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data?.message ?? t("sendError"));
          return;
        }

        await onSuccess();
      } catch {
        setError(t("connectionError"));
      } finally {
        setSending(false);
      }
    },
    [station, sending, t, onSuccess, setError]
  );

  return { sendMessage, sending };
}
