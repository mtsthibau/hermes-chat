import { formatTime } from "@/lib/formatting";
import type { Message } from "@/lib/message";
import DeleteMessageButton from "@/components/DeleteMessageButton";
import DoubleCheck from "@/components/DoubleCheck";
import FileAttachment from "./FileAttachment";

interface MessageBubbleProps {
  msg: Message;
  sentIds: Set<number>;
  syncedIds: Set<number>;
  onDeleted: (id: number) => void;
  onError: (msg: string) => void;
  deleteLabel: string;
}

export default function MessageBubble({
  msg,
  sentIds,
  syncedIds,
  onDeleted,
  onError,
  deleteLabel,
}: MessageBubbleProps) {
  const isMine = !msg.inbox;
  const isAudio = !!(msg.file && msg.fileid && msg.mimetype?.startsWith("audio/"));

  return (
    <div className={`flex mb-1 items-end gap-1 ${isMine ? "justify-end" : "justify-start"}`}>
      {isMine && (
        <DeleteMessageButton
          messageId={msg.id}
          onDeleted={() => onDeleted(msg.id)}
          onError={onError}
          label={deleteLabel}
        />
      )}
      <div
        className={`${isAudio ? "w-[90%] sm:w-[70%]" : "max-w-[75%] sm:max-w-[60%]"} rounded-2xl px-4 py-2 shadow ${
          isMine
            ? "bg-gray-800 shadow text-white rounded-br-sm"
            : "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white rounded-bl-sm"
        }`}
      >
        <p className="text-md opacity-100 truncate">{msg.name}</p>

        {msg.file && msg.fileid && msg.mimetype ? (
          <FileAttachment
            file={msg.file}
            fileid={msg.fileid}
            mimetype={msg.mimetype}
            text={msg.text}
          />
        ) : (
          <>
            {msg.name && msg.text && msg.name !== msg.text && (
              <p className="text-xs font-semibold opacity-70 mb-1">{msg.name}</p>
            )}
            <p className="text-sm whitespace-pre-wrap break-words">
              {msg.text !== msg.name && msg.text}
            </p>
          </>
        )}

        <p className={`text-xs mt-1 opacity-60 flex items-center gap-1 ${isMine ? "justify-end" : "justify-start"}`}>
          <span>{formatTime(msg.sent_at)}</span>
          {msg.secure && <span>🔒</span>}
          {isMine && sentIds.has(msg.id) && (
            <DoubleCheck synced={syncedIds.has(msg.id)} />
          )}
        </p>
      </div>
    </div>
  );
}
