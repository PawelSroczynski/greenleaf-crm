// lib/inbox.ts — skrzynka admina: prośby o zmianę daty odbioru + wiadomości od klientów (F4/F11).

import type { ClientRequest, Store } from './types';

let _seq = 0;
function genId(): string {
  _seq += 1;
  return `req_${Date.now().toString(36)}_${_seq.toString(36)}`;
}

/** Klient prosi o zmianę daty odbioru (fromDate → toDate). */
export function requestDateChange(
  store: Store,
  userId: string,
  fromDate: string,
  toDate: string,
  now: string = new Date().toISOString(),
): ClientRequest {
  const req: ClientRequest = {
    id: genId(),
    userId,
    kind: 'date_change',
    fromDate,
    toDate,
    createdAt: now,
    isRead: false,
  };
  store.clientRequests.push(req);
  return req;
}

/** Klient wysyła wiadomość do admina. */
export function sendMessage(
  store: Store,
  userId: string,
  body: string,
  now: string = new Date().toISOString(),
): ClientRequest {
  const trimmed = body.trim();
  if (!trimmed) throw new Error('Wiadomość nie może być pusta.');
  const req: ClientRequest = {
    id: genId(),
    userId,
    kind: 'message',
    body: trimmed,
    createdAt: now,
    isRead: false,
  };
  store.clientRequests.push(req);
  return req;
}

/** Skrzynka admina: najnowsze na górze. */
export function inbox(store: Store): ClientRequest[] {
  return [...store.clientRequests].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function unreadCount(store: Store): number {
  return store.clientRequests.filter((r) => !r.isRead).length;
}

export function markRequestRead(store: Store, requestId: string): void {
  const r = store.clientRequests.find((x) => x.id === requestId);
  if (r) r.isRead = true;
}
