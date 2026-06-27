// lib/clients.ts — logika modułu „Klienci" (admin, MVP-12 edycja subskrypcji) + profilu klienta.
// Czyste funkcje na obiekcie Store (mutacja in-place). UI persystuje (saveStore).

import type { DeliveryOption, Store, Subscription, SubscriptionStatus, User } from './types';

export interface ClientRow {
  user: User;
  subscriptions: Subscription[];
}

/** Lista klientów (RWS + zewnętrzni), z ich subskrypcjami. */
export function listClients(store: Store): ClientRow[] {
  return store.users
    .filter((u) => u.role === 'klient_rws' || u.role === 'klient_zewnetrzny')
    .map((user) => ({
      user,
      subscriptions: store.subscriptions.filter((s) => s.userId === user.id),
    }))
    .sort((a, b) => a.user.lastName.localeCompare(b.user.lastName));
}

/** Główna (paczkowa) subskrypcja klienta — do podsumowania licznika. */
export function primarySubscription(store: Store, userId: string): Subscription | undefined {
  const subs = store.subscriptions.filter((s) => s.userId === userId);
  return subs.find((s) => s.type === 'paczka_24' || s.type === 'paczka_12') ?? subs[0];
}

/** Zmiana statusu subskrypcji (MVP-12: pauza / wznowienie / anulowanie). */
export function setSubscriptionStatus(
  store: Store,
  subscriptionId: string,
  status: SubscriptionStatus,
  editedBy = 'admin',
): Store {
  const sub = store.subscriptions.find((s) => s.id === subscriptionId);
  if (!sub) throw new Error(`Brak subskrypcji o id ${subscriptionId}.`);
  sub.status = status;
  sub.editedBy = editedBy;
  sub.updatedAt = new Date().toISOString();
  return store;
}

export interface ProfilePatch {
  defaultPickupPointId?: string | null;
  deliveryOption?: DeliveryOption;
  deliveryAddress?: string | null;
  notes?: string | null;
}

/** Aktualizacja profilu klienta (punkt odbioru, sposób dostawy, adres, notatki). */
export function updateProfile(store: Store, userId: string, patch: ProfilePatch): Store {
  const user = store.users.find((u) => u.id === userId);
  if (!user) throw new Error(`Brak użytkownika o id ${userId}.`);
  if (patch.defaultPickupPointId !== undefined) user.defaultPickupPointId = patch.defaultPickupPointId;
  if (patch.deliveryOption !== undefined) user.deliveryOption = patch.deliveryOption;
  if (patch.deliveryAddress !== undefined) user.deliveryAddress = patch.deliveryAddress;
  if (patch.notes !== undefined) user.notes = patch.notes;
  user.updatedAt = new Date().toISOString();
  return store;
}
