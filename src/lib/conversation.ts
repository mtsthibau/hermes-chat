import type { Message } from "./message";
import { destArray } from "./message";

export interface Conversation {
  station: string;
  lastMessage: Message;
  unread: number;
}

/** Strip optional @domain suffix so addresses compare equal regardless of format. */
export function stationId(s: string): string {
  return (s.includes('@') ? s.split('@')[0] : s).toLowerCase();
}

/**
 * Build one conversation entry per remote station from a merged message list.
 * inbox:false = I sent it  → other party is dest
 * inbox:true  = I received it → other party is orig
 * All station keys are normalised via stationId() so address-format
 * variations ("estacao3" vs "estacao3@domain") collapse to one entry.
 */
export function buildConversations(messages: Message[]): Conversation[] {
  // Map from normalised station key → canonical address (first seen) + messages
  const stationMap = new Map<string, { canonical: string; msgs: Message[] }>();

  for (const msg of messages) {
    const parties = msg.inbox
      ? [msg.orig]                    // received: other party = sender
      : destArray(msg.dest);          // sent: other party = each recipient

    for (const party of parties) {
      const key = stationId(party);
      if (!stationMap.has(key)) stationMap.set(key, { canonical: party, msgs: [] });
      stationMap.get(key)!.msgs.push(msg);
    }
  }

  return Array.from(stationMap.values())
    .map(({ canonical, msgs }) => {
      const sorted = [...msgs].sort(
        (a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime(),
      );
      return {
        station: canonical,
        lastMessage: sorted[0],
        unread: msgs.filter((m) => m.inbox).length,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.lastMessage.sent_at).getTime() -
        new Date(a.lastMessage.sent_at).getTime(),
    );
}

/**
 * Return all messages belonging to a conversation with `station`, oldest first.
 */
export function filterConversation(messages: Message[], station: string): Message[] {
  const id = stationId(station);
  return messages
    .filter((msg) =>
      msg.inbox
        ? stationId(msg.orig) === id
        : destArray(msg.dest).some((d) => stationId(d) === id),
    )
    .sort((a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime());
}
