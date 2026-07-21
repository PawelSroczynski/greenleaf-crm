'use client';

// components/client/ExtraOrdersPanel.tsx — zamówienia dodatkowe poza paczką (F10).

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadStore, saveStore } from '@/lib/store';
import { findCurrentClient } from '@/lib/pickups';
import { availableExtras, placeOrder, ordersForUser, orderItems } from '@/lib/orders';
import type { Store, User } from '@/lib/types';

export function ExtraOrdersPanel() {
  const { t } = useTranslation();
  const [store, setStore] = useState<Store | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [tick, setTick] = useState(0);
  const [cart, setCart] = useState<Record<string, number>>({});

  useEffect(() => {
    const s = loadStore();
    setStore(s);
    setUser(findCurrentClient(s)?.user ?? null);
  }, []);

  const extras = useMemo(() => (store ? availableExtras(store) : []), [store]);
  const myOrders = useMemo(
    () => (store && user ? ordersForUser(store, user.id) : []),
    [store, user, tick],
  );
  if (!store || !user) return null;

  const productName = (id: string) => store.products.find((p) => p.id === id)?.name ?? id;

  const submit = () => {
    const lines = Object.entries(cart)
      .filter(([, q]) => q > 0)
      .map(([productId, quantity]) => ({ productId, quantity }));
    try {
      placeOrder(store, user.id, lines);
      saveStore(store);
      setCart({});
      setTick((x) => x + 1);
    } catch {
      /* puste zamówienie */
    }
  };

  const cartCount = Object.values(cart).filter((q) => q > 0).length;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">{t('client.orders.title')}</h2>
      <p className="text-sm text-gray-500">{t('client.orders.intro')}</p>

      <div className="rounded-xl border border-leaf-100 bg-white p-3">
        <label className="mb-2 flex flex-col text-sm">
          <span className="mb-1 text-gray-600">{t('client.orders.product')}</span>
          <select
            aria-label={t('client.orders.product')}
            onChange={(e) => {
              const id = e.target.value;
              if (id) setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
              e.target.value = '';
            }}
            className="rounded border border-leaf-200 px-2 py-1.5"
          >
            <option value="">{t('client.orders.add')}</option>
            {extras.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        {cartCount > 0 && (
          <ul className="mb-2 divide-y divide-gray-100 text-sm">
            {Object.entries(cart)
              .filter(([, q]) => q > 0)
              .map(([id, q]) => (
                <li key={id} className="flex items-center justify-between py-1">
                  <span>{productName(id)}</span>
                  <input
                    type="number"
                    min={0}
                    value={q}
                    aria-label={`${productName(id)} ${t('client.orders.qty')}`}
                    onChange={(e) => setCart((c) => ({ ...c, [id]: Number(e.target.value) }))}
                    className="w-16 rounded border border-gray-300 px-1 py-0.5"
                  />
                </li>
              ))}
          </ul>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={cartCount === 0}
          className="rounded bg-leaf-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-40"
        >
          {t('client.orders.submit')}
        </button>
      </div>

      {myOrders.length > 0 && (
        <div>
          <h3 className="mb-1 text-sm font-semibold text-gray-700">{t('client.orders.mine')}</h3>
          <ul className="space-y-1 text-sm">
            {myOrders.map((o) => (
              <li key={o.id} className="rounded border border-gray-100 bg-white p-2">
                <span className="text-xs text-gray-400">{o.submittedAt.slice(0, 10)}</span> —{' '}
                {orderItems(store, o.id)
                  .map((i) => `${productName(i.productId)} ${i.quantity}`)
                  .join(', ')}
                <span className="ml-2 rounded bg-leaf-50 px-1.5 py-0.5 text-xs text-leaf-700">
                  {t(`orderStatus.${o.status}`)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
