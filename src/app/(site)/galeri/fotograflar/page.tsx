import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

import { GalleryPhotosView } from "@/components/gallery/GalleryPhotosView.client";
import { Container } from "@/components/ui/Container";
import { getGalleryAlbums, getGalleryImages } from "@/lib/content";

export const metadata: Metadata = createPageMetadata({ title: "Futbol Akademisi Foto?raf Galerisi | Samand?ra ?Y Akademi", description: "Samand?ra ?dman Yurdu Akademi antrenman, ma? ve etkinlik foto?raflar?.", path: "/galeri/fotograflar" });

export default async function GaleriFotograflarPage() {
  const [albums, images] = await Promise.all([getGalleryAlbums(), getGalleryImages()]);

  return (
    <main className="flex flex-1 flex-col">
      <section className="relative isolate overflow-hidden pb-14 pt-[calc(var(--header-height)+0.75rem)] md:pb-20 md:pt-[calc(var(--header-height)+1rem)]">
        <div aria-hidden className="absolute inset-0 -z-20 bg-surface-base" />
        <div
          aria-hidden
          className="absolute right-0 top-0 -z-10 h-72 w-72 bg-[radial-gradient(circle,rgba(234,88,12,0.10),transparent_68%)] blur-2xl"
        />

        <Container>
          <div className="max-w-prose-section">
            <p className="type-overline club-kicker-line text-accent">Galeri</p>
            <h1 className="type-display text-text-primary">Fotoğraflar</h1>
            <p className="type-lead mt-5 max-w-prose-lead">
              Sahadaki anlarımızı ve antrenman görüntülerimizi bu sayfada bulabilirsiniz.
            </p>
          </div>

          {images.length > 0 ? (
            albums.length > 0 ? (
              <>
                {albums.map((album) => {
                  const albumImages = images.filter((image) => image.album_id === album.id);
                  if (albumImages.length === 0) return null;

                  return (
                    <section key={album.id} className="mt-12 first:mt-10">
                      <h2 className="type-heading-md text-text-primary">{album.title}</h2>
                      {album.description ? (
                        <p className="type-body-lg mt-2 max-w-prose-body">{album.description}</p>
                      ) : null}
                      <GalleryPhotosView images={albumImages} />
                    </section>
                  );
                })}
                {(() => {
                  const albumIds = new Set(albums.map((album) => album.id));
                  const unassigned = images.filter(
                    (image) => !image.album_id || !albumIds.has(image.album_id),
                  );
                  if (unassigned.length === 0) return null;

                  return (
                    <section className="mt-12 first:mt-10">
                      <h2 className="type-heading-md text-text-primary">Diğer Fotoğraflar</h2>
                      <GalleryPhotosView images={unassigned} />
                    </section>
                  );
                })()}
              </>
            ) : (
              <GalleryPhotosView images={images} />
            )
          ) : (
            <section className="mt-10 max-w-3xl border-l border-accent/45 pl-6">
              <h2 className="type-heading-md text-text-primary">Henüz fotoğraf eklenmedi.</h2>
              <p className="type-body-lg mt-4 max-w-prose-body">
                Yeni fotoğraflar eklendiğinde bu sayfada görüntülenecektir.
              </p>
            </section>
          )}
        </Container>
      </section>
    </main>
  );
}
