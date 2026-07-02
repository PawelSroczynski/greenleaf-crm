'use client';

// components/AdminShell.tsx — shell admina: TopBar + nawigacja sekcji (state-driven).
// Pulpit pokazuje realne dane ze store (dowód przepływu seed → UI).

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TopBar } from '@/components/TopBar';
import { PackageBuilder } from '@/components/admin/PackageBuilder';
import { SwapSummary } from '@/components/admin/SwapSummary';
import { PickupList } from '@/components/admin/PickupList';
import { ExportPanel } from '@/components/admin/ExportPanel';
import { ClientsList } from '@/components/admin/ClientsList';
import { PointsManager } from '@/components/admin/PointsManager';
import { loadStore } from '@/lib/store';
import { currentPickupWeek } from '@/lib/pickups';

type Section = 'dashboard' | 'weeklyPackage' | 'clients' | 'pickups' | 'export';

const SECTIONS: Section[] = ['dashboard', 'weeklyPackage', 'clients', 'pickups', 'export'];

interface DashboardStats {
  activeClients: number;
  week: number;
  status: string;
}

function Dashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const store = loadStore();
    const activeClients = store.users.filter(
      (u) => (u.role === 'klient_rws' || u.role === 'klient_zewnetrzny') && u.isActive,
    ).length;
    const wp = currentPickupWeek(store); // najnowszy opublikowany, nie [0]
    setStats({
      activeClients,
      week: wp?.weekNumber ?? 0,
      status: wp?.status ?? 'draft',
    });
  }, []);

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">{t('admin.dashboard.title')}</h2>
      {stats && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-leaf-100 bg-white p-4">
            <p className="text-sm text-gray-600">{t('admin.dashboard.activeClients')}</p>
            <p className="text-3xl font-bold text-leaf-600">{stats.activeClients}</p>
          </div>
          <div className="rounded-xl border border-leaf-100 bg-white p-4">
            <p className="text-sm text-gray-600">{t('admin.dashboard.weeklyPackage')}</p>
            <p className="text-lg font-semibold text-leaf-700">
              {t('admin.dashboard.weekLabel', { week: stats.week })}
            </p>
            <p className="text-sm text-gray-600">
              {t('admin.dashboard.statusLabel')}: {t(`status.${stats.status}`)}
            </p>
          </div>
        </div>
      )}
      <PointsManager />
    </section>
  );
}

export function AdminShell() {
  const { t } = useTranslation();
  const [active, setActive] = useState<Section>('dashboard');

  return (
    <div className="min-h-screen pb-4">
      <TopBar />

      <nav
        aria-label={t('admin.dashboard.title')}
        className="flex border-b border-leaf-100 bg-white px-1 py-2"
      >
        {SECTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setActive(s)}
            aria-current={active === s ? 'page' : undefined}
            className={`min-w-0 flex-1 whitespace-nowrap rounded px-1 py-1.5 text-center text-sm font-medium ${
              active === s ? 'bg-leaf-600 text-white' : 'text-leaf-700 hover:bg-leaf-50'
            }`}
          >
            {t(`admin.nav.${s}`)}
          </button>
        ))}
      </nav>

      <main className="p-4">
        {active === 'dashboard' && <Dashboard />}
        {active === 'weeklyPackage' && (
          <>
            <PackageBuilder />
            <SwapSummary />
          </>
        )}
        {active === 'clients' && <ClientsList />}
        {active === 'pickups' && <PickupList />}
        {active === 'export' && <ExportPanel />}
      </main>
    </div>
  );
}
