import {
  createGalleryAlbum,
  createGalleryImage,
  updateGalleryAlbum,
  updateGalleryImage,
} from "@/app/admin/(protected)/gallery/actions";
import { BulkGalleryUpload } from "@/app/admin/(protected)/gallery/BulkGalleryUpload";
import { GalleryAlbumForm } from "@/app/admin/(protected)/gallery/GalleryAlbumForm";
import { GalleryImageForm } from "@/app/admin/(protected)/gallery/GalleryImageForm";
import { GallerySortableList } from "@/app/admin/(protected)/gallery/GallerySortableList";
import { createClient } from "@/lib/supabase/server";

type GalleryAlbum = {
  id: string;
  title: string | null;
  description: string | null;
  cover_image_url: string | null;
  sort_order: number | null;
  is_active: boolean | null;
};

type GalleryImage = {
  id: string;
  album_id: string | null;
  image_url: string | null;
  alt_text: string | null;
  caption: string | null;
  aspect_ratio: string | null;
  sort_order: number | null;
  is_active: boolean | null;
  gallery_albums?: {
    title: string | null;
  } | null;
};

export default async function AdminGalleryPage() {
  const supabase = await createClient();
  const [{ data: albumData }, { data: imageData }] = await Promise.all([
    supabase.from("gallery_albums").select("*").order("sort_order", { ascending: true }),
    supabase
      .from("gallery_images")
      .select("*,gallery_albums(title)")
      .order("sort_order", { ascending: true }),
  ]);
  const albums = (albumData ?? []) as GalleryAlbum[];
  const images = (imageData ?? []) as GalleryImage[];
  const albumOptions = albums.map((album) => ({ id: album.id, title: album.title }));

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-400">
          İçerik Yönetimi
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">Galeri</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          Albüm oluşturun, fotoğraf ekleyin, toplu yükleme yapın ve galeri sıralamasını yönetin.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <a
          href="#foto-ekle"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
        >
          Fotoğraf Ekle
        </a>
        <a
          href="#toplu-yukle"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-700 px-5 py-3 text-sm font-bold text-slate-200 transition hover:border-orange-400 hover:text-orange-300"
        >
          Toplu Fotoğraf Yükle
        </a>
        <a
          href="#album-olustur"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-700 px-5 py-3 text-sm font-bold text-slate-200 transition hover:border-orange-400 hover:text-orange-300"
        >
          Albüm Oluştur
        </a>
      </section>

      <section id="album-olustur" className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <details>
          <summary className="cursor-pointer text-lg font-bold text-white">Albüm Oluştur</summary>
          <div className="mt-5 border-t border-slate-800 pt-5">
            <GalleryAlbumForm action={createGalleryAlbum} submitLabel="Albüm Oluştur" />
          </div>
        </details>
      </section>

      <section id="foto-ekle" className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <details>
          <summary className="cursor-pointer text-lg font-bold text-white">Tek Fotoğraf Ekle</summary>
          <div className="mt-5 border-t border-slate-800 pt-5">
            <GalleryImageForm action={createGalleryImage} submitLabel="Fotoğrafı Kaydet" albums={albumOptions} />
          </div>
        </details>
      </section>

      <div id="toplu-yukle">
        <BulkGalleryUpload albums={albumOptions} />
      </div>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-400">
            Albümler
          </p>
          <h2 className="mt-2 text-xl font-bold text-white">Albümler Listesi</h2>
        </div>
        <GallerySortableList
          type="albums"
          items={albums.map((album) => ({
            id: album.id,
            title: album.title || "Başlıksız Albüm",
            subtitle: album.description || "Açıklama yok",
            imageUrl: album.cover_image_url,
            isActive: album.is_active,
            editContent: (
              <GalleryAlbumForm
                action={updateGalleryAlbum.bind(null, album.id)}
                submitLabel="Albümü Güncelle"
                values={album}
              />
            ),
          }))}
        />
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-400">
            Fotoğraflar
          </p>
          <h2 className="mt-2 text-xl font-bold text-white">Fotoğraflar Listesi</h2>
        </div>
        <GallerySortableList
          type="images"
          items={images.map((image) => ({
            id: image.id,
            title: image.alt_text || "Başlıksız Fotoğraf",
            subtitle: `${image.gallery_albums?.title || "Albüm yok"} · ${image.aspect_ratio || "4:5"}`,
            imageUrl: image.image_url,
            isActive: image.is_active,
            editContent: (
              <GalleryImageForm
                action={updateGalleryImage.bind(null, image.id)}
                submitLabel="Fotoğrafı Güncelle"
                albums={albumOptions}
                values={image}
              />
            ),
          }))}
        />
      </section>
    </div>
  );
}
