'use client';

// lib/role-context.tsx — fake auth: aktualna rola + setRole, persystencja w localStorage.

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Role = 'admin' | 'klient_rws' | 'klient_zewnetrzny' | 'dostawca' | null;

/** Klucz localStorage przechowujący wybraną rolę. */
export const ROLE_KEY = 'glcrm_role';

const VALID_ROLES: Exclude<Role, null>[] = ['admin', 'klient_rws', 'klient_zewnetrzny', 'dostawca'];

interface RoleContextValue {
  role: Role;
  setRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(null);

  // Odczyt zapisanej roli przy starcie (client-only).
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem(ROLE_KEY) : null;
    if (saved && (VALID_ROLES as string[]).includes(saved)) {
      setRoleState(saved as Role);
    }
  }, []);

  const setRole = (next: Role) => {
    setRoleState(next);
    if (typeof window === 'undefined') return;
    if (next) {
      window.localStorage.setItem(ROLE_KEY, next);
    } else {
      window.localStorage.removeItem(ROLE_KEY);
    }
  };

  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>;
}

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    throw new Error('useRole musi być użyte wewnątrz <RoleProvider>');
  }
  return ctx;
}
