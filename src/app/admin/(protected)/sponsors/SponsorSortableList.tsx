"use client";

import { useMemo, useState, useTransition } from "react";

import { deleteSponsor, updateSponsor, updateSponsorOrder } from "@/app/admin/(protected)/sponsors/actions";
import { SponsorForm } from "@/app/admin/(protected)/sponsors/SponsorForm";

type SponsorItem = {
  id: string;
  name: string | null;
  website_url: string | null;
  logo_url: string | null;
  sort_order: number | null;
  is_active: boolean | null;
};

export function SponsorSortableList({ sponsors }: { sponsors: SponsorItem[] }) {
  const [orderedItems, setOrderedItems] = useState(sponsors);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const orderChanged = useMemo(
    () => orderedItems.some((item, index) => item.id !== sponsors[index]?.id),
    [orderedItems, sponsors],
  );

  function moveItem(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= orderedItems.length) return;

    const nextItems = [...orderedItems];
    const [item] = nextItems.splice(index, 1);
    nextItems.splice(nextIndex, 0, item);
    setOrderedItems(nextItems);
    setMessage("");
  }

  function saveOrder() {
    startTransition(async () => {
      const result = await updateSponsorOrder(
        orderedItems.map((item, index) => ({ id: item.id, sort_order: index })),
      );
      setMessage(result.message);
    });
  }

  function removeItem(id: string) {
    if (!window.confirm("Bu sponsoru silmek istediğinizden emin misiniz?")) return;

    startTransition(async () => {
      try {
        await deleteSponsor(id);
        setOrderedItems((current) => current.filter((item) => item.id !== id));
        setMessage("Sponsor silindi.");
      } catch {
        setMessage("Sponsor silinemedi.");
      }
    });
  }

  if (orderedItems.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/45 p-6">
        <p className="text-sm font-semibold text-slate-100">Henüz sponsor eklenmedi.</p>
      </section>
    );
  }

  return (
    <div className="space-y-3">
      {orderedItems.map((sponsor, index) => (
        <article key={sponsor.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="grid gap-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
            <div className="flex gap-2 md:flex-col">
              <button
                type="button"
                disabled={index === 0 || pending}
                onClick={() => moveItem(index, -1)}
                className="min-h-10 rounded-full border border-slate-700 px-3 text-sm font-semibold text-slate-200 disabled:opacity-40"
              >
                Yukarı
              </button>
              <button
                type="button"
                disabled={index === orderedItems.length - 1 || pending}
                onClick={() => moveItem(index, 1)}
                className="min-h-10 rounded-full border border-slate-700 px-3 text-sm font-semibold text-slate-200 disabled:opacity-40"
              >
                Aşağı
              </button>
            </div>

            <div className="flex min-w-0 gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-3">
                {sponsor.logo_url ? (
                  <img src={sponsor.logo_url} alt="" className="max-h-full max-w-full object-contain" />
                ) : null}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">
                  {sponsor.is_active ? "Aktif" : "Pasif"}
                </p>
                <h3 className="mt-1 break-words text-base font-bold text-white">
                  {sponsor.name || "İsimsiz Sponsor"}
                </h3>
                {sponsor.website_url ? (
                  <p className="mt-1 break-words text-sm text-slate-400">{sponsor.website_url}</p>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row md:justify-end">
              <details className="rounded-xl border border-slate-800 bg-slate-950/50">
                <summary className="min-h-11 cursor-pointer px-4 py-3 text-sm font-semibold text-slate-200">
                  Düzenle
                </summary>
                <div className="w-full border-t border-slate-800 p-4 md:w-[34rem]">
                  <SponsorForm
                    action={updateSponsor.bind(null, sponsor.id)}
                    submitLabel="Sponsoru Güncelle"
                    values={sponsor}
                  />
                </div>
              </details>
              <button
                type="button"
                disabled={pending}
                onClick={() => removeItem(sponsor.id)}
                className="min-h-11 rounded-full border border-red-500/60 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/10 disabled:opacity-60"
              >
                Sil
              </button>
            </div>
          </div>
        </article>
      ))}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          disabled={!orderChanged || pending}
          onClick={saveOrder}
          className="min-h-11 rounded-full bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Kaydediliyor..." : "Sıralamayı Kaydet"}
        </button>
        {message ? <p className="text-sm text-slate-300">{message}</p> : null}
      </div>
    </div>
  );
}
