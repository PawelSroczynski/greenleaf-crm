'use client';

// components/client/ProfilePanel.tsx — profil klienta RWS: dane + edycja punktu odbioru / dostawy / notatek.

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadStore, saveStore } from '@/lib/store';
import { findCurrentClient } from '@/lib/pickups';
import { updateProfile } from '@/lib/clients';
import type { DeliveryOption, PickupPoint, Store, User } from '@/lib/types';

export function ProfilePanel() {
  const { t } = useTranslation();
  const [store, setStore] = useState<Store | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [points, setPoints] = useState<PickupPoint[]>([]);
  const [pointId, setPointId] = useState<string>('');
  const [delivery, setDelivery] = useState<DeliveryOption>('pickup');
  const [notes, setNotes] = useState<string>('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const s = loadStore();
    const cur = findCurrentClient(s);
    setStore(s);
    setPoints(s.pickupPoints.filter((p) => p.isActive));
    if (cur?.user) {
      setUser(cur.user);
      setPointId(cur.user.defaultPickupPointId ?? '');
      setDelivery(cur.user.deliveryOption);
      setNotes(cur.user.notes ?? '');
    }
  }, []);

  if (!store || !user) {
    return <p className="text-gray-600">{t('client.profile.none')}</p>;
  }

  const onSave = () => {
    updateProfile(store, user.id, {
      defaultPickupPointId: pointId || null,
      deliveryOption: delivery,
      notes: notes || null,
    });
    saveStore(store);
    setSaved(true);
  };

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">{t('client.tabs.profile')}</h2>

      <div className="rounded-xl border border-leaf-100 bg-white p-4 text-sm">
        <p className="font-medium">{user.firstName} {user.lastName}</p>
        <p className="text-gray-500">{user.email}</p>
        <p className="text-gray-500">{user.phone ?? '—'}</p>
      </div>

      <div className="space-y-3 rounded-xl border border-leaf-100 bg-white p-4">
        <label className="block text-sm">
          <span className="mb-1 block text-gray-600">{t('client.profile.point')}</span>
          <select
            value={pointId}
            onChange={(e) => { setPointId(e.target.value); setSaved(false); }}
            className="w-full rounded-lg border border-gray-300 p-2"
          >
            {points.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </label>

        {/* Godziny i adres wybranego punktu (ustala Magda; klient widzi) */}
        {(() => {
          const sel = points.find((p) => p.id === pointId);
          if (!sel) return null;
          return (
            <div className="rounded-lg bg-leaf-50 p-3 text-sm">
              <p className="text-gray-700">
                <span className="text-gray-500">{t('client.profile.address')}:</span> {sel.address}
              </p>
              <p className="text-gray-700">
                <span className="text-gray-500">{t('client.profile.hours')}:</span>{' '}
                {t('client.profile.saturday')} {sel.hoursFrom}–{sel.hoursTo}
              </p>
            </div>
          );
        })()}

        <label className="block text-sm">
          <span className="mb-1 block text-gray-600">{t('client.profile.delivery')}</span>
          <select
            value={delivery}
            onChange={(e) => { setDelivery(e.target.value as DeliveryOption); setSaved(false); }}
            className="w-full rounded-lg border border-gray-300 p-2"
          >
            <option value="pickup">{t('deliveryOption.pickup')}</option>
            <option value="home_delivery">{t('deliveryOption.home_delivery')}</option>
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-gray-600">{t('client.profile.notes')}</span>
          <textarea
            value={notes}
            onChange={(e) => { setNotes(e.target.value); setSaved(false); }}
            rows={2}
            className="w-full rounded-lg border border-gray-300 p-2"
          />
        </label>

        <button
          type="button"
          onClick={onSave}
          className="rounded-lg bg-leaf-600 px-4 py-2 text-sm font-semibold text-white hover:bg-leaf-700"
        >
          {t('client.profile.save')}
        </button>
        {saved && <span className="ml-3 text-sm text-leaf-700">{t('client.profile.saved')}</span>}
      </div>
    </section>
  );
}
