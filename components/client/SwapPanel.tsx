'use client';

// components/client/SwapPanel.tsx — moduł ZAMIAN klienta RWS (MVP-4).
// Stan w komponencie; cała logika domenowa w lib/swaps.ts.
// "Symulowany czas": jeden przełącznik przestawia `now` przed/po terminie zamian,
// bo deadline z seed (czerwiec) jest w przeszłości wobec realnej daty.

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadStore, saveStore } from '@/lib/store';
import { itemsForPackage } from '@/lib/packages';
import {
  applySwap,
  cancelSwap,
  getSwapDeadline,
  isSwapOpen,
  replacementOptions,
  swapsForClientPackage,
} from '@/lib/swaps';
import type { ClientPackage, PackageItem, Product, Store, Swap, WeeklyPackage } from '@/lib/types';

type Variant = 'A' | 'B' | 'C';

/** Bieżący klient = pierwszy aktywny klient_rws z ClientPackage opublikowanej paczki (Anna). */
function findCurrent(store: Store): { cp: ClientPackage; wp: WeeklyPackage } | null {
  const wp = store.weeklyPackages.find((w) => w.status === 'published');
  if (!wp) return null;
  const rwsIds = new Set(
    store.users.filter((u) => u.role === 'klient_rws' && u.isActive).map((u) => u.id),
  );
  const cp = store.clientPackages.find((c) => c.weeklyPackageId === wp.id && rwsIds.has(c.userId));
  return cp ? { cp, wp } : null;
}

export function SwapPanel() {
  const { t } = useTranslation();
  const [store, setStore] = useState<Store | null>(null);
  const [cp, setCp] = useState<ClientPackage | null>(null);
  const [wp, setWp] = useState<WeeklyPackage | null>(null);
  const [items, setItems] = useState<PackageItem[]>([]);
  const [swaps, setSwaps] = useState<Swap[]>([]);

  const [variant, setVariant] = useState<Variant>('A');
  const [afterDeadline, setAfterDeadline] = useState(false);

  // Wariant A: które pozycje mają rozwinięty dropdown.
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  // Wariant B: wybory formularza X→Y.
  const [bOriginal, setBOriginal] = useState('');
  const [bReplacement, setBReplacement] = useState('');
  // Wariant C: zaznaczone pozycje + wybrany zamiennik per pozycja.
  const [cSelected, setCSelected] = useState<Record<string, string>>({});

  useEffect(() => {
    const s = loadStore();
    const cur = findCurrent(s);
    setStore(s);
    if (cur) {
      setCp(cur.cp);
      setWp(cur.wp);
      setItems(itemsForPackage(s, cur.wp.id));
      setSwaps(swapsForClientPackage(s, cur.cp.id));
    }
  }, []);

  const options: Product[] = useMemo(
    () => (store && cp ? replacementOptions(store, cp.id) : []),
    [store, cp],
  );

  if (!store || !cp || !wp) {
    return <p className="text-gray-600">{t('common.soon')}</p>;
  }

  const productName = (id: string) => store.products.find((p) => p.id === id)?.name ?? id;
  const open = isSwapOpen(wp, simulatedNow(wp, afterDeadline));
  const swapForItem = (productId: string) =>
    swaps.find((s) => s.clientPackageId === cp.id && s.originalProductId === productId) ?? null;

  function commit(pairs: { original: string; replacement: string }[]) {
    const now = simulatedNow(wp!, afterDeadline);
    try {
      for (const p of pairs) {
        if (!p.replacement) continue;
        applySwap(store!, cp!.id, p.original, p.replacement, now);
      }
      saveStore(store!);
      setSwaps([...swapsForClientPackage(store!, cp!.id)]);
    } catch {
      // Po terminie / niedozwolony zamiennik — kontrolki i tak zablokowane.
    }
  }

  /** Rozmyślenie się: cofa zamianę (powrót do oryginału). Możliwe do terminu. */
  function cancel(originalProductId: string) {
    const now = simulatedNow(wp!, afterDeadline);
    try {
      cancelSwap(store!, cp!.id, originalProductId, now);
      saveStore(store!);
      setSwaps([...swapsForClientPackage(store!, cp!.id)]);
    } catch {
      // Po terminie — kontrolki i tak zablokowane.
    }
  }

  return (
    <section>
      <h2 className="mb-1 text-xl font-semibold">{t('client.swap.title')}</h2>
      <p className="mb-3 text-sm text-gray-600">
        {t('client.swap.weekLine', { week: wp.weekNumber, date: wp.pickupDate })}
      </p>

      {/* Przełącznik wariantów UI */}
      <div
        role="group"
        aria-label={t('client.swap.variantLabel')}
        className="mb-3 inline-flex rounded-lg border border-leaf-200 p-0.5"
      >
        {(['A', 'B', 'C'] as Variant[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setVariant(v)}
            aria-pressed={variant === v}
            className={`rounded-md px-3 py-1 text-sm font-medium ${
              variant === v ? 'bg-leaf-600 text-white' : 'text-leaf-700'
            }`}
          >
            {t(`client.swap.variant${v}`)}
          </button>
        ))}
      </div>

      {/* Symulowany czas */}
      <label className="mb-3 flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={afterDeadline}
          onChange={(e) => setAfterDeadline(e.target.checked)}
        />
        {t('client.swap.simulateAfter')}
      </label>

      <p
        className={`mb-4 rounded px-2 py-1 text-sm font-semibold ${
          open ? 'bg-leaf-50 text-leaf-700' : 'bg-red-50 text-red-700'
        }`}
      >
        {open ? t('client.swap.open') : t('client.swap.closed')}
      </p>

      {variant === 'A' && (
        <VariantA
          items={items}
          options={options}
          open={open}
          openItemId={openItemId}
          setOpenItemId={setOpenItemId}
          swapForItem={swapForItem}
          productName={productName}
          onSwap={(original, replacement) => {
            commit([{ original, replacement }]);
            setOpenItemId(null);
          }}
          onCancel={cancel}
          t={t}
        />
      )}

      {variant === 'B' && (
        <VariantB
          items={items}
          options={options}
          open={open}
          bOriginal={bOriginal}
          bReplacement={bReplacement}
          setBOriginal={setBOriginal}
          setBReplacement={setBReplacement}
          swaps={swaps}
          productName={productName}
          onSwap={() => {
            if (bOriginal && bReplacement) commit([{ original: bOriginal, replacement: bReplacement }]);
            setBOriginal('');
            setBReplacement('');
          }}
          onCancel={cancel}
          t={t}
        />
      )}

      {variant === 'C' && (
        <VariantC
          items={items}
          options={options}
          open={open}
          cSelected={cSelected}
          setCSelected={setCSelected}
          swapForItem={swapForItem}
          productName={productName}
          onConfirm={() => {
            const pairs = Object.entries(cSelected).map(([original, replacement]) => ({
              original,
              replacement,
            }));
            commit(pairs);
            setCSelected({});
          }}
          onCancel={cancel}
          t={t}
        />
      )}
    </section>
  );
}

/** `now` symulowany: minutę przed / po terminie zamian. */
function simulatedNow(wp: Pick<WeeklyPackage, 'pickupDate'>, afterDeadline: boolean): Date {
  const deadline = getSwapDeadline(wp).getTime();
  return new Date(afterDeadline ? deadline + 60_000 : deadline - 60_000);
}

type TFn = ReturnType<typeof useTranslation>['t'];

// ---------- Wariant A — lista z przyciskiem + dropdown ----------
function VariantA(props: {
  items: PackageItem[];
  options: Product[];
  open: boolean;
  openItemId: string | null;
  setOpenItemId: (id: string | null) => void;
  swapForItem: (productId: string) => Swap | null;
  productName: (id: string) => string;
  onSwap: (original: string, replacement: string) => void;
  onCancel: (original: string) => void;
  t: TFn;
}) {
  const {
    items,
    options,
    open,
    openItemId,
    setOpenItemId,
    swapForItem,
    productName,
    onSwap,
    onCancel,
    t,
  } = props;
  return (
    <ul className="divide-y divide-leaf-100 rounded-xl border border-leaf-100 bg-white">
      {items.map((i) => {
        const swap = swapForItem(i.productId);
        return (
          <li key={i.id} className="px-3 py-2 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span>{productName(i.productId)}</span>
              <span className="flex items-center gap-2">
                {swap && (
                  <span className="text-leaf-700">
                    {t('client.swap.swappedTo', { name: productName(swap.replacementProductId) })}
                  </span>
                )}
                {open && (
                  <button
                    type="button"
                    onClick={() => setOpenItemId(openItemId === i.id ? null : i.id)}
                    className={`rounded px-2 py-1 text-xs font-medium ${
                      swap
                        ? 'border border-leaf-300 text-leaf-700 hover:bg-leaf-50'
                        : 'bg-leaf-600 text-white'
                    }`}
                  >
                    {swap ? t('client.swap.change') : t('client.swap.swap')}
                  </button>
                )}
                {open && swap && (
                  <button
                    type="button"
                    onClick={() => onCancel(i.productId)}
                    className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    {t('client.swap.cancel')}
                  </button>
                )}
              </span>
            </div>
            {open && openItemId === i.id && (
              <select
                aria-label={`${t('client.swap.replacement')}: ${productName(i.productId)}`}
                defaultValue=""
                onChange={(e) => e.target.value && onSwap(i.productId, e.target.value)}
                className="mt-2 w-full rounded border border-leaf-200 px-2 py-1.5"
              >
                <option value="">{t('client.swap.selectReplacement')}</option>
                {options.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// ---------- Wariant B — formularz X→Y ----------
function VariantB(props: {
  items: PackageItem[];
  options: Product[];
  open: boolean;
  bOriginal: string;
  bReplacement: string;
  setBOriginal: (v: string) => void;
  setBReplacement: (v: string) => void;
  swaps: Swap[];
  productName: (id: string) => string;
  onSwap: () => void;
  onCancel: (original: string) => void;
  t: TFn;
}) {
  const {
    items,
    options,
    open,
    bOriginal,
    bReplacement,
    setBOriginal,
    setBReplacement,
    swaps,
    productName,
    onSwap,
    onCancel,
    t,
  } = props;
  return (
    <div>
      {open && (
        <div className="mb-4 flex flex-wrap items-end gap-2">
          <label className="flex flex-col text-sm">
            <span className="mb-1 text-gray-600">{t('client.swap.original')}</span>
            <select
              aria-label={t('client.swap.original')}
              value={bOriginal}
              onChange={(e) => setBOriginal(e.target.value)}
              className="rounded border border-leaf-200 px-2 py-1.5"
            >
              <option value="">{t('client.swap.selectReplacement')}</option>
              {items.map((i) => (
                <option key={i.id} value={i.productId}>
                  {productName(i.productId)}
                </option>
              ))}
            </select>
          </label>
          <span className="pb-2 text-sm text-gray-500">{t('client.swap.swapTo')}</span>
          <label className="flex flex-col text-sm">
            <span className="mb-1 text-gray-600">{t('client.swap.replacement')}</span>
            <select
              aria-label={t('client.swap.replacement')}
              value={bReplacement}
              onChange={(e) => setBReplacement(e.target.value)}
              className="rounded border border-leaf-200 px-2 py-1.5"
            >
              <option value="">{t('client.swap.selectReplacement')}</option>
              {options.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={onSwap}
            disabled={!bOriginal || !bReplacement}
            className="rounded bg-leaf-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-40"
          >
            {t('client.swap.swap')}
          </button>
        </div>
      )}

      <h3 className="mb-1 text-sm font-semibold text-gray-700">{t('client.swap.done')}</h3>
      {swaps.length === 0 ? (
        <p className="text-sm text-gray-500">{t('client.swap.noSwaps')}</p>
      ) : (
        <ul className="list-disc pl-5 text-sm text-gray-800">
          {swaps.map((s) => (
            <li key={s.id}>
              {productName(s.originalProductId)} {t('client.swap.swapTo')}{' '}
              {productName(s.replacementProductId)}
              {open && (
                <button
                  type="button"
                  onClick={() => onCancel(s.originalProductId)}
                  className="ml-2 rounded px-1.5 py-0.5 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  {t('client.swap.cancel')}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------- Wariant C — checkboxy + zbiorcze zatwierdzenie ----------
function VariantC(props: {
  items: PackageItem[];
  options: Product[];
  open: boolean;
  cSelected: Record<string, string>;
  setCSelected: (v: Record<string, string>) => void;
  swapForItem: (productId: string) => Swap | null;
  productName: (id: string) => string;
  onConfirm: () => void;
  onCancel: (original: string) => void;
  t: TFn;
}) {
  const {
    items,
    options,
    open,
    cSelected,
    setCSelected,
    swapForItem,
    productName,
    onConfirm,
    onCancel,
    t,
  } = props;

  function toggle(productId: string, checked: boolean) {
    const next = { ...cSelected };
    // zaznaczenie zamienionej pozycji podpowiada obecny zamiennik (zmiana wyboru)
    if (checked) next[productId] = swapForItem(productId)?.replacementProductId ?? '';
    else delete next[productId];
    setCSelected(next);
  }

  return (
    <div>
      <ul className="mb-4 divide-y divide-leaf-100 rounded-xl border border-leaf-100 bg-white">
        {items.map((i) => {
          const swap = swapForItem(i.productId);
          const checked = i.productId in cSelected;
          return (
            <li key={i.id} className="px-3 py-2 text-sm">
              <div className="flex items-center gap-2">
                <label className="flex min-w-0 flex-1 items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={!open}
                    onChange={(e) => toggle(i.productId, e.target.checked)}
                  />
                  <span>{productName(i.productId)}</span>
                  {swap && (
                    <span className="text-leaf-700">
                      {t('client.swap.swappedTo', { name: productName(swap.replacementProductId) })}
                    </span>
                  )}
                </label>
                {/* Cofnij POZA label — inaczej klik przełączałby też checkbox */}
                {open && swap && (
                  <button
                    type="button"
                    onClick={() => onCancel(i.productId)}
                    className="rounded px-1.5 py-0.5 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    {t('client.swap.cancel')}
                  </button>
                )}
              </div>
              {open && checked && (
                <select
                  aria-label={`${t('client.swap.replacement')}: ${productName(i.productId)}`}
                  value={cSelected[i.productId]}
                  onChange={(e) => setCSelected({ ...cSelected, [i.productId]: e.target.value })}
                  className="mt-2 w-full rounded border border-leaf-200 px-2 py-1.5"
                >
                  <option value="">{t('client.swap.selectReplacement')}</option>
                  {options.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              )}
            </li>
          );
        })}
      </ul>
      {open && (
        <button
          type="button"
          onClick={onConfirm}
          className="rounded bg-leaf-700 px-4 py-2 text-sm font-semibold text-white"
        >
          {t('client.swap.confirm')}
        </button>
      )}
    </div>
  );
}
