"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default function LigMerkeziError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[lig-merkezi]", error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col bg-surface-base">
      <Container className="pb-16 pt-[calc(var(--header-height)+1.5rem)]">
        <p className="type-overline text-accent">TFF Fikstürü</p>
        <h1 className="type-display mt-2">Sayfa yüklenemedi.</h1>
        <p className="type-lead mt-4 max-w-prose-lead">
          Lig bilgileri görüntülenirken beklenmeyen bir sorun oluştu. Lütfen tekrar deneyin.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={() => unstable_retry()} className="min-h-[2.75rem]">
            Tekrar dene
          </Button>
          <Button href="/" variant="outline" className="min-h-[2.75rem]">
            Ana sayfaya dön
          </Button>
        </div>
      </Container>
    </div>
  );
}
