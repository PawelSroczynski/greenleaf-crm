'use client';

// app/page.tsx — shell sterowany stanem klienta (RoleContext), bez routingu URL.
// Brak roli → RolePicker; w zależności od roli → odpowiedni shell.

import { I18nProvider } from '@/components/I18nProvider';
import { RoleProvider, useRole } from '@/lib/role-context';
import { RolePicker } from '@/components/RolePicker';
import { AdminShell } from '@/components/AdminShell';
import { ClientShell } from '@/components/ClientShell';
import { SimpleShell } from '@/components/SimpleShell';

function ShellRouter() {
  const { role } = useRole();

  if (!role) return <RolePicker />;
  if (role === 'admin') return <AdminShell />;
  if (role === 'klient_rws') return <ClientShell />;
  if (role === 'dostawca') return <SimpleShell variant="supplier" />;
  return <SimpleShell variant="external" />; // klient_zewnetrzny
}

export default function HomePage() {
  return (
    <I18nProvider>
      <RoleProvider>
        <ShellRouter />
      </RoleProvider>
    </I18nProvider>
  );
}
