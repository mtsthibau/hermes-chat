"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

export default function NewChatFab() {

  return (
    <Link
      href="/home/new-chat"
      className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white shadow-lg flex items-center justify-center transition-colors z-40"
    >
      <Plus className="w-7 h-7" aria-hidden="true" />
    </Link>
  );
}
