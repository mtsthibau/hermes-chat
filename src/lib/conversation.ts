import type { Message } from "./message";
import { destArray } from "./message";

export interface Conversation {
  station: string;
  lastMessage: Message;
  unread: number;
}

export function buildConversations(inbox: Message[], sent: Message[]): Conversation[] {
  const map = new Map<string, Message[]>();

  for (const msg of inbox) {
    if (!map.has(msg.orig)) map.set(msg.orig, []);
    map.get(msg.orig)!.push(msg);
  }

  for (const msg of sent) {
    for (const dest of destArray(msg.dest)) {
      if (!map.has(dest)) map.set(dest, []);
      map.get(dest)!.push(msg);
    }
  }

  return Array.from(map.entries())
    .map(([station, messages]) => {
      const sorted = [...messages].sort(
        (a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime(),
      );
      return {
        station,
        lastMessage: sorted[0],
        unread: messages.filter((m) => m.inbox).length,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.lastMessage.sent_at).getTime() -
        new Date(a.lastMessage.sent_at).getTime(),
    );
}

export function filterConversation(
  inbox: Message[],
  sent: Message[],
  station: string,
): Message[] {
  const fromContact = inbox.filter((m) => m.orig === station);
  const toContact = sent.filter((m) => destArray(m.dest).includes(station));
  return [...fromContact, ...toContact].sort(
    (a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime(),
  );
}
