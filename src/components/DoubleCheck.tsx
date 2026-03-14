"use client";

interface DoubleCheckProps {
  /** true = message has been synced (double check), false = pending sync (single check) */
  synced: boolean;
  className?: string;
}

/**
 * WhatsApp-style message status indicator.
 * Single check  → message saved locally, pending sync.
 * Double check  → message has been synced to the network.
 */
export default function DoubleCheck({ synced, className = "" }: DoubleCheckProps) {
  if (!synced) {
    return (
      <svg
        className={`inline-block w-[14px] h-[10px] shrink-0 ${className}`}
        viewBox="0 0 14 10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Pending sync"
      >
        <path
          d="M2 5.5L5.5 9L12 1"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      className={`inline-block w-[19px] h-[10px] shrink-0 ${className}`}
      viewBox="0 0 19 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Synced"
    >
      {/* First check */}
      <path
        d="M1 5.5L4.5 9L11 1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Second check (offset right) */}
      <path
        d="M7 5.5L10.5 9L17 1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
