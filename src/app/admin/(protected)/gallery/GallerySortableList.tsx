"use client";

import type { ReactNode } from "react";
import { useMemo, useState, useTransition } from "react";

import {
  deleteGalleryAlbum,
  deleteGalleryImage,
  updateGalleryOrder,
} from "@/app/admin/(protected)/gallery/actions";

type SortableType = "albums" | "images";

type SortableItem = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  isActive?: boolean | null;
  editContent?: ReactNode;
};

type GallerySortableListProps = {
  type: SortableType;
  items: SortableItem[];
};

export function GallerySortableList({ type, items }: GallerySortableListProps) {
  const [orderedItems, setOrderedItems] = useState(items);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const table = type === "albums" ? "gallery_albums" : "gallery_images";
  const emptyText = type === "albums" ? "Henüz albüm yok." : "Henüz fotoğraf yok.";
  const deleteLabel = type === "albums" ? "Albümü Sil" : "Fotoğrafı Sil";
  const confirmText =
    type === "albums"
      ? "Bu albümü silmek istediğinizden emin misiniz?"
      : "Bu fotoğrafı silmek istediğinizden emin misiniz?";

  const orderChanged = useMemo(
    () => orderedItems.some((item, index) => item.id !== items[index]?.id),
    [items, orderedItems],
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
      const result = await updateGalleryOrder(
        table,
        orderedItems.map((item, index) => ({ id: item.id, sort_order: index })),
      );
      setMessage(result.message);
    });
  }

  function deleteItem(id: string) {
    if (!window.confirm(confirmText)) return;

    startTransition(async () => {
      try {
        if (type === "albums") {
          await deleteGalleryAlbum(id);
        } else {
          await deleteGalleryImage(id);
        }

        setOrderedItems((current) => current.filter((item) => item.id !== id));
        setMessage(type === "albums" ? "Albüm silindi." : "Fotoğraf silindi.");
      } catch {
        setMessage(type === "albums" ? "Albüm silinemedi." : "Fotoğraf silinemedi.");
      }
    });
  }

  if (orderedItems.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/45 p-6">
        <p className="text-sm font-semibold text-slate-100">{emptyText}</p>
      </section>
    );
  }

  return (
    <div className="space-y-3">
      {orderedItems.map((item, index) => (
        <article key={item.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
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
              {item.imageUrl ? (
                <div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-950">
                  <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                </div>
              ) : null}
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">
                  {item.isActive === false ? "Pasif" : "Aktif"}
                </p>
                <h3 className="mt-1 break-words text-base font-bold text-white">{item.title}</h3>
                {item.subtitle ? (
                  <p className="mt-1 break-words text-sm text-slate-400">{item.subtitle}</p>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row md:justify-end">
              <details className="rounded-xl border border-slate-800 bg-slate-950/50">
                <summary className="min-h-11 cursor-pointer px-4 py-3 text-sm font-semibold text-slate-200">
                  Düzenle
                </summary>
                <div className="w-full border-t border-slate-800 p-4 md:w-[34rem]">
                  {item.editContent}
                </div>
              </details>
              <button
                type="button"
                disabled={pending}
                onClick={() => deleteItem(item.id)}
                className="min-h-11 rounded-full border border-red-500/60 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/10 disabled:opacity-60"
              >
                {deleteLabel}
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
