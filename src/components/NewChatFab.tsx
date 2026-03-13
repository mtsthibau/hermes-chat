"use client";

import Link from "next/link";

export default function NewChatFab() {

  return (
    <Link
      href="/home/new-chat"
      className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white shadow-lg flex items-center justify-center transition-colors z-40"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-7 h-7"
        aria-hidden="true"
      >
        <path d="M12 4a1 1 0 0 1 1 1v6h6a1 1 0 1 1 0 2h-6v6a1 1 0 1 1-2 0v-6H5a1 1 0 1 1 0-2h6V5a1 1 0 0 1 1-1z" />
      </svg>
    </Link>
  );
}
