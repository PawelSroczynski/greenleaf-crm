'use client';

// components/client/PackageStatus.tsx — MVP-7 (status paczki) + MVP-5 (zgłoszenie braku odbioru).
// Status jako kroki; przycisk „Nie odbiorę" z deadline śr 10:00 (symulacja czasu przed/po terminie).

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadStore, saveStore } from '@/lib/store';
import {
  findCurrentClient,
  getAbsenceDeadline,
  isAbsenceOpen,
  reportAbsence,
  cancelAbsence,
} from '@/lib/pickups';
import type { ClientPackage, Store, WeeklyPackage } from '@/lib/types';

const STEPS: ClientPackage['status'][] = ['pending', 'assembled', 'ready', 'picked_up'];

export function PackageStatus() {
  const { t } = useTranslation();
  const [store, setStore] = useState<Store | null>(null);
  const [cp, setCp] = useState<ClientPackage | null>(null);
  const [wp, setWp] = useState<WeeklyPackage | null>(null);
  const [afterDeadline, setAfterDeadline] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const s = loadStore();
    const cur = findCurrentClient(s);
    setStore(s);
    if (cur) {
      setCp(cur.cp);
      setWp(cur.wp);
    }
  }, []);

  if (!store || !cp || !wp) return null;

  const deadline = getAbsenceDeadline(wp);
  const now = new Date(deadline.getTime() + (afterDeadline ? 60_000 : -60_000));
  const open = isAbsenceOpen(wp, now);
  const currentStepIdx = STEPS.indexOf(cp.status);

  const refresh = () => {
    saveStore(store);
    setCp({ ...cp });
  };

  const onReport = () => {
    setError('');
    try {
      reportAbsence(store, cp.id, now);
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };
  const onCancel = () => {
    setError('');
    try {
      cancelAbsence(store, cp.id, now);
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <section className="mb-4 rounded-xl border border-leaf-100 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-700">{t('client.status.title')}</h3>

      <ol className="mb-4 flex items-center gap-1">
        {STEPS.map((step, i) => (
          <li key={step} className="flex flex-1 flex-col items-center">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                i <= currentStepIdx ? 'bg-leaf-600 text-white' : 'bg-gray-100 text-gray-400'
              }`}
            >
              {i + 1}
            </span>
            <span
              className={`mt-1 text-center text-[10px] ${
                i <= currentStepIdx ? 'text-leaf-700' : 'text-gray-400'
              }`}
            >
              {t(`status.${step}`)}
            </span>
          </li>
        ))}
      </ol>

      {/* Symulacja czasu dla deadline braku odbioru */}
      <label className="mb-2 flex items-center gap-2 text-xs text-gray-500">
        <input
          type="checkbox"
          checked={afterDeadline}
          onChange={(e) => setAfterDeadline(e.target.checked)}
        />
        {t('client.absence.simulateAfter')}
      </label>

      {cp.absenceReported ? (
        <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          {t('client.absence.reported')}
          {open && (
            <button
              type="button"
              onClick={onCancel}
              className="ml-2 rounded border border-amber-300 px-2 py-0.5 text-xs font-medium"
            >
              {t('client.absence.cancel')}
            </button>
          )}
        </div>
      ) : open ? (
        <button
          type="button"
          onClick={onReport}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {t('client.absence.report')}
        </button>
      ) : (
        <p className="rounded-lg bg-gray-100 p-3 text-sm text-gray-500">
          {t('client.absence.closed')}
        </p>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </section>
  );
}
