import { formatDateDivider } from "@/lib/formatting";

interface DateDividerProps {
  dateStr: string;
}

export default function DateDivider({ dateStr }: DateDividerProps) {
  return (
    <div className="flex items-center gap-2 my-4">
      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
      <span className="text-gray-400 dark:text-gray-500 text-xs shrink-0">
        {formatDateDivider(dateStr)}
      </span>
      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
    </div>
  );
}
