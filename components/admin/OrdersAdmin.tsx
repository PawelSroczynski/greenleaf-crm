'use client';

// components/admin/OrdersAdmin.tsx — zamówienia dodatkowe (F10): admin zatwierdza/odrzuca.

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadStore, saveStore } from '@/lib/store';
import { allOrders, orderItems, setOrderStatus } from '@/lib/orders';
import type { Store } from '@/lib/types';

export function OrdersAdmin() {
  const { t } = useTranslation();
  const [store, setStore] = useState<Store | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setStore(loadStore());
  }, []);

  const orders = useMemo(() => (store ? allOrders(store) : []), [store, tick]);
  if (!store) return null;

  const userName = (id: string) => {
    const u = store.users.find((x) => x.id === id);
    return u ? `${u.firstName} ${u.lastName}` : id;
  };
  const productName = (id: string) => store.products.find((p) => p.id === id)?.name ?? id;

  const act = (id: string, status: 'approved' | 'rejected') => {
    setOrderStatus(store, id, status);
    saveStore(store);
    setTick((n) => n + 1);
  };

  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold">{t('admin.nav.orders')}</h2>
      {orders.length === 0 ? (
        <p className="text-gray-600">{t('admin.orders.empty')}</p>
      ) : (
        <ul className="space-y-2">
          {orders.map((o) => (
            <li key={o.id} className="rounded-xl border border-leaf-100 bg-white p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">{userName(o.userId)}</span>
                <span className="rounded bg-leaf-50 px-1.5 py-0.5 text-xs text-leaf-700">
                  {t(`orderStatus.${o.status}`)}
                </span>
              </div>
              <p className="mt-1 text-gray-700">
                {orderItems(store, o.id)
                  .map((i) => `${productName(i.productId)} ${i.quantity}${i.unit}`)
                  .join(', ')}
              </p>
              {o.status === 'submitted' && (
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => act(o.id, 'approved')}
                    className="rounded bg-leaf-600 px-2 py-1 text-xs font-medium text-white"
                  >
                    {t('admin.orders.approve')}
                  </button>
                  <button
                    type="button"
                    onClick={() => act(o.id, 'rejected')}
                    className="rounded border border-red-200 px-2 py-1 text-xs font-medium text-red-600"
                  >
                    {t('admin.orders.reject')}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
