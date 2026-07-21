// lib/auth.ts — SYMULACJA logowania (F12). Admin nadaje login+hasło klientowi.
// UWAGA: to makieta bez backendu — hasła jawne, brak sesji. Realny auth przy „podbudowie".

import type { Store, User } from './types';

/** Admin ustawia poświadczenia klienta. */
export function setCredentials(store: Store, userId: string, login: string, password: string): void {
  const user = store.users.find((u) => u.id === userId);
  if (!user) throw new Error(`Brak użytkownika o id ${userId}.`);
  const l = login.trim();
  if (!l) throw new Error('Login nie może być pusty.');
  if (store.users.some((u) => u.id !== userId && u.login === l)) {
    throw new Error(`Login "${l}" jest już zajęty.`);
  }
  user.login = l;
  user.password = password;
  user.updatedAt = new Date().toISOString();
}

export function hasCredentials(user: Pick<User, 'login'>): boolean {
  return !!user.login;
}

/** Sprawdza poświadczenia; zwraca użytkownika albo null. */
export function authenticate(store: Store, login: string, password: string): User | null {
  const u = store.users.find((x) => x.login === login.trim() && x.password === password);
  return u ?? null;
}
